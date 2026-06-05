import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Check, AlertCircle, RotateCcw, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { UploadedPdf } from '@/hooks/usePdfUpload';
import { formatBytes, getReductionRatio } from '@/hooks/usePdfUpload';

interface PdfQueueProps {
  files: UploadedPdf[];
  isProcessing: boolean;
  progress: number;
  processingText: string;
  currentItem: string | null;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onProcessAll: () => void;
  onRetry: (id: string) => void;
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

const statusStyles = {
  ready: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
  processing: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  done: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  error: 'bg-red-500/15 text-red-300 border-red-500/25',
};

const statusLabel: Record<UploadedPdf['status'], string> = {
  ready: 'Ready',
  processing: 'Compressing',
  done: 'Done',
  error: 'Failed',
};

const PdfQueue = ({
  files,
  isProcessing,
  progress,
  processingText,
  currentItem,
  onRemove,
  onClearAll,
  onProcessAll,
  onRetry,
  onAddMore,
  allDone,
  readyCount,
}: PdfQueueProps) => {
  const [hoverId, setHoverId] = useState<string | null>(null);

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
      aria-label="PDF queue"
    >
      <motion.div className="mb-3 flex items-center justify-between" layout>
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </p>
          {doneCount > 0 && (
            <Badge
              variant="outline"
              className="rounded-full border-emerald-500/30 bg-emerald-500/10 px-2 py-0 text-[9px] font-semibold text-emerald-300"
            >
              {doneCount} done
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge
              variant="outline"
              className="rounded-full border-red-500/30 bg-red-500/10 px-2 py-0 text-[9px] font-semibold text-red-300"
            >
              {errorCount} failed
            </Badge>
          )}
        </div>
        {!isProcessing && files.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 rounded-full px-2 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={onAddMore}
              aria-label="Add more PDFs"
            >
              <Plus className="mr-0.5 h-2.5 w-2.5" /> Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 rounded-full px-2 text-[10px] text-muted-foreground hover:text-destructive"
              onClick={onClearAll}
              aria-label="Clear all PDFs"
            >
              Clear
            </Button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            aria-live="polite"
          >
            <div className="relative overflow-hidden rounded-full bg-secondary/50 h-1.5">
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
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{processingText || `${progress}%`}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="grid grid-cols-1 gap-2" layout>
        <AnimatePresence mode="popLayout">
          {files.map((f, i) => {
            const isCurrent = currentItem === f.id && f.status === 'processing';
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
                className={`group relative flex items-center gap-2.5 rounded-xl border bg-card/60 p-2 transition-all duration-200 ${
                  f.status === 'error'
                    ? 'border-red-500/30 hover:border-red-500/50'
                    : f.status === 'done'
                    ? 'border-emerald-500/20 hover:border-emerald-500/40'
                    : 'border-border/40 hover:border-primary/30'
                }`}
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-secondary/30 flex items-center justify-center">
                  <FileText
                    className={`h-7 w-7 ${
                      f.status === 'done'
                        ? 'text-emerald-500/70'
                        : f.status === 'error'
                        ? 'text-red-500/70'
                        : 'text-primary/70'
                    }`}
                    aria-hidden
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
                      className="absolute inset-0 flex items-center justify-center bg-emerald-500/30 backdrop-blur-[1px]"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </div>
                    </motion.div>
                  )}
                  {f.status === 'error' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-red-500/30 backdrop-blur-[1px]"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-lg">
                        <AlertCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-medium text-foreground"
                    title={f.name}
                  >
                    {truncate(f.name, 28)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {formatBytes(f.originalSize)}
                    {f.pageCount !== null && (
                      <> · {f.pageCount} page{f.pageCount !== 1 ? 's' : ''}</>
                    )}
                  </p>
                  {f.status === 'processing' && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${Math.round(f.progress * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {Math.round(f.progress * 100)}%
                      </span>
                    </div>
                  )}
                  {f.status === 'done' && f.result && (
                    <p className="mt-0.5 text-[10px] font-medium text-emerald-300">
                      {formatBytes(f.result.sizeBytes)} ·{' '}
                      {getReductionRatio(f.originalSize, f.result.sizeBytes)}
                    </p>
                  )}
                  {f.status === 'error' && f.error && (
                    <p
                      className="mt-0.5 truncate text-[10px] text-red-300"
                      title={f.error}
                    >
                      {f.error}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className={`mt-1 rounded-full px-1.5 py-0 text-[9px] font-semibold ${statusStyles[f.status]}`}
                  >
                    {isCurrent ? 'Compressing now' : statusLabel[f.status]}
                  </Badge>
                </div>

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
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/20"
                        aria-label={`Retry ${f.name}`}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>Retry</TooltipContent>
                  </Tooltip>
                )}

                {!isProcessing && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(f.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-all duration-150 ${
                      hoverId === f.id || f.status === 'error'
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {!allDone && readyCount > 0 && (
          <motion.div
            className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="default"
                disabled={isProcessing}
                onClick={onProcessAll}
                className="h-10 w-full rounded-xl text-sm font-semibold text-primary-foreground shadow-md sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Compressing…
                  </>
                ) : (
                  <>
                    <span className="mr-1">⚡</span>
                    Compress {readyCount} PDF{readyCount !== 1 ? 's' : ''}
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

export default PdfQueue;
