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

export const DEFAULT_FILENAME_PATTERN = 'ls-image-compressor_{name}.{ext}';

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

/**
 * Heuristic content analyzer. Renders a small thumbnail of the image and
 * inspects it to guess three things: is it photographic or graphical
 * (continuous tones vs. flat colors / sharp edges)? Does it have any
 * non-opaque pixels (transparency / alpha)? And how many distinct colors
 * does it appear to use?
 *
 * The numbers produced are rough on purpose — this is a fast classifier
 * that runs on a 64×64 thumbnail so it stays cheap even for a 50-image
 * batch. It exists to feed the format-recommendation engine.
 */
async function analyzeImageContent(
  file: Blob
): Promise<{ isPhoto: boolean; hasTransparency: boolean; estimatedColors: number }> {
  const SAMPLE = 64;
  let img: HTMLImageElement;
  let url: string;
  try {
    url = URL.createObjectURL(file);
    img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Failed to load image'));
      i.src = url;
    });
  } catch {
    return { isPhoto: true, hasTransparency: false, estimatedColors: 0 };
  } finally {
    try {
      if (url!) URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE;
  canvas.height = SAMPLE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { isPhoto: true, hasTransparency: false, estimatedColors: 0 };

  // Draw the source fitted into a square, preserving aspect ratio
  const aspect = img.naturalWidth / img.naturalHeight;
  let dw = SAMPLE;
  let dh = SAMPLE;
  let dx = 0;
  let dy = 0;
  if (aspect > 1) {
    dh = Math.round(SAMPLE / aspect);
    dy = Math.floor((SAMPLE - dh) / 2);
  } else if (aspect < 1) {
    dw = Math.round(SAMPLE * aspect);
    dx = Math.floor((SAMPLE - dw) / 2);
  }
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, SAMPLE, SAMPLE);
  ctx.drawImage(img, dx, dy, dw, dh);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, SAMPLE, SAMPLE).data;
  } catch {
    return { isPhoto: true, hasTransparency: false, estimatedColors: 0 };
  }

  let transparentPixels = 0;
  const colorSet = new Set<number>();
  let photoScore = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 250) transparentPixels++;

    // Quantize to 4 bits per channel for color counting
    const key = (r >> 4) * 1024 + (g >> 4) * 32 + (b >> 4);
    colorSet.add(key);

    // Measure local variance: compare each pixel to a neighbor to count edges.
    // A photo has lots of low-amplitude edges, a graphic has fewer but
    // higher-amplitude edges.
    if (i > 4) {
      const dr = Math.abs(r - data[i - 4]);
      const dg = Math.abs(g - data[i - 3]);
      const db = Math.abs(b - data[i - 2]);
      const sum = dr + dg + db;
      if (sum > 30 && sum < 200) photoScore++;
      else if (sum >= 200) photoScore += 0.2;
    }
  }

  const totalPixels = SAMPLE * SAMPLE;
  const transparencyRatio = transparentPixels / totalPixels;
  const photoRatio = photoScore / totalPixels;
  // Heuristic: if more than 35% of edges are "soft" (low amplitude), it's
  // probably a photo. Graphics / screenshots have fewer soft edges.
  const isPhoto = photoRatio > 0.35;
  const hasTransparency = transparencyRatio > 0.005;
  const estimatedColors = colorSet.size * 16; // back-of-envelope

  return { isPhoto, hasTransparency, estimatedColors };
}

/**
 * Suggests the best output format, quality, and projected savings for a
 * given image. Pure metadata-only when possible, falls back to a 64×64
 * thumbnail analysis for the transparency / photo detection.
 *
 * The reasoning string is short and friendly so it can be surfaced in the UI.
 */
