import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import {
  processImage,
  toDownloadFile,
  getImageDimensions,
  type ProcessResult,
  type ProcessSettings,
} from '@/utils/imageProcessor';
import { validateBatch } from '@/utils/batchValidation';
import {
  MAX_FILES,
  MAX_FILE_SIZE,
  MAX_TOTAL_BATCH_SIZE,
} from '@/hooks/imageUploadLimits';
import type { Settings } from '@/hooks/useSettings';

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
}

export { MAX_FILES, MAX_FILE_SIZE, MAX_TOTAL_BATCH_SIZE };

export function useImageUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const urlsRef = useRef<Set<string>>(new Set());

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

      const total = targets.length;
      let completed = 0;
      let successCount = 0;
      let errorCount = 0;

      for (const item of targets) {
        setCurrentItem(item.id);
        setProcessingText(`Processing ${completed + 1} of ${total}…`);

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
          };

          const result = await processImage(item.file, ps, item.originalSize);
          const processedFile = toDownloadFile(item.name, result.blob);
          const processedPreview = URL.createObjectURL(result.blob);
          urlsRef.current.add(processedPreview);

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
        setProgress(Math.round((completed / total) * 100));
      }

      setIsProcessing(false);
      setProcessingText('');
      setCurrentItem(null);

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

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({ name: f.name, size: f.size, type: f.type }));
    if (incoming.length === 0) {
      toast.error(
        'No valid images found. Please select JPG, PNG, WebP, GIF, BMP, or AVIF files.'
      );
      return;
    }

    // Re-derive the full File objects from the filter step above. We need the
    // raw File for blob URLs and processing, but the validator only needs the
    // metadata — so the file list is split into a metadata shadow and the
    // original File[] for state insertion.
    const incomingFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));

    setFiles((prev) => {
      const report = validateBatch(incoming, prev.length);

      // Surface warnings for special cases (the validator reports, the hook
      // decides how to communicate them).
      if (report.oversized.length > 0) {
        toast.error(
          `${report.oversized.length} file${report.oversized.length > 1 ? 's' : ''} exceed the 25 MB per-file limit and were skipped.`,
          {
            description: report.oversized.map((f) => f.name).slice(0, 2).join(', '),
          }
        );
      }
      if (report.hasLargeFiles) {
        const largeCount = report.accepted.filter((f) => f.size > 10 * 1024 * 1024).length;
        toast.warning(
          `⚠️ ${largeCount} large file${largeCount > 1 ? 's' : ''} detected. Processing may take longer.`,
          { description: 'Files over 10 MB are decoded fully in memory.' }
        );
      }
      if (report.hasAnimatedGifs) {
        const gifCount = incoming.filter((f) => f.type === 'image/gif').length;
        toast.info('ℹ️ Animated GIFs will become static images.', {
          description: `${gifCount} GIF file${gifCount > 1 ? 's' : ''} detected.`,
        });
      }
      if (report.overflow.length > 0) {
        toast.warning(
          `⚠️ Only ${report.accepted.length} of ${incoming.length} added — free version supports up to ${MAX_FILES} images at once.`
        );
      }
      if (report.exceedsTotalCap) {
        const totalMB = (report.acceptedBytes / (1024 * 1024)).toFixed(0);
        toast.warning(
          `📦 Large batch (~${totalMB} MB) — older devices may slow down while processing ${report.accepted.length} images.`,
          { description: `Recommended cap is ${MAX_TOTAL_BATCH_SIZE / (1024 * 1024)} MB per batch.` }
        );
      }

      // Build UploadedFile entries by matching the validator's `accepted`
      // metadata back to the original File objects (the validator only sees
      // the shadow shape so it can stay pure).
      const acceptedSet = new Set(report.accepted.map((a) => `${a.name}|${a.size}|${a.type}`));
      const toAdd = incomingFiles.filter((f) =>
        acceptedSet.has(`${f.name}|${f.size}|${f.type}`)
      );

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

      // Resolve original dimensions asynchronously (best-effort)
      newFiles.forEach((nf) => {
        getImageDimensions(nf.file)
          .then((dims) => {
            setFiles((p) =>
              p.map((f) =>
                f.id === nf.id
                  ? { ...f, originalWidth: dims.width, originalHeight: dims.height }
                  : f
              )
            );
          })
          .catch(() => {
            /* ignore — dimensions are informational */
          });
      });

      return [...prev, ...newFiles];
    });
  }, []);

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
    isProcessing,
    progress,
    processingText,
    currentItem,
    hasFiles,
    allDone,
    processedFiles,
    hasErrors,
    readyCount,
  };
}
