import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { House, Warning, MagnifyingGlass } from "@phosphor-icons/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocumentTitle from "@/components/DocumentTitle";
import { pageSeo } from "@/config/seo";

const allTools = [
  { label: 'Image Compressor', to: '/', desc: 'Resize & convert images' },
  { label: 'Compress PDF', to: '/compress-pdf', desc: 'Shrink PDFs in your browser' },
  { label: 'Bulk File Rename', to: '/bulk-rename', desc: 'Rename 100 files at once' },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <DocumentTitle {...pageSeo.notFound} />
      <Header />
      <main className="container relative mx-auto flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 50% 30%, hsl(var(--primary) / 0.15), transparent),
              radial-gradient(ellipse 40% 30% at 70% 70%, hsl(var(--accent) / 0.1), transparent)
            `,
          }}
          aria-hidden
        />
        <motion.div
          className="relative z-10 mx-auto max-w-xl text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300"
            initial={{ rotate: -8, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          >
            <Warning size={36} weight="duotone" />
          </motion.div>
          <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">
            <span
              style={{
                background: 'linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-2)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              404
            </span>
          </h1>
          <p className="mt-3 text-lg font-semibold sm:text-xl">Page not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you were looking for doesn’t exist. The path{' '}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{location.pathname}</code>{' '}
            isn’t one of our routes.
          </p>

          <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
            <Button asChild className="h-12 rounded-full px-5 sm:h-10">
              <a href="/">
                <House size={16} weight="bold" className="mr-2" />
                Return to Home
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-5 sm:h-10">
              <a href="/#how-it-works">
                <MagnifyingGlass size={16} weight="bold" className="mr-2" />
                See How It Works
              </a>
            </Button>
          </div>

          <div className="mt-10 text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/40 sm:text-[10px]">
              Or try one of our tools
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {allTools.map((t) => (
                <a
                  key={t.to}
                  href={t.to}
                  className="group min-h-[60px] rounded-2xl border border-border/50 bg-card/60 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <p className="text-sm font-semibold group-hover:text-primary">{t.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-[10px]">{t.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
