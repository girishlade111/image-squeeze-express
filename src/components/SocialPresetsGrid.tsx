import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ImageIcon, Sparkles, Upload, Eye } from 'lucide-react';

interface SocialPresetsGridProps {
  onSelectPreset: (w: number, h: number, id: string) => void;
  selectedPreset?: string | null;
}

const platforms = [
  { id: 'ig-post', name: 'Instagram Post', icon: '📸', sizes: '1080×1080', w: 1080, h: 1080, desc: 'Square feed post' },
  { id: 'li-post', name: 'LinkedIn Post', icon: '💼', sizes: '1200×627', w: 1200, h: 627, desc: 'Feed update image' },
  { id: 'wa-dp', name: 'WhatsApp DP', icon: '💬', sizes: '500×500', w: 500, h: 500, desc: 'Profile picture' },
  { id: 'tw-post', name: 'Twitter / X', icon: '🐦', sizes: '1200×675', w: 1200, h: 675, desc: 'In-feed image' },
  { id: 'fb-cover', name: 'Facebook Cover', icon: '📘', sizes: '820×312', w: 820, h: 312, desc: 'Page cover banner' },
  { id: 'yt-thumb', name: 'YouTube Thumb', icon: '▶️', sizes: '1280×720', w: 1280, h: 720, desc: 'Video thumbnail' },
];

function getRatio(w: number, h: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

const SocialPresetsGrid = ({ onSelectPreset, selectedPreset = null }: SocialPresetsGridProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);

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

  const activePlatform = useMemo(
    () => platforms.find((p) => p.id === (hoveredPreset || selectedPreset)) || null,
    [hoveredPreset, selectedPreset]
  );

  const handleClick = (w: number, h: number, id: string, name: string) => {
    onSelectPreset(w, h, id);
    setHoveredPreset(null);
    toast.success(`${name} preset applied`, {
      description: `Images will be resized to ${w}×${h}px. Drop your images below to start.`,
      duration: 3500,
    });
    const upload = document.getElementById('upload');
    if (upload) {
      const headerOffset = 60;
      const top = upload.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollToUpload = () => {
    const upload = document.getElementById('upload');
    if (upload) {
      const headerOffset = 60;
      const top = upload.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section className="container mx-auto mt-24 px-4" ref={ref}>
      {/* Header */}
      <div className="text-center mb-10">
        <h2
          className={`text-3xl font-extrabold tracking-tight sm:text-4xl transition-all duration-700 ${
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
        <p
          className={`mt-3 text-sm text-muted-foreground max-w-lg mx-auto transition-all duration-700 ${
            visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
          }`}
          style={{ animationDelay: '100ms' }}
        >
          Hover or click a platform to preview the exact aspect ratio, then auto-fill the dimensions.
        </p>
      </div>

      {/* Demo area */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Live preview */}
        <div
          className={`lg:col-span-2 transition-all duration-700 ${
            visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
          }`}
          style={{ animationDelay: '200ms' }}
        >
          <div className="relative h-full min-h-[220px] overflow-hidden rounded-2xl border-2 border-border/40 bg-secondary/20 shadow-lg">
            {/* Subtle grid background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, hsl(var(--border)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--border)) 25%, transparent 25%)',
                backgroundSize: '20px 20px',
              }}
              aria-hidden
            />

            {/* Empty state */}
            {!activePlatform && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-semibold">Live preview</p>
                  <p className="mt-1 text-[10px]">Hover or click a platform →</p>
                </div>
              </div>
            )}

            {/* Aspect-ratio frame */}
            {activePlatform && (
              <div className="absolute inset-0 flex items-center justify-center p-5">
                <div
                  className="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-2xl ring-2 ring-white/30 transition-all duration-500"
                  style={{
                    aspectRatio: `${activePlatform.w}/${activePlatform.h}`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                >
                  {/* Faux photo content for visual context */}
                  <div className="absolute inset-0 opacity-30" aria-hidden>
                    <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-white/40 blur-xl" />
                    <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-yellow-300/40 blur-xl" />
                    <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-md" />
                  </div>
                  <div className="relative text-center text-white drop-shadow-lg">
                    <div className="text-3xl" aria-hidden>{activePlatform.icon}</div>
                    <div className="mt-1 text-[11px] font-bold">{activePlatform.name}</div>
                    <div className="font-mono text-[10px] opacity-90">{activePlatform.sizes}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Dimensions badge */}
            {activePlatform && (
              <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 font-mono text-[10px] text-white backdrop-blur-sm">
                <Sparkles className="h-2.5 w-2.5" />
                {activePlatform.w} × {activePlatform.h} • {getRatio(activePlatform.w, activePlatform.h)}
              </div>
            )}

            {/* Description badge */}
            {activePlatform && (
              <div className="absolute bottom-3 left-3 right-3 rounded-md bg-black/70 px-2 py-1 text-center text-[10px] font-medium text-white backdrop-blur-sm">
                {activePlatform.desc}
              </div>
            )}
          </div>
        </div>

        {/* Platform buttons */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {platforms.map((p, i) => {
              const isActive = selectedPreset === p.id;
              const isHovered = hoveredPreset === p.id;
              const showGlow = isActive || isHovered;
              return (
                <Button
                  key={p.id}
                  variant="outline"
                  aria-pressed={isActive}
                  aria-label={`${p.name} preset: ${p.sizes} pixels`}
                  onMouseEnter={() => setHoveredPreset(p.id)}
                  onMouseLeave={() => setHoveredPreset(null)}
                  onFocus={() => setHoveredPreset(p.id)}
                  onBlur={() => setHoveredPreset(null)}
                  onClick={() => handleClick(p.w, p.h, p.id, p.name)}
                  className={`flex h-auto flex-col items-center gap-0.5 rounded-2xl border px-2 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 bg-card/60 hover:border-primary/60'
                  } ${showGlow ? 'shadow-[0_0_18px_rgba(124,58,237,0.2)]' : ''} ${
                    visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
                  }`}
                  style={{ animationDelay: visible ? `${i * 80 + 300}ms` : '0ms' }}
                >
                  <span className="text-xl" aria-hidden>{p.icon}</span>
                  <span className="text-[11px] font-semibold leading-tight">{p.name}</span>
                  <span className="text-[9px] text-muted-foreground">{p.sizes}</span>
                </Button>
              );
            })}
          </div>

          {/* Active-state info */}
          {activePlatform && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-3 text-center">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{activePlatform.name}</span> uses a{' '}
                <span className="font-mono text-primary">{getRatio(activePlatform.w, activePlatform.h)}</span> aspect
                ratio — perfect for {activePlatform.desc.toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div
        className={`mt-8 text-center transition-all duration-700 ${
          visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
        }`}
        style={{ animationDelay: '700ms' }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollToUpload}
          className="text-xs text-muted-foreground hover:text-primary"
          aria-label="Skip preset and upload your own image"
        >
          <Upload className="mr-1.5 h-3 w-3" />
          Or upload your own image
        </Button>
      </div>
    </section>
  );
};

export default SocialPresetsGrid;
