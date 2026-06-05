import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SocialPresetsGridProps {
  onSelectPreset: (w: number, h: number, id: string) => void;
  selectedPreset?: string | null;
}

const platforms = [
  { id: 'ig-post', name: 'Instagram', icon: '📸', sizes: '1080×1080', w: 1080, h: 1080 },
  { id: 'li-post', name: 'LinkedIn', icon: '💼', sizes: '1200×627', w: 1200, h: 627 },
  { id: 'wa-dp', name: 'WhatsApp', icon: '💬', sizes: '500×500', w: 500, h: 500 },
  { id: 'tw-post', name: 'Twitter/X', icon: '🐦', sizes: '1200×675', w: 1200, h: 675 },
  { id: 'fb-cover', name: 'Facebook', icon: '📘', sizes: '820×312', w: 820, h: 312 },
  { id: 'yt-thumb', name: 'YouTube', icon: '▶️', sizes: '1280×720', w: 1280, h: 720 },
];

const SocialPresetsGrid = ({ onSelectPreset, selectedPreset = null }: SocialPresetsGridProps) => {
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

  const handleClick = (w: number, h: number, id: string, name: string) => {
    onSelectPreset(w, h, id);
    toast.success(`${name} preset applied`, {
      description: `Images will be resized to ${w}×${h}px. Drop your images to start.`,
      duration: 3500,
    });
    const upload = document.getElementById('upload');
    if (upload) {
      const headerOffset = 60;
      const top = upload.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
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
      <div
        className="mx-auto grid max-w-3xl grid-cols-2 gap-3 lg:grid-cols-6"
        role="group"
        aria-label="Social media size presets"
      >
        {platforms.map((p, i) => {
          const isActive = selectedPreset === p.id;
          return (
            <Button
              key={p.id}
              variant="outline"
              aria-pressed={isActive}
              aria-label={`${p.name} preset: ${p.sizes} pixels`}
              className={`flex h-auto flex-col gap-1 rounded-2xl border px-4 py-5 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(124,58,237,0.25)]'
                  : 'border-border/50 bg-card/60 hover:border-primary/60 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]'
              } ${
                visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
              }`}
              style={{ animationDelay: visible ? `${i * 80 + 200}ms` : '0ms' }}
              onClick={() => handleClick(p.w, p.h, p.id, p.name)}
            >
              <span className="text-2xl" aria-hidden>{p.icon}</span>
              <span className="text-xs font-semibold">{p.name}</span>
              <span className="text-[10px] text-muted-foreground">{p.sizes}</span>
              {isActive && (
                <span className="sr-only"> (currently selected)</span>
              )}
            </Button>
          );
        })}
      </div>
    </section>
  );
};

export default SocialPresetsGrid;
