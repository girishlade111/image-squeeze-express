import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import {
  FilePdf,
  Sparkle,
  Lightning,
  ShieldCheck,
} from '@phosphor-icons/react';

interface PdfUploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  pdfCount: number;
  maxFiles?: number;
}

const ACCEPT = 'application/pdf,.pdf';

const PdfUploadZone = ({ onFilesSelected, pdfCount, maxFiles = 5 }: PdfUploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const full = pdfCount >= maxFiles;

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  return (
    <div className="w-full">
      <motion.div
        role="button"
        tabIndex={full ? -1 : 0}
        aria-disabled={full}
        aria-label={
          full
            ? `Maximum ${maxFiles} PDFs selected. Remove some to add more.`
            : `Upload PDFs. ${pdfCount} of ${maxFiles} selected. Click, press Enter/Space, or drag and drop files here.`
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
        className={`group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-foreground/[0.02] p-6 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[220px] sm:gap-4 sm:p-8 ${
          full
            ? 'cursor-not-allowed border-border/30 opacity-60'
            : dragOver
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-primary/25 hover:border-primary/50 hover:bg-primary/[0.04] hover:shadow-[0_0_30px_rgba(124,58,237,0.08)]'
        }`}
        whileHover={full ? {} : { scale: 1.005 }}
        whileTap={full ? {} : { scale: 0.995 }}
      >
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
            className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-colors sm:h-14 sm:w-14 ${
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
            <FilePdf size={28} weight="duotone" className="text-primary sm:!h-8 sm:!w-8" aria-hidden="true" />
          </motion.div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground sm:text-base md:text-lg">
            {full ? `Maximum ${maxFiles} PDFs reached` : 'Drag & drop PDFs here'}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {full ? (
              'Remove some PDFs to add more'
            ) : (
              <>
                or{' '}
                <span className="font-medium text-primary underline-offset-4 group-hover:underline">
                  browse files
                </span>
              </>
            )}
          </p>
        </div>

        {!full && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <ShieldCheck size={12} weight="duotone" />
              100% Private
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Lightning size={12} weight="duotone" />
              Instant
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Sparkle size={12} weight="duotone" />
              Up to 90% smaller
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Zap className="h-2.5 w-2.5" />
              Runs in browser
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Sparkles className="h-2.5 w-2.5" />
              Up to 90% smaller
            </span>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/70">
          PDF files only &nbsp;•&nbsp; {pdfCount}/{maxFiles} files &nbsp;•&nbsp; up to 100 MB each
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          disabled={full}
          className="hidden"
          onChange={handleChange}
          aria-label="Select PDF files to compress"
          tabIndex={-1}
        />
      </motion.div>
    </div>
  );
};

export default PdfUploadZone;
