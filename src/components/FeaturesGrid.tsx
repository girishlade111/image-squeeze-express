import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ShieldCheck,
  Lightning,
  Stack,
  ArrowsClockwise,
  Gift,
  Globe,
  ArrowUpRight,
  Sparkle,
} from '@phosphor-icons/react';

interface Feature {
  icon: typeof ShieldCheck;
  title: string;
  desc: string;
  meta: string;
  accent: 'primary' | 'accent';
}

const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: '100% Private',
    desc: 'Images processed entirely in your browser. Zero server uploads, zero tracking.',
    meta: 'No server',
    accent: 'primary',
  },
  {
    icon: Lightning,
    title: 'Lightning Fast',
    desc: 'No upload wait times. Web Workers + Canvas API = compression in milliseconds.',
    meta: '< 200ms',
    accent: 'accent',
  },
  {
    icon: Stack,
    title: 'Batch Processing',
    desc: 'Compress up to 50 images at once (up to 750 MB) and download as a single ZIP.',
    meta: '50 files',
    accent: 'primary',
  },
  {
    icon: ArrowsClockwise,
    title: 'Format Conversion',
    desc: 'Convert to WebP (30% smaller) or AVIF (50% smaller), plus PNG and JPEG.',
    meta: '4 formats',
    accent: 'accent',
  },
  {
    icon: Gift,
    title: 'Free Forever',
    desc: 'No account, no hidden fees, no watermarks, no upsells. Free is a feature.',
    meta: '$0 always',
    accent: 'primary',
  },
  {
    icon: Globe,
    title: 'Works Anywhere',
    desc: 'Any modern browser, any device. No install, no signup, no extensions.',
    meta: '100% client',
    accent: 'accent',
  },
];

const GRADIENT_TEXT = {
  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
};

const FeaturesGrid = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const floatingShapes = useMemo(
    () => [
      { left: '5%', top: '20%', size: 180, delay: '0s', duration: '20s', color: 'primary' },
      { left: '92%', top: '60%', size: 140, delay: '-7s', duration: '24s', color: 'accent' },
      { left: '88%', top: '15%', size: 100, delay: '-3s', duration: '18s', color: 'primary' },
    ],
    []
  );

  return (
    <section
      id="features"
      ref={ref}
      className="relative container mx-auto mt-12 overflow-hidden px-4 pt-12 sm:mt-24 sm:pt-16"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 15% 20%, hsl(var(--primary) / 0.08), transparent),
            radial-gradient(ellipse 50% 40% at 85% 80%, hsl(var(--accent) / 0.08), transparent)
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {floatingShapes.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              left: s.left,
              top: s.top,
              background:
                s.color === 'primary'
                  ? 'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent)'
                  : 'radial-gradient(circle, hsl(var(--accent) / 0.25), transparent)',
              filter: 'blur(60px)',
            }}
            animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{
              duration: parseFloat(s.duration),
              delay: parseFloat(s.delay),
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Section header */}
      <div className="relative mx-auto mb-10 max-w-2xl text-center sm:mb-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-primary sm:mb-4"
        >
          <Sparkle size={12} weight="duotone" />
          Why choose us
        </motion.div>

        <motion.h2
          className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Why Choose <span style={GRADIENT_TEXT}>LS Image Compressor</span>?
        </motion.h2>

        <motion.p
          className="mx-auto mt-2 max-w-md text-sm text-muted-foreground text-pretty sm:text-base"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Six promises we keep — no asterisks, no fine print, no exceptions.
        </motion.p>
      </div>

      {/* Bento grid */}
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {features.map((feature, i) => (
          <FeatureCard
            key={feature.title}
            feature={feature}
            number={String(i + 1).padStart(2, '0')}
            index={i}
            active={inView}
          />
        ))}
      </div>
    </section>
  );
};

const FeatureCard = ({
  feature,
  number,
  index,
  active,
}: {
  feature: Feature;
  number: string;
  index: number;
  active: boolean;
}) => {
  const Icon = feature.icon;
  const isAccent = feature.accent === 'accent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: 0.05 + index * 0.07, ease: 'easeOut' }}
      className="group relative"
    >
      <div
        className="absolute inset-0 rounded-2xl p-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.4), hsl(var(--primary) / 0.2))',
        }}
      >
        <div className="h-full w-full rounded-[15px] bg-card" />
      </div>

      <div className="relative h-full overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm transition-all duration-500 group-hover:border-transparent group-hover:bg-card/80 sm:p-6">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          aria-hidden
          style={{
            background: isAccent
              ? 'radial-gradient(circle, hsl(var(--accent) / 0.18), transparent)'
              : 'radial-gradient(circle, hsl(var(--primary) / 0.18), transparent)',
            filter: 'blur(30px)',
          }}
        />

        <div className="relative flex items-start justify-between gap-3">
          {/* Icon with animated halo */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-2xl"
              aria-hidden
              style={{
                background: isAccent
                  ? 'radial-gradient(circle, hsl(var(--accent) / 0.3), transparent 70%)'
                  : 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)',
              }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: isAccent
                  ? 'linear-gradient(135deg, hsl(var(--accent) / 0.15), hsl(var(--primary) / 0.1))'
                  : 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.1))',
                borderColor: 'hsl(var(--border) / 0.5)',
              }}
            >
              <Icon
                size={28}
                weight="duotone"
                className={isAccent ? 'h-7 w-7 text-primary/80' : 'h-7 w-7 text-primary'}
              />
            </div>
          </div>

          {/* Number badge + meta pill */}
          <div className="flex flex-col items-end gap-1.5">
            <span className="font-mono text-[10px] font-bold tabular-nums text-muted-foreground/60 transition-colors duration-500 group-hover:text-primary">
              {number}
            </span>
            <span
              className={cn(
                'rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors duration-500',
                isAccent
                  ? 'border-primary/30 bg-primary/10 text-primary/80'
                  : 'border-primary/25 bg-primary/10 text-primary'
              )}
            >
              {feature.meta}
            </span>
          </div>
        </div>

        <h3 className="mt-5 text-base font-bold tracking-tight sm:text-lg">
          {feature.title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {feature.desc}
        </p>

        {/* Hover reveal — arrow link */}
        <div className="mt-3 flex h-4 items-center overflow-hidden">
          <span className="inline-flex translate-y-5 items-center gap-1 text-[11px] font-semibold text-primary opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            Learn more
            <ArrowUpRight size={12} weight="bold" />
          </span>
        </div>

        {/* Corner accent — bottom-left, subtle */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-px w-12 origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
          aria-hidden
          style={{
            background: isAccent
              ? 'linear-gradient(90deg, hsl(var(--accent)), transparent)'
              : 'linear-gradient(90deg, hsl(var(--primary)), transparent)',
          }}
        />
      </div>
    </motion.div>
  );
};

const cn = (...classes: (string | false | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default FeaturesGrid;
