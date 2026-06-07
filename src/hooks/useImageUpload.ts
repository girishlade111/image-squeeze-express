import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import type { ProcessResult, ProcessSettings, ImageMetadata } from '@/utils/imageProcessor';
import {
  MAX_FILES,
  MAX_FILE_SIZE,
  MAX_TOTAL_BATCH_SIZE,
} from '@/hooks/imageUploadLimits';
import type { Settings } from '@/hooks/useSettings';
import { addHistoryEntry, blobToDataUrl, type HistoryEntry } from '@/utils/historyStorage';

// browser-image-compression is ~50 KB. We defer loading the image engine
// (and the pure batch-validator) until the user actually interacts with the
// queue, so the landing page stays lean on first paint.
const loadImageEngine = () => import('@/utils/imageProcessor');
const loadBatchValidator = () => import('@/utils/batchValidation');

import { addHistoryEntry, blobToDataUrl, HISTORY_UPDATED_EVENT, type HistoryEntry } from '@/utils/historyStorage';

const saveToHistory = async (entry: HistoryEntry, blob: Blob): Promise<void> => {
  try {
    const dataUrl = await blobToDataUrl(blob);
    addHistoryEntry({ ...entry, dataUrl });
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  } catch {
    /* history save is best-effort — never fail compression over it */
  }
};

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  preview: string;
  status: 'ready' | 'processing' | 'done' | 'error';
  error?: string;
  result?: ProcessResult;
  processedFile?: File;
  processedPreview?: string;
  metadata?: ImageMetadata;
}

export interface ProcessingStats {
  /** Rolling throughput in bytes per second. */
  bytesPerSecond: number;
  /** Estimated time remaining, or null if unknown. */
  etaMs: number | null;
  /** Number of bytes processed so far. */
  bytesProcessed: number;
  /** Total bytes to process. */
  bytesTotal: number;
}

export { MAX_FILES, MAX_FILE_SIZE, MAX_TOTAL_BATCH_SIZE };

