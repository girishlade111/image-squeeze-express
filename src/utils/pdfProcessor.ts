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

async function renderFirstPageThumbnail(
  page: import('pdfjs-dist').PDFPageProxy,
  maxDim = 240
): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  try {
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
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    return canvas.toDataURL('image/jpeg', 0.6);
  } catch {
    return null;
  }
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

  // dpi takes precedence over scale: 1 DPI unit = 1/72 inch in pdfjs space.
  let effectiveScale = settings.scale;
  if (settings.dpi && settings.dpi > 0) {
    effectiveScale = settings.dpi / 72;
  }
  let effectiveQuality = Math.max(0.1, Math.min(1, settings.quality));

  const pdf = await loadPdfDocument(file);
  const totalPages = pdf.numPages;

  // Apply page range (1-based, inclusive)
  const range = settings.pageRange && totalPages > 0
    ? {
        from: Math.max(1, Math.min(totalPages, Math.floor(settings.pageRange.from))),
        to: Math.max(1, Math.min(totalPages, Math.floor(settings.pageRange.to))),
      }
    : { from: 1, to: totalPages };
  if (range.to < range.from) {
    range.to = range.from;
  }
  const pagesToProcess = range.to - range.from + 1;

  const outDoc = await PDFDocument.create();
  if (!settings.stripMetadata) {
    outDoc.setTitle('Compressed with ImageSqueeze');
    outDoc.setProducer('ImageSqueeze PDF Compressor');
    outDoc.setCreator('ImageSqueeze');
  }

  let lastBlob: Blob | null = null;

  for (let idx = 0; idx < pagesToProcess; idx++) {
    const pageNum = range.from + idx;
    const page = await pdf.getPage(pageNum);

    const { bytes, width, height } = await renderPageToJpeg(
      page,
      effectiveQuality,
      effectiveScale,
      settings.maxWidth,
      { grayscale: settings.grayscale }
    );

    const jpeg = await outDoc.embedJpg(bytes);
    const newPage = outDoc.addPage([width, height]);
    newPage.drawImage(jpeg, {
      x: 0,
      y: 0,
      width,
      height,
    });

    page.cleanup();

    onProgress?.((idx + 1) / pagesToProcess, pageNum, totalPages);

    if ((idx + 1) % 3 === 0) await new Promise((r) => setTimeout(r, 0));
  }

  await pdf.cleanup();

  const buildBlob = async (): Promise<Blob> => {
    const outBytes = await outDoc.save({ useObjectStreams: true });
    const u8 = outBytes instanceof Uint8Array ? outBytes : new Uint8Array(outBytes);
    return new Blob([u8], { type: 'application/pdf' });
  };

  let blob = await buildBlob();
  lastBlob = blob;

  // Iteratively reduce quality + scale when a target size is set
  if (settings.targetSizeKB && settings.targetSizeKB > 0) {
    const limit = settings.targetSizeKB * 1024;
    let qualityIter = effectiveQuality;
    let scaleIter = effectiveScale;

    for (let i = 0; i < TARGET_SIZE_ITERATIONS; i++) {
      if (blob.size <= limit) break;
      if (qualityIter <= MIN_TARGET_QUALITY && scaleIter <= MIN_TARGET_SCALE) break;

      if (qualityIter > MIN_TARGET_QUALITY) {
        qualityIter = Math.max(MIN_TARGET_QUALITY, qualityIter - 0.1);
      } else {
        scaleIter = Math.max(MIN_TARGET_SCALE, scaleIter - 0.15);
      }

      // Rebuild a fresh output document at the new settings
      const retryDoc = await PDFDocument.create();
      if (!settings.stripMetadata) {
        retryDoc.setTitle('Compressed with ImageSqueeze');
        retryDoc.setProducer('ImageSqueeze PDF Compressor');
      }
      const retryPdf = await loadPdfDocument(file);
      for (let idx = 0; idx < pagesToProcess; idx++) {
        const pageNum = range.from + idx;
        const page = await retryPdf.getPage(pageNum);
        const { bytes, width, height } = await renderPageToJpeg(
          page,
          qualityIter,
          scaleIter,
          settings.maxWidth,
          { grayscale: settings.grayscale }
        );
        const jpeg = await retryDoc.embedJpg(bytes);
        const newPage = retryDoc.addPage([width, height]);
        newPage.drawImage(jpeg, { x: 0, y: 0, width, height });
        page.cleanup();
        if ((idx + 1) % 5 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      await retryPdf.cleanup();
      blob = await (async () => {
        const outBytes = await retryDoc.save({ useObjectStreams: true });
        const u8 = outBytes instanceof Uint8Array ? outBytes : new Uint8Array(outBytes);
        return new Blob([u8], { type: 'application/pdf' });
      })();
      lastBlob = blob;
      effectiveQuality = qualityIter;
      effectiveScale = scaleIter;
    }
  }

  void lastBlob;

  const reduction = Math.max(
    0,
    Math.round(((originalSize - blob.size) / originalSize) * 100)
  );

  return {
    blob,
    pageCount: totalPages,
    pageRange: range,
    sizeBytes: blob.size,
    reduction,
    quality: effectiveQuality,
    scale: effectiveScale,
    durationMs: Math.round(performance.now() - start),
    finalDpi: Math.round(effectiveScale * 72),
    finalQuality: Math.round(effectiveQuality * 100),
    pagesProcessed: pagesToProcess,
  };
}

/**
 * Reads the first page of a PDF and returns a thumbnail as a data URL plus
 * key metadata. The thumbnail is small (~240px on the long side) so it can
 * be used in card previews without bloating the DOM.
 */
export async function getPdfMetadata(file: File | Blob): Promise<PdfMetadata> {
  const pdf = await loadPdfDocument(file);
  try {
    const pageCount = pdf.numPages;
    const firstPage = await pdf.getPage(1);
    const baseViewport = firstPage.getViewport({ scale: 1 });
    const pageWidth = baseViewport.width;
    const pageHeight = baseViewport.height;

    const thumbnail = await renderFirstPageThumbnail(firstPage, 240);

    // Pull metadata from pdfjs (best-effort; not all PDFs populate it)
    const meta = await pdf.getMetadata().catch(() => null);
    const info = (meta?.info ?? {}) as Record<string, string | undefined>;

    return {
      pageCount,
      pageWidth: Math.round(pageWidth),
      pageHeight: Math.round(pageHeight),
      pageRatio: pageWidth / pageHeight,
      estimatedPageSize: formatEstimatedPageSize(pageWidth, pageHeight),
      isImageHeavy: false,
      isTextHeavy: false,
      recommendedPreset: 'medium',
      recommendedQuality: 0.6,
      estimatedSavings: 50,
      recommendationReason: 'Re-rendering as JPEG usually saves 40-70% on most PDFs.',
      firstPageThumbnail: thumbnail,
      title: info.Title ?? null,
      author: info.Author ?? null,
      creator: info.Creator ?? null,
      producer: info.Producer ?? null,
      fileVersion: typeof pdf.pdfFormatVersion === 'number' ? String(pdf.pdfFormatVersion) : null,
    };
  } finally {
    await pdf.cleanup();
  }
}

/**
 * Heuristic recommendation engine for PDFs. Classifies the source as
 * "image-heavy" or "text-heavy" by analyzing the first few pages' rendered
 * thumbnails. Text-heavy pages (lots of edges, low color count) compress
 * better at higher quality; image-heavy pages tolerate more aggressive
 * JPEG encoding.
 */
export async function recommendPdf(file: File | Blob): Promise<PdfMetadata> {
  const meta = await getPdfMetadata(file);
  const pdf = await loadPdfDocument(file);
  try {
    const probe = await pdf.getPage(1);
    const viewport = probe.getViewport({ scale: 0.25 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext('2d');
    if (!ctx) return meta;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await probe.render({ canvasContext: ctx, viewport, canvas }).promise;

    let data: Uint8ClampedArray;
    try {
      data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch {
      return meta;
    }

    let softEdges = 0;
    let hardEdges = 0;
    const colorSet = new Set<number>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = (r >> 4) * 1024 + (g >> 4) * 32 + (b >> 4);
      colorSet.add(key);
      if (i > 0) {
        const dr = Math.abs(r - data[i - 4]);
        const dg = Math.abs(g - data[i - 3]);
        const db = Math.abs(b - data[i - 2]);
        const sum = dr + dg + db;
        if (sum > 30 && sum < 200) softEdges++;
        else if (sum >= 200) hardEdges++;
      }
    }
    const total = data.length / 4;
    const softRatio = softEdges / total;
    const hardRatio = hardEdges / total;
    const colors = colorSet.size;

    const isTextHeavy = hardRatio > 0.15 || (colors < 200 && hardRatio > 0.08);
    const isImageHeavy = softRatio > 0.3 && colors > 1500;

    let recommendedPreset: PdfQualityPreset;
    let recommendedQuality: number;
    let estimatedSavings: number;
    let reason: string;

    if (isTextHeavy) {
      recommendedPreset = 'high';
      recommendedQuality = 0.82;
      estimatedSavings = 35;
      reason = 'Mostly text — keep high quality so letters stay crisp';
    } else if (isImageHeavy) {
      recommendedPreset = 'low';
      recommendedQuality = 0.4;
      estimatedSavings = 70;
      reason = 'Image-heavy — aggressive compression saves the most';
    } else {
      recommendedPreset = 'medium';
      recommendedQuality = 0.6;
      estimatedSavings = 55;
      reason = 'Mixed content — balanced settings work best';
    }

    return {
      ...meta,
      isImageHeavy,
      isTextHeavy,
      recommendedPreset,
      recommendedQuality,
      estimatedSavings,
      recommendationReason: reason,
    };
  } finally {
    await pdf.cleanup();
  }
}

function formatEstimatedPageSize(widthPt: number, heightPt: number): string {
  const a4 = [595, 842];
  const letter = [612, 792];
  const w = Math.round(widthPt);
  const h = Math.round(heightPt);
  if (Math.abs(w - a4[0]) < 5 && Math.abs(h - a4[1]) < 5) return 'A4';
  if (Math.abs(w - a4[1]) < 5 && Math.abs(h - a4[0]) < 5) return 'A4 (landscape)';
  if (Math.abs(w - letter[0]) < 5 && Math.abs(h - letter[1]) < 5) return 'Letter';
  if (Math.abs(w - letter[1]) < 5 && Math.abs(h - letter[0]) < 5) return 'Letter (landscape)';
  return `${w}×${h} pt`;
}

export function toDownloadPdfFile(
  originalName: string,
  blob: Blob,
  pattern: string = DEFAULT_PDF_FILENAME_PATTERN,
  context?: { index?: number; quality?: number; pageCount?: number; date?: Date }
): File {
  const base = originalName.replace(/\.pdf$/i, '') || 'document';
  const ext = 'pdf';
  const date = context?.date ?? new Date();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const sizeKB = Math.max(0, Math.round(blob.size / 1024));

  const replacements: Record<string, string> = {
    '{name}': base,
    '{ext}': ext,
    '{format}': 'pdf',
    '{pages}': String(context?.pageCount ?? 0),
    '{size}': String(sizeKB),
    '{date}': dateStr,
    '{q}': String(Math.round((context?.quality ?? 0) * 100)),
    '{index}': String(context?.index ?? 1),
  };

  const sanitized = Object.entries(replacements).reduce(
    (acc, [token, value]) => acc.split(token).join(value),
    pattern
  );

  // Strip illegal characters and collapse underscores.
  const cleaned = sanitized
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();

  let finalName = cleaned || `${base}_compressed.${ext}`;
  if (!finalName.toLowerCase().endsWith('.pdf')) {
    finalName = `${finalName}.${ext}`;
  }
  if (finalName.length > 200) {
    finalName = `${finalName.slice(0, 195)}.${ext}`;
  }
  return new File([blob], finalName, { type: 'application/pdf' });
}
