import { useMemo } from 'react';
import UploadZone from '@/components/UploadZone';

interface HeroSectionProps {
  onFilesSelected: (files: FileList | File[]) => void;
  imageCount: number;
  children?: React.ReactNode;
}

const HeroSection = ({ onFilesSelected, imageCount, children }: HeroSectionProps) => {
  const floatingShapes = useMemo(() => [
    { size: 320, left: '5%', top: '15%', delay: '0s', duration: '20s' },
    { size: 260, left: '80%', top: '60%', delay: '-5s', duration: '25s' },
    { size: 180, left: '70%', top: '20%', delay: '-10s', duration: '18s' },
    { size: 150, left: '15%', top: '70%', delay: '-7s', duration: '22s' },
  ], []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated gradient mesh background */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 20%, hsl(263 70% 58% / 0.18), transparent),
          radial-gradient(ellipse 60% 40% at 80% 60%, hsl(187 92% 43% / 0.12), transparent),
          radial-gradient(ellipse 50% 50% at 20% 80%, hsl(263 70% 58% / 0.1), transparent),
          radial-gradient(ellipse 40% 30% at 70% 10%, hsl(187 92% 43% / 0.08), transparent)
        `
      }} />

      {/* Floating blurred shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floatingShapes.map((shape, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30 animate-float"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.left,
              top: shape.top,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, hsl(263 70% 58% / 0.4), transparent)' 
                : 'radial-gradient(circle, hsl(187 92% 43% / 0.4), transparent)',
              filter: 'blur(60px)',
              animationDelay: shape.delay,
              animationDuration: shape.duration,
            }}
          />
        ))}
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Compress Images Up to 90%
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Instantly & Privately
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
            No uploads to servers. No login required. Your images never leave your device.
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { emoji: '🔒', label: '100% Private' },
              { emoji: '⚡', label: 'Instant' },
              { emoji: '🆓', label: 'Free' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1 text-xs font-medium text-foreground"
              >
                <span className="text-xs">{badge.emoji}</span>
                {badge.label}
              </div>
            ))}
          </div>

          {/* Upload Zone */}
          <div className="mx-auto mt-8 max-w-xl">
            <UploadZone onFilesSelected={onFilesSelected} imageCount={imageCount} />
          </div>

          {/* Queue injected via children */}
          {children}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;