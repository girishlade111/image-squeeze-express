import { X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-foreground">
          {files.length} image{files.length !== 1 ? 's' : ''} selected
        </p>
        {!isProcessing && !allDone && files.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 rounded-full text-xs text-muted-foreground hover:text-destructive"
            onClick={onClearAll}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div className="mb-6" style={{ animationDuration: '0.3s' }}>
          <div className="relative overflow-hidden rounded-full bg-secondary/50 h-3">
            <div 
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
            {processingText || `${progress}% complete`}
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((f, i) => (
          <div
            key={f.id}
            className="group relative flex items-center gap-3 rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.08]"
            style={{ animationDelay: `${i * 50}ms`, animationDuration: '0.4s' }}
          >
            {/* Thumbnail */}
            <div className="relative h-[64px] w-[64px] flex-shrink-0 overflow-hidden rounded-xl">
              <img
                src={f.preview}
                alt={f.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              {f.status === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                  <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight" title={f.name}>
                {truncate(f.name, 22)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatFileSize(f.originalSize)}
                <span className="mx-1.5">·</span>
                {f.originalWidth}×{f.originalHeight}
              </p>
              <Badge
                variant="outline"
                className={`mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusStyles[f.status]}`}
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
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 hover:bg-destructive hover:scale-110 disabled:opacity-0"
              aria-label={`Remove ${f.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      {!allDone && (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            disabled={isProcessing}
            onClick={onProcessAll}
            className={`w-full sm:w-auto rounded-2xl px-8 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25 ${
              isProcessing ? 'animate-pulse' : ''
            }`}
            style={{
              background: isProcessing ? undefined : 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span className="mr-2 text-lg">⚡</span>
                Compress & Convert All
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageQueue;
