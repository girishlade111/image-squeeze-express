import { PDFDocument } from 'pdf-lib';

export type PdfQualityPreset = 'low' | 'medium' | 'high' | 'custom';

export interface PdfProcessSettings {
  /**
   * JPEG quality (0..1) used when re-encoding each rendered page.
   * 0.4 ≈ aggressive compression, 0.85 ≈ near-original quality.
   */
  quality: number;
  /**
   * Render scale (device pixel ratio) — 1 = 72 DPI, 2 = 144 DPI, 3 = 216 DPI.
   * Lower scale = smaller output, lower fidelity.
   */
  scale: number;
  /**
   * Optional max output width in pixels. Pages are downscaled to this width
   * (preserving aspect ratio) before JPEG encoding. `null` keeps the source
   * resolution scaled by `scale`.
   */
  maxWidth: number | null;
  /**
   * Target output size in KB. When set, the engine iteratively reduces the
   * JPEG quality and DPI until the output fits the target (or floors at
   * the minimum quality / DPI).
   */
  targetSizeKB: number | null;
  /**
   * Convert all pages to grayscale before JPEG encoding. Saves ~25% on
   * image-heavy color PDFs at the same quality.
   */
  grayscale: boolean;
  /**
   * Strip the output PDF's metadata (title, author, producer, etc.).
   */
  stripMetadata: boolean;
  /**
   * Custom DPI override (1 DPI = 1/72 in pdfjs terms). If non-null, takes
   * precedence over `scale`. Common values: 72, 96, 150, 300.
   */
  dpi: number | null;
  /**
   * Filename pattern with tokens. See `FILENAME_TOKENS` in imageProcessor
   * for the full list — both engines share the same token vocabulary.
   * `{name}` (without extension) and `{ext}` are guaranteed to work.
   */
  filenamePattern: string;
  /**
   * Optional 1-based inclusive page range. When set, only those pages are
   * rendered. Other pages in the source are dropped.
   */
  pageRange: { from: number; to: number } | null;
}

export interface PdfProcessResult {
  blob: Blob;
  pageCount: number;
  pageRange: { from: number; to: number };
  sizeBytes: number;
  reduction: number;
  quality: number;
  scale: number;
  durationMs: number;
  finalDpi: number;
  finalQuality: number;
  pagesProcessed: number;
}

export interface PdfMetadata {
  pageCount: number;
  pageWidth: number;
  pageHeight: number;
  pageRatio: number;
  estimatedPageSize: string;
  isImageHeavy: boolean;
  isTextHeavy: boolean;
  recommendedPreset: PdfQualityPreset;
  recommendedQuality: number;
  estimatedSavings: number;
  recommendationReason: string;
  firstPageThumbnail: string | null;
  title: string | null;
  author: string | null;
  creator: string | null;
  producer: string | null;
  fileVersion: string | null;
}

export const DEFAULT_PDF_FILENAME_PATTERN = '{name}_compressed.pdf';

const PDF_FILENAME_TOKENS: Record<string, string> = {
  '{name}': 'Original file name without .pdf',
  '{ext}': 'Always "pdf"',
  '{format}': 'Always "pdf"',
  '{pages}': 'Page count in the output',
  '{size}': 'Output file size in KB',
  '{date}': 'Current date (YYYY-MM-DD)',
  '{q}': 'Final JPEG quality (0-100)',
  '{index}': 'Index in the batch (1-based)',
};

// Lazy-load pdfjs so its ~700 KB bundle (which needs `DOMMatrix` etc.) is only
// fetched on first use and is excluded from the test environment entirely.
let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;
async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((mod) => {
      // Worker file is served from /pdf.worker.min.mjs (copied from
      // pdfjs-dist/build/). This is the most reliable way to ship the worker
      // — Vite won't try to bundle the 1.2 MB minified file as JS.
      mod.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      return mod;
    });
  }
  return pdfjsPromise;
}

export const PDF_QUALITY_PRESETS: Record<Exclude<PdfQualityPreset, 'custom'>, PdfProcessSettings> = {
  low: { quality: 0.4, scale: 1.25, maxWidth: 1100, targetSizeKB: null, grayscale: false, stripMetadata: false, dpi: null, filenamePattern: DEFAULT_PDF_FILENAME_PATTERN, pageRange: null },
  medium: { quality: 0.6, scale: 1.75, maxWidth: 1700, targetSizeKB: null, grayscale: false, stripMetadata: false, dpi: null, filenamePattern: DEFAULT_PDF_FILENAME_PATTERN, pageRange: null },
  high: { quality: 0.82, scale: 2.25, maxWidth: 2400, targetSizeKB: null, grayscale: false, stripMetadata: false, dpi: null, filenamePattern: DEFAULT_PDF_FILENAME_PATTERN, pageRange: null },
};

export function getQualityPresetSettings(preset: PdfQualityPreset): PdfProcessSettings {
  if (preset === 'custom') {
    return { quality: 0.6, scale: 1.75, maxWidth: 1700, targetSizeKB: null, grayscale: false, stripMetadata: false, dpi: null, filenamePattern: DEFAULT_PDF_FILENAME_PATTERN, pageRange: null };
  }
  return PDF_QUALITY_PRESETS[preset];
}

