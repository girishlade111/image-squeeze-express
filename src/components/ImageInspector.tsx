import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  ImageIcon,
  Eye,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  ImagePlus,
  EyeOff,
  Database,
  Gauge,
  Lightbulb,
  Check,
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
import { formatFileSize, getCompressionRatio } from '@/utils/imageProcessor';
import type { UploadedFile } from '@/hooks/useImageUpload';
import type { Settings } from '@/hooks/useSettings';

interface ImageInspectorProps {
  file: UploadedFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyRecommendation: (id: string, format: Settings['outputFormat'], quality: number) => void;
  onPreviewOne: (id: string) => void;
}

function formatAspect(w: number, h: number): string {
  if (!w || !h) return '—';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const r = gcd(w, h);
  return `${Math.round(w / r)}:${Math.round(h / r)}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const ImageInspector = ({
  file,
  open,
  onOpenChange,
  onApplyRecommendation,
  onPreviewOne,
}: ImageInspectorProps) => {
  const [zoom, setZoom] = useState(1);
  const [showOriginal, setShowOriginal] = useState(false);

  // Reset zoom when file changes
  useEffect(() => {
    setZoom(1);
    setShowOriginal(false);
  }, [file?.id]);

  if (!file) return null;

  const meta = file.metadata;
  const isDone = file.status === 'done' && file.result;
  const previewUrl = showOriginal
    ? file.preview
    : isDone
    ? file.processedPreview
    : file.preview;
  const hasResult = isDone && file.result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-lg max-sm:left-0 max-sm:top-0 max-sm:h-[100dvh] max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 sm:max-h-[90vh]">
        <DialogHeader className="flex-row items-center justify-between gap-2 border-b border-border/40 bg-card/60 px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold sm:text-sm">{file.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground sm:text-[11px]">
              {file.originalWidth > 0 && `${file.originalWidth}×${file.originalHeight} · `}
              {formatFileSize(file.originalSize)}
              {file.file.type && ` · ${file.file.type.replace('image/', '').toUpperCase()}`}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-7 sm:w-7"
                  onClick={() => setShowOriginal((v) => !v)}
                  aria-pressed={showOriginal}
                  aria-label={showOriginal ? 'Show processed' : 'Show original'}
                >
                  {showOriginal ? <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <EyeOff className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showOriginal ? 'Show processed' : 'Show original'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-7 sm:w-7"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>
            <span className="w-10 text-center text-[11px] tabular-nums text-muted-foreground sm:text-[10px]">
              {Math.round(zoom * 100)}%
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-7 sm:w-7"
                  onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-7 sm:w-7"
                  onClick={() => setZoom(1)}
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset zoom</TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-7 sm:w-7"
              onClick={() => onOpenChange(false)}
              aria-label="Close inspector"
            >
              <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid max-h-[calc(100dvh-3.5rem)] grid-cols-1 overflow-y-auto sm:max-h-[calc(90vh-3.5rem)] md:grid-cols-[1fr_280px]">
          {/* Preview pane */}
          <div className="flex min-h-[260px] items-center justify-center overflow-auto bg-foreground/[0.02] p-3 sm:min-h-[300px] sm:p-4">
            <motion.img
              key={`${file.id}-${showOriginal}-${zoom}`}
              src={previewUrl}
              alt={file.name}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="max-h-[50vh] max-w-full rounded-lg object-contain shadow-elev-2 sm:max-h-[60vh]"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
            />
          </div>

          {/* Info pane */}
          <div className="flex flex-col gap-3 overflow-auto border-border/40 bg-card/40 p-3 text-xs sm:p-4 md:border-l">
            {/* Status / result summary */}
            {hasResult && (
              <div className="rounded-lg border border-success/30 bg-success/10 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-success sm:text-[10px]">
                  <Check className="h-3 w-3" /> Compression complete
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-[11px]">
                  <div>
                    <p className="text-muted-foreground">Original</p>
                    <p className="font-semibold tabular-nums">{formatFileSize(file.originalSize)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Optimized</p>
                    <p className="font-semibold tabular-nums text-success">
                      {formatFileSize(file.result!.sizeBytes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Saved</p>
                    <p className="font-semibold tabular-nums text-success">
                      {getCompressionRatio(file.originalSize, file.result!.sizeBytes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Output</p>
                    <p className="font-semibold tabular-nums">
                      {file.result!.width}×{file.result!.height}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Smart recommendation */}
            {meta && (
              <div className="rounded-lg border border-primary/30 bg-primary/[0.06] p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary sm:text-[10px]">
                  <Lightbulb className="h-3 w-3" /> Smart recommendation
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs leading-relaxed sm:text-[11px]">{meta.recommendationReason}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase text-primary sm:text-[10px]">
                      {meta.recommendedFormat}
                    </span>
                    <span className="text-[11px] text-muted-foreground sm:text-[10px]">
                      q={meta.recommendedQuality} · saves ~{meta.estimatedSavings}%
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1.5 h-9 w-full rounded-md text-xs sm:h-7 sm:text-[11px]"
                    onClick={() =>
                      onApplyRecommendation(
                        file.id,
                        meta.recommendedFormat,
                        meta.recommendedQuality
                      )
                    }
                  >
                    <Sparkles className="mr-1 h-3.5 w-3.5 sm:h-3 sm:w-3" />
                    Apply suggestion
                  </Button>
                </div>
              </div>
            )}

            {/* Image metadata */}
            <div className="rounded-lg border border-border/40 bg-background/40 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[10px]">
                <Database className="h-3 w-3" /> Metadata
              </div>
              <dl className="space-y-1.5 text-xs sm:text-[11px]">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <ImagePlus className="h-3 w-3" /> Dimensions
                  </dt>
                  <dd className="font-mono tabular-nums">
                    {file.originalWidth > 0
                      ? `${file.originalWidth} × ${file.originalHeight}`
                      : '…'}
                  </dd>
                </div>
                {file.originalWidth > 0 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Aspect ratio</dt>
                    <dd className="font-mono tabular-nums">
                      {formatAspect(file.originalWidth, file.originalHeight)}
                    </dd>
                  </div>
                )}
                {meta && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground">
                      <Camera className="h-3 w-3" /> Megapixels
                    </dt>
                    <dd className="font-mono tabular-nums">{meta.megapixels.toFixed(2)} MP</dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">File size</dt>
                  <dd className="font-mono tabular-nums">{formatFileSize(file.originalSize)}</dd>
                </div>
                {meta && (
                  <>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-muted-foreground">
                        <Layers className="h-3 w-3" /> Est. colors
                      </dt>
                      <dd className="font-mono tabular-nums">~{formatNumber(meta.estimatedColors)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-muted-foreground">
                        <ImageIcon className="h-3 w-3" /> Type
                      </dt>
                      <dd className="font-mono text-[11px] sm:text-[10px]">
                        {meta.isPhoto ? 'Photo' : 'Graphic'}
                        {meta.hasTransparency ? ' + alpha' : ''}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-muted-foreground">
                        <Gauge className="h-3 w-3" /> Est. savings
                      </dt>
                      <dd className="font-mono tabular-nums text-success">~{meta.estimatedSavings}%</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            {/* Actions */}
            {file.status === 'ready' && (
              <Button
                size="sm"
                className="h-10 w-full rounded-md text-sm font-semibold sm:h-8 sm:text-[11px]"
                onClick={() => onPreviewOne(file.id)}
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
              >
                <Sparkles className="mr-1 h-4 w-4 sm:h-3 sm:w-3" />
                Try current settings
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageInspector;
