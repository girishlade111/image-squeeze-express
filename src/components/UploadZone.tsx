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
    <div id="upload" className="container mx-auto px-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`glass-card mx-auto flex max-w-2xl cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          dragOver
            ? 'border-violet shadow-[0_0_30px_hsl(var(--violet)/0.4)]'
            : 'border-border hover:border-violet/60 hover:shadow-[0_0_20px_hsl(var(--violet)/0.2)]'
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet/10">
          <CloudUpload className="h-8 w-8 text-violet" />
        </div>
        <div>
          <p className="text-lg font-semibold">Drag & Drop your images here</p>
          <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Supports: JPG, PNG, WebP, AVIF, GIF, BMP · Up to 10 files ({imageCount}/10)
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
