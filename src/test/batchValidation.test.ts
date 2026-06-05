import { describe, it, expect } from 'vitest';
import {
  validateBatch,
  MAX_FILES,
  MAX_FILE_SIZE,
  MAX_TOTAL_BATCH_SIZE,
  LARGE_FILE_THRESHOLD,
} from '@/utils/batchValidation';

function makeFile(name: string, sizeBytes: number, type = 'image/jpeg'): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe('batchValidation constants', () => {
  it('exposes the expected limits', () => {
    expect(MAX_FILES).toBe(50);
    expect(MAX_FILE_SIZE).toBe(25 * 1024 * 1024);
    expect(MAX_TOTAL_BATCH_SIZE).toBe(750 * 1024 * 1024);
    expect(LARGE_FILE_THRESHOLD).toBe(10 * 1024 * 1024);
  });
});

describe('validateBatch', () => {
  it('returns an empty report for an empty input', () => {
    const r = validateBatch([], 0);
    expect(r.accepted).toEqual([]);
    expect(r.overflow).toEqual([]);
    expect(r.oversized).toEqual([]);
    expect(r.acceptedBytes).toBe(0);
    expect(r.hasLargeFiles).toBe(false);
    expect(r.hasAnimatedGifs).toBe(false);
    expect(r.animatedGifCount).toBe(0);
    expect(r.largeFileCount).toBe(0);
    expect(r.exceedsTotalCap).toBe(false);
  });

  it('accepts a small batch in full', () => {
    const files = [
      makeFile('a.jpg', 1_000_000),
      makeFile('b.png', 2_000_000),
      makeFile('c.webp', 3_000_000),
    ];
    const r = validateBatch(files, 0);
    expect(r.accepted).toEqual([0, 1, 2]);
    expect(r.overflow).toEqual([]);
    expect(r.oversized).toEqual([]);
    expect(r.acceptedBytes).toBe(6_000_000);
    expect(r.hasLargeFiles).toBe(false);
    expect(r.hasAnimatedGifs).toBe(false);
  });

  it('returns indices into the original list (not the resulting list)', () => {
    const files = [
      makeFile('big.jpg', MAX_FILE_SIZE + 1),       // oversized
      makeFile('ok.jpg', 1_000_000),
      makeFile('another-big.jpg', MAX_FILE_SIZE + 1), // oversized
      makeFile('also-ok.jpg', 2_000_000),
    ];
    const r = validateBatch(files, 0);
    expect(r.accepted).toEqual([1, 3]);
    expect(r.oversized).toEqual([0, 2]);
  });

  it('handles a mixed batch (oversized, GIF, large, small) correctly', () => {
    const files = [
      makeFile('small.jpg', 500_000),                                       // 0: ok
      makeFile('huge.jpg', MAX_FILE_SIZE + 1),                              // 1: oversized
      makeFile('big.jpg', LARGE_FILE_THRESHOLD + 1_000_000),                // 2: large (still accepted)
      makeFile('anim.gif', 1_000_000, 'image/gif'),                         // 3: GIF
      makeFile('tiny.png', 100_000),                                        // 4: ok
    ];
    const r = validateBatch(files, 0);
    expect(r.accepted).toEqual([0, 2, 3, 4]);
    expect(r.oversized).toEqual([1]);
    expect(r.hasLargeFiles).toBe(true);
    expect(r.largeFileCount).toBe(1);
    expect(r.hasAnimatedGifs).toBe(true);
    expect(r.animatedGifCount).toBe(1);
  });

  it('detects animated GIFs by mime AND extension (case-insensitive)', () => {
    const cases: Array<[string, string]> = [
      ['anim.gif', 'image/gif'],
      ['anim.GIF', 'image/gif'],
      ['pic.gif', 'image/jpeg'],              // extension wins when mime is wrong
      ['pic.GIF', 'image/png'],
    ];
    const files = cases.map(([n, t]) => makeFile(n, 100_000, t));
    const r = validateBatch(files, 0);
    expect(r.hasAnimatedGifs).toBe(true);
    expect(r.animatedGifCount).toBe(4);
  });

  it('flags files that would push the total batch size over MAX_TOTAL_BATCH_SIZE', () => {
    const tenMeg = 10 * 1024 * 1024;
    // 80 × 10 MB = 800 MB > 750 MB cap, all 50 should still be accepted
    // (the cap is a soft warning, not a hard reject)
    const files = Array.from({ length: 80 }, (_, i) => makeFile(`f${i}.jpg`, tenMeg));
    const r = validateBatch(files, 0);
    expect(r.accepted.length).toBe(50);
    expect(r.overflow.length).toBe(30);
    expect(r.acceptedBytes).toBe(50 * tenMeg);
    expect(r.exceedsTotalCap).toBe(true);
  });

  it('does not flag total cap for sub-cap batches', () => {
    const oneMeg = 1024 * 1024;
    const files = Array.from({ length: 10 }, (_, i) => makeFile(`f${i}.jpg`, oneMeg));
    const r = validateBatch(files, 0);
    expect(r.acceptedBytes).toBe(10 * oneMeg);
    expect(r.exceedsTotalCap).toBe(false);
  });

  it('caps the batch to MAX_FILES (incoming + current)', () => {
    const small = makeFile('tiny.jpg', 1000);
    const current = 45;
    const incoming = Array.from({ length: 20 }, (_, i) => makeFile(`f${i}.jpg`, 1000));
    const r = validateBatch(incoming, current);
    expect(r.accepted).toHaveLength(5);                // 45 + 5 = 50
    expect(r.accepted.length + r.overflow.length).toBe(20);
  });

  it('handles currentCount >= MAX_FILES by accepting nothing', () => {
    const files = [makeFile('a.jpg', 1000)];
    const r = validateBatch(files, MAX_FILES);
    expect(r.accepted).toEqual([]);
    expect(r.overflow).toEqual([0]);
  });

  it('preserves input order in accepted (FIFO)', () => {
    const files = [
      makeFile('a.jpg', 100),
      makeFile('b.jpg', 100),
      makeFile('c.jpg', 100),
    ];
    const r = validateBatch(files, 0);
    expect(r.accepted).toEqual([0, 1, 2]);
  });

  it('does NOT re-penalize a file for being large AND a GIF (one report per index)', () => {
    const files = [makeFile('huge.gif', LARGE_FILE_THRESHOLD + 1, 'image/gif')];
    const r = validateBatch(files, 0);
    expect(r.accepted).toEqual([0]);
    expect(r.hasLargeFiles).toBe(true);
    expect(r.hasAnimatedGifs).toBe(true);
    expect(r.largeFileCount).toBe(1);
    expect(r.animatedGifCount).toBe(1);
  });

  it('treats files right at the MAX_FILE_SIZE limit as accepted (boundary)', () => {
    const files = [makeFile('exact.jpg', MAX_FILE_SIZE)];
    const r = validateBatch(files, 0);
    expect(r.accepted).toEqual([0]);
    expect(r.oversized).toEqual([]);
  });

  it('treats files right at the LARGE_FILE_THRESHOLD as not-large (boundary)', () => {
    const files = [makeFile('ten.jpg', LARGE_FILE_THRESHOLD)];
    const r = validateBatch(files, 0);
    expect(r.hasLargeFiles).toBe(false);
    expect(r.largeFileCount).toBe(0);
  });
});
