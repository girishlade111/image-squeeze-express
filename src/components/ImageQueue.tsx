import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  Check,
  AlertCircle,
  RotateCcw,
  Plus,
  LayoutGrid,
  List,
  Eye,
  Lightbulb,
  Gauge,
} from 'lucide-react';
import { Lightning, Sparkle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UploadedFile, type ProcessingStats } from '@/hooks/useImageUpload';
import { formatFileSize, getCompressionRatio } from '@/utils/imageProcessor';

interface ImageQueueProps {
  files: UploadedFile[];
  isProcessing: boolean;
  progress: number;
  processingText: string;
  currentItem: string | null;
  stats?: ProcessingStats;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onProcessAll: () => void;
  onRetry: (id: string) => void;
  onPreviewOne?: (id: string) => void;
  onInspect?: (id: string) => void;
  onAddMore: () => void;
  allDone: boolean;
  readyCount: number;
}

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  const dot = str.lastIndexOf('.');
  const ext = dot >= 0 ? str.slice(dot) : '';
  const base = str.slice(0, Math.max(1, max - ext.length - 1));
  return `${base}…${ext}`;
}

function formatEta(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

const statusStyles = {
  ready: 'bg-muted text-muted-foreground border-border/60',
  processing: 'bg-warning/15 text-warning-foreground border-warning/30',
  done: 'bg-success/15 text-success-foreground border-success/30',
  error: 'bg-destructive/15 text-destructive-foreground border-destructive/30',
};

const statusLabel: Record<UploadedFile['status'], string> = {
  ready: 'Ready',
  processing: 'Processing',
  done: 'Done',
  error: 'Failed',
};

type ViewMode = 'cards' | 'list';
const COMPACT_THRESHOLD = 20;

const ImageQueue = ({
  files,
  isProcessing,
  progress,
  processingText,
  currentItem,
  stats,
  onRemove,
  onClearAll,
  onProcessAll,
  onRetry,
  onPreviewOne,
  onInspect,
  onAddMore,
  allDone,
  readyCount,
}: ImageQueueProps) => {
  const [hoverId, setHoverId] = useState<string | null>(null);
  // Auto-switch to the compact list view for large batches so 50-image runs
  // don't generate 25 rows of cards. The user can override the auto-pick.
  const [viewMode, setViewMode] = useState<ViewMode>(
    files.length > COMPACT_THRESHOLD ? 'list' : 'cards'
  );
  const isList = viewMode === 'list';

  if (files.length === 0) return null;

  const totalOriginal = files.reduce((s, f) => s + f.originalSize, 0);
  const totalProcessed = files
    .filter((f) => f.status === 'done')
    .reduce((s, f) => s + (f.result?.sizeBytes || 0), 0);
  const savedBytes = totalOriginal - totalProcessed;
  const doneCount = files.filter((f) => f.status === 'done').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <motion.div
      className="mx-auto mt-6 max-w-xl"
      layout
      role="region"
      aria-label="Image queue"
    >
      {/* Header */}
      <motion.div
        className="mb-3 flex flex-wrap items-center justify-between gap-2"
        layout
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </p>
          {doneCount > 0 && (
            <Badge variant="outline" className="rounded-full border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
              {doneCount} done
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="outline" className="rounded-full border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
              {errorCount} failed
            </Badge>
          )}
        </div>
        {!isProcessing && files.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div
              className="flex h-9 items-center rounded-full border border-border/40 bg-background/40 p-0.5 sm:h-7"
              role="group"
              aria-label="Queue view mode"
            >
              <button
                onClick={() => setViewMode('cards')}
                aria-pressed={!isList}
                aria-label="Card view"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:h-6 sm:w-6 ${
                  !isList ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-pressed={isList}
                aria-label="List view"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:h-6 sm:w-6 ${
                  isList ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground sm:h-7 sm:px-2 sm:text-[11px]"
              onClick={onAddMore}
              aria-label="Add more images"
            >
              <Plus className="mr-1 h-3.5 w-3.5 sm:mr-0.5 sm:h-3 sm:w-3" /> Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-destructive sm:h-7 sm:px-2 sm:text-[11px]"
              onClick={onClearAll}
              aria-label="Clear all images"
            >
              Clear
            </Button>
          </div>
        )}
      </motion.div>

      {/* Progress bar */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            aria-live="polite"
          >
            <div className="relative h-1.5 overflow-hidden rounded-full bg-secondary/50">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
              <div
                className="absolute inset-0 -translate-x-full animate-shimmer rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
                aria-hidden
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="truncate">{processingText || `${progress}%`}</span>
              <span className="flex items-center gap-2 tabular-nums">
                {stats && stats.bytesPerSecond > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <Gauge className="h-3 w-3" />
                    {formatFileSize(stats.bytesPerSecond)}/s
                    {stats.etaMs != null && stats.etaMs > 0 && (
                      <> · ETA {formatEta(stats.etaMs)}</>
                    )}
                  </span>
                )}
                <span className="font-semibold">{progress}%</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid (cards) or list (compact) — driven by viewMode */}
      {isList ? (
        <QueueList
          files={files}
          currentItem={currentItem}
          onRemove={onRemove}
          onRetry={onRetry}
          onInspect={onInspect}
          onPreviewOne={onPreviewOne}
        />
      ) : (
      <motion.div className="grid grid-cols-1 gap-2 sm:grid-cols-2" layout>
        <AnimatePresence mode="popLayout">
          {files.map((f, i) => {
            const isCurrent = currentItem === f.id && f.status === 'processing';
            const recommendation = f.metadata;
            const showRecommendation =
              !!recommendation && f.status === 'ready' && !isProcessing;
            return (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                onMouseEnter={() => setHoverId(f.id)}
                onMouseLeave={() => setHoverId(null)}
                className={`group relative flex items-center gap-2.5 rounded-xl border bg-card/60 p-2.5 transition-all duration-200 sm:p-2 ${
                  f.status === 'error'
                    ? 'border-destructive/30 bg-destructive/[0.04] hover:border-destructive/50'
                    : f.status === 'done'
                    ? 'border-success/25 bg-success/[0.04] hover:border-success/45'
                    : f.status === 'processing' && isCurrent
                    ? 'border-warning/40 bg-warning/[0.05] shadow-elev-1'
                    : 'border-border/40 hover:border-primary/30'
                }`}
              >
                {/* Thumbnail — click to open inspector */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspect?.(f.id);
                  }}
                  className="relative h-14 w-14 flex-shrink-0 cursor-zoom-in overflow-hidden rounded-lg bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-12 sm:w-12"
                  aria-label={`Open inspector for ${f.name}`}
                >
                  <img
                    src={f.preview}
                    alt={f.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {f.status === 'processing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                      <motion.div
                        className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        aria-label="Processing"
                      />
                    </div>
                  )}
                  {f.status === 'done' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute inset-0 flex items-center justify-center bg-success/30 backdrop-blur-[1px]"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success shadow-lg">
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </div>
                    </motion.div>
                  )}
                  {f.status === 'error' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-destructive/30 backdrop-blur-[1px]"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive shadow-lg">
                        <AlertCircle className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </div>
                    </motion.div>
                  )}
                </button>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-foreground sm:text-xs"
                    title={f.name}
                  >
                    {truncate(f.name, 22)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-[10px]">
                    {formatFileSize(f.originalSize)}
                    {f.originalWidth > 0 && f.originalHeight > 0 && (
                      <> · {f.originalWidth}×{f.originalHeight}</>
                    )}
                  </p>
                  {f.status === 'done' && f.result && (
                    <p className="mt-0.5 text-[11px] font-medium text-success sm:text-[10px]">
                      {formatFileSize(f.result.sizeBytes)} ·{' '}
                      {getCompressionRatio(f.originalSize, f.result.sizeBytes)}
                    </p>
                  )}
                  {f.status === 'error' && f.error && (
                    <p
                      className="mt-0.5 truncate text-[11px] text-destructive sm:text-[10px]"
                      title={f.error}
                    >
                      {f.error}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2 py-0 text-[11px] font-semibold sm:px-1.5 sm:text-[9px] ${statusStyles[f.status]}`}
                    >
                      {isCurrent ? 'Processing now' : statusLabel[f.status]}
                    </Badge>
                    {showRecommendation && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="cursor-help rounded-full border-primary/30 bg-primary/10 px-2 py-0 text-[11px] font-semibold text-primary sm:px-1.5 sm:text-[9px]"
                          >
                            <Lightbulb className="mr-0.5 h-2.5 w-2.5 sm:h-2 sm:w-2" />
                            Use {String(recommendation!.recommendedFormat).toUpperCase()}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px] text-xs leading-relaxed">
                          {recommendation!.recommendationReason}
                          <br />
                          <span className="text-primary">
                            Saves ~{recommendation!.estimatedSavings}%
                          </span>
                          <br />
                          <span className="text-muted-foreground">
                            Click the thumbnail to apply this suggestion.
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Action buttons cluster: inspect / preview / retry */}
                <div className="flex flex-col items-center gap-1">
                  {f.status === 'ready' && onPreviewOne && !isProcessing && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewOne(f.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/20 sm:h-7 sm:w-7"
                          aria-label={`Try settings on ${f.name}`}
                        >
                          <Sparkle size={16} weight="duotone" className="sm:!h-3.5 sm:!w-3.5" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>Try current settings on this image</TooltipContent>
                    </Tooltip>
                  )}
                  {f.status === 'ready' && onInspect && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspect(f.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground sm:h-7 sm:w-7"
                          aria-label={`Inspect ${f.name}`}
                        >
                          <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>Inspect metadata & smart suggestion</TooltipContent>
                    </Tooltip>
                  )}
                  {f.status === 'error' && !isProcessing && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetry(f.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 sm:h-7 sm:w-7"
                          aria-label={`Retry ${f.name}`}
                        >
                          <RotateCcw className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>Retry</TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Remove button — always visible on touch / mobile, hover-only on desktop */}
                {!isProcessing && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(f.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity duration-150 sm:h-6 sm:w-6 ${
                      hoverId === f.id || f.status === 'error'
                        ? 'opacity-100'
                        : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                    }`}
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      )}

      {/* Action buttons */}
      <AnimatePresence>
        {!allDone && readyCount > 0 && (
          <motion.div
            className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button
                size="default"
                disabled={isProcessing}
                onClick={onProcessAll}
                className="h-12 w-full rounded-xl text-sm font-semibold text-primary-foreground shadow-md sm:h-10 sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lightning size={16} weight="duotone" className="mr-1.5" />
                    Compress {readyCount} image{readyCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageQueue;

/**
 * Compact row layout used when the queue has many files (default for > 20).
 * Each row is a single 12-row-high strip with a small thumbnail, name, size,
 * status, and action buttons — designed to fit 6-8 rows on a laptop screen.
 */
function QueueList({
  files,
  currentItem,
  onRemove,
  onRetry,
  onInspect,
  onPreviewOne,
}: {
  files: UploadedFile[];
  currentItem: string | null;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onInspect?: (id: string) => void;
  onPreviewOne?: (id: string) => void;
}) {
  return (
    <motion.ul
      className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/40 bg-card/40"
      layout
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {files.map((f) => {
          const isCurrent = currentItem === f.id && f.status === 'processing';
          const hasRec = f.metadata && f.status === 'ready';
          return (
            <motion.li
              key={f.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className={`group flex items-center gap-2.5 px-2.5 py-1.5 transition-colors ${
                f.status === 'error'
                  ? 'bg-destructive/5'
                  : f.status === 'done'
                  ? 'bg-success/[0.05]'
                  : f.status === 'processing' && isCurrent
                  ? 'bg-warning/[0.06]'
                  : ''
              }`}
            >
              <button
                type="button"
                onClick={() => onInspect?.(f.id)}
                className="relative h-8 w-8 flex-shrink-0 cursor-zoom-in overflow-hidden rounded-md bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`Inspect ${f.name}`}
              >
                <img
                  src={f.preview}
                  alt={f.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {f.status === 'processing' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <motion.div
                      className="h-3 w-3 rounded-full border-2 border-primary/30 border-t-primary"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
                {f.status === 'done' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-success/40">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
                {f.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-destructive/40">
                    <AlertCircle className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[11px] font-medium"
                  title={f.name}
                >
                  {truncate(f.name, 32)}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {formatFileSize(f.originalSize)}
                  {f.result && (
                    <span className="text-success">
                      {' '}→ {formatFileSize(f.result.sizeBytes)} ·{' '}
                      {getCompressionRatio(f.originalSize, f.result.sizeBytes)}
                    </span>
                  )}
                  {f.status === 'error' && f.error && (
                    <span className="text-destructive"> · {f.error}</span>
                  )}
                </p>
              </div>

              {hasRec && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="rounded-full border-primary/30 bg-primary/10 px-1.5 py-0 text-[9px] font-semibold text-primary"
                    >
                      <Lightbulb className="mr-0.5 h-2 w-2" />
                      {String(f.metadata!.recommendedFormat).toUpperCase()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-[11px] leading-relaxed">
                    {f.metadata!.recommendationReason}
                    <br />
                    <span className="text-primary">
                      Saves ~{f.metadata!.estimatedSavings}%
                    </span>
                  </TooltipContent>
                </Tooltip>
              )}

              <Badge
                variant="outline"
                className={`rounded-full px-1.5 py-0 text-[9px] font-semibold ${statusStyles[f.status]}`}
              >
                {isCurrent ? 'Processing' : statusLabel[f.status]}
              </Badge>

              <div className="flex items-center gap-0.5">
                {f.status === 'ready' && onPreviewOne && (
                  <button
                    onClick={() => onPreviewOne(f.id)}
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label={`Try settings on ${f.name}`}
                  >
                    <Sparkle size={12} weight="duotone" />
                  </button>
                )}
                {f.status === 'error' && (
                  <button
                    onClick={() => onRetry(f.id)}
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label={`Retry ${f.name}`}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={() => onRemove(f.id)}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
}
