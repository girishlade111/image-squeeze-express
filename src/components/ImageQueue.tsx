import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadedFile, formatSize } from '@/hooks/useImageUpload';

interface ImageQueueProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
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

const statusLabel = {
  ready: 'Ready',
  processing: 'Processing…',
  done: 'Done ✓',
  error: 'Error ✗',
};

const ImageQueue = ({ files, onRemove, onClearAll }: ImageQueueProps) => {
  if (files.length === 0) return null;

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      {/* Count */}
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        {files.length} image{files.length !== 1 ? 's' : ''} selected
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((f) => (
          <div
            key={f.id}
            className="group relative flex items-center gap-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-3 transition-colors hover:border-border"
          >
            {/* Thumbnail */}
            <img
              src={f.preview}
              alt={f.name}
              className="h-[60px] w-[60px] flex-shrink-0 rounded-xl object-cover"
              loading="lazy"
            />

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight" title={f.name}>
                {truncate(f.name, 20)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatSize(f.originalSize)}
              </p>
              <Badge
                variant="outline"
                className={`mt-1.5 rounded-full px-2 py-0 text-[10px] font-medium ${statusStyles[f.status]}`}
              >
                {statusLabel[f.status]}
              </Badge>
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(f.id);
              }}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-destructive"
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
          disabled
          size="lg"
          className="rounded-full px-8 text-primary-foreground opacity-60 cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
          }}
        >
          ⚡ Compress & Convert All
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onClearAll}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default ImageQueue;
