import imageCompression from 'browser-image-compression';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'original';
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
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  reduction: number;
}

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

function toMime(format: ProcessSettings['outputFormat'], originalType: string): string {
  if (format === 'original') return originalType;
  return `image/${format}`;
}

function toExt(mime: string): string {
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/png') return '.png';
  return '.jpg';
}

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

function applyCanvasTransforms(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rotation: number,
  mirror: boolean,
  canvasW: number,
  canvasH: number
): void {
  ctx.translate(canvasW / 2, canvasH / 2);
  
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
  
  ctx.translate(-canvasW / 2, -canvasH / 2);
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
    progressive?: boolean;
  }
): Promise<Blob> {
  const img = await loadImage(source);
  
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
  
  if (options.rotation || options.mirror) {
    applyCanvasTransforms(
      ctx,
      width,
      height,
      options.rotation || 0,
      options.mirror || false,
      canvasWidth,
      canvasHeight
    );
  }
  
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
  
  if (options.grayscale) {
    applyGrayscale(ctx, canvasWidth, canvasHeight);
  }
  
  const qualityNum = Math.max(0.1, Math.min(1, quality / 100));
  
  return new Promise((resolve, reject) => {
    const mimeType = mime === 'image/jpeg' && options.progressive ? 'image/jpeg' : mime;
    
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      mimeType,
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
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(source);
  });
}

function calculateOptimalQuality(
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
  
  if (outputFormat === 'png') {
    return 100;
  }
  
  return 80;
}

async function compressWithCanvas(
  source: Blob,
  targetWidth: number,
  targetHeight: number,
  mime: string,
  quality: number
): Promise<Blob> {
  const img = await loadImage(source);
  
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  
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

export async function processImage(
  file: File,
  settings: ProcessSettings,
  originalSize: number
): Promise<ProcessResult> {
  const outputMime = toMime(settings.outputFormat, file.type);
  const origDims = await getImageDimensions(file);

  const { w: targetW, h: targetH } = calcDimensions(
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
  
  const quality = settings.autoOptimize
    ? calculateOptimalQuality(originalSize, settings.targetSizeKB, settings.outputFormat, hasTransforms)
    : settings.quality;

  let result: Blob;

  if (hasTransforms || needsResize || needsFormatChange) {
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
        progressive: settings.progressive && outputMime === 'image/jpeg',
      }
    );
    
    if (result.size > (settings.targetSizeKB || Infinity) * 1024 && settings.targetSizeKB) {
      let iterQuality = quality;
      let iterResult = result;
      
      for (let i = 0; i < 5; i++) {
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
            progressive: settings.progressive && outputMime === 'image/jpeg',
          }
        );
        
        if (iterResult.size <= settings.targetSizeKB! * 1024) {
          result = iterResult;
          break;
        }
        result = iterResult;
      }
    }
  } else {
    const compressionOpts: Parameters<typeof imageCompression>[1] = {
      maxSizeMB: settings.targetSizeKB ? settings.targetSizeKB / 1024 : 50,
      maxWidthOrHeight: Math.max(targetW, targetH),
      useWebWorker: true,
      fileType: outputMime,
      initialQuality: quality / 100,
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

export function toDownloadFile(originalName: string, blob: Blob): File {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const ext = toExt(blob.type);
  return new File([blob], `imagesqueeze_${baseName}${ext}`, { type: blob.type });
}

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

export async function getExifOrientation(file: File): Promise<number> {
  return 1;
}