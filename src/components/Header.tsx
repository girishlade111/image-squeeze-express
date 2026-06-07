import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import {
  Lightning,
  Image as PhosphorImage,
  FileText as PhosphorFileText,
  FilePlus,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { prefetch } from '@/lib/prefetch';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

const tools = [
  { label: 'Images', to: '/', icon: PhosphorImage },
  {
    label: 'PDF',
    to: '/compress-pdf',
    icon: PhosphorFileText,
    load: () => import('@/pages/CompressPdf'),
  },
  {
    label: 'Rename',
    to: '/bulk-rename',
    icon: FilePlus,
    load: () => import('@/pages/BulkRename'),
  },
];

const resources = [
  { label: 'About', to: '/about', load: () => import('@/pages/About') },
  { label: 'Privacy', to: '/privacy', load: () => import('@/pages/PrivacyPolicy') },
  { label: 'Terms', to: '/terms', load: () => import('@/pages/TermsOfService') },
  { label: 'Contact', to: '/contact', load: () => import('@/pages/Contact') },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  const isToolActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus first link when mobile menu opens; trap escape key to close
  useEffect(() => {
    if (!mobileOpen) return;
    const t = setTimeout(() => firstMobileLinkRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle('lock-scroll', mobileOpen);
    return () => {
      document.body.classList.remove('lock-scroll');
    };
  }, [mobileOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const prefetchOnInteract = useCallback((load?: () => Promise<unknown>) => {
    if (!load) return;
    prefetch(load);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 metallic-rim metallic-surface transition-all duration-300 pt-safe ${
          scrolled ? 'shadow-sm border-b border-border/20' : ''
        }`}
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-3 sm:px-5 md:h-12 md:gap-4 md:px-4">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-1.5 group min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:gap-1.5"
            aria-label="LS Image Compressor — home"
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-transform group-hover:scale-110 md:h-7 md:w-7"
              aria-hidden
            >
              <Lightning size={20} weight="duotone" className="md:hidden" />
              <Lightning size={16} weight="duotone" className="hidden md:block" />
            </span>
            <span className="truncate text-sm font-bold tracking-tight sm:text-base md:text-base metallic-text">
              <span className="sm:hidden">LS Compressor</span>
              <span className="hidden sm:inline">LS Image Compressor</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-0.5 md:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleNavClick(e, l.href)}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-primary/5"
              >
                {l.label}
              </a>
            ))}
            <div className="mx-1.5 h-4 w-px bg-border" />

            {/* Tool switcher pill */}
            <div
              className="flex h-7 items-center gap-0.5 rounded-full border border-border/50 bg-foreground/[0.03] p-0.5"
              role="group"
              aria-label="Switch tool"
            >
              {tools.map((t) => {
                const active = isToolActive(t.to);
                const Icon = t.icon;
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    onClick={() => setMobileOpen(false)}
                    onPointerEnter={() => prefetchOnInteract(t.load)}
                    onFocus={() => prefetchOnInteract(t.load)}
                    onTouchStart={() => prefetchOnInteract(t.load)}
                    aria-current={active ? 'page' : undefined}
                    title={t.label}
                    className={`flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium transition-colors ${
                      active
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-3 w-3" aria-hidden />
                    <span className="hidden lg:inline">{t.label}</span>
                  </Link>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="ml-1 h-7 w-7 rounded-full hover:bg-primary/5 hover:text-primary"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-11 w-11 rounded-full hover:bg-foreground/5"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="h-11 w-11 rounded-full hover:bg-foreground/5"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu — full-screen overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 md:hidden transition-all duration-200 ${
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-background/85 backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
        <nav
          className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-xs flex-col border-l border-border/40 bg-card/98 backdrop-blur-xl transition-transform duration-300 pt-safe pb-safe ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
            <span className="text-sm font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="h-10 w-10 rounded-full"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-1">
              <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">
                Tools
              </p>
              {tools.map((t) => {
                const active = isToolActive(t.to);
                const Icon = t.icon;
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    onClick={() => setMobileOpen(false)}
                    onPointerEnter={() => prefetchOnInteract(t.load)}
                    onFocus={() => prefetchOnInteract(t.load)}
                    onTouchStart={() => prefetchOnInteract(t.load)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {t.label}
                  </Link>
                );
              })}

              <p className="mt-3 px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">
                Resources
              </p>
              {navLinks.map((l, i) => (
                <a
                  key={l.href}
                  ref={i === 0 ? firstMobileLinkRef : undefined}
                  href={l.href}
                  onClick={(e) => handleNavClick(e, l.href)}
                  className="flex min-h-[48px] items-center rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {l.label}
                </a>
              ))}

              <div className="my-3 h-px bg-border" />
              {resources.map((r) => {
                const active = location.pathname === r.to;
                return (
                  <Link
                    key={r.to}
                    to={r.to}
                    onClick={() => setMobileOpen(false)}
                    onPointerEnter={() => prefetchOnInteract(r.load)}
                    onFocus={() => prefetchOnInteract(r.load)}
                    onTouchStart={() => prefetchOnInteract(r.load)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-[48px] items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                    }`}
                  >
                    {r.label === 'Privacy' ? 'Privacy Policy' : r.label === 'Terms' ? 'Terms of Service' : r.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
