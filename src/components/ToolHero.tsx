import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ToolHeroProps {
  /** First line of the headline (rendered in normal weight). */
  prefix: string;
  /** Gradient-accented middle of the headline. */
  highlight: string;
  /** Trailing line of the headline. */
  suffix: string;
  /** One-sentence subhead. */
  subhead: string;
  /** Trust badges shown above the upload zone. Use the brand emoji for each. */
  badges: { emoji: string; label: string }[];
  /** Anything rendered after the upload zone (e.g. settings + queue). */
  children?: React.ReactNode;
}

/**
 * Shared hero block used by all 3 tool pages. It renders:
 *   1. Gradient mesh background (4 overlapping radial gradients)
 *   2. 4 floating blurred shapes that drift on a 18-25s loop
 *   3. The headline + subhead + trust badges (staggered fade-in)
 *   4. `children` — typically the upload zone, settings, and queue
 */
const ToolHero = ({ prefix, highlight, suffix, subhead, badges, children }: ToolHeroProps) => {
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
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-[calc(3.5rem+env(safe-area-inset-top))] pb-12 sm:pt-[calc(3rem+env(safe-area-inset-top))] md:pt-12"
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
          <motion.h1
            className="text-fluid-hero font-extrabold tracking-tight text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {prefix}{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {highlight}
            </span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            {suffix}
          </motion.h1>

          <motion.p
            className="mx-auto mt-3 max-w-xl text-fluid-body text-muted-foreground text-pretty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {subhead}
          </motion.p>

          <motion.div
            className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:mt-5 sm:gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-0.5 text-[11px] font-medium text-foreground sm:px-3 sm:py-1 sm:text-xs"
              >
                <span className="text-xs sm:text-sm" aria-hidden>
                  {badge.emoji}
                </span>
                {badge.label}
              </div>
            ))}
          </motion.div>

          <motion.div
            className="mx-auto mt-6 max-w-xl sm:mt-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ToolHero;
