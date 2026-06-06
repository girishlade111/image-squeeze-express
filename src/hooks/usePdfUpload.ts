import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import {
  formatBytes,
  getReductionRatio,
  type PdfProcessSettings,
  type PdfProcessResult,
  type PdfMetadata,
} from '@/utils/pdfFormat';

// pdfjs-dist + pdf-lib are heavy (~700 KB + 200 KB). They're only needed when
// the user actually runs a compression job, so we lazy-load the whole engine
// module. The module is cached after first load.
const loadPdfEngine = () => import('@/utils/pdfProcessor');

export interface UploadedPdf {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  pageCount: number | null;
  preview: string | null;
  status: 'ready' | 'processing' | 'done' | 'error';
  error?: string;
  result?: PdfProcessResult;
  processedFile?: File;
  progress: number;
  metadata?: PdfMetadata;
}

export interface ProcessingStats {
  bytesPerSecond: number;
  etaMs: number | null;
  bytesProcessed: number;
  bytesTotal: number;
}

export const MAX_PDF_FILES = 5;
export const MAX_PDF_SIZE = 100 * 1024 * 1024;

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function getPdfPageCount(file: File): Promise<number> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  const buffer = await file.arrayBuffer();
  const task = pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) });
  try {
    const doc = await task.promise;
    const count = doc.numPages;
    await doc.cleanup();
    return count;
  } catch {
    throw new Error('Could not read PDF — file may be corrupted or password-protected.');
  }
}