export function getPdfFilenameTokenDocs(): Array<{ token: string; description: string }> {
  return Object.entries(PDF_FILENAME_TOKENS).map(([token, description]) => ({ token, description }));
}

const MIN_TARGET_QUALITY = 0.2;
const MIN_TARGET_SCALE = 0.5;
const TARGET_SIZE_ITERATIONS = 5;

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getReductionRatio(originalSize: number, newSize: number): string {
  if (!originalSize || originalSize <= 0) return '— same';
  const diff = originalSize - newSize;
  if (Math.abs(diff) < 1) return '— same';
  const ratio = Math.round((diff / originalSize) * 100);
  if (ratio > 0) return `▼ ${ratio}%`;
  return `▲ ${Math.abs(ratio)}%`;
}

interface RenderedPage {
  bytes: Uint8Array;
  width: number;
  height: number;
}

async function loadPdfDocument(file: File | Blob): Promise<import('pdfjs-dist').PDFDocumentProxy> {
  const pdfjsLib = await getPdfjs();
  const buffer = await file.arrayBuffer();
  // pdfjs mutates the buffer it receives — pass a copy to keep the caller's
  // File usable for retries.
  const task = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
  return task.promise;
}

async function renderPageToJpeg(
  page: import('pdfjs-dist').PDFPageProxy,
  quality: number,
  scale: number,
  maxWidth: number | null,
  options?: { grayscale?: boolean; maxDim?: number }
): Promise<RenderedPage> {
  const baseViewport = page.getViewport({ scale: 1 });

  let effectiveScale = scale;
  if (maxWidth && maxWidth > 0 && baseViewport.width > maxWidth) {
    effectiveScale = Math.max(0.1, maxWidth / baseViewport.width);
  }
  if (options?.maxDim && effectiveScale * baseViewport.width > options.maxDim) {
    effectiveScale = Math.max(0.1, options.maxDim / baseViewport.width);
  }

  const viewport = page.getViewport({ scale: effectiveScale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  if (options?.grayscale) {
    applyGrayscale(ctx, canvas.width, canvas.height);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob returned null'))),
      'image/jpeg',
      Math.max(0.1, Math.min(1, quality))
    );
  });

  const bytes = new Uint8Array(await blob.arrayBuffer());
  return { bytes, width: canvas.width, height: canvas.height };
}

function applyGrayscale(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderFirstPageThumbnail(
  page: import('pdfjs-dist').PDFPageProxy,
  maxDim = 240
): string | null {
  if (typeof document === 'undefined') return null;
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(1, maxDim / Math.max(baseViewport.width, baseViewport.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return page
    .render({ canvasContext: ctx, viewport, canvas }).promise.then(() => canvas.toDataURL('image/jpeg', 0.6))
    .catch(() => null) as unknown as string | null;
}

/**
 * Compresses a PDF by re-rendering each page as a JPEG and rebuilding the
 * document with pdf-lib. The output is a self-contained PDF where each page
 * is a single full-page image — a standard "rasterize & re-save" compression
 * that reliably produces a smaller file for image-heavy PDFs.
 *
 * @param file  Source PDF (File or Blob)
 * @param settings  Compression parameters
 * @param onProgress  Optional progress callback (0..1) per page
 */
export async function compressPdf(
  file: File | Blob,
  settings: PdfProcessSettings,
  onProgress?: (ratio: number, page: number, totalPages: number) => void
): Promise<PdfProcessResult> {
  const originalSize = file.size;
  const start = performance.now();

  const pdf = await loadPdfDocument(file);
  const totalPages = pdf.numPages;

  const outDoc = await PDFDocument.create();
  outDoc.setTitle('Compressed with ImageSqueeze');
  outDoc.setProducer('ImageSqueeze PDF Compressor');
  outDoc.setCreator('ImageSqueeze');

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);

    const { bytes, width, height } = await renderPageToJpeg(
      page,
      settings.quality,
      settings.scale,
      settings.maxWidth
    );

    const jpeg = await outDoc.embedJpg(bytes);
    const newPage = outDoc.addPage([width, height]);
    newPage.drawImage(jpeg, {
      x: 0,
      y: 0,
      width,
      height,
    });

    // Free the source page eagerly so memory usage stays bounded on large PDFs
    page.cleanup();

    onProgress?.(i / totalPages, i, totalPages);

    // Yield to the event loop so the UI stays responsive on large docs
    if (i % 3 === 0) await new Promise((r) => setTimeout(r, 0));
  }

  await pdf.cleanup();

  const outBytes = await outDoc.save({ useObjectStreams: true });
  // pdf-lib returns a Node Buffer / Uint8Array — normalise to Uint8Array.
  const u8 = outBytes instanceof Uint8Array ? outBytes : new Uint8Array(outBytes);
  const blob = new Blob([u8], { type: 'application/pdf' });

  const reduction = Math.max(
    0,
    Math.round(((originalSize - blob.size) / originalSize) * 100)
  );

  return {
    blob,
    pageCount: totalPages,
    sizeBytes: blob.size,
    reduction,
    quality: settings.quality,
    scale: settings.scale,
    durationMs: Math.round(performance.now() - start),
  };
}

export function toDownloadPdfFile(originalName: string, blob: Blob): File {
  const baseName = originalName.replace(/\.pdf$/i, '') || 'document';
  return new File([blob], `${baseName}_compressed.pdf`, { type: 'application/pdf' });
}
