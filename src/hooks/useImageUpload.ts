import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { processImage, toDownloadFile, getImageDimensions, ProcessResult } from '@/utils/imageProcessor';
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

    // Check limit
    const currentCount = files.length;
    const remaining = MAX_FILES - currentCount;
    if (remaining <= 0) {
      toast.warning('⚠️ Free version supports up to 10 images at once.');
      return;
    }
    const toAdd = incoming.slice(0, remaining);
    if (incoming.length > remaining) {
      toast.warning('⚠️ Free version supports up to 10 images at once.');
    }

    const newFiles: UploadedFile[] = [];
    for (const file of toAdd) {
      const preview = URL.createObjectURL(file);
      urlsRef.current.push(preview);
      let dims = { width: 0, height: 0 };
      try {
        dims = await getImageDimensions(file);
      } catch {}
      newFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        originalSize: file.size,
        originalWidth: dims.width,
        originalHeight: dims.height,
        preview,
        status: 'ready',
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, [files.length]);

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
    const toProcess = files.filter((f) => f.status !== 'done');
    if (toProcess.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessingText('');
    let completed = 0;
    const total = toProcess.length;

    for (const item of toProcess) {
      // Mark processing
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'processing' as const } : f))
      );

      try {
        const result = await processImage(item.file, {
          quality: settings.quality,
          targetSizeKB: settings.targetSizeKB,
          width: settings.width,
          height: settings.height,
          lockAspectRatio: settings.lockAspectRatio,
          outputFormat: settings.outputFormat,
        });

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
      setProgress(Math.round((completed / toProcess.length) * 100));
    }

    setIsProcessing(false);
    toast.success('✅ All images processed!');
  }, [files]);

  const hasFiles = files.length > 0;
  const allDone = files.length > 0 && files.every((f) => f.status === 'done' || f.status === 'error');
  const processedFiles = files.filter((f) => f.status === 'done');

  return {
    files,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    isProcessing,
    progress,
    hasFiles,
    allDone,
    processedFiles,
  };
}
