import { X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UploadedFile } from '@/hooks/useImageUpload';
import { formatFileSize } from '@/utils/imageProcessor';

interface ImageQueueProps {
  files: UploadedFile[];
  isProcessing: boolean;
  progress: number;
  processingText: string;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onProcessAll: () => void;
  allDone: boolean;
}

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  const ext = str.lastIndexOf('.') >= 0 ? str.slice(str.lastIndexOf('.')) : '';
  const base = str.slice(0, max - ext.length - 1);
  return `${base}…${ext}`;
}

const statusStyles = {
  ready: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  processing: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  done: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  error: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const statusLabel: Record<UploadedFile['status'], string> = {
  ready: 'Ready',
  processing: 'Processing…',
  done: 'Done ✓',
  error: 'Error ✗',
};

const ImageQueue = ({
  files,
  isProcessing,
  progress,
  processingText,
  onRemove,
  onClearAll,
  onProcessAll,
  allDone,
}: ImageQueueProps) => {
  if (files.length === 0) return null;

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      {/* Count */}
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        {files.length} image{files.length !== 1 ? 's' : ''} selected
      </p>

      {/* Progress bar */}
      {isProcessing && (
        <div className="mb-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          <Progress value={progress} className="h-2.5 rounded-full" />
          <p className="mt-1.5 text-center text-xs font-medium text-muted-foreground">
            {processingText || `${progress}% complete`}
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((f, i) => (
          <div
            key={f.id}
            className="group relative flex items-center gap-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-3 transition-all duration-300 hover:border-border animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms`, animationDuration: '0.4s' }}
          >
            {/* Thumbnail */}
            <div className="relative h-[60px] w-[60px] flex-shrink-0">
              <img
                src={f.preview}
                alt={f.name}
                className="h-full w-full rounded-xl object-cover"
                loading="lazy"
              />
              {f.status === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight" title={f.name}>
                {truncate(f.name, 20)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatFileSize(f.originalSize)}
                <span className="mx-1">·</span>
                {f.originalWidth}×{f.originalHeight}
              </p>
              <Badge
                variant="outline"
                className={`mt-1.5 rounded-full px-2 py-0 text-[10px] font-medium ${statusStyles[f.status]}`}
              >
                {f.status === 'processing' && <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />}
                {f.status === 'done' && <Check className="mr-1 h-2.5 w-2.5" />}
                {f.status === 'error' && <AlertCircle className="mr-1 h-2.5 w-2.5" />}
                {statusLabel[f.status]}
              </Badge>
              {f.status === 'error' && f.error && (
                <p className="mt-1 text-[10px] text-red-400 leading-tight line-clamp-2" title={f.error}>
                  {f.error.length > 60 ? f.error.slice(0, 60) + '…' : f.error}
                </p>
              )}
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(f.id);
              }}
              disabled={isProcessing}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-destructive disabled:opacity-0"
              aria-label={`Remove ${f.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          disabled={isProcessing || allDone}
          onClick={onProcessAll}
          className={`rounded-full px-8 text-primary-foreground transition-all ${
            isProcessing ? 'animate-pulse' : ''
          }`}
          style={{
            background: isProcessing || allDone ? undefined : 'linear-gradient(135deg, #7C3AED, #06B6D4)',
          }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : allDone ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              All Done!
            </>
          ) : (
            '⚡ Compress & Convert All'
          )}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onClearAll}
          disabled={isProcessing}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default ImageQueue;