export async function recommendFormat(
  file: File,
  dims: { width: number; height: number }
): Promise<ImageMetadata> {
  const mp = (dims.width * dims.height) / 1_000_000;
  const aspect = dims.width / dims.height;

  // Cheap shortcut: GIF/BMP can never be smaller as anything other than
  // PNG (for graphics) or WebP/AVIF (for photos). Skip the analysis for
  // tiny files (< 5 KB) where the savings would be negligible.
  let content: { isPhoto: boolean; hasTransparency: boolean; estimatedColors: number };
  if (file.size < 5 * 1024) {
    content = { isPhoto: true, hasTransparency: false, estimatedColors: 256 };
  } else {
    try {
      content = await analyzeImageContent(file);
    } catch {
      content = { isPhoto: true, hasTransparency: false, estimatedColors: 0 };
    }
  }

  let recommendedFormat: ImageFormat;
  let recommendedQuality = 75;
  let reason: string;

  if (content.hasTransparency) {
    // Transparency-bearing images compress best as WebP (lossless alpha at
    // small size) or stay as PNG when lossless matters more than size.
    if (isFormatSupported('image/webp')) {
      recommendedFormat = 'webp';
      recommendedQuality = 80;
      reason = 'Transparency detected — WebP preserves alpha with great compression';
    } else {
      recommendedFormat = 'png';
      recommendedQuality = 100;
      reason = 'Transparency detected — PNG preserves alpha losslessly';
    }
  } else if (!content.isPhoto) {
    // Graphics, screenshots, line art — few colors, lots of flat regions
    if (isFormatSupported('image/webp')) {
      recommendedFormat = 'webp';
      recommendedQuality = 90;
      reason = 'Graphic/screenshot detected — WebP keeps edges crisp at small size';
    } else {
      recommendedFormat = 'png';
      recommendedQuality = 100;
      reason = 'Graphic detected — PNG is lossless and ideal for sharp edges';
    }
  } else {
    // Photographic content
    if (isFormatSupported('image/avif')) {
      recommendedFormat = 'avif';
      recommendedQuality = 65;
      reason = 'Photo detected — AVIF gives the smallest files at great quality';
    } else if (isFormatSupported('image/webp')) {
      recommendedFormat = 'webp';
      recommendedQuality = 75;
      reason = 'Photo detected — WebP is ~30% smaller than JPEG at the same quality';
    } else {
      recommendedFormat = 'jpeg';
      recommendedQuality = 80;
      reason = 'Photo detected — JPEG is the most widely supported format';
    }
  }

  // Projected savings — rough, based on the format's typical compression
  // ratio for the detected content type. Used to show "save ~60%" in the UI.
  const ratioFor: Record<ImageFormat, number> = {
    avif: content.isPhoto ? 0.25 : 0.45,
    webp: content.isPhoto ? 0.35 : 0.55,
    jpeg: content.isPhoto ? 0.55 : 0.85,
    png: content.hasTransparency ? 0.65 : 0.95,
    original: 1,
  };
  const estimatedSavings = Math.round((1 - ratioFor[recommendedFormat]) * 100);

  return {
    width: dims.width,
    height: dims.height,
    megapixels: mp,
    aspectRatio: aspect,
    isPhoto: content.isPhoto,
    hasTransparency: content.hasTransparency,
    estimatedColors: content.estimatedColors,
    recommendedFormat,
    recommendedQuality,
    estimatedSavings: Math.max(0, estimatedSavings),
    recommendationReason: reason,
  };
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

interface CalcResult {
  w: number;
  h: number;
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
  // the user typed both width and height). Honor them as-is. When the source
  // aspect ratio differs, canvasProcess letterboxes/pillarboxes the source so
  // the full image remains visible — no cropping ever.
  const w = safeW || origW;
  const h = safeH || origH;
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
  }
): Promise<Blob> {
  const img = await loadImage(source);

  // Canvas dimensions swap for 90/270 rotation so the rotated image fits
  const rot = options.rotation || 0;
  const swapDims = rot === 90 || rot === 270;
  const canvasWidth = swapDims ? height : width;
  const canvasHeight = swapDims ? width : height;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill background. JPEG gets white (no alpha channel), everything else
  // (PNG/WebP/AVIF) keeps the canvas default — fully transparent — so the
  // letterbox padding blends with whatever the image is placed on.
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Effective source dimensions after the pending rotation. The fitted size
  // must reflect the rotated footprint, otherwise 90°/270° rotation would
  // letterbox on the wrong axis.
  const srcW = swapDims ? img.naturalHeight : img.naturalWidth;
  const srcH = swapDims ? img.naturalWidth : img.naturalHeight;

  // Fit the entire source inside the canvas while preserving aspect ratio.
  // Any leftover space is padding — the image is never cropped. When the
  // source aspect matches the canvas aspect, drawW/drawH equal the canvas
  // size and there is no padding at all.
  const targetAspect = canvasWidth / canvasHeight;
  const sourceAspect = srcW / srcH;

  let drawW: number;
  let drawH: number;
  if (sourceAspect > targetAspect) {
    drawW = canvasWidth;
    drawH = canvasWidth / sourceAspect;
  } else {
    drawH = canvasHeight;
    drawW = canvasHeight * sourceAspect;
  }

  const offsetX = (canvasWidth - drawW) / 2;
  const offsetY = (canvasHeight - drawH) / 2;

  const needsTransform = rot !== 0 || options.mirror;

  if (needsTransform) {
    // Pivot around the center of the fitted image so rotation/mirror rotate
    // the visible content, not the whole canvas.
    ctx.translate(offsetX + drawW / 2, offsetY + drawH / 2);
    if (options.mirror) ctx.scale(-1, 1);
    if (rot) ctx.rotate((rot * Math.PI) / 180);
    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );
  } else {
    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      offsetX,
      offsetY,
      drawW,
      drawH
    );
  }

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

  out = out
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
  if (out.length === 0) {
    // Everything was stripped — fall back to the safe default
    out = `ls-image-compressor_${baseName}`;
  }

  // Cap the base name BEFORE appending the extension so the final length
  // stays predictable. The extension itself is 5 chars max (.webp/.avif).
  const dotExt = toExt(blob.type);
  if (out.length > 195) out = out.slice(0, 195);

  // Guarantee the right extension is appended when the pattern omits it
  if (!out.toLowerCase().endsWith(dotExt.toLowerCase())) {
    out = out + dotExt;
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
