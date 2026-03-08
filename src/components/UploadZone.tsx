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
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex min-h-[400px] cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed bg-foreground/[0.02] backdrop-blur-sm p-8 text-center transition-all duration-300 ${
          dragOver
            ? 'border-primary bg-primary/10 shadow-[0_0_40px_hsl(var(--violet)/0.3)]'
            : 'border-primary/30 hover:border-primary/60 hover:bg-primary/[0.06]'
        }`}
      >
        {/* Icon */}
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 ${
          dragOver ? 'bg-primary/20 scale-110' : 'bg-primary/10 group-hover:bg-primary/15 group-hover:scale-105'
        }`}>
          <CloudUpload className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <div>
          <p className="text-xl font-semibold text-foreground">
            Drag & Drop images here
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            or click to browse files
          </p>
        </div>

        {/* Supported formats */}
        <p className="text-xs text-muted-foreground/70">
          Supports: JPG, PNG, WebP, GIF, BMP • Max 10 files ({imageCount}/10)
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default UploadZone;
