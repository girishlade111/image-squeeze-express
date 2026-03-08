import { X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ImageItem, formatFileSize } from '@/lib/image-processing';

interface ImageQueueProps {
  images: ImageItem[];
  isProcessing: boolean;
  progress: number;
  onRemove: (id: string) => void;
  onProcessAll: () => void;
  onClearAll: () => void;
}

const statusConfig = {
  ready: { label: 'Ready', variant: 'secondary' as const, icon: null },
  processing: { label: 'Processing...', variant: 'default' as const, icon: Loader2 },
  done: { label: 'Done ✓', variant: 'default' as const, icon: Check },
  error: { label: 'Error ✗', variant: 'destructive' as const, icon: AlertCircle },
};

const ImageQueue = ({ images, isProcessing, progress, onRemove, onProcessAll, onClearAll }: ImageQueueProps) => {
  if (images.length === 0) return null;

  return (
    <div className="container mx-auto mt-8 max-w-2xl px-4">
      <div className="space-y-3">
        {images.map((img) => {
          const cfg = statusConfig[img.status];
          return (
            <div key={img.id} className="glass-card flex items-center gap-4 rounded-2xl p-3">
              <img
                src={img.preview}
                alt={img.file.name}
                className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{img.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(img.originalSize)} · {img.originalWidth}×{img.originalHeight}
                </p>
              </div>
              <Badge
                variant={cfg.variant}
                className={`flex-shrink-0 gap-1 rounded-full text-xs ${
                  img.status === 'done' ? 'bg-success/20 text-success border-success/30' : ''
                }`}
              >
                {cfg.icon && img.status === 'processing' && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {cfg.icon && img.status === 'done' && <Check className="h-3 w-3" />}
                {cfg.icon && img.status === 'error' && <AlertCircle className="h-3 w-3" />}
                {cfg.label}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 rounded-full"
                onClick={() => onRemove(img.id)}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {isProcessing && (
        <div className="mt-4">
          <Progress value={progress} className="h-2 rounded-full" />
          <p className="mt-1 text-center text-xs text-muted-foreground">{progress}% complete</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          onClick={onProcessAll}
          disabled={isProcessing || images.every((i) => i.status === 'done')}
          className="rounded-full gradient-bg px-8 text-primary-foreground hover:opacity-90"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            '⚡ Compress & Convert All'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onClearAll}
          disabled={isProcessing}
          className="rounded-full"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default ImageQueue;
