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

const MAX_FILES = 10;

export function useImageUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingText, setProcessingText] = useState('');
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (incoming.length === 0) return;

    // Show warnings for special cases
    incoming.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.warning('⚠️ Large file detected. Processing may take a few seconds.', {
          description: file.name,
        });
      }
      if (file.type === 'image/gif') {
        toast.info('ℹ️ GIF files will be converted to static image. Animated GIFs are not supported.', {
          description: file.name,
        });
      }
    });

    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) {
        toast.warning('⚠️ Free version supports up to 10 images at once.');
        return prev;
      }
      const toAdd = incoming.slice(0, remaining);
      if (incoming.length > remaining) {
        toast.warning('⚠️ Free version supports up to 10 images at once.');
      }

      const newFiles: UploadedFile[] = toAdd.map((file) => {
        const preview = URL.createObjectURL(file);
        urlsRef.current.push(preview);
        return {
          id: crypto.randomUUID(),
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: 0,
          originalHeight: 0,
          preview,
          status: 'ready' as const,
        };
      });

      newFiles.forEach((nf) => {
        getImageDimensions(nf.file).then((dims) => {
          setFiles((p) =>
            p.map((f) =>
              f.id === nf.id ? { ...f, originalWidth: dims.width, originalHeight: dims.height } : f
            )
          );
        }).catch(() => {});
      });

      return [...prev, ...newFiles];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
        if (item.processedPreview) URL.revokeObjectURL(item.processedPreview);
        urlsRef.current = urlsRef.current.filter(
          (u) => u !== item.preview && u !== item.processedPreview
        );
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        URL.revokeObjectURL(f.preview);
        if (f.processedPreview) URL.revokeObjectURL(f.processedPreview);
      });
      urlsRef.current = [];
      return [];
    });
    setProgress(0);
  }, []);

  const processAll = useCallback(async (settings: Settings) => {
    setFiles((currentFiles) => {
      const toProcess = currentFiles.filter((f) => f.status !== 'done');
      if (toProcess.length === 0) return currentFiles;

      // Kick off processing outside setState
      (async () => {
        setIsProcessing(true);
        setProgress(0);
        setProcessingText('');
        let completed = 0;
        const total = toProcess.length;

        for (const item of toProcess) {
          setProcessingText(`Processing ${completed + 1} of ${total}...`);
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'processing' as const } : f))
          );

          try {
            const result = await processImage(item.file, {
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
            }, item.originalSize);

            const processedFile = toDownloadFile(item.name, result.blob);
            const processedPreview = URL.createObjectURL(result.blob);
            urlsRef.current.push(processedPreview);

            setFiles((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? { ...f, status: 'done' as const, result, processedFile, processedPreview }
                  : f
              )
            );
          } catch (err) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? { ...f, status: 'error' as const, error: String(err) }
                  : f
              )
            );
          }

          completed++;
          setProgress(Math.round((completed / total) * 100));
        }

        setIsProcessing(false);
        setProcessingText('');

        // Show appropriate toast based on results
        setFiles((finalFiles) => {
          const doneCount = finalFiles.filter((f) => f.status === 'done').length;
          const errorCount = finalFiles.filter((f) => f.status === 'error').length;
          if (doneCount > 0 && errorCount === 0) {
            toast.success('✅ All images processed successfully!');
          } else if (doneCount > 0 && errorCount > 0) {
            toast.warning(`⚠️ ${doneCount} processed, ${errorCount} failed.`);
          } else if (errorCount > 0) {
            toast.error('❌ All images failed to process.');
          }
          return finalFiles;
        });
      })();

      return currentFiles;
    });
  }, []);

  const hasFiles = files.length > 0;
  const allDone = useMemo(
    () => files.length > 0 && files.every((f) => f.status === 'done' || f.status === 'error'),
    [files]
  );
  const processedFiles = useMemo(
    () => files.filter((f) => f.status === 'done'),
    [files]
  );

  return {
    files,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    isProcessing,
    progress,
    processingText,
    hasFiles,
    allDone,
    processedFiles,
  };
}
