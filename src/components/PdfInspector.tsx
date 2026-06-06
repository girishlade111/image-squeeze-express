import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  FileText,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Database,
  Gauge,
  Lightbulb,
  Check,
  Download,
  FileImage,
  Type,
  Layers,
  Ruler,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { formatBytes, getReductionRatio } from '@/hooks/usePdfUpload';
import type { UploadedPdf } from '@/hooks/usePdfUpload';
import type { PdfProcessSettings, PdfQualityPreset } from '@/utils/pdfProcessor';

interface PdfInspectorProps {
  file: UploadedPdf | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyRecommendation: (
    id: string,
    preset: PdfQualityPreset,
    quality: number
  ) => void;
  onPreviewOne: (id: string) => void;
  onDownload?: (id: string) => void;
  getSettings: () => PdfProcessSettings;
}

function formatAspect(w: number, h: number): string {
  if (!w || !h) return '—';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const r = gcd(w, h);
  return `${Math.round(w / r)}:${Math.round(h / r)}`;
}

const PdfInspector = ({
  file,
  open,
  onOpenChange,
  onApplyRecommendation,
  onPreviewOne,
  onDownload,
  getSettings,
}: PdfInspectorProps) => {
  const [zoom, setZoom] = useState(1);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    setZoom(1);
    setShowOriginal(false);
  }, [file?.id]);

  if (!file) return null;

  const meta = file.metadata;
  const isDone = file.status === 'done' && file.result;
  const previewUrl = showOriginal ? null : file.preview;
  const thumbnailUrl = meta?.firstPageThumbnail ?? null;
  const hasResult = isDone && file.result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-lg max-sm:left-0 max-sm:top-0 max-sm:h-[100dvh] max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 sm:max-h-[90vh]">
        <DialogHeader className="flex-row items-center justify-between gap-2 border-b border-border/40 bg-card/60 px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold">{file.name}</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              {meta
                ? `${meta.pageCount} page${meta.pageCount !== 1 ? 's' : ''} · ${meta.estimatedPageSize} · ${formatBytes(file.originalSize)}`
                : `${file.pageCount ?? '…'} page${file.pageCount !== 1 ? 's' : ''} · ${formatBytes(file.originalSize)}`}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowOriginal((v) => !v)}
                  aria-pressed={showOriginal}
                  aria-label={showOriginal ? 'Show processed' : 'Show original'}
                >
                  {showOriginal ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showOriginal ? 'Show processed' : 'Show original'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>
            <span className="w-10 text-center text-[10px] tabular-nums text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom(1)}
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset zoom</TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onOpenChange(false)}
              aria-label="Close inspector"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid max-h-[70vh] grid-cols-1 md:grid-cols-[1fr_280px]">
          <div className="flex items-center justify-center overflow-auto bg-foreground/[0.02] p-4">
            {showOriginal ? (
              <div className="flex h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-card/40 p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40" />
                <p className="text-[11px] text-muted-foreground">
                  Original PDF preview is not available — open it in your PDF reader to compare.
                </p>
              </div>
            ) : previewUrl ? (
              <motion.iframe
                key={`${file.id}-processed-${zoom}`}
                src={previewUrl}
                title={`${file.name} processed preview`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: zoom }}
                transition={{ duration: 0.2 }}
                className="h-[60vh] w-full max-w-2xl rounded-lg border border-border/30 bg-white shadow-elev-2"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              />
            ) : thumbnailUrl ? (
              <motion.img
                key={`${file.id}-thumb-${zoom}`}
                src={thumbnailUrl}
                alt={`${file.name} first page`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-elev-2"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              />
            ) : (
              <div className="flex h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-card/40 p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40" />
                <p className="text-[11px] text-muted-foreground">
                  {file.status === 'ready'
                    ? 'Click "Try current settings" to generate a preview.'
                    : file.status === 'processing'
                    ? 'Processing…'
                    : 'Preview not available.'}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 overflow-auto border-l border-border/40 bg-card/40 p-4 text-xs">
            {hasResult && (
              <div className="rounded-lg border border-success/30 bg-success/10 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success">
                  <Check className="h-3 w-3" /> Compression complete
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <p className="text-muted-foreground">Original</p>
                    <p className="font-semibold tabular-nums">{formatBytes(file.originalSize)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Optimized</p>
                    <p className="font-semibold tabular-nums text-success">
                      {formatBytes(file.result!.sizeBytes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Saved</p>
                    <p className="font-semibold tabular-nums text-success">
                      {getReductionRatio(file.originalSize, file.result!.sizeBytes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Final q</p>
                    <p className="font-semibold tabular-nums">
                      {file.result!.finalQuality}% @ {file.result!.finalDpi} dpi
                    </p>
                  </div>
                </div>
              </div>
            )}

            {meta && (meta.isTextHeavy || meta.isImageHeavy || meta.recommendedPreset) && (
              <div className="rounded-lg border border-primary/30 bg-primary/[0.06] p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <Lightbulb className="h-3 w-3" /> Smart recommendation
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] leading-relaxed">{meta.recommendationReason}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                      {meta.recommendedPreset}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      q={Math.round(meta.recommendedQuality * 100)}% · saves ~{meta.estimatedSavings}%
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1.5 h-7 w-full rounded-md text-[11px]"
                    onClick={() =>
                      onApplyRecommendation(
                        file.id,
                        meta.recommendedPreset,
                        meta.recommendedQuality
                      )
                    }
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Apply suggestion
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-border/40 bg-background/40 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Database className="h-3 w-3" /> Metadata
              </div>
              <dl className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="h-3 w-3" /> Pages
                  </dt>
                  <dd className="font-mono tabular-nums">
                    {meta?.pageCount ?? file.pageCount ?? '…'}
                  </dd>
                </div>
                {meta && (
                  <>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-muted-foreground">
                        <Ruler className="h-3 w-3" /> Page size
                      </dt>
                      <dd className="font-mono tabular-nums">
                        {meta.pageWidth} × {meta.pageHeight} pt
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Page format</dt>
                      <dd className="font-mono text-[10px]">{meta.estimatedPageSize}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Aspect ratio</dt>
                      <dd className="font-mono tabular-nums">
                        {formatAspect(meta.pageWidth, meta.pageHeight)}
                      </dd>
                    </div>
                    {meta.title && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="flex items-center gap-1 text-muted-foreground">
                          <Type className="h-3 w-3" /> Title
                        </dt>
                        <dd className="truncate font-mono text-[10px]" title={meta.title}>
                          {meta.title}
                        </dd>
                      </div>
                    )}
                    {meta.author && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="flex items-center gap-1 text-muted-foreground">
                          <Type className="h-3 w-3" /> Author
                        </dt>
                        <dd className="truncate font-mono text-[10px]" title={meta.author}>
                          {meta.author}
                        </dd>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">File size</dt>
                  <dd className="font-mono tabular-nums">{formatBytes(file.originalSize)}</dd>
                </div>
                {meta?.fileVersion && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <Layers className="h-3 w-3" /> PDF version
                    </dt>
                    <dd className="font-mono tabular-nums">{meta.fileVersion}</dd>
                  </div>
                )}
                {meta && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <FileImage className="h-3 w-3" /> Content type
                    </dt>
                    <dd className="font-mono text-[10px]">
                      {meta.isTextHeavy ? 'Text-heavy' : meta.isImageHeavy ? 'Image-heavy' : 'Mixed'}
                    </dd>
                  </div>
                )}
                {meta && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <Gauge className="h-3 w-3" /> Est. savings
                    </dt>
                    <dd className="font-mono tabular-nums text-success">~{meta.estimatedSavings}%</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="flex flex-col gap-1.5">
              {file.status === 'ready' && (
                <Button
                  size="sm"
                  className="h-8 w-full rounded-md text-[11px]"
                  onClick={() => onPreviewOne(file.id)}
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Try current settings
                </Button>
              )}
              {file.status === 'done' && onDownload && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-full rounded-md text-[11px]"
                  onClick={() => onDownload(file.id)}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Download
                </Button>
              )}
            </div>

            <div className="rounded-lg border border-border/30 bg-secondary/30 p-2.5 text-[10px] leading-relaxed text-muted-foreground">
              <Badge
                variant="outline"
                className="mb-1 rounded-full border-primary/30 bg-primary/10 px-1.5 py-0 text-[9px] font-semibold text-primary"
              >
                Privacy
              </Badge>
              {getSettings().stripMetadata
                ? 'Output metadata will be stripped on the next run.'
                : 'Output will keep an "ImageSqueeze" producer tag.'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfInspector;
