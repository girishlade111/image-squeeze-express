import imageCompression from 'browser-image-compression';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'original';
export type QualityPreset = 'max' | 'high' | 'balanced' | 'compact';
export type Rotation = 0 | 90 | 180 | 270;

export interface ProcessSettings {
  quality: number;
  autoOptimize: boolean;
  targetSizeKB: number | null;

  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;

  outputFormat: ImageFormat;

  stripEXIF: boolean;
  grayscale: boolean;
  rotation: Rotation;
  mirror: boolean;
  preserveMetadata: boolean;
  progressive: boolean;
  embedColorProfile: boolean;

  lossless: boolean;
  filenamePattern: string;
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  reduction: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  megapixels: number;
  aspectRatio: number;
  isPhoto: boolean;
  hasTransparency: boolean;
  estimatedColors: number;
  recommendedFormat: ImageFormat;
  recommendedQuality: number;
  estimatedSavings: number;
  recommendationReason: string;
}

export const DEFAULT_FILENAME_PATTERN = 'imagesqueeze_{name}.{ext}';

const FILENAME_TOKENS: Record<string, string> = {
  '{name}': 'Original file name without extension',
  '{ext}': 'Output extension (webp, jpg, png, avif)',
  '{format}': 'Output format (lowercase)',
  '{w}': 'Output width in pixels',
  '{h}': 'Output height in pixels',
  '{q}': 'Output quality (rounded)',
  '{index}': 'Index in the batch (1-based)',
  '{date}': 'Current date (YYYY-MM-DD)',
  '{size}': 'Output file size in KB',
};

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getCompressionRatio(originalSize: number, newSize: number): string {
  if (!originalSize || originalSize <= 0) return '— same';
  const diff = originalSize - newSize;
  if (Math.abs(diff) < 1) return '— same';
  const ratio = Math.round((diff / originalSize) * 100);
  if (ratio > 0) return `▼ ${ratio}%`;
  return `▲ ${Math.abs(ratio)}%`;
}

