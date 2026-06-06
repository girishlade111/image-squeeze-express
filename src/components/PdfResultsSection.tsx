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
                        className="h-9 rounded-full px-2.5 text-[11px] sm:h-7 sm:px-2 sm:text-[10px]"
                        aria-label={`Preview ${f.name}`}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadSingle(f)}
                        className="h-9 rounded-full bg-emerald-500 px-3 text-[11px] font-semibold text-white hover:bg-emerald-600 sm:h-7 sm:px-2.5 sm:text-[10px]"
                        aria-label={`Download ${f.name}`}
                      >
                        <Download className="mr-1 h-3.5 w-3.5 sm:mr-1 sm:h-3 sm:w-3" />
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
        <DialogContent className="max-w-4xl gap-3 overflow-hidden p-0 sm:p-6 max-sm:left-0 max-sm:top-0 max-sm:h-[100dvh] max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0">
          <DialogHeader className="border-b border-border/40 pb-3 max-sm:px-4 max-sm:pt-4 sm:border-0 sm:pb-0">
            <DialogTitle className="flex items-center gap-2 pr-6 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="truncate">{previewFile?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-sm:px-4 max-sm:pb-4 sm:max-h-[calc(90vh-4rem)]">
            {previewFile?.processedFile && (
              <div className="overflow-hidden rounded-xl border border-border/40 bg-secondary/30">
                <iframe
                  src={URL.createObjectURL(previewFile.processedFile)}
                  title="Compressed PDF preview"
                  className="h-[55vh] w-full sm:h-[60vh]"
                />
              </div>
            )}
            <div className="mt-3 flex items-center justify-end gap-2 max-sm:flex-col-reverse max-sm:items-stretch">
              <Button
                variant="ghost"
                onClick={() => setPreviewFile(null)}
                className="h-11 sm:h-9"
                aria-label="Close preview"
              >
                <X className="mr-1.5 h-3.5 w-3.5" /> Close
              </Button>
              <Button
                onClick={() => previewFile && downloadSingle(previewFile)}
                className="h-11 bg-emerald-500 text-white hover:bg-emerald-600 sm:h-9"
                aria-label="Download from preview"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

function ConfettiBurst() {
  const colors = ['#4F46E5', '#0D9488', '#F59E0B', '#EC4899', '#10B981'];
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: (Math.random() - 0.5) * 600,
    delay: Math.random() * 0.2,
    rotate: Math.random() * 720 - 360,
    size: 6 + Math.random() * 6,
  }));
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-0 w-0" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: 220, opacity: 0, rotate: p.rotate, scale: 0.6 }}
          transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            display: 'block',
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

export default PdfResultsSection;
