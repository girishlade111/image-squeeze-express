import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Check, ImageIcon, FileArchive, Share2, Eye, X } from 'lucide-react';
import { Confetti } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadedFile } from '@/hooks/useImageUpload';
import { formatFileSize, getCompressionRatio } from '@/utils/imageProcessor';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { toast } from 'sonner';

interface ResultsSectionProps {
  files: UploadedFile[];
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

const ResultsSection = ({ files, onReset }: ResultsSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

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

  const { totalSaved, avgReduction, successCount } = useMemo(() => {
    const done = files.filter((f) => f.status === 'done');
    const totalOriginal = files.reduce((s, f) => s + f.originalSize, 0);
    const totalNew = done.reduce((s, f) => s + (f.result?.sizeBytes || 0), 0);
    const saved = totalOriginal - totalNew;
    const avg = totalOriginal > 0 ? Math.round((saved / totalOriginal) * 100) : 0;
    return { totalSaved: saved, avgReduction: avg, successCount: done.length };
  }, [files]);

  const downloadSingle = useCallback((f: UploadedFile) => {
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
    saveAs(blob, 'imagesqueeze_batch.zip');
    toast.success(`Downloaded ${doneFiles.length} images as ZIP`);
  }, [files]);

  const shareText = encodeURIComponent(
    'I just compressed my images with ImageSqueeze — 100% free & private! 🚀'
  );
  const shareUrl = encodeURIComponent('https://img.ladestack.in');

  return (
    <section
      className="container relative mx-auto mt-10 max-w-3xl px-4 sm:mt-16"
      ref={ref}
      aria-label="Compression results"
    >
      {/* One-time confetti burst when results first appear */}
      {visible && <ConfettiBurst />}

      {/* Heading */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-2.5">
          <motion.span
            className="text-primary"
            initial={{ scale: 0, rotate: -180 }}
            animate={visible ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
          >
            <Confetti size={22} weight="duotone" />
          </motion.span>
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Compression Complete!
          </h2>
        </div>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {successCount} image{successCount !== 1 ? 's' : ''} optimized and ready to download.
        </p>
      </motion.div>

      {/* Stats bar */}
      <StatsBar
        filesCount={successCount}
        totalSaved={totalSaved}
        avgReduction={avgReduction}
        visible={visible}
      />

      {/* Result cards */}
      <div className="mt-6 space-y-3">
        {files.map((f, i) => {
          if (f.status !== 'done') return null;
          const newSize = f.result?.sizeBytes || 0;
          const ratio = getCompressionRatio(f.originalSize, newSize);
          const isReduction = f.originalSize > newSize;
          const ext = f.processedFile?.type.split('/')[1]?.toUpperCase() || '';

          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* Before */}
                <button
                  onClick={() => setPreviewFile(f)}
                  className="group/before flex flex-1 items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-foreground/[0.03]"
                  aria-label={`Preview original ${f.name}`}
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
                    <img
                      src={f.preview}
                      alt={`Original ${f.name}`}
                      className="h-full w-full object-cover transition-transform group-hover/before:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/before:bg-black/30">
                      <Eye className="h-4 w-4 text-white opacity-0 transition-opacity group-hover/before:opacity-100" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Before
                    </p>
                    <p className="text-sm font-bold">{formatFileSize(f.originalSize)}</p>
                    {f.originalWidth > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        {f.originalWidth}×{f.originalHeight}
                      </p>
                    )}
                  </div>
                </button>

                {/* Arrow + ratio */}
                <div className="flex flex-shrink-0 items-center gap-2 self-center">
                  <div className="hidden h-px w-6 bg-border sm:block" />
                  <Badge
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      isReduction
                        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                        : 'border-slate-500/30 bg-slate-500/15 text-slate-300'
                    }`}
                  >
                    {ratio}
                  </Badge>
                  <div className="hidden h-px w-6 bg-border sm:block" />
                </div>

                {/* After */}
                <button
                  onClick={() => setPreviewFile(f)}
                  className="group/after flex flex-1 items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-foreground/[0.03] sm:justify-end sm:text-right"
                  aria-label={`Preview compressed ${f.name}`}
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl shadow-md sm:order-2">
                    <img
                      src={f.processedPreview}
                      alt={`Compressed ${f.name}`}
                      className="h-full w-full object-cover transition-transform group-hover/after:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/after:bg-black/30">
                      <Eye className="h-4 w-4 text-white opacity-0 transition-opacity group-hover/after:opacity-100" />
                    </div>
                    {isReduction && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-md">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 sm:order-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      After
                    </p>
                    <p className="text-sm font-bold text-emerald-300">
                      {formatFileSize(newSize)}
                    </p>
                    {f.result && (
                      <p className="text-[10px] text-muted-foreground">
                        {f.result.width}×{f.result.height}
                      </p>
                    )}
                  </div>
                </button>
              </div>

              {/* Bottom row */}
              <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-semibold">
                    {ext}
                  </Badge>
                  <p className="truncate text-[10px] text-muted-foreground" title={f.name}>
                    {f.name}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-7 rounded-full px-3 text-[11px] font-semibold text-primary-foreground"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                  onClick={() => downloadSingle(f)}
                >
                  <Download className="mr-1 h-3 w-3" /> Download
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <motion.div
        className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        initial={{ opacity: 0, y: 12 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Button
          size="lg"
          className="h-11 w-full rounded-full text-sm font-semibold text-primary-foreground shadow-lg sm:w-auto"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
          onClick={downloadAll}
        >
          <FileArchive className="mr-2 h-4 w-4" /> Download All as ZIP
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-11 w-full rounded-full text-sm sm:w-auto"
          onClick={onReset}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Process More Images
        </Button>
      </motion.div>

      {/* Share */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <p className="mb-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Share2 className="h-3.5 w-3.5" />
          Share ImageSqueeze
        </p>
        <div className="flex justify-center gap-2">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border/40 bg-secondary/50 px-4 py-1.5 text-xs font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            Twitter / X
          </a>
          <a
            href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border/40 bg-secondary/50 px-4 py-1.5 text-xs font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            WhatsApp
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://img.ladestack.in');
              toast.success('Link copied to clipboard!');
            }}
            className="rounded-full border border-border/40 bg-secondary/50 px-4 py-1.5 text-xs font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            Copy link
          </button>
        </div>
      </motion.div>

      {/* Preview dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-3xl gap-3 overflow-hidden p-0 sm:rounded-2xl sm:p-6 max-sm:left-0 max-sm:top-0 max-sm:h-[100dvh] max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0">
          <DialogHeader className="border-b border-border/40 pb-3 max-sm:px-4 max-sm:pt-4 sm:border-0 sm:pb-0">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4 text-primary" />
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-sm:px-4 max-sm:pb-4 sm:max-h-[calc(90vh-4rem)]">
            {previewFile && <ComparisonView file={previewFile} />}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

/** Animated stats bar */
function StatsBar({ filesCount, totalSaved, avgReduction, visible }: {
  filesCount: number;
  totalSaved: number;
  avgReduction: number;
  visible: boolean;
}) {
  const animatedSaved = useCountUp(visible ? Math.round(totalSaved / 1024) : 0);
  const animatedReduction = useCountUp(visible ? avgReduction : 0);

  return (
    <motion.div
      className="mt-6 grid grid-cols-3 gap-2 sm:gap-4"
      initial={{ opacity: 0, y: 12 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-3 sm:p-5 text-center shadow-md">
        <p className="text-2xl sm:text-3xl font-extrabold tabular-nums bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {filesCount}
        </p>
        <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground">Images</p>
      </div>
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3 sm:p-5 text-center shadow-md shadow-emerald-500/[0.08]">
        <p className="text-2xl sm:text-3xl font-extrabold tabular-nums text-emerald-300">
          {animatedSaved}
          <span className="text-sm sm:text-base font-bold text-emerald-400/80"> KB</span>
        </p>
        <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground">Saved</p>
      </div>
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3 sm:p-5 text-center shadow-md shadow-emerald-500/[0.08]">
        <p className="text-2xl sm:text-3xl font-extrabold tabular-nums text-emerald-300">
          {animatedReduction}
          <span className="text-base font-bold text-emerald-400/80">%</span>
        </p>
        <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground">Smaller</p>
      </div>
    </motion.div>
  );
}

/** Side-by-side comparison in the preview dialog */
function ComparisonView({ file }: { file: UploadedFile }) {
  if (!file.result) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Original · {formatFileSize(file.originalSize)} · {file.originalWidth}×{file.originalHeight}
        </p>
        <img
          src={file.preview}
          alt={`Original ${file.name}`}
          className="w-full rounded-lg object-contain"
        />
      </div>
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
          Compressed · {formatFileSize(file.result.sizeBytes)} · {file.result.width}×{file.result.height}
        </p>
        <img
          src={file.processedPreview}
          alt={`Compressed ${file.name}`}
          className="w-full rounded-lg object-contain"
        />
      </div>
    </div>
  );
}

/**
 * Lightweight confetti burst — 24 particles that fall + rotate for ~1.4s.
 * Pure CSS + framer-motion, no canvas, no external library. Honors
 * `prefers-reduced-motion` by skipping the animation entirely.
 */
function ConfettiBurst() {
  const colors = ['#FFFFFF', '#A3A3A3', '#525252', '#D4D4D4', '#737373'];
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: (Math.random() - 0.5) * 600,
    delay: Math.random() * 0.2,
    rotate: Math.random() * 720 - 360,
    size: 6 + Math.random() * 6,
  }));

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-0 -z-10 h-0 w-0"
      aria-hidden
    >
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

export default ResultsSection;
