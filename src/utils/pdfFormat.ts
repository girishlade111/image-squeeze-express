import type { PdfProcessSettings, PdfQualityPreset } from './pdfProcessor';

export type { PdfProcessSettings, PdfQualityPreset };

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

export const PDF_QUALITY_PRESETS: Record<Exclude<PdfQualityPreset, 'custom'>, PdfProcessSettings> = {
  low: { quality: 0.4, scale: 1.25, maxWidth: 1100, targetSizeKB: null, grayscale: false, stripMetadata: false, dpi: null, filenamePattern: '{name}_compressed.pdf', pageRange: null },
  medium: { quality: 0.6, scale: 1.75, maxWidth: 1700, targetSizeKB: null, grayscale: false, stripMetadata: false, dpi: null, filenamePattern: '{name}_compressed.pdf', pageRange: null },
  high: { quality: 0.82, scale: 2.25, maxWidth: 2400, targetSizeKB: null, grayscale: false, stripMetadata: false, dpi: null, filenamePattern: '{name}_compressed.pdf', pageRange: null },
};

export function getQualityPresetSettings(preset: PdfQualityPreset): PdfProcessSettings {
  if (preset === 'custom') {
    return { quality: 0.6, scale: 1.75, maxWidth: 1700, targetSizeKB: null, grayscale: false, stripMetadata: false, dpi: null, filenamePattern: '{name}_compressed.pdf', pageRange: null };
  }
  return PDF_QUALITY_PRESETS[preset];
}

export function getPdfFilenameTokenDocs(): Array<{ token: string; description: string }> {
  return Object.entries(PDF_FILENAME_TOKENS).map(([token, description]) => ({ token, description }));
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

export function toDownloadPdfFile(
  originalName: string,
  blob: Blob,
  pattern: string = '{name}_compressed.pdf',
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

  const cleaned = sanitized
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
