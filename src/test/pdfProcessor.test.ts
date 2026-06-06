import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  getReductionRatio,
  getQualityPresetSettings,
  PDF_QUALITY_PRESETS,
  toDownloadPdfFile,
  DEFAULT_PDF_FILENAME_PATTERN,
  getPdfFilenameTokenDocs,
} from '../utils/pdfProcessor';

describe('pdfProcessor helpers', () => {
  describe('formatBytes', () => {
    it('formats bytes (< 1024)', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(512)).toBe('512 B');
    });

    it('formats kilobytes (< 1 MB)', () => {
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(900 * 1024)).toBe('900.0 KB');
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

  describe('power features', () => {
    it('all preset configs expose the new fields with sane defaults', () => {
      for (const p of Object.values(PDF_QUALITY_PRESETS)) {
        expect(p.targetSizeKB).toBeNull();
        expect(p.grayscale).toBe(false);
        expect(p.stripMetadata).toBe(false);
        expect(p.dpi).toBeNull();
        expect(p.filenamePattern).toBe(DEFAULT_PDF_FILENAME_PATTERN);
        expect(p.pageRange).toBeNull();
      }
    });

    it('getPdfFilenameTokenDocs lists all supported tokens', () => {
      const docs = getPdfFilenameTokenDocs();
      expect(docs.length).toBeGreaterThanOrEqual(8);
      const tokens = docs.map((d) => d.token);
      expect(tokens).toContain('{name}');
      expect(tokens).toContain('{ext}');
      expect(tokens).toContain('{pages}');
      expect(tokens).toContain('{size}');
      expect(tokens).toContain('{date}');
      expect(tokens).toContain('{q}');
      expect(tokens).toContain('{index}');
    });

    it('toDownloadPdfFile replaces tokens in the pattern', () => {
      const blob = new Blob([new Uint8Array(2048)], { type: 'application/pdf' });
      const file = toDownloadPdfFile(
        'mydoc.pdf',
        blob,
        '{name}_q{q}_p{pages}.{ext}',
        { quality: 0.6, pageCount: 12, index: 3 }
      );
      expect(file.name).toBe('mydoc_q60_p12.pdf');
      expect(file.type).toBe('application/pdf');
    });

    it('toDownloadPdfFile falls back to default when pattern strips to empty', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'application/pdf' });
      const file = toDownloadPdfFile('foo.pdf', blob, '////');
      expect(file.name).toMatch(/_compressed\.pdf$/);
    });

    it('toDownloadPdfFile strips illegal characters and collapses underscores', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'application/pdf' });
      const file = toDownloadPdfFile('hello.pdf', blob, 'a<b<c>d.pdf');
      expect(file.name).not.toMatch(/[<>:"/\\|?*\x00-\x1f]/);
      expect(file.name).not.toMatch(/_+/);
    });

    it('toDownloadPdfFile appends .pdf when pattern has no extension', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'application/pdf' });
      const file = toDownloadPdfFile('doc.pdf', blob, '{name}');
      expect(file.name.toLowerCase()).toMatch(/\.pdf$/);
    });

    it('toDownloadPdfFile caps the filename at 200 characters', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'application/pdf' });
      const longName = 'a'.repeat(300);
      const file = toDownloadPdfFile(`${longName}.pdf`, blob, '{name}');
      expect(file.name.length).toBeLessThanOrEqual(200);
      expect(file.name.toLowerCase()).toMatch(/\.pdf$/);
    });

    it('toDownloadPdfFile handles missing context (no index/quality/etc.)', () => {
      const blob = new Blob([new Uint8Array(1024)], { type: 'application/pdf' });
      const file = toDownloadPdfFile('foo.pdf', blob, '{name}_{q}_{pages}_{index}');
      expect(file.name).toMatch(/^foo_/);
      expect(file.name.toLowerCase()).toMatch(/\.pdf$/);
    });
  });
});
