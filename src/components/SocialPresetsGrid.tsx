import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Upload, Eye } from 'lucide-react';

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
          Hover or click a platform to see exactly how your image will be cropped, then auto-fill the dimensions.
        </p>
      </div>

      {/* Demo area */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Live preview with sample image */}
        <div
          className={`lg:col-span-2 transition-all duration-700 ${
            visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
          }`}
          style={{ animationDelay: '200ms' }}
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-border/40 bg-secondary/30 shadow-lg">
            {/* Sample photo (SVG landscape) */}
            <svg
              viewBox="0 0 400 225"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <defs>
                <linearGradient id="demo-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="55%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <linearGradient id="demo-mtn-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#312e81" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
                <linearGradient id="demo-mtn-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4338ca" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
              </defs>
              <rect width="400" height="225" fill="url(#demo-sky)" />
              <circle cx="310" cy="70" r="28" fill="#fef3c7" opacity="0.9" />
              <circle cx="310" cy="70" r="20" fill="#fbbf24" />
              <ellipse cx="80" cy="50" rx="30" ry="8" fill="white" opacity="0.4" />
              <ellipse cx="125" cy="45" rx="25" ry="6" fill="white" opacity="0.3" />
              <polygon points="0,225 90,110 180,225" fill="url(#demo-mtn-1)" />
              <polygon points="130,225 220,80 310,225" fill="url(#demo-mtn-2)" />
              <polygon points="250,225 340,130 400,180 400,225" fill="url(#demo-mtn-1)" />
              <rect y="200" width="400" height="25" fill="#065f46" />
              <rect y="210" width="400" height="15" fill="#047857" />
            </svg>

            {/* Crop frame overlay (everything outside is darkened) */}
            {activePlatform && (
              <div
                key={activePlatform.id}
                className="animate-fade-in-up absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 border-2 border-white"
                style={{
                  aspectRatio: `${activePlatform.w}/${activePlatform.h}`,
                  width: activePlatform.w >= activePlatform.h ? '90%' : 'auto',
                  height: activePlatform.h > activePlatform.w ? '90%' : 'auto',
                  maxWidth: '90%',
                  maxHeight: '90%',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                }}
              >
                {/* Camera-style corner markers */}
                <div className="absolute -left-1 -top-1 h-3 w-3 border-l-2 border-t-2 border-white" />
                <div className="absolute -right-1 -top-1 h-3 w-3 border-r-2 border-t-2 border-white" />
                <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-white" />

                {/* Platform label inside the crop */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-md bg-black/70 px-2.5 py-1.5 text-center text-white shadow-lg backdrop-blur-sm">
                    <div className="text-xl leading-none" aria-hidden>{activePlatform.icon}</div>
                    <div className="mt-1 text-[10px] font-bold">{activePlatform.name}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!activePlatform && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                <div className="rounded-xl bg-black/70 px-4 py-2.5 text-center text-white shadow-lg backdrop-blur-sm">
                  <Eye className="mx-auto h-5 w-5" />
                  <p className="mt-1 text-[11px] font-semibold">Hover or click a platform</p>
                  <p className="text-[10px] opacity-80">to preview the crop</p>
                </div>
              </div>
            )}

            {/* Dimensions badge */}
            {activePlatform && (
              <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 font-mono text-[10px] text-white shadow-md backdrop-blur-sm">
                <Sparkles className="h-2.5 w-2.5" />
                {activePlatform.w} × {activePlatform.h} • {getRatio(activePlatform.w, activePlatform.h)}
              </div>
            )}

            {/* Description badge */}
            {activePlatform && (
              <div className="absolute bottom-3 left-3 right-3 z-20 rounded-md bg-black/70 px-2 py-1 text-center text-[10px] font-medium text-white shadow-md backdrop-blur-sm">
                {activePlatform.desc}
              </div>
            )}
          </div>

          <p className="mt-2 text-center text-[10px] text-muted-foreground/70">
            Demo image — your photo will be cropped to match.
          </p>
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
