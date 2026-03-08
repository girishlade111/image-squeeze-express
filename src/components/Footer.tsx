import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Github, CodepenIcon, Mail, Globe } from 'lucide-react';

const socials = [
  { icon: Instagram, href: 'https://www.instagram.com/girish_lade_/', label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/girish-lade-075bba201/', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/girishlade111', label: 'GitHub' },
  { icon: CodepenIcon, href: 'https://codepen.io/Girish-Lade-the-looper', label: 'CodePen' },
  { icon: Mail, href: 'mailto:admin@ladestack.in', label: 'Email' },
  { icon: Globe, href: 'https://ladestack.in', label: 'Website' },
];

const Footer = () => {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only handle hash links on the homepage
    if (window.location.pathname !== '/') return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="mt-24 border-t border-foreground/10 bg-background" style={{ backgroundColor: 'hsl(0 0% 3%)' }}>
      <div className="container mx-auto px-4 py-10 sm:px-6">
        {/* Top row */}
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Logo + tagline */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-xl">⚡</span>
            <div>
              <span
                className="text-lg font-extrabold"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ImageSqueeze
              </span>
              <p className="text-[11px] text-muted-foreground">Compress. Resize. Convert. Instantly.</p>
            </div>
          </Link>

          {/* Link columns */}
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm sm:justify-end">
            {/* Product */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/60">Product</p>
              <nav className="flex flex-col gap-1.5" aria-label="Product links">
                <a href="#home" onClick={(e) => handleAnchorClick(e, '#home')} className="text-muted-foreground transition-colors hover:text-foreground">Home</a>
                <a href="#how-it-works" onClick={(e) => handleAnchorClick(e, '#how-it-works')} className="text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
                <a href="#features" onClick={(e) => handleAnchorClick(e, '#features')} className="text-muted-foreground transition-colors hover:text-foreground">Features</a>
                <a href="#faq" onClick={(e) => handleAnchorClick(e, '#faq')} className="text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
              </nav>
            </div>

            {/* Company */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/60">Company</p>
              <nav className="flex flex-col gap-1.5" aria-label="Company links">
                <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
                <Link to="/contact" className="text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
                <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">Lade Stack ↗</a>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/60">Legal</p>
              <nav className="flex flex-col gap-1.5" aria-label="Legal links">
                <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link>
                <Link to="/terms" className="text-muted-foreground transition-colors hover:text-foreground">Terms of Service</Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-foreground/10" />

        {/* Social icons */}
        <div className="flex items-center justify-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-foreground/[0.03] text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:scale-110"
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        {/* Middle */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Built with <span className="text-red-400">❤️</span> by{' '}
          <a
            href="https://ladestack.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Lade Stack
          </a>
        </p>

        {/* Bottom */}
        <p className="mt-3 text-center text-xs text-muted-foreground">
          © 2026 ImageSqueeze by Lade Stack. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
