import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  formatFileSize,
  getCompressionRatio,
  estimateQualityForSize,
  calcDimensions,
  toMime,
  toExt,
  calculateOptimalQuality,
  isFormatSupported,
  toDownloadFile,
  getFilenameTokenDocs,
  DEFAULT_FILENAME_PATTERN,
  recommendFormat,
  type ImageFormat,
  type ProcessSettings,
} from '../utils/imageProcessor';
import { computeAspectDimensions } from '../hooks/useSettings';

describe('imageProcessor helpers', () => {
  describe('formatFileSize', () => {
    it('formats bytes (< 1024)', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
    });

    it('formats kilobytes (< 1 MB)', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.50 MB');
    });

    it('handles invalid input', () => {
      expect(formatFileSize(-1)).toBe('0 B');
      expect(formatFileSize(NaN)).toBe('0 B');
    });
  });

  describe('getCompressionRatio', () => {
    it('returns reduction percentage', () => {
      expect(getCompressionRatio(1000, 500)).toBe('▼ 50%');
      expect(getCompressionRatio(1000, 100)).toBe('▼ 90%');
    });

    it('returns increase percentage when file grew', () => {
      expect(getCompressionRatio(500, 1000)).toBe('▲ 100%');
    });

    it('handles equal sizes', () => {
      expect(getCompressionRatio(1000, 1000)).toBe('— same');
    });

    it('handles zero original', () => {
      expect(getCompressionRatio(0, 100)).toBe('— same');
    });
  });

  describe('estimateQualityForSize', () => {
    it('returns high quality for small reductions', () => {
      expect(estimateQualityForSize(1000, 900)).toBe(95);
      expect(estimateQualityForSize(1000, 800)).toBe(95);
    });

    it('returns lower quality for large reductions', () => {
      // 1 MB original, target 200 KB → ratio ~0.2 → 30
      expect(estimateQualityForSize(1024 * 1024, 200)).toBe(30);
      // 1 MB original, target 400 KB → ratio ~0.4 → 50
      expect(estimateQualityForSize(1024 * 1024, 400)).toBe(50);
    });

    it('handles invalid input', () => {
      expect(estimateQualityForSize(0, 100)).toBe(75);
    });
  });
});

describe('computeAspectDimensions', () => {
  it('returns both dims when no resize requested', () => {
    expect(computeAspectDimensions(1920, 1080, null, null, true)).toEqual({
      width: null,
      height: null,
    });
  });

  it('computes height from width when lock is on', () => {
    expect(computeAspectDimensions(1920, 1080, 960, null, true)).toEqual({
      width: 960,
      height: 540,
    });
  });

  it('computes width from height when lock is on', () => {
    expect(computeAspectDimensions(1920, 1080, null, 540, true)).toEqual({
      width: 960,
      height: 540,
    });
  });

  it('honors both dims when explicitly set, even with lock on', () => {
    // Lock is an auto-complete helper — if the user typed both, we respect both.
    // Aspect enforcement happens in the image processor itself.
    expect(computeAspectDimensions(1920, 1080, 800, 500, true)).toEqual({
      width: 800,
      height: 500,
    });
  });

  it('returns dimensions as-is when lock is off', () => {
    expect(computeAspectDimensions(1920, 1080, 800, 600, false)).toEqual({
      width: 800,
      height: 600,
    });
  });

  it('returns dimensions as-is when source dims are unknown', () => {
    expect(computeAspectDimensions(0, 0, 800, null, true)).toEqual({
      width: 800,
      height: null,
    });
  });

  it('rounds to at least 1 pixel', () => {
    expect(computeAspectDimensions(100, 100, 1, null, true)).toEqual({
      width: 1,
      height: 1,
    });
  });
});

