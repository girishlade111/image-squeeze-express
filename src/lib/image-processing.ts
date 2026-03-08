import imageCompression from 'browser-image-compression';

export interface ProcessingSettings {
  quality: number; // 10-100
  targetSizeKB?: number;
  width?: number;
  height?: number;
  lockAspectRatio: boolean;
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'keep';
}

export interface ImageItem {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  status: 'ready' | 'processing' | 'done' | 'error';
  processedFile?: File;
  processedPreview?: string;
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  error?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function getOutputMime(settings: ProcessingSettings, originalType: string): string {
  if (settings.outputFormat === 'keep') return originalType;
  return settings.outputFormat;
}

function getExtension(mime: string): string {
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/png') return '.png';
  return '.jpg';
}

export async function processImage(
  file: File,
  settings: ProcessingSettings
): Promise<{ file: File; width: number; height: number }> {
  const outputMime = getOutputMime(settings, file.type);
  
  // Use browser-image-compression
  const options: any = {
    useWebWorker: true,
    initialQuality: settings.quality / 100,
    fileType: outputMime,
  };

  if (settings.targetSizeKB) {
    options.maxSizeMB = settings.targetSizeKB / 1024;
  } else {
    options.maxSizeMB = 50; // effectively unlimited
  }

  // Determine target dimensions
  let targetWidth = settings.width;
  let targetHeight = settings.height;

  if (targetWidth || targetHeight) {
    const maxDim = Math.max(targetWidth || 0, targetHeight || 0);
    if (maxDim > 0) options.maxWidthOrHeight = maxDim;
  }

  let compressed: File | Blob = await imageCompression(file, options);

  // Determine final dimensions for canvas pass
  const compressedDims = await getImageDimensions(compressed as File);
  const finalWidth = targetWidth || compressedDims.width;
  const finalHeight = targetHeight || compressedDims.height;

  // Always use Canvas API as fallback for format conversion (especially WebP)
  // and for precise resizing. This ensures reliable WebP output across browsers.
  const needsCanvasPass =
    outputMime === 'image/webp' ||
    (targetWidth && targetHeight) ||
    outputMime !== file.type;

  if (needsCanvasPass) {
    compressed = await convertWithCanvas(compressed, finalWidth, finalHeight, outputMime, settings.quality);
  }

  // Get final dimensions
  const dims = await getImageDimensions(compressed as File);

  // Rename file with correct extension
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const ext = getExtension(outputMime);
  const newFile = new File([compressed], `${baseName}-squeezed${ext}`, { type: outputMime });

  return { file: newFile, width: dims.width, height: dims.height };
}

/**
 * Canvas API fallback for reliable format conversion (especially WebP)
 * and precise resizing. Draws image onto canvas and exports as target MIME.
 */
async function convertWithCanvas(
  file: File | Blob,
  width: number,
  height: number,
  mime: string,
  quality: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], (file as File).name || 'image', { type: mime }));
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        mime,
        quality / 100
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function estimateCompressedSize(originalSize: number, quality: number): number {
  // Rough estimation: at quality 100 = ~original, at quality 10 = ~10% of original
  const factor = (quality / 100) * 0.8 + 0.1;
  return Math.round(originalSize * factor);
}