export function usePdfUpload() {
  const [files, setFiles] = useState<UploadedPdf[]>([]);
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

  const revokeUrl = useCallback((url: string | null | undefined) => {
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

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList).filter(
        (f) =>
          f.type === 'application/pdf' ||
          f.name.toLowerCase().endsWith('.pdf')
      );
      if (incoming.length === 0) {
        toast.error('No valid PDFs found. Please select .pdf files only.');
        return;
      }

      const oversized = incoming.filter((f) => f.size > MAX_PDF_SIZE);
      if (oversized.length > 0) {
        toast.error(
          `${oversized.length} file${oversized.length > 1 ? 's' : ''} exceed the 100 MB limit and were skipped.`,
          { description: oversized.map((f) => f.name).slice(0, 2).join(', ') }
        );
      }
      const valid = incoming.filter((f) => f.size <= MAX_PDF_SIZE);
      if (valid.length === 0) return;

      setFiles((prev) => {
        const remaining = MAX_PDF_FILES - prev.length;
        if (remaining <= 0) {
          toast.warning(`⚠️ Up to ${MAX_PDF_FILES} PDFs at once.`);
          return prev;
        }
        const toAdd = valid.slice(0, remaining);
        if (valid.length > remaining) {
          toast.warning(
            `⚠️ Only ${remaining} PDF${remaining > 1 ? 's' : ''} added — up to ${MAX_PDF_FILES} at once.`
          );
        }

        const newFiles: UploadedPdf[] = toAdd.map((file) => ({
          id: generateId(),
          file,
          name: file.name,
          originalSize: file.size,
          pageCount: null,
          preview: null,
          status: 'ready' as const,
          progress: 0,
        }));

        newFiles.forEach((nf) => {
          getPdfPageCount(nf.file)
            .then((count) => {
              setFiles((p) =>
                p.map((f) => (f.id === nf.id ? { ...f, pageCount: count } : f))
              );
            })
            .catch((err: Error) => {
              setFiles((p) =>
                p.map((f) =>
                  f.id === nf.id
                    ? { ...f, status: 'error' as const, error: err.message }
                    : f
                )
              );
              toast.error(`Could not read ${nf.name}: ${err.message}`);
            });

          getPdfMetadata(nf.file)
            .then((meta) => {
              setFiles((p) =>
                p.map((f) => (f.id === nf.id ? { ...f, metadata: meta } : f))
              );
            })
            .catch(() => {
              /* non-fatal: metadata is optional */
            });
        });

        return [...prev, ...newFiles];
      });
    },
    []
  );

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const item = prev.find((f) => f.id === id);
        if (item) {
          revokeUrl(item.preview);
        }
        return prev.filter((f) => f.id !== id);
      });
    },
    [revokeUrl]
  );

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => revokeUrl(f.preview));
      return [];
    });
    setProgress(0);
    setProcessingText('');
    setCurrentItem(null);
    setStats({ bytesPerSecond: 0, etaMs: null, bytesProcessed: 0, bytesTotal: 0 });
  }, [revokeUrl]);

  const previewOne = useCallback(
    async (id: string, settings: PdfProcessSettings) => {
      let target: UploadedPdf | null = null;
      setFiles((current) => {
        target = current.find((f) => f.id === id) ?? null;
        return current;
      });
      await Promise.resolve();
      if (!target) {
        toast.error('Could not find that PDF.');
        return;
      }
      try {
        const result = await compressPdf(target.file, settings);
        const processedFile = toDownloadPdfFile(target.name, result.blob, settings.filenamePattern, {
          index: 1,
          quality: result.finalQuality,
          pageCount: result.pagesProcessed,
        });
        const url = URL.createObjectURL(processedFile);
        urlsRef.current.add(url);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, preview: url } : f
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(`Preview failed: ${message}`);
      }
    },
    []
  );

  const processFiles = useCallback(
    async (ids: string[], settings: PdfProcessSettings) => {
      setIsProcessing(true);
      setProgress(0);
      setProcessingText('Starting…');

      let targets: UploadedPdf[] = [];
      setFiles((current) => {
        targets = current.filter((f) => ids.includes(f.id));
        return current;
      });

      await Promise.resolve();

      if (targets.length === 0) {
        setIsProcessing(false);
        setProcessingText('');
        return;
      }

      const idSet = new Set(targets.map((t) => t.id));
      const bytesTotal = targets.reduce((s, t) => s + t.originalSize, 0);
      setFiles((prev) =>
        prev.map((f) => {
          if (!idSet.has(f.id)) return f;
          if (f.preview) revokeUrl(f.preview);
          return {
            ...f,
            status: 'processing' as const,
            error: undefined,
            progress: 0,
            preview: null,
          };
        })
      );

      const total = targets.length;
      let completed = 0;
      let successCount = 0;
      let errorCount = 0;
      let bytesProcessed = 0;
      const startTime = performance.now();
      let lastSpeedUpdate = startTime;
      let lastBytesAtUpdate = 0;

      for (const item of targets) {
        setCurrentItem(item.id);
        setProcessingText(`Compressing ${completed + 1} of ${total}…`);

        try {
          const result = await compressPdf(item.file, settings, (ratio, page, totalPages) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, progress: ratio } : f))
            );
            setProcessingText(
              `Compressing ${completed + 1} of ${total} — page ${page}/${totalPages}`
            );
            bytesProcessed += 0;
          });

          const processedFile = toDownloadPdfFile(item.name, result.blob, settings.filenamePattern, {
            index: completed + 1,
            quality: result.finalQuality,
            pageCount: result.pagesProcessed,
          });

          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: 'done' as const,
                    result,
                    processedFile,
                    progress: 1,
                    error: undefined,
                  }
                : f
            )
          );
          successCount++;
          bytesProcessed += result.sizeBytes;

          // Update throughput stats
          const now = performance.now();
          const deltaMs = now - lastSpeedUpdate;
          if (deltaMs > 200) {
            const deltaBytes = bytesProcessed - lastBytesAtUpdate;
            const bps = deltaBytes / (deltaMs / 1000);
            const remainingBytes = bytesTotal - bytesProcessed;
            const eta = bps > 0 ? (remainingBytes / bps) * 1000 : null;
            setStats({
              bytesPerSecond: bps,
              etaMs: eta,
              bytesProcessed,
              bytesTotal,
            });
            lastSpeedUpdate = now;
            lastBytesAtUpdate = bytesProcessed;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: 'error' as const, error: message, progress: 0 }
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
      setStats({ bytesPerSecond: 0, etaMs: null, bytesProcessed, bytesTotal });

      if (errorCount === 0) {
        toast.success(
          successCount === 1
            ? '✅ PDF compressed successfully!'
            : `✅ All ${successCount} PDFs compressed successfully!`
        );
      } else if (successCount > 0) {
        toast.warning(`⚠️ ${successCount} succeeded, ${errorCount} failed.`);
      } else {
        toast.error(`❌ All ${errorCount} PDFs failed to compress.`);
      }
    },
    [revokeUrl]
  );

  const processAll = useCallback(
    (settings: PdfProcessSettings) => {
      setFiles((current) => {
        const toProcess = current
          .filter((f) => f.status === 'ready' || f.status === 'error')
          .map((f) => f.id);
        if (toProcess.length === 0) {
          toast.info('Nothing to compress. Add a PDF first.');
          return current;
        }
        void processFiles(toProcess, settings);
        return current.map((f) =>
          toProcess.includes(f.id)
            ? { ...f, result: undefined, processedFile: undefined, error: undefined, progress: 0 }
            : f
        );
      });
    },
    [processFiles]
  );

  const retryFile = useCallback(
    (id: string, settings: PdfProcessSettings) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'ready' as const, error: undefined, progress: 0 }
            : f
        )
      );
      void processFiles([id], settings);
    },
    [processFiles]
  );

  const hasFiles = files.length > 0;
  const allDone = useMemo(
    () => files.length > 0 && files.every((f) => f.status === 'done' || f.status === 'error'),
    [files]
  );
  const processedFiles = useMemo(() => files.filter((f) => f.status === 'done'), [files]);
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
    previewOne,
    isProcessing,
    progress,
    processingText,
    currentItem,
    stats,
    hasFiles,
    allDone,
    processedFiles,
    readyCount,
  };
}

// Re-export the size helpers so consumers don't have to import from the processor
export { formatBytes, getReductionRatio, getPdfMetadata };
export type { PdfMetadata };
