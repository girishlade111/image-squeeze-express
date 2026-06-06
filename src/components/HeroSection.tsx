import UploadZone from '@/components/UploadZone';
import ToolHero from '@/components/ToolHero';
import {
  ShieldCheck,
  Lightning,
  Gift,
  Stack,
} from '@phosphor-icons/react';

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
      { icon: ShieldCheck, label: '100% Private' },
      { icon: Lightning, label: 'Instant' },
      { icon: Gift, label: 'Free Forever' },
      { icon: Stack, label: `Batch (${maxFiles})` },
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