export function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const cleanup = () => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* noop */
      }
    };
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      cleanup();
      resolve(dims);
    };
    img.onerror = () => {
      cleanup();
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

export function toMime(format: ProcessSettings['outputFormat'], originalType: string): string {
  if (format === 'original') {
    // Round-trip the original format for the formats the browser can re-encode
    // losslessly via canvas (PNG, JPEG, WebP, AVIF). Anything else (GIF, BMP,
    // TIFF, …) falls back to PNG so we never silently drop pixels.
    if (
      originalType === 'image/png' ||
      originalType === 'image/jpeg' ||
      originalType === 'image/webp' ||
      originalType === 'image/avif'
    ) {
      return originalType;
    }
    return 'image/png';
  }
  return `image/${format}`;
}

export function toExt(mime: string): string {
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/avif') return '.avif';
  return '.jpg';
}

/**
 * Feature-detects whether the current browser can encode a given mime type
 * through `canvas.toBlob`. The check is cached after the first call so the UI
 * can call it freely while rendering the format picker.
 */
const _supportCache = new Map<string, boolean>();
export function isFormatSupported(mime: string): boolean {
  const cached = _supportCache.get(mime);
  if (cached !== undefined) return cached;
  if (typeof document === 'undefined') {
    _supportCache.set(mime, false);
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    // Some non-browser environments (e.g. jsdom without the optional canvas
    // shim) leave `toDataURL` unimplemented and print a warning to the
    // console. Probe first to stay quiet in those test environments.
    if (typeof canvas.toDataURL !== 'function') {
      _supportCache.set(mime, false);
      return false;
    }
    const dataUrl = canvas.toDataURL(mime);
    const supported = dataUrl.startsWith(`data:${mime}`);
    _supportCache.set(mime, supported);
    return supported;
  } catch {
    _supportCache.set(mime, false);
    return false;
  }
}

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CalcResult {
  w: number;
  h: number;
  /**
   * Source-image rectangle to sample from. When omitted, the full source is used.
   * Returned when an explicit (w, h) target is requested whose aspect ratio differs
   * from the source — the image is then center-cropped to match the target aspect
   * ratio before being scaled to the target dimensions (e.g., social media presets).
   */
  crop?: CropRect;
}

export function calcDimensions(
  origW: number,
  origH: number,
  targetW: number | null,
  targetH: number | null,
  lock: boolean
): CalcResult {
  // No resize requested
  if (!targetW && !targetH) return { w: origW, h: origH };

  // Sanitize values
  const safeW = targetW && targetW > 0 ? targetW : null;
  const safeH = targetH && targetH > 0 ? targetH : null;
  const aspect = origW > 0 && origH > 0 ? origW / origH : 1;

  // When only one dimension is requested AND the aspect lock is on, derive the
  // missing dimension from the source aspect ratio. This is the "lock" helper
  // behavior for the manual width/height inputs in the settings panel.
  if (lock) {
    if (safeW && !safeH) {
      return { w: safeW, h: Math.max(1, Math.round(safeW / aspect)) };
    }
    if (safeH && !safeW) {
      return { w: Math.max(1, Math.round(safeH * aspect)), h: safeH };
    }
  }

  // Both target dimensions are explicitly known (e.g. a Social Media preset, or
  // the user typed both width and height). Honor them as-is and, if the source
  // aspect ratio differs, center-crop the source to match the target aspect so
  // the output is exactly the requested size without distortion.
  const w = safeW || origW;
  const h = safeH || origH;

  if (safeW && safeH && origW > 0 && origH > 0) {
    const targetAspect = safeW / safeH;
    const sourceAspect = origW / origH;

    if (Math.abs(sourceAspect - targetAspect) > 0.001) {
      let cropW: number;
      let cropH: number;
      let cropX: number;
      let cropY: number;

      if (sourceAspect > targetAspect) {
        // Source is wider than target → crop the sides equally
        cropH = origH;
        cropW = origH * targetAspect;
        cropX = (origW - cropW) / 2;
        cropY = 0;
      } else {
        // Source is taller than target → crop top/bottom equally
        cropW = origW;
        cropH = origW / targetAspect;
        cropX = 0;
        cropY = (origH - cropH) / 2;
      }

      return { w, h, crop: { x: cropX, y: cropY, w: cropW, h: cropH } };
    }
  }

  return { w, h };
}

function applyCanvasTransforms(
  ctx: CanvasRenderingContext2D,
  rotation: number,
  mirror: boolean
): void {
  if (mirror) {
    ctx.scale(-1, 1);
  }

  if (rotation) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
}

async function canvasProcess(
  source: Blob,
  width: number,
  height: number,
  mime: string,
  quality: number,
  options: {
    rotation?: Rotation;
    mirror?: boolean;
    grayscale?: boolean;
    crop?: CropRect;
  }
): Promise<Blob> {
  const img = await loadImage(source);

  // Canvas dimensions swap for 90/270 rotation so the rotated image fits
  let canvasWidth = width;
  let canvasHeight = height;
  if (options.rotation === 90 || options.rotation === 270) {
    canvasWidth = height;
    canvasHeight = width;
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Always fill background white to avoid transparent JPEG artifacts
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Source rectangle to sample from (defaults to the full image).
  // When a crop is provided, the cropped region is drawn at the requested size
  // so the output exactly matches the target dimensions without distortion.
  const crop = options.crop;
  const srcX = crop ? crop.x : 0;
  const srcY = crop ? crop.y : 0;
  const srcW = crop ? crop.w : img.naturalWidth;
  const srcH = crop ? crop.h : img.naturalHeight;

  // Move origin to the canvas center so rotation/mirror pivot around it
  if (options.rotation || options.mirror) {
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    applyCanvasTransforms(ctx, options.rotation || 0, options.mirror || false);
  }

  const drawWidth = options.rotation || options.mirror ? width : canvasWidth;
  const drawHeight = options.rotation || options.mirror ? height : canvasHeight;
  const drawX = options.rotation || options.mirror ? -width / 2 : 0;
  const drawY = options.rotation || options.mirror ? -height / 2 : 0;

  ctx.drawImage(img, srcX, srcY, srcW, srcH, drawX, drawY, drawWidth, drawHeight);

  if (options.grayscale) {
    applyGrayscale(ctx, canvasWidth, canvasHeight);
  }

  const qualityNum = Math.max(0.1, Math.min(1, quality / 100));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      mime,
      qualityNum
    );
  });
}

