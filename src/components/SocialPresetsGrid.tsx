import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface SocialPresetsGridProps {
  onSelectPreset: (w: number, h: number, id: string) => void;
}

const platforms = [
  { id: 'ig-post', name: 'Instagram', icon: '📸', sizes: '1080×1080', w: 1080, h: 1080 },
  { id: 'li-post', name: 'LinkedIn', icon: '💼', sizes: '1200×627', w: 1200, h: 627 },
  { id: 'wa-dp', name: 'WhatsApp', icon: '💬', sizes: '500×500', w: 500, h: 500 },
  { id: 'tw-post', name: 'Twitter/X', icon: '🐦', sizes: '1200×675', w: 1200, h: 675 },
  { id: 'fb-cover', name: 'Facebook', icon: '📘', sizes: '820×312', w: 820, h: 312 },
  { id: 'yt-thumb', name: 'YouTube', icon: '▶️', sizes: '1280×720', w: 1280, h: 720 },
];

const SocialPresetsGrid = ({ onSelectPreset }: SocialPresetsGridProps) => {
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

  const handleClick = (w: number, h: number, id: string) => {
    onSelectPreset(w, h, id);
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="container mx-auto mt-24 px-4" ref={ref}>
      <h2
        className={`mb-2 text-center text-2xl font-extrabold tracking-tight sm:text-3xl transition-all duration-700 ${
          visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
        }`}
      >
        Optimize for Social Media —{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #4F46E5, #0D9488)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          One Click
        </span>
      </h2>
      <p className={`mx-auto mb-8 max-w-lg text-center text-sm text-muted-foreground transition-all duration-700 ${visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
        Click a platform to auto-fill the perfect dimensions.
      </p>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 lg:grid-cols-6">
        {platforms.map((p, i) => (
          <Button
            key={p.name}
            variant="outline"
            className={`flex h-auto flex-col gap-1 rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm px-4 py-5 transition-all duration-500 hover:border-primary/60 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)] hover:scale-105 ${
              visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
            }`}
            style={{ animationDelay: visible ? `${i * 80 + 200}ms` : '0ms' }}
            onClick={() => handleClick(p.w, p.h)}
          >
            <span className="text-2xl">{p.icon}</span>
            <span className="text-xs font-semibold">{p.name}</span>
            <span className="text-[10px] text-muted-foreground">{p.sizes}</span>
          </Button>
        ))}
      </div>
    </section>
  );
};

export default SocialPresetsGrid;
