import { Zap } from 'lucide-react';

const Footer = () => (
  <footer className="mt-20 border-t border-border/40 bg-card/30">
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-bold gradient-text">ImageSqueeze</span>
            <p className="text-[10px] text-muted-foreground">Compress. Resize. Convert.</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <a href="#home" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>

        {/* Social */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors text-sm"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors text-sm"
          >
            Twitter/X
          </a>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>
          Built with ❤️ by{' '}
          <a
            href="https://ladestack.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-violet hover:underline"
          >
            Lade Stack
          </a>
        </p>
        <p className="mt-1">© 2026 ImageSqueeze by Lade Stack. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
