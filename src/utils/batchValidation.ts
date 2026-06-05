/**
 * Pure validation logic for incoming image batches. The `useImageUpload` hook
 * calls this once per `addFiles` invocation to decide which files are kept,
 * which are skipped, and what warnings to surface — without mutating any state
 * itself, so the function is easy to unit-test.
 *
 * The function is metadata-only: it takes a shadow shape (`IncomingFile`) and
 * returns a report keyed by *array index* into the original list, so the
 * caller can map back to its real `File` objects without a key-collision
 * bug for files that share a name+size+type triple.
 *
 * Returns a structured report instead of throwing so the caller can decide
 * how to present each warning to the user (toast, banner, etc.).
 */

import { MAX_FILES, MAX_FILE_SIZE, MAX_TOTAL_BATCH_SIZE } from '@/hooks/imageUploadLimits';

export interface IncomingFile {
  name: string;
  size: number;
  type: string;
}

export interface BatchValidationReport {
  /** Indices into the original `incoming` array for files safe to add. */
  accepted: number[];
  /** Indices for files dropped because the queue would overflow MAX_FILES. */
  overflow: number[];
  /** Indices for files dropped because their size exceeded MAX_FILE_SIZE. */
  oversized: number[];
  /** Total bytes of the accepted set. */
  acceptedBytes: number;
  /** Soft warning: at least one accepted file is larger than 10 MB. */
  hasLargeFiles: boolean;
  /** Soft warning: at least one incoming file is an animated GIF. */
  hasAnimatedGifs: boolean;
  /** Count of incoming animated GIFs (for the toast message). */
  animatedGifCount: number;
  /** Count of accepted files larger than 10 MB (for the toast message). */
  largeFileCount: number;
  /**
   * Soft warning: total accepted bytes exceed the recommended batch cap
   * (MAX_TOTAL_BATCH_SIZE). The user can still proceed; the hook surfaces a
   * "may be slow" toast but does not refuse the files.
   */
  exceedsTotalCap: boolean;
}

const LARGE_FILE_WARN_BYTES = 10 * 1024 * 1024;

export function validateBatch(
  incoming: IncomingFile[],
  currentCount: number
): BatchValidationReport {
  const oversized: number[] = [];
  const viable: number[] = [];

  incoming.forEach((f, i) => {
    if (f.size > MAX_FILE_SIZE) {
      oversized.push(i);
    } else {
      viable.push(i);
    }
  });

  const remaining = Math.max(0, MAX_FILES - currentCount);
  const overflow = viable.length > remaining ? viable.slice(remaining) : [];
  const accepted = viable.slice(0, remaining);

  const acceptedBytes = accepted.reduce((s, i) => s + incoming[i].size, 0);
  const animatedGifIndices: number[] = [];
  incoming.forEach((f, i) => {
    if (f.type === 'image/gif') animatedGifIndices.push(i);
  });
  const largeFileCount = accepted.reduce(
    (n, i) => (incoming[i].size > LARGE_FILE_WARN_BYTES ? n + 1 : n),
    0
  );

  return {
    accepted,
    overflow,
    oversized,
    acceptedBytes,
    hasLargeFiles: largeFileCount > 0,
    hasAnimatedGifs: animatedGifIndices.length > 0,
    animatedGifCount: animatedGifIndices.length,
    largeFileCount,
    exceedsTotalCap: acceptedBytes > MAX_TOTAL_BATCH_SIZE,
  };
}
