import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const proFeatures = [
  'Batch compress 50+ images at once',
  'AI Background Remover',
  'AVIF format conversion',
  'Bulk rename files',
  'Compress PDF files',
  'Priority processing speed',
];

const ProTeaser = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('You\'re on the waitlist! We\'ll notify you when Pro launches.');
      setEmail('');
      setOpen(false);
    }
  };

  return (
    <section className="container mx-auto mt-20 px-4">
      <div className="mx-auto max-w-2xl rounded-2xl gradient-border glass-card p-8 text-center">
        <Badge className="mb-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-xs font-bold text-black border-0">
          Pro
        </Badge>
        <h2 className="text-2xl font-bold sm:text-3xl">
          Need More Power? Go Pro 🚀
        </h2>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
          {proFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-success">✅</span> {f}
            </li>
          ))}
        </ul>
        <Button
          size="lg"
          className="mt-8 rounded-full gradient-bg text-primary-foreground"
          onClick={() => setOpen(true)}
        >
          Coming Soon — Join Waitlist
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join the Pro Waitlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
            <Button type="submit" className="rounded-full gradient-bg text-primary-foreground">
              Join
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProTeaser;
