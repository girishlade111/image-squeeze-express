import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  addHistoryEntry,
  blobToDataUrl,
  clearHistory,
  dataUrlToBlob,
  deleteHistoryEntry,
  formatBytes,
  formatRelativeDate,
  loadHistory,
  MAX_HISTORY_ENTRIES,
} from '@/utils/historyStorage';

const STORAGE_KEY = 'ls-image-compressor-history';

const makeEntry = (overrides: Partial<{
  id: string;
  tool: 'image' | 'pdf';
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: number;
  dataUrl: string;
}> = {}) => ({
  id: 'test-1',
  tool: 'image' as const,
  fileName: 'test.jpg',
  fileSize: 1024,
  mimeType: 'image/jpeg',
  createdAt: Date.now(),
  dataUrl: 'data:image/jpeg;base64,xxxx',
  ...overrides,
});

describe('historyStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadHistory', () => {
    it('returns an empty array when localStorage is empty', () => {
      expect(loadHistory()).toEqual([]);
    });

    it('returns an empty array when localStorage has invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not json');
      expect(loadHistory()).toEqual([]);
    });

    it('returns an empty array when localStorage has a non-array payload', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));
      expect(loadHistory()).toEqual([]);
    });

    it('filters out invalid entries from a mixed array', () => {
      const valid = makeEntry({ id: 'good' });
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([valid, { broken: true }, null, 'string', 42])
      );
      const result = loadHistory();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('good');
    });

    it('sorts results by createdAt descending', () => {
      const old = makeEntry({ id: 'old', createdAt: 1000 });
      const mid = makeEntry({ id: 'mid', createdAt: 2000 });
      const newEntry = makeEntry({ id: 'new', createdAt: 3000 });
      localStorage.setItem(STORAGE_KEY, JSON.stringify([old, newEntry, mid]));
      const result = loadHistory();
      expect(result.map((e) => e.id)).toEqual(['new', 'mid', 'old']);
    });
  });

  describe('addHistoryEntry', () => {
    it('prepends new entries', () => {
      const first = addHistoryEntry(makeEntry({ id: 'a', createdAt: 1000 }));
      const second = addHistoryEntry(makeEntry({ id: 'b', createdAt: 2000 }));
      expect(second.map((e) => e.id)).toEqual(['b', 'a']);
      expect(first).toHaveLength(1);
    });

    it('dedupes by id (re-saving the same id updates in place)', () => {
      addHistoryEntry(makeEntry({ id: 'a', createdAt: 1000, fileName: 'old.jpg' }));
      addHistoryEntry(makeEntry({ id: 'a', createdAt: 2000, fileName: 'new.jpg' }));
      const result = loadHistory();
      expect(result).toHaveLength(1);
      expect(result[0].fileName).toBe('new.jpg');
      expect(result[0].createdAt).toBe(2000);
    });

    it('prunes to MAX_HISTORY_ENTRIES when over the cap', () => {
      for (let i = 0; i < MAX_HISTORY_ENTRIES + 10; i++) {
        addHistoryEntry(
          makeEntry({ id: `id-${i}`, createdAt: 1000 + i, fileName: `f-${i}.jpg` })
        );
      }
      const result = loadHistory();
      expect(result).toHaveLength(MAX_HISTORY_ENTRIES);
      expect(result[0].id).toBe(`id-${MAX_HISTORY_ENTRIES + 9}`);
      expect(result[result.length - 1].id).toBe('id-10');
    });
  });

  describe('deleteHistoryEntry', () => {
    it('removes a single entry by id', () => {
      addHistoryEntry(makeEntry({ id: 'a' }));
      addHistoryEntry(makeEntry({ id: 'b' }));
      const next = deleteHistoryEntry('a');
      expect(next).toHaveLength(1);
      expect(next[0].id).toBe('b');
      expect(loadHistory()).toHaveLength(1);
    });

    it('returns the same list when the id is not found', () => {
      addHistoryEntry(makeEntry({ id: 'a' }));
      const next = deleteHistoryEntry('nope');
      expect(next).toHaveLength(1);
    });
  });

  describe('clearHistory', () => {
    it('removes the storage key', () => {
      addHistoryEntry(makeEntry({ id: 'a' }));
      expect(loadHistory()).toHaveLength(1);
      clearHistory();
      expect(loadHistory()).toEqual([]);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('blob <-> data URL', () => {
    it('round-trips a blob through a data URL', async () => {
      const original = new Blob(['hello world'], { type: 'text/plain' });
      const dataUrl = await blobToDataUrl(original);
      expect(dataUrl).toMatch(/^data:text\/plain;base64,/);

      const restored = dataUrlToBlob(dataUrl);
      expect(restored.type).toBe('text/plain');
      const text = await new Response(restored).text();
      expect(text).toBe('hello world');
    });

    it('preserves binary data through the round trip', async () => {
      const bytes = new Uint8Array([0, 1, 2, 255, 128, 64]);
      const original = new Blob([bytes], { type: 'application/octet-stream' });
      const dataUrl = await blobToDataUrl(original);
      const restored = dataUrlToBlob(dataUrl);
      const restoredBytes = new Uint8Array(await new Response(restored).arrayBuffer());
      expect(Array.from(restoredBytes)).toEqual(Array.from(bytes));
    });

    it('dataUrlToBlob defaults to octet-stream for unknown mime', async () => {
      const blob = dataUrlToBlob('data:,hello');
      expect(blob.type).toBe('application/octet-stream');
      expect(blob.size).toBe(5);
    });
  });

  describe('formatBytes', () => {
    it('formats bytes, KB, and MB', () => {
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(2048)).toMatch(/KB$/);
      expect(formatBytes(5 * 1024 * 1024)).toMatch(/MB$/);
    });

    it('handles zero', () => {
      expect(formatBytes(0)).toBe('0 B');
    });
  });

  describe('formatRelativeDate', () => {
    const FIXED_NOW = 1_700_000_000_000;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_NOW);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "Just now" for under a minute', () => {
      expect(formatRelativeDate(FIXED_NOW - 30_000)).toBe('Just now');
    });

    it('returns minutes for under an hour', () => {
      expect(formatRelativeDate(FIXED_NOW - 5 * 60_000)).toMatch(/m ago$/);
    });

    it('returns hours for under a day', () => {
      expect(formatRelativeDate(FIXED_NOW - 3 * 3_600_000)).toMatch(/h ago$/);
    });

    it('returns days for under a week', () => {
      expect(formatRelativeDate(FIXED_NOW - 2 * 86_400_000)).toMatch(/d ago$/);
    });

    it('returns a locale date string for older entries', () => {
      const result = formatRelativeDate(FIXED_NOW - 30 * 86_400_000);
      expect(result).toMatch(/\d/);
    });
  });
});
