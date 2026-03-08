import { useState, useCallback } from 'react';
import { ImageItem, ProcessingSettings, processImage, getImageDimensions } from '@/lib/image-processing';

const MAX_FILES = 10;

export function useImageProcessor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<ProcessingSettings>({
    quality: 75,
    lockAspectRatio: true,
    outputFormat: 'image/webp',
  });

  const addImages = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, MAX_FILES);
    const newItems: ImageItem[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue;
      const dims = await getImageDimensions(file);
      newItems.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        originalSize: file.size,
        originalWidth: dims.width,
        originalHeight: dims.height,
        status: 'ready',
      });
    }

    setImages((prev) => {
      const combined = [...prev, ...newItems];
      return combined.slice(0, MAX_FILES);
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
        if (item.processedPreview) URL.revokeObjectURL(item.processedPreview);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview);
      if (img.processedPreview) URL.revokeObjectURL(img.processedPreview);
    });
    setImages([]);
    setProgress(0);
  }, [images]);

  const processAll = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);
    const total = images.filter((i) => i.status !== 'done').length;
    let completed = 0;

    for (let i = 0; i < images.length; i++) {
      if (images[i].status === 'done') continue;

      setImages((prev) =>
        prev.map((img, idx) => (idx === i ? { ...img, status: 'processing' as const } : img))
      );

      try {
        const result = await processImage(images[i].file, settings);
        const processedPreview = URL.createObjectURL(result.file);

        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i
              ? {
                  ...img,
                  status: 'done' as const,
                  processedFile: result.file,
                  processedPreview,
                  processedSize: result.file.size,
                  processedWidth: result.width,
                  processedHeight: result.height,
                }
              : img
          )
        );
      } catch (err) {
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, status: 'error' as const, error: String(err) } : img
          )
        );
      }

      completed++;
      setProgress(Math.round((completed / total) * 100));
    }

    setIsProcessing(false);
  }, [images, settings]);

  const resetAll = useCallback(() => {
    clearAll();
    setProgress(0);
  }, [clearAll]);

  const hasImages = images.length > 0;
  const allDone = images.length > 0 && images.every((i) => i.status === 'done' || i.status === 'error');
  const processedImages = images.filter((i) => i.status === 'done');

  return {
    images,
    settings,
    setSettings,
    addImages,
    removeImage,
    clearAll,
    processAll,
    resetAll,
    isProcessing,
    progress,
    hasImages,
    allDone,
    processedImages,
  };
}
