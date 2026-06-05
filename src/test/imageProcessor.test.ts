import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  getCompressionRatio,
  estimateQualityForSize,
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
