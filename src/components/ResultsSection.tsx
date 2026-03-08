import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadedFile } from '@/hooks/useImageUpload';
import { formatFileSize, getCompressionRatio } from '@/utils/imageProcessor';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface ResultsSectionProps {
  files: UploadedFile[];
  onReset: () => void;
}

const ResultsSection = ({ files, onReset }: ResultsSectionProps) => {
  if (files.length === 0) return null;

  const downloadSingle = (f: UploadedFile) => {
    if (f.processedFile) saveAs(f.processedFile, f.processedFile.name);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    files.forEach((f) => {
      if (f.processedFile) zip.file(f.processedFile.name, f.processedFile);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'imagesqueeze_batch.zip');
  };

  const shareText = encodeURIComponent(
    'I just compressed my images with ImageSqueeze — 100% free & private! 🚀'
  );
  const shareUrl = encodeURIComponent('https://imagesqueeze.com');

  return (
    <section className="container mx-auto mt-12 max-w-3xl px-4">
      <h2 className="mb-6 text-center text-2xl font-bold">Results</h2>

      <div className="space-y-4">
        {files.map((f) => {
          const newSize = f.result?.sizeBytes || 0;
          const ratio = getCompressionRatio(f.originalSize, newSize);
          const ext = f.processedFile?.type.split('/')[1]?.toUpperCase() || '';

          return (
            <div key={f.id} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Before */}
                <div className="flex flex-1 items-center gap-3">
                  <img src={f.preview} alt="Before" className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Before</p>
                    <p className="text-sm font-semibold">{formatFileSize(f.originalSize)}</p>
                    <p className="text-xs text-muted-foreground">{f.originalWidth}×{f.originalHeight}</p>
                  </div>
                </div>

                {/* Reduction badge */}
                <Badge className="mx-auto flex-shrink-0 rounded-full bg-emerald-500/15 text-emerald-400 border-emerald-500/25 px-3 py-1 text-sm font-bold">
                  {ratio}
                </Badge>

                {/* After */}
                <div className="flex flex-1 items-center gap-3 sm:justify-end">
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground">After</p>
                    <p className="text-sm font-semibold">{formatFileSize(newSize)}</p>
                    <p className="text-xs text-muted-foreground">{f.result?.width}×{f.result?.height}</p>
                  </div>
                  <img src={f.processedPreview} alt="After" className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Badge variant="outline" className="rounded-full text-xs">{ext}</Badge>
                <Button size="sm" className="rounded-full text-primary-foreground" style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }} onClick={() => downloadSingle(f)}>
                  <Download className="mr-1 h-3.5 w-3.5" /> Download
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" className="rounded-full text-primary-foreground" style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }} onClick={downloadAll}>
          <Download className="mr-2 h-4 w-4" /> Download All as ZIP
        </Button>
        <Button variant="outline" size="lg" className="rounded-full" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" /> Process More Images
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="mb-2 text-sm text-muted-foreground">Share ImageSqueeze</p>
        <div className="flex justify-center gap-3">
          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-secondary px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary/80">Twitter/X</a>
          <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-secondary px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary/80">WhatsApp</a>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
