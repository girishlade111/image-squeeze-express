import { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  Lightning,
  Stack,
  ArrowsClockwise,
  Gift,
} from '@phosphor-icons/react';

const features = [
  {
    icon: ShieldCheck,
    title: '100% Private',
    desc: 'Images processed in your browser. Zero server uploads.',
  },
  {
    icon: Lightning,
    title: 'Lightning Fast',
    desc: 'No upload wait times. Compression starts instantly.',
  },
  {
    icon: Stack,
    title: 'Batch Processing',
    desc: 'Compress up to 50 images at once (up to 750 MB) for free.',
  },
  {
    icon: ArrowsClockwise,
    title: 'Format Conversion',
    desc: 'Convert to WebP (30% smaller), AVIF (50% smaller), PNG, or JPEG instantly.',
  },
  {
    icon: Gift,
    title: 'Free Forever',
    desc: 'No account, no hidden fees, no watermarks. Ever.',
  },
];

const FeaturesGrid = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="features" className="container mx-auto mt-12 px-4 sm:mt-24" ref={ref}>
      <h2 className="mb-14 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
        Why Choose{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #4F46E5, #0D9488)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ImageSqueeze
        </span>
        ?
      </h2>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
          <div
            key={f.title}
            className={`group rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 transition-all duration-700 hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--violet)/0.12)] ${
              visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
            }`}
            style={{ animationDelay: visible ? `${i * 100}ms` : '0ms' }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
              <Icon size={26} weight="duotone" aria-hidden />
            </div>

            <h3 className="text-base font-bold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesGrid;
