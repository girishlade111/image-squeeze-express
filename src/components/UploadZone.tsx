import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  imageCount: number;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp';

const UploadZone = ({ onFilesSelected, imageCount }: UploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
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

  return (
    <motion.div 
      id="upload" 
      className="w-full"
      layout
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={`Upload images. ${imageCount} of 10 selected. Click or drag and drop files here.`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        className={`relative flex min-h-[140px] sm:min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-foreground/[0.02] p-4 sm:p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          dragOver
            ? 'border-primary bg-primary/10'
            : 'border-primary/25 hover:border-primary/50 hover:bg-primary/[0.04]'
        }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <AnimatePresence>
          {dragOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-xl bg-primary/5"
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div 
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
            dragOver ? 'bg-primary/20' : 'bg-primary/[0.08]'
          }`}
          animate={{
            scale: dragOver ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CloudUpload className={`h-6 w-6 text-primary`} strokeWidth={1.5} aria-hidden="true" />
        </motion.div>

        {/* Text */}
        <div>
          <p className="text-sm font-medium text-foreground">
            Drag & Drop images
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            or click to browse
          </p>
        </div>

        {/* Supported formats */}
        <p className="text-[10px] text-muted-foreground/60">
          JPG, PNG, WebP, GIF, BMP • {imageCount}/10 files
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
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
