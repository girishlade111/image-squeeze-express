import UploadZone from '@/components/UploadZone';

interface HeroSectionProps {
  onFilesSelected: (files: FileList | File[]) => void;
  imageCount: number;
}

const HeroSection = ({ onFilesSelected, imageCount }: HeroSectionProps) => (
  <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
    {/* Background radial glow */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-primary/15 blur-[150px]" />
      <div className="absolute bottom-0 left-1/4 h-[300px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />
    </div>

    <div className="container relative mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl text-center">
        {/* Headline */}
        <h1 className="text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
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
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
          No uploads to servers. No login required. Your images never leave your device.
        </p>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {[
            { emoji: '🔒', label: '100% Private' },
            { emoji: '⚡', label: 'Instant Processing' },
            { emoji: '🆓', label: 'Free Forever' },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-4 py-2 text-sm font-medium text-foreground"
            >
              <span className="text-base">{badge.emoji}</span>
              {badge.label}
            </div>
          ))}
        </div>

        {/* Upload Zone */}
        <div className="mx-auto mt-12 max-w-2xl">
          <UploadZone onFilesSelected={onFilesSelected} imageCount={imageCount} />
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