export function useImageUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [stats, setStats] = useState<ProcessingStats>({
    bytesPerSecond: 0,
    etaMs: null,
    bytesProcessed: 0,
    bytesTotal: 0,
  });
  const urlsRef = useRef<Set<string>>(new Set());
  const sessionStartRef = useRef<number | null>(null);
  const bytesProcessedRef = useRef<number>(0);

  // Stable revoke helper
  const revokeUrl = useCallback((url: string) => {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
    urlsRef.current.delete(url);
  }, []);

  // Cleanup all blob URLs on unmount
  useEffect(() => {
    const tracked = urlsRef.current;
    return () => {
      tracked.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          /* noop */
        }
      });
      tracked.clear();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // CORE PROCESSOR — declared FIRST so it can be referenced by the
  // other callbacks (retryFile, processAll) without hitting a
  // temporal dead zone at module-evaluation time.
  // ─────────────────────────────────────────────────────────────────
  const processFiles = useCallback(
    async (ids: string[], settings: Settings) => {
      setIsProcessing(true);
      setProgress(0);
      setProcessingText('Starting…');

      // Snapshot the files we'll process (in current order)
      let targets: UploadedFile[] = [];
      setFiles((currentFiles) => {
        targets = currentFiles.filter((f) => ids.includes(f.id));
        return currentFiles;
      });

      // Yield to React so any pending status updates can apply first
      await Promise.resolve();

      if (targets.length === 0) {
        setIsProcessing(false);
        setProcessingText('');
        return;
      }

      // Mark all targets as processing
      const idSet = new Set(targets.map((t) => t.id));
      setFiles((prev) =>
        prev.map((f) =>
          idSet.has(f.id)
            ? { ...f, status: 'processing' as const, error: undefined }
            : f
        )
      );

      // Start the timing/throughput session
      sessionStartRef.current = performance.now();
      bytesProcessedRef.current = 0;
      const bytesTotal = targets.reduce((s, t) => s + t.originalSize, 0);
      setStats({ bytesPerSecond: 0, etaMs: null, bytesProcessed: 0, bytesTotal });

      const total = targets.length;
      let completed = 0;
      let successCount = 0;
      let errorCount = 0;

      for (const item of targets) {
        setCurrentItem(item.id);
        setProcessingText(`Processing ${completed + 1} of ${total}…`);

        const itemStart = performance.now();

        try {
          const ps: ProcessSettings = {
            quality: settings.quality,
            autoOptimize: settings.autoOptimize,
            targetSizeKB: settings.targetSizeKB,
            width: settings.width,
            height: settings.height,
            lockAspectRatio: settings.lockAspectRatio,
            outputFormat: settings.outputFormat,
            stripEXIF: settings.stripEXIF,
            grayscale: settings.grayscale,
            rotation: settings.rotation,
            mirror: settings.mirror,
            preserveMetadata: settings.preserveMetadata,
            progressive: settings.progressive,
            embedColorProfile: settings.embedColorProfile,
            lossless: settings.lossless,
            filenamePattern: settings.filenamePattern,
          };

          const { processImage, toDownloadFile } = await loadImageEngine();
          const result = await processImage(item.file, ps, item.originalSize, completed + 1);
          const processedFile = toDownloadFile(item.name, result.blob, settings.filenamePattern, {
            width: result.width,
            height: result.height,
            quality: settings.autoOptimize ? undefined : settings.quality,
            index: completed + 1,
            sizeBytes: result.sizeBytes,
          });
          const processedPreview = URL.createObjectURL(result.blob);
          urlsRef.current.add(processedPreview);

          void saveToHistory({
            id: item.id,
            tool: 'image',
            fileName: processedFile.name,
            fileSize: result.sizeBytes,
            mimeType: result.blob.type || processedFile.type,
            createdAt: Date.now(),
            image: {
              originalSize: item.originalSize,
              originalWidth: result.width,
              originalHeight: result.height,
              processedWidth: result.width,
              processedHeight: result.height,
              reduction: result.reduction,
              format: result.blob.type?.split('/')[1]?.toUpperCase() ?? 'IMG',
              quality: settings.autoOptimize ? 0 : settings.quality,
            },
          }, result.blob);

          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: 'done' as const,
                    result,
                    processedFile,
                    processedPreview,
                    error: undefined,
                  }
                : f
            )
          );
          successCount++;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: 'error' as const, error: message }
                : f
            )
          );
          errorCount++;
        }

        completed++;
        bytesProcessedRef.current += item.originalSize;
        setProgress(Math.round((completed / total) * 100));

        // Update throughput & ETA
        const elapsed = performance.now() - (sessionStartRef.current ?? performance.now());
        const bps = elapsed > 0 ? (bytesProcessedRef.current / elapsed) * 1000 : 0;
        const remainingBytes = Math.max(0, bytesTotal - bytesProcessedRef.current);
        const etaMs = bps > 0 ? (remainingBytes / bps) * 1000 : null;
        setStats({
          bytesPerSecond: bps,
          etaMs,
          bytesProcessed: bytesProcessedRef.current,
          bytesTotal,
        });
        // Mark `itemStart` as used so the analyzer doesn't warn — it's
        // available for future per-item timing breakdowns.
        void itemStart;
      }

      setIsProcessing(false);
      setProcessingText('');
      setCurrentItem(null);
      sessionStartRef.current = null;

      if (errorCount === 0) {
        toast.success(
          successCount === 1
            ? '✅ Image processed successfully!'
            : `✅ All ${successCount} images processed successfully!`
        );
      } else if (successCount > 0) {
        toast.warning(`⚠️ ${successCount} succeeded, ${errorCount} failed.`, {
          description: 'Click a failed file to retry.',
        });
      } else {
        toast.error(`❌ All ${errorCount} images failed to process.`);
      }
    },
    []
  );

  const pendingRef = useRef<{ files: File[]; meta: Array<{ name: string; size: number; type: string }> } | null>(null);

  const runValidation = useCallback(
    async (
      validateBatch: typeof import('@/utils/batchValidation').validateBatch,
      pending: { files: File[]; meta: Array<{ name: string; size: number; type: string }> },
      prev: UploadedFile[]
    ) => {
      const { files: incomingFiles, meta: incomingMeta } = pending;
      const report = validateBatch(incomingMeta, prev.length);

      // Surface warnings for special cases (the validator reports, the hook
      // decides how to communicate them).
      if (report.oversized.length > 0) {
        const names = report.oversized.map((i) => incomingMeta[i].name).slice(0, 2).join(', ');
        toast.error(
          `${report.oversized.length} file${report.oversized.length > 1 ? 's' : ''} exceed the 25 MB per-file limit and were skipped.`,
          { description: names }
        );
      }
      if (report.hasLargeFiles) {
        toast.warning(
          `⚠️ ${report.largeFileCount} large file${report.largeFileCount > 1 ? 's' : ''} detected. Processing may take longer.`,
          { description: 'Files over 10 MB are decoded fully in memory.' }
        );
      }
      if (report.hasAnimatedGifs) {
        toast.info('ℹ️ Animated GIFs will become static images.', {
          description: `${report.animatedGifCount} GIF file${report.animatedGifCount > 1 ? 's' : ''} detected.`,
        });
      }
      if (report.overflow.length > 0) {
        toast.warning(
          `⚠️ Only ${report.accepted.length} of ${incomingMeta.length} added — free version supports up to ${MAX_FILES} images at once.`
        );
      }
      if (report.exceedsTotalCap) {
        const totalMB = (report.acceptedBytes / (1024 * 1024)).toFixed(0);
        toast.warning(
          `📦 Large batch (~${totalMB} MB) — older devices may slow down while processing ${report.accepted.length} images.`,
          { description: `Recommended cap is ${MAX_TOTAL_BATCH_SIZE / (1024 * 1024)} MB per batch.` }
        );
      }

      const toAdd = report.accepted.map((i) => incomingFiles[i]);

      const newFiles: UploadedFile[] = toAdd.map((file) => {
        const preview = URL.createObjectURL(file);
        urlsRef.current.add(preview);
        return {
          id:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: 0,
          originalHeight: 0,
          preview,
          status: 'ready' as const,
        };
      });

      setFiles((p) => [...p, ...newFiles]);

      // Resolve original dimensions + smart recommendation asynchronously.
      // The image engine is dynamic-imported here so the canvas-based
      // analyzer and browser-image-compression only load when the user
      // actually adds images to the queue.
      newFiles.forEach((nf) => {
        void loadImageEngine().then(({ getImageDimensions, recommendFormat }) => {
          getImageDimensions(nf.file)
            .then(async (dims) => {
              setFiles((p) =>
                p.map((f) =>
                  f.id === nf.id
                    ? { ...f, originalWidth: dims.width, originalHeight: dims.height }
                    : f
                )
              );
              try {
                const meta = await recommendFormat(nf.file, dims);
                setFiles((p) =>
                  p.map((f) => (f.id === nf.id ? { ...f, metadata: meta } : f))
                );
              } catch {
                /* recommendation is best-effort */
              }
            })
            .catch(() => {
              /* ignore — dimensions are informational */
            });
        });
      });
    },
    []
  );

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const incomingFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (incomingFiles.length === 0) {
      toast.error(
        'No valid images found. Please select JPG, PNG, WebP, GIF, BMP, or AVIF files.'
      );
      return;
    }

    // Build the metadata shadow the validator consumes. The validator never
    // sees the real `File` objects so it can stay a pure function — and the
    // hook can match reports back to the real files by array index.
    const incomingMeta = incomingFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));

    // Stash the candidates so the async validator can read them when its
    // module chunk finishes loading. We can't pass the arrays through the
    // setFiles callback because that runs synchronously and we need the
    // values after the dynamic import resolves.
    pendingRef.current = { files: incomingFiles, meta: incomingMeta };

    // Read the current file count synchronously so the validator's overflow
    // math is correct without needing a setFiles callback.
    setFiles((prev) => {
      void loadBatchValidator().then(({ validateBatch }) => {
        const pending = pendingRef.current;
        if (!pending) return;
        runValidation(validateBatch, pending, prev);
      });
      return prev;
    });
  }, [runValidation]);

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const item = prev.find((f) => f.id === id);
        if (item) {
          revokeUrl(item.preview);
          if (item.processedPreview) revokeUrl(item.processedPreview);
        }
        return prev.filter((f) => f.id !== id);
      });
    },
    [revokeUrl]
  );

  const retryFile = useCallback(
    (id: string, settings: Settings) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'ready' as const, error: undefined }
            : f
        )
      );
      void processFiles([id], settings);
    },
    [processFiles]
  );

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        revokeUrl(f.preview);
        if (f.processedPreview) revokeUrl(f.processedPreview);
      });
      return [];
    });
    setProgress(0);
    setProcessingText('');
    setCurrentItem(null);
  }, [revokeUrl]);

  const resetFile = useCallback(
    (id: string) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          if (f.processedPreview) revokeUrl(f.processedPreview);
          const { result: _r, processedFile: _pf, processedPreview: _pp, error: _e, ...rest } = f;
          return { ...rest, status: 'ready' as const };
        })
      );
    },
    [revokeUrl]
  );

  const processAll = useCallback(
    (settings: Settings) => {
      setFiles((currentFiles) => {
        const toProcess = currentFiles
          .filter((f) => f.status === 'ready' || f.status === 'error')
          .map((f) => f.id);
        if (toProcess.length === 0) {
          toast.info('Nothing to process. Add images first.');
          return currentFiles;
        }
        // Revoke any existing processed previews before re-processing
        currentFiles.forEach((f) => {
          if (toProcess.includes(f.id) && f.processedPreview) {
            revokeUrl(f.processedPreview);
          }
        });
        void processFiles(toProcess, settings);
        return currentFiles.map((f) =>
          toProcess.includes(f.id)
            ? {
                ...f,
                result: undefined,
                processedFile: undefined,
                processedPreview: undefined,
                error: undefined,
              }
            : f
        );
      });
    },
    [processFiles, revokeUrl]
  );

  /**
   * Process a single image with the current settings — used for the "Try
   * settings" preview action. Reuses the same per-file pipeline as the
   * full batch run, so the preview is identical to what the user would
   * get from `processAll`.
   */
  const previewOne = useCallback(
    (id: string, settings: Settings) => {
      setFiles((currentFiles) => {
        const target = currentFiles.find((f) => f.id === id);
        if (target?.processedPreview) revokeUrl(target.processedPreview);
        return currentFiles.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'processing' as const,
                result: undefined,
                processedFile: undefined,
                processedPreview: undefined,
                error: undefined,
              }
            : f
        );
      });
      void processFiles([id], settings);
    },
    [processFiles, revokeUrl]
  );

  const hasFiles = files.length > 0;
  const allDone = useMemo(
    () => files.length > 0 && files.every((f) => f.status === 'done' || f.status === 'error'),
    [files]
  );
  const processedFiles = useMemo(() => files.filter((f) => f.status === 'done'), [files]);
  const hasErrors = useMemo(() => files.some((f) => f.status === 'error'), [files]);
  const readyCount = useMemo(
    () => files.filter((f) => f.status === 'ready' || f.status === 'error').length,
    [files]
  );

  return {
    files,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    processFiles,
    retryFile,
    resetFile,
    previewOne,
    isProcessing,
    progress,
    processingText,
    currentItem,
    stats,
    hasFiles,
    allDone,
    processedFiles,
    hasErrors,
    readyCount,
  };
}
