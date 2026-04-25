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
  done: 'Done',
  error: 'Error',
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
    <div className="mx-auto mt-6 max-w-xl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-foreground">
          {files.length} file{files.length !== 1 ? 's' : ''} selected
        </p>
        {!isProcessing && !allDone && files.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 rounded-full text-[10px] text-muted-foreground hover:text-destructive"
            onClick={onClearAll}
          >
            Clear
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="mb-4">
          <div className="relative overflow-hidden rounded-full bg-secondary/50 h-2">
            <div 
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-center text-[10px] text-muted-foreground">
            {processingText || `${progress}%`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {files.map((f, i) => (
          <div
            key={f.id}
            className="group relative flex items-center gap-2 rounded-lg border border-border/40 bg-card/60 p-2 transition-all duration-200 hover:border-primary/30"
          >
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={f.preview}
                alt={f.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {f.status === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <div className="h-5 w-5 rounded-full border border-primary/30 border-t-primary animate-spin" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium" title={f.name}>
                {truncate(f.name, 20)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatFileSize(f.originalSize)} · {f.originalWidth}×{f.originalHeight}
              </p>
              <Badge
                variant="outline"
                className={`mt-1 rounded px-1.5 py-0 text-[9px] font-medium ${statusStyles[f.status]}`}
              >
                {statusLabel[f.status]}
              </Badge>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(f.id);
              }}
              disabled={isProcessing}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 hover:bg-destructive disabled:opacity-0"
              aria-label={`Remove ${f.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {!allDone && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={onProcessAll}
            className={`h-8 rounded-lg text-xs transition-all ${
              isProcessing ? 'animate-pulse' : ''
            }`}
            style={{
              background: isProcessing ? undefined : 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span className="mr-1 text-xs">⚡</span>
                Compress
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageQueue;