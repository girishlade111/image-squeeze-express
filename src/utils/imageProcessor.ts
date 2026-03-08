import imageCompression from 'browser-image-compression';

/* ─── Types ─── */
export interface ProcessSettings {
  quality: number;            // 10-100
  targetSizeKB: number | null;
  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;
  outputFormat: 'jpeg' | 'png' | 'webp' | 'original';
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
}

/* ─── Helpers ─── */

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getCompressionRatio(originalSize: number, newSize: number): string {
  if (originalSize === 0) return '▼ 0% smaller';
  const ratio = Math.round(((originalSize - newSize) / originalSize) * 100);
  if (ratio <= 0) return '— same size';
  return `▼ ${ratio}% smaller`;
}

export function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/* ─── Internal helpers ─── */

function toMime(format: ProcessSettings['outputFormat'], originalType: string): string {
  if (format === 'original') return originalType;
  return `image/${format}`;
}

function toExt(mime: string): string {
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/png') return '.png';
  return '.jpg';
}

/** Calculate target dimensions respecting aspect ratio */
function calcDimensions(
  origW: number,
  origH: number,
  targetW: number | null,
  targetH: number | null,
  lock: boolean
): { w: number; h: number } {
  if (!targetW && !targetH) return { w: origW, h: origH };

  if (lock) {
    const aspect = origW / origH;
    if (targetW && !targetH) return { w: targetW, h: Math.round(targetW / aspect) };
    if (!targetW && targetH) return { w: Math.round(targetH * aspect), h: targetH };
    // Both provided — honour width, recalc height
    if (targetW) return { w: targetW, h: Math.round(targetW / aspect) };
  }

  return {
    w: targetW || origW,
    h: targetH || origH,
  };
}

/**
 * Canvas API — precise resize + reliable format conversion (especially WebP).
 * Draws image onto a canvas at target dimensions and exports as the desired MIME.
 */
function canvasProcess(
  source: Blob,
  width: number,
  height: number,
  mime: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob returned null'));
        },
        mime,
        quality / 100
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image for canvas processing'));
    img.src = URL.createObjectURL(source);
  });
}

/* ─── Main processor ─── */

export async function processImage(
  file: File,
  settings: ProcessSettings
): Promise<ProcessResult> {
  const outputMime = toMime(settings.outputFormat, file.type);
  const origDims = await getImageDimensions(file);

  // 1) Calculate final target dimensions
  const { w: targetW, h: targetH } = calcDimensions(
    origDims.width,
    origDims.height,
    settings.width,
    settings.height,
    settings.lockAspectRatio
  );

  // 2) Run browser-image-compression with exact options from spec
  const compressionOpts: Parameters<typeof imageCompression>[1] = {
    maxSizeMB: settings.targetSizeKB ? settings.targetSizeKB / 1024 : 999,
    maxWidthOrHeight: Math.max(settings.width || 9999, settings.height || 9999),
    useWebWorker: true,
    fileType: settings.outputFormat === 'original' ? file.type : `image/${settings.outputFormat}`,
    initialQuality: settings.quality / 100,
    alwaysKeepResolution: !settings.width && !settings.height,
  };

  let result: Blob = await imageCompression(file, compressionOpts);

  // 3) Canvas pass for precise resizing and/or format conversion
  const needsCanvas =
    outputMime === 'image/webp' ||           // ensure reliable WebP output
    outputMime !== file.type ||              // format change
    targetW !== origDims.width ||            // resize
    targetH !== origDims.height;

  if (needsCanvas) {
    result = await canvasProcess(result, targetW, targetH, outputMime, settings.quality);
  }

  // 4) Read final dimensions to confirm
  const finalDims = await getImageDimensions(result);

  return {
    blob: result,
    width: finalDims.width,
    height: finalDims.height,
    sizeBytes: result.size,
  };
}

/** Build a downloadable File from a processing result */
export function toDownloadFile(originalName: string, blob: Blob): File {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const ext = toExt(blob.type);
  return new File([blob], `imagesqueeze_${baseName}${ext}`, { type: blob.type });
}
