import { useMemo } from 'react';
import { motion } from 'framer-motion';
import UploadZone from '@/components/UploadZone';

interface HeroSectionProps {
  onFilesSelected: (files: FileList | File[]) => void;
  imageCount: number;
  maxFiles?: number;
  children?: React.ReactNode;
}

const HeroSection = ({ onFilesSelected, imageCount, maxFiles = 50, children }: HeroSectionProps) => {
  const floatingShapes = useMemo(
    () => [
      { size: 220, left: '5%', top: '15%', delay: '0s', duration: '20s' },
      { size: 160, left: '80%', top: '60%', delay: '-5s', duration: '25s' },
      { size: 120, left: '70%', top: '20%', delay: '-10s', duration: '18s' },
      { size: 100, left: '15%', top: '70%', delay: '-7s', duration: '22s' },
    ],
    []
  );

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-12 pb-12"
    >
      {/* Animated gradient mesh background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 20%, hsl(var(--primary) / 0.18), transparent),
            radial-gradient(ellipse 60% 40% at 80% 60%, hsl(var(--accent) / 0.12), transparent),
            radial-gradient(ellipse 50% 50% at 20% 80%, hsl(var(--primary) / 0.1), transparent),
            radial-gradient(ellipse 40% 30% at 70% 10%, hsl(var(--accent) / 0.08), transparent)
          `,
        }}
        aria-hidden
      />

      {/* Floating blurred shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-30"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.left,
              top: shape.top,
              background:
                i % 2 === 0
                  ? 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent)'
                  : 'radial-gradient(circle, hsl(var(--accent) / 0.4), transparent)',
              filter: 'blur(60px)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 30, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: parseFloat(shape.duration),
              delay: parseFloat(shape.delay),
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <motion.h1
            className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Compress Images{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Up to 90%
            </span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Instantly & Privately
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Free image compressor that runs entirely in your browser. Resize for social media,
            convert to WebP, and download — no uploads, no login.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              { emoji: '🔒', label: '100% Private' },
              { emoji: '⚡', label: 'Instant' },
              { emoji: '🆓', label: 'Free Forever' },
              { emoji: '📦', label: 'Batch (10)' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-0.5 text-[11px] font-medium text-foreground"
              >
                <span className="text-xs" aria-hidden>
                  {badge.emoji}
                </span>
                {badge.label}
              </div>
            ))}
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            className="mx-auto mt-6 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <UploadZone onFilesSelected={onFilesSelected} imageCount={imageCount} />
          </motion.div>

          {/* Queue / Settings injected via children */}
          {children}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
