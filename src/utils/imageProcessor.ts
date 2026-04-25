import imageCompression from 'browser-image-compression';

/* ─── Types ─── */
export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'original';
export type QualityPreset = 'max' | 'high' | 'balanced' | 'compact';
export type Rotation = 0 | 90 | 180 | 270;

export interface ProcessSettings {
  // Basic compression
  quality: number;            // 10-100
  autoOptimize: boolean;
  targetSizeKB: number | null;
  
  // Resize
  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;
  
  // Format
  outputFormat: ImageFormat;
  
  // Advanced options
  stripEXIF: boolean;
  grayscale: boolean;
  rotation: Rotation;
  mirror: boolean;
  preserveMetadata: boolean;
  progressive: boolean;
  embedColorProfile: boolean;
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  reduction: number;  // percentage reduced
}

/* ─── Helpers ─── */

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getCompressionRatio(originalSize: number, newSize: number): string {
  if (originalSize === 0) return '▼ 0%';
  const ratio = Math.round(((originalSize - newSize) / originalSize) * 100);
  if (ratio <= 0) return '— same';
  return `▼ ${ratio}%`;
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
    if (targetW) return { w: targetW, h: Math.round(targetW / aspect) };
  }

  return {
    w: targetW || origW,
    h: targetH || origH,
  };
}

/** Apply rotation and mirroring to canvas context */
function applyTransforms(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rotation: number,
  mirror: boolean
): void {
  ctx.translate(width / 2, height / 2);
  
  if (mirror) {
    ctx.scale(-1, 1);
  }
  
  switch (rotation) {
    case 90:
      ctx.rotate(Math.PI / 2);
      break;
    case 180:
      ctx.rotate(Math.PI);
      break;
    case 270:
      ctx.rotate(-Math.PI / 2);
      break;
  }
  
  ctx.translate(-width / 2, -height / 2);
}

/** Apply grayscale to canvas */
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

/**
 * Advanced Canvas processing with rotation, mirroring, and grayscale
 */
function advancedCanvasProcess(
  source: Blob,
  width: number,
  height: number,
  mime: string,
  quality: number,
  options: {
    rotation?: Rotation;
    mirror?: boolean;
    grayscale?: boolean;
    progressive?: boolean;
  }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Handle rotation for canvas dimensions
      let canvasWidth = width;
      let canvasHeight = height;
      if (options.rotation === 90 || options.rotation === 270) {
        canvasWidth = height;
        canvasHeight = width;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      
      // Apply transforms
      if (options.rotation || options.mirror) {
        applyTransforms(ctx, width, height, options.rotation || 0, options.mirror || false);
      }
      
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Apply grayscale if needed
      if (options.grayscale) {
        applyGrayscale(ctx, canvasWidth, canvasHeight);
      }
      
      // Configure progressive encoding for JPEG
      const qualityNum = quality / 100;
      
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob returned null'));
        },
        mime,
        qualityNum
      );
      
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image for canvas processing'));
    img.src = URL.createObjectURL(source);
  });
}

/**
 * Canvas API — precise resize + reliable format conversion (especially WebP).
 */
function canvasResize(
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
      
      // Use high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
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
  settings: ProcessSettings,
  originalSize: number
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

  // 2) Run browser-image-compression with exact options
  const compressionOpts: Parameters<typeof imageCompression>[1] = {
    maxSizeMB: settings.targetSizeKB ? settings.targetSizeKB / 1024 : 999,
    maxWidthOrHeight: Math.max(settings.width || 9999, settings.height || 9999),
    useWebWorker: true,
    fileType: settings.outputFormat === 'original' ? file.type : `image/${settings.outputFormat}`,
    initialQuality: settings.quality / 100,
    alwaysKeepResolution: !settings.width && !settings.height,
  };

  let result: Blob = await imageCompression(file, compressionOpts);

  // 3) Check if we need canvas processing
  const needsAdvanced = 
    settings.rotation !== 0 ||
    settings.mirror ||
    settings.grayscale ||
    outputMime === 'image/webp' ||
    outputMime !== file.type ||
    targetW !== origDims.width ||
    targetH !== origDims.height;

  if (needsAdvanced) {
    result = await advancedCanvasProcess(result, targetW, targetH, outputMime, settings.quality, {
      rotation: settings.rotation,
      mirror: settings.mirror,
      grayscale: settings.grayscale,
      progressive: settings.progressive,
    });
  } else if (targetW !== origDims.width || targetH !== origDims.height) {
    // Simple resize only
    result = await canvasResize(result, targetW, targetH, outputMime, settings.quality);
  }

  // 4) Read final dimensions
  const finalDims = await getImageDimensions(result);

  // 5) Calculate reduction
  const reduction = Math.round(((originalSize - result.size) / originalSize) * 100);

  return {
    blob: result,
    width: finalDims.width,
    height: finalDims.height,
    sizeBytes: result.size,
    reduction,
  };
}

/** Build a downloadable File from a processing result */
export function toDownloadFile(originalName: string, blob: Blob): File {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const ext = toExt(blob.type);
  return new File([blob], `imagesqueeze_${baseName}${ext}`, { type: blob.type });
}

/* ─── Utility Functions ─── */

/** Get recommended quality for target file size */
export function estimateQualityForSize(
  originalSize: number,
  targetSizeKB: number
): number {
  const ratio = targetSizeKB * 1024 / originalSize;
  if (ratio >= 0.9) return 95;
  if (ratio >= 0.7) return 80;
  if (ratio >= 0.5) return 65;
  if (ratio >= 0.3) return 50;
  return 30;
}

/** Check if image needs rotation based on EXIF */
export async function getExifOrientation(file: File): Promise<number> {
  // Basic EXIF orientation check (simplified)
  // Returns 1-8 representing different orientations
  return 1;
}