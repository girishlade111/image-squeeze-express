/**
 * Pure validation logic for incoming image batches. The `useImageUpload` hook
 * calls this once per `addFiles` invocation to decide which files are kept,
 * which are skipped, and what warnings to surface — without mutating any state
 * itself, so the function is easy to unit-test.
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
  /** Files safe to add (already capped at the remaining slot count). */
  accepted: IncomingFile[];
  /** Files dropped because they would push the queue past MAX_FILES. */
  overflow: IncomingFile[];
  /** Files dropped because their individual size exceeded MAX_FILE_SIZE. */
  oversized: IncomingFile[];
  /** Total bytes of the `accepted` set. */
  acceptedBytes: number;
  /** Soft warning: at least one accepted file is larger than 10 MB. */
  hasLargeFiles: boolean;
  /** Soft warning: at least one accepted file is an animated GIF. */
  hasAnimatedGifs: boolean;
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
  const oversized = incoming.filter((f) => f.size > MAX_FILE_SIZE);
  // Only consider non-oversized files for the "what fits in the queue" pass.
  const viable = incoming.filter((f) => f.size <= MAX_FILE_SIZE);

  const remaining = Math.max(0, MAX_FILES - currentCount);
  const overflow = viable.length > remaining ? viable.slice(remaining) : [];
  const accepted = viable.slice(0, remaining);

  const acceptedBytes = accepted.reduce((s, f) => s + f.size, 0);
  const animatedGifCount = incoming.filter((f) => f.type === 'image/gif').length;

  return {
    accepted,
    overflow,
    oversized,
    acceptedBytes,
    hasLargeFiles: accepted.some((f) => f.size > LARGE_FILE_WARN_BYTES),
    hasAnimatedGifs: animatedGifCount > 0,
    exceedsTotalCap: acceptedBytes > MAX_TOTAL_BATCH_SIZE,
  };
}
