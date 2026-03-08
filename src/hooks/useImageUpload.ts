import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  preview: string;
  status: 'ready' | 'processing' | 'done' | 'error';
}

const MAX_FILES = 10;

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function useImageUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const urlsRef = useRef<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));

    if (incoming.length === 0) return;

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
          preview,
          status: 'ready' as const,
        };
      });

      return [...prev, ...newFiles];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
        urlsRef.current = urlsRef.current.filter((u) => u !== item.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        URL.revokeObjectURL(f.preview);
      });
      urlsRef.current = [];
      return [];
    });
  }, []);

  return { files, addFiles, removeFile, clearAll };
}
