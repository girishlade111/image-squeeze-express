import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import {
  processImage,
  toDownloadFile,
  getImageDimensions,
  type ProcessResult,
  type ProcessSettings,
} from '@/utils/imageProcessor';
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

export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export function useImageUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const urlsRef = useRef<Set<string>>(new Set());

  const revokeUrl = useCallback((url: string) => {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
    urlsRef.current.delete(url);
  }, []);

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

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (incoming.length === 0) {
      toast.error('No valid images found. Please select JPG, PNG, WebP, GIF, BMP, or AVIF files.');
      return;
    }

    // Surface warnings for special cases (deduped to avoid noise)
    const oversized = incoming.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.warning(
        `⚠️ ${oversized.length} large file${oversized.length > 1 ? 's' : ''} detected. Processing may take longer.`,
        { description: oversized.map((f) => f.name).slice(0, 2).join(', ') }
      );
    }
    const gifs = incoming.filter((f) => f.type === 'image/gif');
    if (gifs.length > 0) {
      toast.info('ℹ️ Animated GIFs will become static images.', {
        description: `${gifs.length} GIF file${gifs.length > 1 ? 's' : ''} detected.`,
      });
    }

    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) {
        toast.warning('⚠️ Free version supports up to 10 images at once.');
        return prev;
      }
      const toAdd = incoming.slice(0, remaining);
      if (incoming.length > remaining) {
        toast.warning(
          `⚠️ Only ${remaining} image${remaining > 1 ? 's' : ''} added — free version supports up to 10 at once.`
        );
      }

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

      // Resolve original dimensions asynchronously
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
            // Silently ignore — dimensions are informational
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
      // Process only this file
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

  /**
   * Internal processor. Operates on a list of file IDs and a settings snapshot.
   * Reads the latest files from the latest state via the functional updater.
   */
  const processFiles = useCallback(
    async (ids: string[], settings: Settings) => {
      setIsProcessing(true);
      setProgress(0);
      setProcessingText('Starting…');

      // Snapshot of the actual files we'll process (in current order)
      let targets: UploadedFile[] = [];
      setFiles((currentFiles) => {
        targets = currentFiles.filter((f) => ids.includes(f.id));
        return currentFiles;
      });

      // Give React a tick to apply status changes
      await Promise.resolve();

      if (targets.length === 0) {
        setIsProcessing(false);
        setProcessingText('');
        return;
      }

      // Mark all targets as processing
      const idSet = new Set(targets.map((t) => t.id));
      setFiles((prev) =>
        prev.map((f) => (idSet.has(f.id) ? { ...f, status: 'processing' as const, error: undefined } : f))
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
                ? { ...f, status: 'done' as const, result, processedFile, processedPreview, error: undefined }
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
        toast.warning(
          `⚠️ ${successCount} succeeded, ${errorCount} failed.`,
          { description: 'Click a failed file to retry.' }
        );
      } else {
        toast.error(`❌ All ${errorCount} images failed to process.`);
      }
    },
    []
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
        // Reset processed previews for files we're re-processing
        currentFiles.forEach((f) => {
          if (toProcess.includes(f.id) && f.processedPreview) {
            revokeUrl(f.processedPreview);
          }
        });
        // Kick off async work (state updates from inside async fn)
        void processFiles(toProcess, settings);
        return currentFiles.map((f) =>
          toProcess.includes(f.id)
            ? { ...f, result: undefined, processedFile: undefined, processedPreview: undefined, error: undefined }
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
  const processedFiles = useMemo(
    () => files.filter((f) => f.status === 'done'),
    [files]
  );
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
