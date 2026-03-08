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
    const onScroll = () => setScrolled(window.scrollY > 50);
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
      className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md bg-background/60 transition-all duration-300 ${
        scrolled
          ? 'border-foreground/10 shadow-lg shadow-background/50'
          : 'border-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2.5 group">
          <span className="text-2xl" role="img" aria-label="lightning bolt">⚡</span>
          <div className="flex flex-col">
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
            <span className="hidden text-[10px] font-medium tracking-wide text-muted-foreground leading-none mt-0.5 sm:block">
              Compress. Resize. Convert. Instantly.
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5"
            >
              {l.label}
            </a>
          ))}
          <div className="ml-2 h-5 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="ml-1 rounded-full hover:bg-foreground/5"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-[18px] w-[18px] text-amber-400" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full hover:bg-foreground/5" aria-label="Toggle theme">
            {darkMode ? <Sun className="h-[18px] w-[18px] text-amber-400" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="rounded-full hover:bg-foreground/5" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <nav
        className={`overflow-hidden border-t border-foreground/10 bg-background/95 backdrop-blur-md md:hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 border-transparent'
        }`}
        aria-label="Mobile navigation"
      >
        <div className="px-4 pb-4 pt-2">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5"
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
