/**
 * Centralised batch limits for the image-upload flow. Exported from here so
 * the validation utility and the hook can both import them without creating
 * a circular dependency.
 */

/** Maximum number of images that can sit in the queue at once. */
export const MAX_FILES = 50;

/** Per-file hard cap. Anything larger is silently dropped with a toast. */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Soft cap on the total bytes of a single batch. When the user adds more than
 * this in one go, the hook surfaces a "may be slow on this device" warning.
 * 750 MB is roughly 30 files of 25 MB — well within modern browser limits.
 */
export const MAX_TOTAL_BATCH_SIZE = 750 * 1024 * 1024;
