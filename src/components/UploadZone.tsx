import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudUpload, Sparkles, Zap, Shield } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  imageCount: number;
  maxFiles?: number;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp';

const UploadZone = ({ onFilesSelected, imageCount, maxFiles = 50 }: UploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const full = imageCount >= maxFiles;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) onFilesSelected(e.dataTransfer.files);
    },
    [onFilesSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(e.target.files);
        e.target.value = '';
      }
    },
    [onFilesSelected]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    []
  );

  return (
    <motion.div id="upload" className="w-full" layout>
      <motion.div
        role="button"
        tabIndex={full ? -1 : 0}
        aria-disabled={full}
        aria-label={
          full
            ? `Maximum ${maxFiles} images selected. Remove some to add more.`
            : `Upload images. ${imageCount} of ${maxFiles} selected. Click, press Enter/Space, or drag and drop files here.`
        }
        onDragOver={(e) => {
          if (full) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !full && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className={`group relative flex min-h-[180px] sm:min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-foreground/[0.02] p-6 sm:p-8 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          full
            ? 'cursor-not-allowed border-border/30 opacity-60'
            : dragOver
            ? 'border-primary bg-primary/10 scale-[1.01] shadow-elev-glow'
            : 'border-primary/25 hover:border-primary/50 hover:bg-primary/[0.04] hover:shadow-elev-2'
        }`}
        whileHover={full ? {} : { scale: 1.005 }}
        whileTap={full ? {} : { scale: 0.995 }}
      >
        {/* Decorative gradient glow */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ${
            dragOver ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--primary) / 0.15), transparent)',
          }}
        />

        {/* Icon with pulse ring */}
        <div className="relative">
          <div
            className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              dragOver ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), transparent)',
              filter: 'blur(8px)',
            }}
            aria-hidden
          />
          <motion.div
            className={`relative flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
              dragOver ? 'bg-primary/25' : 'bg-primary/[0.1] group-hover:bg-primary/[0.15]'
            }`}
            animate={
              dragOver
                ? { scale: 1.1, rotate: -6 }
                : { scale: 1, rotate: 0, y: [0, -2, 0] }
            }
            transition={
              dragOver
                ? { type: 'spring', stiffness: 300, damping: 20 }
                : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <CloudUpload className="h-7 w-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
          </motion.div>
        </div>

        {/* Text */}
        <div className="space-y-1">
          <p className="text-base sm:text-lg font-semibold text-foreground">
            {full ? `Maximum ${maxFiles} images reached` : 'Drag & drop images here'}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {full ? (
              'Remove some images to add more'
            ) : (
              <>
                or{' '}
                <span className="font-medium text-primary underline-offset-4 group-hover:underline">
                  browse files
                </span>
                {' • '}
                <kbd className="rounded border border-border/60 bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  Ctrl V
                </kbd>{' '}
                to paste
              </>
            )}
          </p>
        </div>

        {/* Quick info chips */}
        {!full && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Shield className="h-2.5 w-2.5" />
              100% Private
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Zap className="h-2.5 w-2.5" />
              Instant
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Sparkles className="h-2.5 w-2.5" />
              Up to 90% smaller
            </span>
          </div>
        )}

        {/* Supported formats */}
        <p className="text-[10px] text-muted-foreground/70">
          JPG · PNG · WebP · GIF · BMP · AVIF &nbsp;•&nbsp; {imageCount}/{maxFiles} files
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          disabled={full}
          className="hidden"
          onChange={handleChange}
          aria-label="Select image files to compress"
          tabIndex={-1}
        />
      </motion.div>
    </motion.div>
  );
};

export default UploadZone;
