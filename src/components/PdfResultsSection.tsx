import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Check, FileText, FileArchive, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { UploadedPdf } from '@/hooks/usePdfUpload';
import { formatBytes, getReductionRatio } from '@/hooks/usePdfUpload';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { toast } from 'sonner';

interface PdfResultsSectionProps {
  files: UploadedPdf[];
  onReset: () => void;
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current !== target) {
      started.current = false;
      prevTarget.current = target;
    }
    if (started.current || target === 0) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

const PdfResultsSection = ({ files, onReset }: PdfResultsSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedPdf | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { totalOriginal, totalNew, avgReduction, successCount } = useMemo(() => {
    const done = files.filter((f) => f.status === 'done');
    const totalOriginalCalc = files.reduce((s, f) => s + f.originalSize, 0);
    const totalNewCalc = done.reduce((s, f) => s + (f.result?.sizeBytes || 0), 0);
    const saved = totalOriginalCalc - totalNewCalc;
    const avg = totalOriginalCalc > 0 ? Math.round((saved / totalOriginalCalc) * 100) : 0;
    return {
      totalOriginal: totalOriginalCalc,
      totalNew: totalNewCalc,
      avgReduction: avg,
      successCount: done.length,
    };
  }, [files]);

  const animatedSaved = useCountUp(totalOriginal - totalNew);
  const animatedReduction = useCountUp(avgReduction);

  const downloadSingle = useCallback((f: UploadedPdf) => {
    if (f.processedFile) {
      saveAs(f.processedFile, f.processedFile.name);
      toast.success(`Downloaded ${f.processedFile.name}`);
    }
  }, []);

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter((f) => f.status === 'done' && f.processedFile);
    if (doneFiles.length === 0) return;
    if (doneFiles.length === 1 && doneFiles[0].processedFile) {
      saveAs(doneFiles[0].processedFile, doneFiles[0].processedFile.name);
      return;
    }
    const zip = new JSZip();
    doneFiles.forEach((f) => {
      if (f.processedFile) zip.file(f.processedFile.name, f.processedFile);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'imagesqueeze_pdfs.zip');
    toast.success(`Downloaded ${doneFiles.length} PDFs as ZIP`);
  }, [files]);

  return (
    <section ref={ref} className="container relative mx-auto mt-20 px-4" id="pdf-results">
      {visible && <ConfettiBurst />}
      <motion.div
        className="mx-auto max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-5 shadow-lg sm:p-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                Compression Complete
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {successCount} of {files.length} PDF{files.length !== 1 ? 's' : ''} compressed
                successfully
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 rounded-full text-[11px] text-muted-foreground hover:text-foreground"
              aria-label="Start over with new PDFs"
            >
              <RefreshCw className="mr-1.5 h-3 w-3" /> Start over
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 text-center">
              <p className="text-[10px] font-medium text-muted-foreground">Total saved</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-emerald-400 sm:text-lg">
                {formatBytes(animatedSaved)}
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 text-center">
              <p className="text-[10px] font-medium text-muted-foreground">Avg. reduction</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-primary sm:text-lg">
                {animatedReduction}%
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 text-center">
              <p className="text-[10px] font-medium text-muted-foreground">Files</p>
              <p className="mt-0.5 text-base font-bold tabular-nums sm:text-lg">
                {successCount}/{files.length}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-background/40 p-2.5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText
                    className={`h-5 w-5 ${
                      f.status === 'done'
                        ? 'text-emerald-500'
                        : f.status === 'error'
                        ? 'text-red-500'
                        : 'text-primary'
                    }`}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" title={f.name}>
                    {f.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                    {f.status === 'done' && f.result && (
                      <>
                        <span className="text-muted-foreground">
                          {formatBytes(f.originalSize)} →{' '}
                          <span className="font-semibold text-emerald-300">
                            {formatBytes(f.result.sizeBytes)}
                          </span>
                        </span>
                        <Badge
                          variant="outline"
                          className="rounded-full border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[9px] font-semibold text-emerald-300"
                        >
                          {getReductionRatio(f.originalSize, f.result.sizeBytes)}
                        </Badge>
                        <span className="text-muted-foreground">
                          · {f.result.pageCount} page{f.result.pageCount !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                    {f.status === 'error' && (
                      <span className="text-red-300">{f.error || 'Failed'}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {f.status === 'done' && f.result && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewFile(f)}
                        className="h-7 rounded-full px-2 text-[10px]"
                        aria-label={`Preview ${f.name}`}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadSingle(f)}
                        className="h-7 rounded-full bg-emerald-500 px-2.5 text-[10px] font-semibold text-white hover:bg-emerald-600"
                        aria-label={`Download ${f.name}`}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {successCount > 1 && (
            <Button
              onClick={downloadAll}
              className="mt-4 h-10 w-full rounded-xl text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              }}
              aria-label="Download all compressed PDFs as ZIP"
            >
              <FileArchive className="mr-2 h-4 w-4" />
              Download all as ZIP
            </Button>
          )}
        </div>
      </motion.div>

      <Dialog open={previewFile !== null} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-6">
              <FileText className="h-4 w-4 text-primary" />
              <span className="truncate">{previewFile?.name}</span>
            </DialogTitle>
          </DialogHeader>
          {previewFile?.processedFile && (
            <div className="overflow-hidden rounded-xl border border-border/40 bg-secondary/30">
              <iframe
                src={URL.createObjectURL(previewFile.processedFile)}
                title="Compressed PDF preview"
                className="h-[60vh] w-full"
              />
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setPreviewFile(null)}
              aria-label="Close preview"
            >
              <X className="mr-1.5 h-3.5 w-3.5" /> Close
            </Button>
            <Button
              onClick={() => previewFile && downloadSingle(previewFile)}
              className="bg-emerald-500 text-white hover:bg-emerald-600"
              aria-label="Download from preview"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PdfResultsSection;
