import UploadZone from '@/components/UploadZone';
import ToolHero from '@/components/ToolHero';

interface HeroSectionProps {
  onFilesSelected: (files: FileList | File[]) => void;
  imageCount: number;
  maxFiles?: number;
  children?: React.ReactNode;
}

const HeroSection = ({ onFilesSelected, imageCount, maxFiles = 50, children }: HeroSectionProps) => (
  <ToolHero
    prefix="Compress Images"
    highlight="Up to 90%"
    suffix="Instantly & Privately"
    subhead="Free image compressor that runs entirely in your browser. Resize for social media, convert to WebP or AVIF, and download — no uploads, no login, no watermarks."
    badges={[
      { emoji: '🔒', label: '100% Private' },
      { emoji: '⚡', label: 'Instant' },
      { emoji: '🆓', label: 'Free Forever' },
      { emoji: '📦', label: `Batch (${maxFiles})` },
    ]}
  >
    <UploadZone
      onFilesSelected={onFilesSelected}
      imageCount={imageCount}
      maxFiles={maxFiles}
    />
    {children}
  </ToolHero>
);

export default HeroSection;
