import { Button } from '@/components/ui/button';

interface SocialPresetsGridProps {
  onSelectPreset: (w: number, h: number) => void;
}

const platforms = [
  { name: 'Instagram', icon: '📸', sizes: '1080×1080', w: 1080, h: 1080 },
  { name: 'LinkedIn', icon: '💼', sizes: '1200×627', w: 1200, h: 627 },
  { name: 'WhatsApp', icon: '💬', sizes: '500×500', w: 500, h: 500 },
  { name: 'Twitter/X', icon: '🐦', sizes: '1200×675', w: 1200, h: 675 },
  { name: 'Facebook', icon: '📘', sizes: '820×312', w: 820, h: 312 },
  { name: 'YouTube', icon: '▶️', sizes: '1280×720', w: 1280, h: 720 },
];

const SocialPresetsGrid = ({ onSelectPreset }: SocialPresetsGridProps) => {
  const handleClick = (w: number, h: number) => {
    onSelectPreset(w, h);
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="container mx-auto mt-20 px-4">
      <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">
        Optimize for Social Media — <span className="gradient-text">One Click</span>
      </h2>
      <p className="mx-auto mb-8 max-w-lg text-center text-sm text-muted-foreground">
        Click a platform to auto-fill the perfect dimensions.
      </p>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {platforms.map((p) => (
          <Button
            key={p.name}
            variant="outline"
            className="flex h-auto flex-col gap-1 rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm px-4 py-5 hover:border-primary/60 hover:shadow-[0_0_15px_hsl(var(--violet)/0.15)]"
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
