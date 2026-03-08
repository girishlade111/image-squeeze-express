import { Lock, Zap, Gift } from 'lucide-react';

const badges = [
  { icon: Lock, label: '100% Private', sub: 'Client-side' },
  { icon: Zap, label: 'Instant Processing', sub: '' },
  { icon: Gift, label: 'Free Forever', sub: '' },
];

const HeroSection = () => (
  <section id="home" className="relative overflow-hidden py-16 sm:py-24">
    {/* Background glow */}
    <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2">
      <div className="h-80 w-[600px] rounded-full bg-violet/20 blur-[120px]" />
    </div>

    <div className="container relative mx-auto px-4 text-center">
      <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        Compress Images Up to 90% —{' '}
        <span className="gradient-text">Instantly & Privately</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
        No uploads to servers. No login required. Your images never leave your device.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
        {badges.map((b) => (
          <div
            key={b.label}
            className="glass-card flex items-center gap-3 rounded-2xl px-5 py-3"
          >
            <b.icon className="h-5 w-5 text-violet" />
            <div className="text-left">
              <p className="text-sm font-semibold">{b.label}</p>
              {b.sub && <p className="text-xs text-muted-foreground">{b.sub}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;
