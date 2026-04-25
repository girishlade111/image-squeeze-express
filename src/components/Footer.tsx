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
    <footer className="relative mt-16 overflow-hidden">
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, #7C3AED, #06B6D4, transparent)' }}
      />

      <div className="relative bg-card/80 backdrop-blur-xl border-t border-border/20">
        <div className="container mx-auto px-4 pb-6 pt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span
                  className="text-base font-bold tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ImageSqueeze
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Compress, resize, and convert your images instantly — right in your browser. No uploads, no signups, 100% private.
              </p>

              <div className="mt-4 flex items-center gap-1.5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="group/icon flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-foreground/[0.03] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  >
                    <s.icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">Product</h4>
                  <nav className="flex flex-col gap-2" aria-label="Product links">
                    {productLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => handleAnchorClick(e, link.href)}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>

                <div>
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">Company</h4>
                  <nav className="flex flex-col gap-2" aria-label="Company links">
                    {companyLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <a
                      href="https://ladestack.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Lade Stack
                    </a>
                  </nav>
                </div>

                <div>
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">Legal</h4>
                  <nav className="flex flex-col gap-2" aria-label="Legal links">
                    {legalLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-2 border-t border-foreground/[0.06] pt-6 sm:flex-row sm:justify-between">
            <p className="text-[10px] text-muted-foreground/70">
              © 2026 ImageSqueeze. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground/70">
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
