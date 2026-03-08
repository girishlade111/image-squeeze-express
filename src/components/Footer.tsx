const Footer = () => (
  <footer className="mt-24 border-t border-foreground/10 bg-background" style={{ backgroundColor: 'hsl(0 0% 3%)' }}>
    <div className="container mx-auto px-4 py-10 sm:px-6">
      {/* Top row */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Logo + tagline */}
        <div className="flex items-center gap-2.5">
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
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground" aria-label="Footer navigation">
          <a href="#home" className="transition-colors hover:text-foreground">Home</a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">How It Works</a>
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </nav>
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-foreground/10" />

      {/* Middle */}
      <p className="text-center text-sm text-muted-foreground">
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
      <p className="mt-3 text-center text-xs text-muted-foreground/60">
        © 2026 ImageSqueeze by Lade Stack. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
