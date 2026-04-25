import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Github, CodepenIcon, Mail, Globe, Zap } from 'lucide-react';

const socials = [
  { icon: Instagram, href: 'https://www.instagram.com/girish_lade_/', label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/girish-lade-075bba201/', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/girishlade111', label: 'GitHub' },
  { icon: CodepenIcon, href: 'https://codepen.io/Girish-Lade-the-looper', label: 'CodePen' },
  { icon: Mail, href: 'mailto:admin@ladestack.in', label: 'Email' },
  { icon: Globe, href: 'https://ladestack.in', label: 'Website' },
];

const productLinks = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

const Footer = () => {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (window.location.pathname !== '/') return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-32 overflow-hidden">
      {/* Gradient top border */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, #7C3AED, #06B6D4, transparent)' }}
      />

      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-40 w-[600px] opacity-20 blur-[100px]"
        style={{ background: 'linear-gradient(180deg, #7C3AED, transparent)' }}
      />

      <div className="relative bg-card/80 backdrop-blur-xl border-t border-border/20">
        <div className="container mx-auto px-6 pb-8 pt-16">
          {/* Main grid */}
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand column */}
            <div className="lg:col-span-5">
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <span
                  className="text-xl font-extrabold tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ImageSqueeze
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Compress, resize, and convert your images instantly — right in your browser. No uploads, no signups, 100% private.
              </p>

              {/* Social icons */}
              <div className="mt-6 flex items-center gap-2.5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="group/icon flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.03] text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/15"
                  >
                    <s.icon className="h-4 w-4 transition-transform duration-300 group-hover/icon:scale-110" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-3 gap-8">
                {/* Product */}
                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Product</h4>
                  <nav className="flex flex-col gap-2.5" aria-label="Product links">
                    {productLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => handleAnchorClick(e, link.href)}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground hover:translate-x-0.5"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Company */}
                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Company</h4>
                  <nav className="flex flex-col gap-2.5" aria-label="Company links">
                    {companyLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <a
                      href="https://ladestack.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      Lade Stack
                      <span className="text-[10px] opacity-60">↗</span>
                    </a>
                  </nav>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">Legal</h4>
                  <nav className="flex flex-col gap-2.5" aria-label="Legal links">
                    {legalLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col items-center gap-4 border-t border-foreground/[0.06] pt-8 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground/70">
              © 2026 ImageSqueeze. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Built with <span className="text-red-400">❤️</span> by{' '}
              <a
                href="https://ladestack.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary/80 transition-colors hover:text-primary hover:underline"
              >
                Lade Stack
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
