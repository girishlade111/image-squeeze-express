import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadedFile } from '@/hooks/useImageUpload';
import { formatFileSize, getCompressionRatio } from '@/utils/imageProcessor';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface ResultsSectionProps {
  files: UploadedFile[];
  onReset: () => void;
}

/** Simple counter animation hook */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { totalSaved, avgReduction } = useMemo(() => {
    const totalOriginal = files.reduce((s, f) => s + f.originalSize, 0);
    const totalNew = files.reduce((s, f) => s + (f.result?.sizeBytes || 0), 0);
    const saved = totalOriginal - totalNew;
    const avg = totalOriginal > 0 ? Math.round((saved / totalOriginal) * 100) : 0;
    return { totalSaved: saved, avgReduction: avg };
  }, [files]);

  const downloadSingle = useCallback((f: UploadedFile) => {
    if (f.processedFile) saveAs(f.processedFile, f.processedFile.name);
  }, []);

  const downloadAll = useCallback(async () => {
    const zip = new JSZip();
    files.forEach((f) => {
      if (f.processedFile) zip.file(f.processedFile.name, f.processedFile);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'imagesqueeze_batch.zip');
  }, [files]);

  const shareText = encodeURIComponent('I just compressed my images with ImageSqueeze — 100% free & private! 🚀');
  const shareUrl = encodeURIComponent('https://imagesqueeze.com');

  return (
    <section className="container mx-auto mt-12 max-w-3xl px-4" ref={ref} aria-label="Compression results">
      <h2
        className={`mb-8 text-center text-2xl font-extrabold tracking-tight sm:text-3xl transition-all duration-700 ${
          visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
        }`}
      >
        Results
      </h2>

      {/* Stats bar */}
      <StatsBar
        filesCount={files.length}
        totalSaved={totalSaved}
        avgReduction={avgReduction}
        visible={visible}
      />

      {/* Result cards */}
      <div className="mt-6 space-y-4">
        {files.map((f, i) => {
          const newSize = f.result?.sizeBytes || 0;
          const ratio = getCompressionRatio(f.originalSize, newSize);
          const ext = f.processedFile?.type.split('/')[1]?.toUpperCase() || '';

          return (
            <div
              key={f.id}
              className={`rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 transition-all duration-700 ${
                visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: visible ? `${(i + 1) * 120}ms` : '0ms' }}
            >
              {/* Mobile: stack vertically. Desktop: side by side */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* Before */}
                <div className="flex flex-1 items-center gap-3">
                  <img src={f.preview} alt={`Original ${f.name}`} className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover" loading="lazy" />
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Before</p>
                    <p className="text-sm font-semibold">{formatFileSize(f.originalSize)}</p>
                    <p className="text-xs text-muted-foreground">{f.originalWidth}×{f.originalHeight}</p>
                  </div>
                </div>

                {/* Reduction badge */}
                <Badge className="self-center flex-shrink-0 rounded-full bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-1 text-sm font-bold">
                  {ratio}
                </Badge>

                {/* After */}
                <div className="flex flex-1 items-center gap-3 sm:justify-end">
                  <img src={f.processedPreview} alt={`Compressed ${f.name}`} className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover sm:order-2" loading="lazy" />
                  <div className="sm:text-right">
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">After</p>
                    <p className="text-sm font-semibold">{formatFileSize(newSize)}</p>
                    <p className="text-xs text-muted-foreground">{f.result?.width}×{f.result?.height}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Badge variant="outline" className="rounded-full text-xs">{ext}</Badge>
                <Button
                  size="sm"
                  className="rounded-full text-primary-foreground"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
                  onClick={() => downloadSingle(f)}
                >
                  <Download className="mr-1 h-3.5 w-3.5" /> Download
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button
          size="lg"
          className="w-full sm:w-auto rounded-full text-primary-foreground"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
          onClick={downloadAll}
        >
          <Download className="mr-2 h-4 w-4" /> Download All as ZIP
        </Button>
        <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" /> Process More Images
        </Button>
      </div>

      {/* Share */}
      <div className="mt-6 text-center">
        <p className="mb-2 text-sm text-muted-foreground">Share ImageSqueeze</p>
        <div className="flex justify-center gap-3">
          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-secondary px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary/80">
            Twitter/X
          </a>
          <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-secondary px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary/80">
            WhatsApp
          </a>
        </div>
      </div>
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
    <div
      className={`grid grid-cols-3 gap-3 transition-all duration-700 ${
        visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
      }`}
      style={{ animationDelay: '100ms' }}
    >
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 text-center">
        <p className="text-2xl font-extrabold text-primary">{filesCount}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Images</p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 text-center">
        <p className="text-2xl font-extrabold text-emerald-400">{animatedSaved} KB</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Saved</p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 text-center">
        <p className="text-2xl font-extrabold text-emerald-400">{animatedReduction}%</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Avg Reduction</p>
      </div>
    </div>
  );
}

export default ResultsSection;