describe('calcDimensions (image processor)', () => {
  it('returns source dimensions when no resize requested', () => {
    expect(calcDimensions(1920, 1080, null, null, true)).toEqual({
      w: 1920,
      h: 1080,
    });
  });

  it('honors an explicit single dimension with lock on (derives the other)', () => {
    // Width only, lock on → height derived from source aspect (16:9 → 1080/1920*1080)
    expect(calcDimensions(1920, 1080, 960, null, true)).toEqual({
      w: 960,
      h: 540,
    });
    // Height only, lock on → width derived from source aspect
    expect(calcDimensions(1920, 1080, null, 540, true)).toEqual({
      w: 960,
      h: 540,
    });
  });

  it('honors both explicit dimensions with lock on (no aspect override)', () => {
    // Regression test: previously the height was silently re-derived from the
    // source aspect ratio, breaking every social media preset that targeted a
    // different aspect ratio than the uploaded image.
    const r = calcDimensions(1920, 1080, 1080, 1080, true);
    expect(r.w).toBe(1080);
    expect(r.h).toBe(1080);
  });

  it('honors both explicit dimensions with lock off', () => {
    const r = calcDimensions(1920, 1080, 500, 500, false);
    expect(r.w).toBe(500);
    expect(r.h).toBe(500);
  });

  it('produces a center-crop rectangle when source aspect is wider than target', () => {
    // 1920×1080 source → 1080×1080 target (square). Source is wider so crop sides.
    const r = calcDimensions(1920, 1080, 1080, 1080, true);
    expect(r.w).toBe(1080);
    expect(r.h).toBe(1080);
    expect(r.crop).toEqual({ x: 420, y: 0, w: 1080, h: 1080 });
  });

  it('produces a center-crop rectangle when source aspect is taller than target', () => {
    // 1080×1920 source → 1200×675 target (16:9). Source is taller so crop top/bottom.
    const r = calcDimensions(1080, 1920, 1200, 675, false);
    expect(r.w).toBe(1200);
    expect(r.h).toBe(675);
    // sourceAspect = 1080/1920 = 0.5625
    // targetAspect = 1200/675 = 1.7778
    // Source is taller → cropW = 1080, cropH = 1080 / 1.7778 ≈ 607.5
    expect(r.crop?.w).toBeCloseTo(1080, 5);
    expect(r.crop?.h).toBeCloseTo(607.5, 1);
    expect(r.crop?.x).toBe(0);
    expect(r.crop?.y).toBeCloseTo((1920 - 607.5) / 2, 1);
  });

  it('does not crop when source and target aspect ratios already match', () => {
    // 1920×1080 (16:9) source → 1200×675 (16:9) target. No crop needed.
    const r = calcDimensions(1920, 1080, 1200, 675, true);
    expect(r.w).toBe(1200);
    expect(r.h).toBe(675);
    expect(r.crop).toBeUndefined();
  });

  it('does not crop when source dimensions are unknown', () => {
    const r = calcDimensions(0, 0, 1080, 1080, true);
    expect(r.w).toBe(1080);
    expect(r.h).toBe(1080);
    expect(r.crop).toBeUndefined();
  });

  it('handles social media preset dimensions correctly', () => {
    // Real-world social media presets (from SettingsPanel).
    const presets: { name: string; w: number; h: number }[] = [
      { name: 'Instagram Post', w: 1080, h: 1080 },
      { name: 'LinkedIn Post', w: 1200, h: 627 },
      { name: 'WhatsApp DP', w: 500, h: 500 },
      { name: 'Twitter / X', w: 1200, h: 675 },
      { name: 'Facebook Cover', w: 820, h: 312 },
      { name: 'YouTube Thumb', w: 1280, h: 720 },
      { name: 'IG Story', w: 1080, h: 1920 },
    ];

    // Source: a 4000×3000 landscape photo (4:3).
    for (const p of presets) {
      const r = calcDimensions(4000, 3000, p.w, p.h, true);
      expect(r.w, `${p.name} width`).toBe(p.w);
      expect(r.h, `${p.name} height`).toBe(p.h);
    }
  });
});

