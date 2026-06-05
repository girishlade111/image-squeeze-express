import * as pdfjsLib from 'pdfjs-dist';
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
}

export interface PdfProcessResult {
  blob: Blob;
  pageCount: number;
  sizeBytes: number;
  reduction: number;
  quality: number;
  scale: number;
  durationMs: number;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const PDF_QUALITY_PRESETS: Record<Exclude<PdfQualityPreset, 'custom'>, PdfProcessSettings> = {
  low: { quality: 0.4, scale: 1.25, maxWidth: 1100 },
  medium: { quality: 0.6, scale: 1.75, maxWidth: 1700 },
  high: { quality: 0.82, scale: 2.25, maxWidth: 2400 },
};

export function getQualityPresetSettings(preset: PdfQualityPreset): PdfProcessSettings {
  if (preset === 'custom') {
    return { quality: 0.6, scale: 1.75, maxWidth: 1700 };
  }
  return PDF_QUALITY_PRESETS[preset];
}

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

async function loadPdfDocument(file: File | Blob): Promise<pdfjsLib.PDFDocumentProxy> {
  const buffer = await file.arrayBuffer();
  // pdfjs mutates the buffer it receives — pass a copy to keep the caller's
  // File usable for retries.
  const task = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
  return task.promise;
}

async function renderPageToJpeg(
  page: pdfjsLib.PDFPageProxy,
  quality: number,
  scale: number,
  maxWidth: number | null
): Promise<RenderedPage> {
  const baseViewport = page.getViewport({ scale: 1 });

  let effectiveScale = scale;
  if (maxWidth && maxWidth > 0 && baseViewport.width > maxWidth) {
    effectiveScale = Math.max(0.1, maxWidth / baseViewport.width);
  }

  const viewport = page.getViewport({ scale: effectiveScale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // White background so pages with transparent regions don't end up black
  // in the JPEG output.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

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
  await pdf.destroy();

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
