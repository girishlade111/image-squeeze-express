import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Github, Mail, Globe } from 'lucide-react';
import {
  Lightning,
  CodepenLogo,
  Heart,
} from '@phosphor-icons/react';

const socials = [
  { icon: Instagram, href: 'https://www.instagram.com/girish_lade_/', label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/girish-lade-075bba201/', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/girishlade111', label: 'GitHub' },
  { icon: CodepenIcon, href: 'https://codepen.io/Girish-Lade-the-looper', label: 'CodePen' },
  { icon: Mail, href: 'mailto:admin@ladestack.in', label: 'Email' },
  { icon: Globe, href: 'https://ladestack.in', label: 'Website' },
];

const toolLinks = [
  { label: 'Image Compressor', desc: 'Resize & convert up to 50 images', to: '/' },
  { label: 'Compress PDF', desc: 'Shrink image-heavy PDFs in-browser', to: '/compress-pdf' },
  { label: 'Bulk File Rename', desc: '13-rule rename engine + ZIP', to: '/bulk-rename' },
];

const resourceLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Sitemap', href: '/sitemap.xml' },
];

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Lade Stack ↗', href: 'https://ladestack.in', external: true },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

const Footer = () => {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const [path, hash] = href.split('#');
    const targetPath = path || '/';
    if (window.location.pathname !== targetPath) return;
    e.preventDefault();
    const el = hash ? document.getElementById(hash) : null;
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-12 overflow-hidden sm:mt-20">
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, #4F46E5, #0D9488, transparent)' }}
      />

      <div className="relative border-t border-border/20 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 pb-8 pb-safe pt-10 sm:pb-10 sm:pt-14">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand block */}
            <div className="lg:col-span-4">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-accent/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span
                  className="text-base font-bold tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #4F46E5, #0D9488)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ImageSqueeze
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Three privacy-first tools that run 100% in your browser — image compression, PDF re-rendering, and bulk file renaming. No uploads, no signups, no watermarks.
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

              <p className="mt-4 text-[10px] text-muted-foreground/70">
                Made with{' '}
                <span className="text-red-400" aria-label="love">❤️</span>{' '}
                in India by{' '}
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

            {/* Link columns */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {/* Tools */}
                <div>
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">
                    Tools
                  </h4>
                  <nav className="flex flex-col gap-2.5" aria-label="Tool pages">
                    {toolLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="group flex flex-col"
                      >
                        <span className="text-xs font-medium text-foreground/90 transition-colors group-hover:text-primary">
                          {link.label}
                        </span>
                        <span className="text-[10px] leading-tight text-muted-foreground/80">
                          {link.desc}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">
                    Resources
                  </h4>
                  <nav className="flex flex-col gap-2" aria-label="Resource links">
                    {resourceLinks.map((link) => (
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

                {/* Company */}
                <div>
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">
                    Company
                  </h4>
                  <nav className="flex flex-col gap-2" aria-label="Company links">
                    {companyLinks.map((link) =>
                      'to' in link ? (
                        <Link
                          key={link.label}
                          to={link.to}
                          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      )
                    )}
                  </nav>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">
                    Legal
                  </h4>
                  <nav className="flex flex-col gap-2" aria-label="Legal links">
                    {legalLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <span className="text-[10px] text-muted-foreground/60">
                      Updated March 8, 2026
                    </span>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="mt-8 flex flex-col items-center gap-2 border-t border-foreground/[0.06] pt-6 sm:flex-row sm:justify-between">
            <p className="text-[10px] text-muted-foreground/70">
              © 2026 ImageSqueeze. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              100% client-side · No servers · No tracking
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
