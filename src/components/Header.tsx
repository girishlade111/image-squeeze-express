import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 transition-all duration-300 ${
        scrolled
          ? 'shadow-sm border-b border-border/20'
          : ''
      }`}
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto flex h-12 items-center justify-between px-3 sm:px-4">
        <a href="#home" className="flex items-center gap-1.5 group">
          <span className="text-lg" role="img" aria-label="lightning bolt">⚡</span>
          <div className="flex flex-col">
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
          </div>
        </a>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
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
          <div className="ml-1.5 h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-7 w-7 rounded-full hover:bg-primary/5 hover:text-primary"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>
        </nav>

        <div className="flex items-center gap-0.5 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-8 w-8 rounded-full hover:bg-foreground/5" aria-label="Toggle theme">
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="h-8 w-8 rounded-full hover:bg-foreground/5" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav
        className={`overflow-hidden border-t border-foreground/10 bg-background/95 backdrop-blur-md md:hidden transition-all duration-200 ${
          mobileOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 border-transparent'
        }`}
        aria-label="Mobile navigation"
      >
        <div className="px-3 pb-3 pt-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className="block rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5"
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