function applyGrayscale(ctx: CanvasRenderingContext2D, width: number, height: number): void {
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

function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    const cleanup = () => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* noop */
      }
    };
    img.onload = () => {
      cleanup();
      resolve(img);
    };
    img.onerror = () => {
      cleanup();
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

export function calculateOptimalQuality(
  originalSize: number,
  targetSizeKB: number | null,
  outputFormat: ImageFormat,
  hasTransforms: boolean
): number {
  if (targetSizeKB && targetSizeKB > 0) {
    const targetBytes = targetSizeKB * 1024;
    const ratio = targetBytes / originalSize;

    if (ratio >= 0.9) return 95;
    if (ratio >= 0.7) return 82;
    if (ratio >= 0.5) return 68;
    if (ratio >= 0.3) return 50;
    return 35;
  }

  if (outputFormat === 'webp') {
    return hasTransforms ? 80 : 75;
  }

  // AVIF encodes more efficiently than WebP, so a lower quality number
  // produces a visually equivalent result. Use 65/60 as defaults.
  if (outputFormat === 'avif') {
    return hasTransforms ? 70 : 65;
  }

  if (outputFormat === 'png') {
    return 100;
  }

  return 80;
}

export async function processImage(
  file: File,
  settings: ProcessSettings,
  originalSize: number,
  indexInBatch?: number
): Promise<ProcessResult> {
  const outputMime = toMime(settings.outputFormat, file.type);
  const origDims = await getImageDimensions(file);

  const { w: targetW, h: targetH, crop } = calcDimensions(
    origDims.width,
    origDims.height,
    settings.width,
    settings.height,
    settings.lockAspectRatio
  );

  const hasTransforms =
    settings.rotation !== 0 ||
    settings.mirror ||
    settings.grayscale ||
    settings.stripEXIF;

  const needsResize = targetW !== origDims.width || targetH !== origDims.height;
  const needsFormatChange = outputMime !== file.type;

  // Lossless mode only applies to formats that support lossless encoding.
  // JPEG and AVIF are inherently lossy; PNG is always lossless.
  const losslessActive =
    settings.lossless && (outputMime === 'image/png' || outputMime === 'image/webp');

  const quality = losslessActive
    ? 100
    : settings.autoOptimize
    ? calculateOptimalQuality(originalSize, settings.targetSizeKB, settings.outputFormat, hasTransforms)
    : settings.quality;

  let result: Blob;

  if (hasTransforms || needsResize || needsFormatChange || losslessActive) {
    result = await canvasProcess(
      file,
      targetW,
      targetH,
      outputMime,
      quality,
      {
        rotation: settings.rotation,
        mirror: settings.mirror,
        grayscale: settings.grayscale,
        crop,
      }
    );

    if (settings.targetSizeKB && settings.targetSizeKB > 0 && !losslessActive) {
      const limit = settings.targetSizeKB * 1024;
      let iterQuality = quality;
      let iterResult = result;
      for (let i = 0; i < 5; i++) {
        if (iterResult.size <= limit) {
          result = iterResult;
          break;
        }
        iterQuality = Math.max(10, iterQuality - 10);
        iterResult = await canvasProcess(
          file,
          targetW,
          targetH,
          outputMime,
          iterQuality,
          {
            rotation: settings.rotation,
            mirror: settings.mirror,
            grayscale: settings.grayscale,
            crop,
          }
        );
        result = iterResult;
        if (iterQuality <= 10) break;
      }
    }
  } else {
    const compressionOpts: Parameters<typeof imageCompression>[1] = {
      maxSizeMB: settings.targetSizeKB && settings.targetSizeKB > 0 ? settings.targetSizeKB / 1024 : 50,
      maxWidthOrHeight: Math.max(targetW, targetH),
      useWebWorker: true,
      fileType: outputMime,
      initialQuality: losslessActive ? 1 : quality / 100,
      alwaysKeepResolution: !needsResize,
    };

    result = await imageCompression(file, compressionOpts);
  }

  const finalDims = await getImageDimensions(result);
  const reduction = Math.round(((originalSize - result.size) / originalSize) * 100);

  return {
    blob: result,
    width: finalDims.width,
    height: finalDims.height,
    sizeBytes: result.size,
    reduction: Math.max(0, reduction),
  };
}

export function toDownloadFile(
  originalName: string,
  blob: Blob,
  pattern: string = DEFAULT_FILENAME_PATTERN,
  context?: {
    width?: number;
    height?: number;
    quality?: number;
    index?: number;
    sizeBytes?: number;
  }
): File {
  const dot = originalName.lastIndexOf('.');
  const baseName = (dot > 0 ? originalName.slice(0, dot) : originalName) || 'image';
  const ext = toExt(blob.type).slice(1);
  const format = ext;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const replacements: Record<string, string> = {
    '{name}': baseName,
    '{ext}': ext,
    '{format}': format,
    '{w}': String(context?.width ?? ''),
    '{h}': String(context?.height ?? ''),
    '{q}': String(Math.round(context?.quality ?? 0)),
    '{index}': String(context?.index ?? ''),
    '{date}': dateStr,
    '{size}': String(Math.round((context?.sizeBytes ?? 0) / 1024)),
  };

  let out = pattern;
  for (const token of Object.keys(replacements)) {
    out = out.split(token).join(replacements[token]);
  }

  // Sanitize illegal characters and trim
  out = out.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/_+/g, '_').trim();
  if (out.length === 0) out = `imagesqueeze_${baseName}${toExt(blob.type)}`;
  if (out.length > 200) out = out.slice(0, 200);

  // Guarantee the right extension is appended when the pattern omits it
  if (!out.toLowerCase().endsWith(toExt(blob.type).toLowerCase())) {
    out = out + toExt(blob.type);
  }

  return new File([blob], out, { type: blob.type });
}

export function getFilenameTokenDocs(): Array<{ token: string; description: string }> {
  return Object.entries(FILENAME_TOKENS).map(([token, description]) => ({ token, description }));
}

export function estimateQualityForSize(
  originalSize: number,
  targetSizeKB: number
): number {
  if (!originalSize || originalSize <= 0) return 75;
  const ratio = (targetSizeKB * 1024) / originalSize;
  if (ratio >= 0.9) return 95;
  if (ratio >= 0.7) return 80;
  if (ratio >= 0.5) return 65;
  if (ratio >= 0.3) return 50;
  return 30;
}

export async function getExifOrientation(file: File): Promise<number> {
  return 1;
}