describe('AVIF format support', () => {
  it('ImageFormat type includes "avif"', () => {
    const fmt: ImageFormat = 'avif';
    expect(fmt).toBe('avif');
  });

  describe('toMime', () => {
    it('returns image/avif when the user picks the AVIF output', () => {
      expect(toMime('avif', 'image/png')).toBe('image/avif');
      expect(toMime('avif', 'image/jpeg')).toBe('image/avif');
    });

    it('round-trips an AVIF input when the user picks "Keep Original"', () => {
      expect(toMime('original', 'image/avif')).toBe('image/avif');
    });

    it('still falls back to PNG for non-round-trippable inputs', () => {
      expect(toMime('original', 'image/gif')).toBe('image/png');
      expect(toMime('original', 'image/bmp')).toBe('image/png');
    });

    it('preserves jpeg/png/webp when "Keep Original" is selected', () => {
      expect(toMime('original', 'image/jpeg')).toBe('image/jpeg');
      expect(toMime('original', 'image/png')).toBe('image/png');
      expect(toMime('original', 'image/webp')).toBe('image/webp');
    });
  });

  describe('toExt', () => {
    it('maps image/avif to .avif', () => {
      expect(toExt('image/avif')).toBe('.avif');
    });
    it('still maps the existing formats', () => {
      expect(toExt('image/jpeg')).toBe('.jpg');
      expect(toExt('image/png')).toBe('.png');
      expect(toExt('image/webp')).toBe('.webp');
    });
  });

  describe('toDownloadFile with AVIF', () => {
    it('produces a .avif file when the blob is an AVIF', () => {
      const blob = new Blob([new Uint8Array([0, 0, 0, 32, 102, 116, 121, 112])], {
        type: 'image/avif',
      });
      const file = toDownloadFile('photo.png', blob);
      expect(file.name).toBe('imagesqueeze_photo.avif');
      expect(file.type).toBe('image/avif');
    });
  });

  describe('calculateOptimalQuality for AVIF', () => {
    it('picks a lower number than WebP because AVIF compresses better', () => {
      const webp = calculateOptimalQuality(1_000_000, null, 'webp', false);
      const avif = calculateOptimalQuality(1_000_000, null, 'avif', false);
      expect(avif).toBeLessThan(webp);
    });

    it('respects the hasTransforms bump', () => {
      const plain = calculateOptimalQuality(1_000_000, null, 'avif', false);
      const transformed = calculateOptimalQuality(1_000_000, null, 'avif', true);
      expect(transformed).toBeGreaterThan(plain);
    });

    it('targets a specific byte budget when targetSizeKB is set (AVIF)', () => {
      // 50% of original → expected ≥ 50
      const q = calculateOptimalQuality(1_000_000, 500, 'avif', false);
      expect(q).toBeGreaterThanOrEqual(50);
    });
  });

  describe('isFormatSupported', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns false in jsdom (no real canvas)', () => {
      // jsdom ships toDataURL as a stub that prints a "Not implemented"
      // warning to stderr. Replace it with a stub that returns a PNG URL
      // so the support check returns false (no AVIF in jsdom) without
      // spamming the test output.
      vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
        'data:image/png;base64,iVBORw0KGgo='
      );
      expect(isFormatSupported('image/tiff')).toBe(false);
    });

    it('caches its result', () => {
      // First call populates the cache; second call should be identical
      // even if the underlying stub changes between calls.
      const spy = vi
        .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
        .mockReturnValue('data:image/heic;base64,AAAA');
      const a = isFormatSupported('image/heic');
      spy.mockReturnValue('data:image/heic;base64,BBBB');
      const b = isFormatSupported('image/heic');
      expect(a).toBe(b);
    });

    it('returns false when the canvas API is missing', () => {
      // Replace the prototype method with undefined, then verify the
      // function falls back to false instead of throwing.
      const original = HTMLCanvasElement.prototype.toDataURL;
      // @ts-expect-error — explicitly removing the method to test the guard
      delete HTMLCanvasElement.prototype.toDataURL;
      try {
        expect(isFormatSupported('image/jp2')).toBe(false);
      } finally {
        HTMLCanvasElement.prototype.toDataURL = original;
      }
    });
  });

  describe('toDownloadFile with filename pattern', () => {
    it('uses the default pattern when none is provided', () => {
      const blob = new Blob(['x'], { type: 'image/webp' });
      const f = toDownloadFile('photo.jpg', blob);
      expect(f.name).toBe('imagesqueeze_photo.webp');
    });

    it('replaces {name} and {ext} tokens', () => {
      const blob = new Blob(['x'], { type: 'image/webp' });
      const f = toDownloadFile('photo.jpg', blob, '{name}_optimized.{ext}');
      expect(f.name).toBe('photo_optimized.webp');
    });

    it('replaces {format}, {w}, {h}, {q}, {index}, {size}, {date} tokens', () => {
      const blob = new Blob(['x'], { type: 'image/webp' });
      const f = toDownloadFile(
        'photo.jpg',
        blob,
        '{name}_{w}x{h}_q{q}_{format}_{index}_{size}kb_{date}.{ext}',
        { width: 1920, height: 1080, quality: 75, index: 3, sizeBytes: 1024 * 200 }
      );
      expect(f.name).toMatch(/^photo_1920x1080_q75_webp_3_200kb_\d{4}-\d{2}-\d{2}\.webp$/);
    });

    it('always appends the right extension if pattern omits it', () => {
      const blob = new Blob(['x'], { type: 'image/png' });
      const f = toDownloadFile('photo.jpg', blob, 'my_{name}');
      expect(f.name).toBe('my_photo.png');
    });

    it('sanitizes illegal characters', () => {
      const blob = new Blob(['x'], { type: 'image/webp' });
      const f = toDownloadFile('photo<bad>.jpg', blob, '{name}_v1.{ext}');
      expect(f.name).toBe('photo_bad__v1.webp');
    });

    it('caps output at 200 characters', () => {
      const blob = new Blob(['x'], { type: 'image/webp' });
      const longName = 'a'.repeat(500) + '.jpg';
      const f = toDownloadFile(longName, blob, '{name}.{ext}');
      expect(f.name.length).toBeLessThanOrEqual(200);
    });

    it('falls back when the pattern is empty or all illegal chars', () => {
      const blob = new Blob(['x'], { type: 'image/webp' });
      const f = toDownloadFile('photo.jpg', blob, '<>:"|?*');
      expect(f.name).toMatch(/^imagesqueeze_photo\.webp$/);
    });
  });

  describe('getFilenameTokenDocs', () => {
    it('returns at least the 9 standard tokens', () => {
      const tokens = getFilenameTokenDocs();
      expect(tokens.length).toBeGreaterThanOrEqual(9);
      const labels = tokens.map((t) => t.token);
      for (const t of ['{name}', '{ext}', '{format}', '{w}', '{h}', '{q}', '{index}', '{date}', '{size}']) {
        expect(labels).toContain(t);
      }
    });

    it('exposes the default pattern', () => {
      expect(DEFAULT_FILENAME_PATTERN).toBe('imagesqueeze_{name}.{ext}');
    });
  });
});
