import { useCallback, useRef, useState } from 'react';
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
    <div id="upload" className="w-full">
      <div
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
        className={`group relative flex min-h-[140px] sm:min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-foreground/[0.02] p-4 sm:p-6 text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          dragOver
            ? 'scale-[1.01] border-primary bg-primary/10'
            : 'border-primary/25 hover:border-primary/50 hover:bg-primary/[0.04]'
        }`}
      >
        {/* Icon */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
          dragOver ? 'bg-primary/20 scale-105' : 'bg-primary/[0.08] group-hover:bg-primary/12'
        }`}>
          <CloudUpload className={`h-6 w-6 text-primary transition-transform duration-300 ${
            dragOver ? 'scale-105' : ''
          }`} strokeWidth={1.5} aria-hidden="true" />
        </div>

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
      </div>
    </div>
  );
};

export default UploadZone;
