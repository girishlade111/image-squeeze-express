import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  getReductionRatio,
  getQualityPresetSettings,
  PDF_QUALITY_PRESETS,
} from '../utils/pdfProcessor';

describe('pdfProcessor helpers', () => {
  describe('formatBytes', () => {
    it('formats bytes (< 1024)', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(512)).toBe('512 B');
    });

    it('formats kilobytes (< 1 MB)', () => {
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(2_457_600)).toBe('2400.0 KB');
    });

    it('formats megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
      expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.50 MB');
    });

    it('handles invalid input', () => {
      expect(formatBytes(-1)).toBe('0 B');
      expect(formatBytes(NaN)).toBe('0 B');
      expect(formatBytes(Infinity)).toBe('0 B');
    });
  });

  describe('getReductionRatio', () => {
    it('returns reduction percentage', () => {
      expect(getReductionRatio(1_000_000, 200_000)).toBe('▼ 80%');
      expect(getReductionRatio(1_000_000, 100_000)).toBe('▼ 90%');
    });

    it('returns increase percentage when file grew', () => {
      expect(getReductionRatio(500_000, 1_000_000)).toBe('▲ 100%');
    });

    it('handles equal sizes', () => {
      expect(getReductionRatio(1000, 1000)).toBe('— same');
    });

    it('handles zero original', () => {
      expect(getReductionRatio(0, 100)).toBe('— same');
    });
  });

  describe('getQualityPresetSettings', () => {
    it('returns the matching preset settings for known presets', () => {
      expect(getQualityPresetSettings('low')).toEqual(PDF_QUALITY_PRESETS.low);
      expect(getQualityPresetSettings('medium')).toEqual(PDF_QUALITY_PRESETS.medium);
      expect(getQualityPresetSettings('high')).toEqual(PDF_QUALITY_PRESETS.high);
    });

    it('returns medium-equivalent defaults for custom', () => {
      const custom = getQualityPresetSettings('custom');
      expect(custom.quality).toBeGreaterThanOrEqual(0.1);
      expect(custom.quality).toBeLessThanOrEqual(1);
      expect(custom.scale).toBeGreaterThan(0);
    });

    it('low preset produces smaller output than high preset', () => {
      expect(PDF_QUALITY_PRESETS.low.quality).toBeLessThan(PDF_QUALITY_PRESETS.high.quality);
      expect(PDF_QUALITY_PRESETS.low.maxWidth!).toBeLessThanOrEqual(
        PDF_QUALITY_PRESETS.high.maxWidth!
      );
    });

    it('all preset qualities are within the valid 0..1 range', () => {
      for (const p of Object.values(PDF_QUALITY_PRESETS)) {
        expect(p.quality).toBeGreaterThan(0);
        expect(p.quality).toBeLessThanOrEqual(1);
        expect(p.scale).toBeGreaterThan(0);
        if (p.maxWidth !== null) {
          expect(p.maxWidth).toBeGreaterThan(0);
        }
      }
    });
  });
});
