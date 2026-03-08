import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const proFeatures = [
  'Batch compress 50+ images',
  'AI Background Remover',
  'AVIF format support',
  'Bulk file rename',
  'Compress PDFs',
  'Priority processing',
];

const ProTeaser = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const existing = JSON.parse(localStorage.getItem('imagesqueeze-waitlist') || '[]');
    if (!existing.includes(email)) {
      existing.push(email);
      localStorage.setItem('imagesqueeze-waitlist', JSON.stringify(existing));
    }
    toast.success("🎉 You're on the waitlist! We'll notify you when Pro launches.");
    setEmail('');
    setOpen(false);
  };

  return (
    <section id="pro" className="container mx-auto mt-24 px-4" ref={ref}>
      <div
        className={`relative mx-auto max-w-4xl overflow-hidden rounded-2xl p-[1px] transition-all duration-700 ${
          visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
      >
        {/* Inner card */}
        <div className="rounded-[15px] bg-card p-8 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            {/* Left — features */}
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Need More Power?{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ✨ Go Pro
                </span>
              </h2>

              <ul className="mt-6 space-y-3">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — pricing card */}
            <div className="flex flex-col items-center rounded-2xl border border-border/50 bg-secondary/30 px-8 py-8 text-center lg:min-w-[260px]">
              <Badge
                className="mb-4 rounded-full border-0 px-4 py-1 text-xs font-bold text-black"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EAB308)' }}
              >
                Pro
              </Badge>

              <p className="text-3xl font-extrabold tracking-tight">Coming Soon</p>
              <p className="mt-1 text-sm text-muted-foreground">Be the first to know</p>

              <Button
                size="lg"
                className="mt-6 w-full rounded-full text-primary-foreground"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
                onClick={() => setOpen(true)}
              >
                🔔 Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Join the Pro Waitlist</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter your email and we'll notify you as soon as ImageSqueeze Pro launches.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
            <Button
              type="submit"
              className="flex-shrink-0 rounded-full text-primary-foreground"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}
            >
              Notify Me
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProTeaser;
