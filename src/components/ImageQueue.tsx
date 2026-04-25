import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div 
      className="mx-auto mt-6 max-w-xl"
      layout
    >
      {/* Count */}
      <motion.div 
        className="flex items-center justify-between mb-3"
        layout
      >
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
      </motion.div>

      {/* Progress bar */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="relative overflow-hidden rounded-full bg-secondary/50 h-2">
              <motion.div 
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-1 text-center text-[10px] text-muted-foreground">
              {processingText || `${progress}%`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div 
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        layout
      >
        <AnimatePresence mode="popLayout">
          {files.map((f, i) => (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, scale: 0.9, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="group relative flex items-center gap-2 rounded-lg border border-border/40 bg-card/60 p-2 transition-all duration-200 hover:border-primary/30"
            >
              {/* Thumbnail */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={f.preview}
                  alt={f.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {f.status === 'processing' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <motion.div 
                      className="h-5 w-5 rounded-full border border-primary/30 border-t-primary"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}
                {f.status === 'done' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-emerald-500/20"
                  >
                    <Check className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                )}
              </div>

              {/* Info */}
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

              {/* Remove button */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(f.id);
                }}
                disabled={isProcessing}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 hover:bg-destructive disabled:opacity-0"
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-3 w-3" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Action buttons */}
      <AnimatePresence>
        {!allDone && (
          <motion.div 
            className="mt-4 flex justify-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={onProcessAll}
                className={`h-8 rounded-lg text-xs transition-all ${
                  isProcessing ? 'animate-pulse' : ''
                }`}
                style={{
                  background: isProcessing ? undefined : 'linear-gradient(135deg, #4F46E5, #0D9488)',
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageQueue;