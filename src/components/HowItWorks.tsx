import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    num: 1,
    icon: '📤',
    title: 'Upload',
    desc: 'Select or drag your images. They stay 100% on your device.',
  },
  {
    num: 2,
    icon: '⚙️',
    title: 'Configure',
    desc: 'Set compression quality, resize dimensions, and output format.',
  },
  {
    num: 3,
    icon: '⬇️',
    title: 'Download',
    desc: 'Get your optimized images instantly. No waiting, no signup.',
  },
];

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

const HowItWorks = () => {
  const { ref, visible } = useInView(0.15);

  return (
    <section id="how-it-works" className="container mx-auto mt-24 px-4" ref={ref}>
      <h2 className="mb-14 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
        How It{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #4F46E5, #0D9488)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Works
        </span>
      </h2>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-0">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center sm:flex-1">
            {/* Step card */}
            <div
              className={`flex w-full flex-col items-center text-center transition-all duration-700 ${
                visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: visible ? `${i * 200}ms` : '0ms' }}
            >
              {/* Circle with number + icon */}
              <div className="relative mb-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 shadow-[0_0_20px_hsl(var(--violet)/0.15)]">
                  <span className="text-3xl">{s.icon}</span>
                </div>
                {/* Number badge */}
                <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #0D9488)' }}
                >
                  {s.num}
                </div>
              </div>

              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>

            {/* Arrow connector — hidden on mobile & after last step */}
            {i < steps.length - 1 && (
              <div
                className={`hidden flex-shrink-0 px-4 sm:flex transition-all duration-700 ${
                  visible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: visible ? `${i * 200 + 100}ms` : '0ms', transitionDelay: `${i * 200 + 300}ms` }}
              >
                <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
