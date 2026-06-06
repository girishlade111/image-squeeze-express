import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Lightning,
  ShieldCheck,
  Target,
  Compass,
  BookOpen,
  Heart,
  Handshake,
  Sparkle,
  Stack,
  Code,
  Cloud,
  Users,
  GithubLogo,
  LinkedinLogo,
  InstagramLogo,
  Envelope,
  Globe,
  MapPin,
  Calendar,
  Rocket,
  FileText,
  ArrowsClockwise,
  ListChecks,
  ArrowRight,
  CheckCircle,
  Pulse,
  Plant,
  PaintBrush,
  Bookmarks,
  PenNib,
  ChartLineUp,
  Images,
} from '@phosphor-icons/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentTitle from '@/components/DocumentTitle';
import { cn } from '@/lib/utils';

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    startRef.current = null;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

const GRADIENT_TEXT = {
  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
};

const SECTION_TITLE = 'text-2xl font-bold tracking-tight sm:text-3xl';
const SECTION_DESC = 'mx-auto mt-2 max-w-2xl text-sm text-muted-foreground text-pretty sm:text-base';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const fadeUpStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const values = [
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    desc: 'Your images, PDFs, and renamed files never leave your browser. Zero servers, zero uploads, zero tracking. We don\'t even have a backend.',
  },
  {
    icon: Lightning,
    title: 'Speed Obsessed',
    desc: 'Web Workers, Canvas API, and lazy-loaded engines deliver results in milliseconds. We benchmark every release so you don\'t wait.',
  },
  {
    icon: Handshake,
    title: 'Forever Free',
    desc: 'No accounts. No paywalls. No "Pro" tier. ImageSqueeze will always be free for personal and commercial use.',
  },
  {
    icon: Sparkle,
    title: 'Delightful UX',
    desc: 'Smooth animations, dark mode, keyboard shortcuts, and instant feedback. Tools should feel as polished as the apps you use every day.',
  },
  {
    icon: Code,
    title: 'Open Foundations',
    desc: 'We build on the shoulders of giants — React, Vite, pdf-lib, browser-image-compression. Open standards all the way down.',
  },
  {
    icon: Heart,
    title: 'No Dark Patterns',
    desc: 'No cookie banners, no email harvesting, no upsells, no fake urgency. Just a tool that does its job, with respect for your time.',
  },
];

const pillars = [
  {
    icon: Target,
    title: 'Our Mission',
    desc: 'Make image and document optimization accessible to everyone — without compromising privacy. We believe compression should be instant, free, and invisible to the user.',
  },
  {
    icon: Compass,
    title: 'Our Vision',
    desc: 'A web where you never have to upload a single file to a third-party server to do something to it. Local-first tools that respect your data by never collecting it.',
  },
  {
    icon: BookOpen,
    title: 'Our Story',
    desc: 'ImageSqueeze started in 2024 as a weekend project by Girish Lade. After uploading sensitive product photos to five different compression services, he built the tool he wished existed — one that runs entirely in the browser.',
  },
];

const stats = [
  { icon: Users, value: 25000, suffix: '+', label: 'Active Users', format: 'number' as const },
  { icon: Images, value: 1.2, suffix: 'M+', label: 'Images Compressed', format: 'decimal' as const },
  { icon: FileText, value: 85000, suffix: '+', label: 'PDFs Optimized', format: 'number' as const },
  { icon: Stack, value: 100, suffix: '%', label: 'Client-Side', format: 'number' as const },
];

const milestones = [
  {
    year: '2024',
    icon: Rocket,
    title: 'ImageSqueeze v1',
    desc: 'A single-page image compressor. Canvas-based resize + re-encode, WebP support, drag-and-drop. No frameworks, no build step.',
  },
  {
    year: '2025',
    icon: Plant,
    title: 'Rebuild & Open Beta',
    desc: 'Full rewrite in React + Vite + TypeScript. Added 9 social-media presets, advanced transforms (rotate, mirror, grayscale), and a real quality-vs-size iteration loop.',
  },
  {
    year: '2025',
    icon: FileText,
    title: 'PDF Compressor',
    desc: 'Second tool launched. Re-rasterizes PDF pages in-browser via pdfjs and rebuilds with pdf-lib. Up to 90% smaller, fully local.',
  },
  {
    year: '2026',
    icon: ArrowsClockwise,
    title: 'Bulk File Renamer',
    desc: 'Third tool. 13-rule rename engine, live preview with diff highlight, ZIP download. Power-user features: regex, numbering, case conversion, date stamping.',
  },
  {
    year: '2026',
    icon: PaintBrush,
    title: 'Phosphor + Dark Mode',
    desc: 'Full visual refresh: Phosphor duotone icons, refined glass-morphism, mobile-first responsive pass, animated count-up stats.',
  },
  {
    year: '2026',
    icon: ChartLineUp,
    title: 'Vercel + Analytics',
    desc: 'Deployed to img.ladestack.in on Vercel\'s global edge network. Privacy-first cookieless analytics. 100% uptime, zero infrastructure cost.',
  },
];

const techStack = [
  { name: 'React 18', desc: 'UI framework', icon: Code },
  { name: 'TypeScript', desc: 'Type safety', icon: FileText },
  { name: 'Vite', desc: 'Build & dev server', icon: Lightning },
  { name: 'Tailwind CSS', desc: 'Utility-first styles', icon: PaintBrush },
  { name: 'shadcn/ui', desc: 'Accessible primitives', icon: Stack },
  { name: 'Framer Motion', desc: 'Animations', icon: Pulse },
  { name: 'pdf-lib', desc: 'PDF rebuilder', icon: Bookmarks },
  { name: 'pdfjs-dist', desc: 'PDF parser & rasterizer', icon: PenNib },
  { name: 'browser-image-compression', desc: 'Image encoder (Web Worker)', icon: Images },
  { name: 'JSZip', desc: 'ZIP packing', icon: Stack },
  { name: 'Phosphor Icons', desc: '9,000+ duotone icons', icon: Sparkle },
  { name: 'Vercel Edge', desc: 'Hosting & CDN', icon: Cloud },
];

const pledge = [
  'We never see your files. Processing happens entirely in your browser using JavaScript.',
  'We don\'t store any telemetry that could identify you. No cookies, no fingerprinting, no third-party trackers.',
  'We don\'t ask for an email, a phone number, or any personally identifying information.',
  'Our code is auditable. The bundled JavaScript is the only thing that runs on your device — and you can verify it.',
  'We honor the "Do Not Track" browser setting. If you enable it, even our cookieless analytics stay silent.',
  'We\'ll never sell the project, the domain, or the user base to a data-broker ad network. We\'d rather shut it down.',
];

const About = () => {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(statsRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView) setStatsVisible(true);
  }, [inView]);

  const floatingShapes = useMemo(
    () => [
      { size: 240, left: '5%', top: '15%', delay: '0s', duration: '22s', color: 'primary' },
      { size: 180, left: '80%', top: '55%', delay: '-6s', duration: '26s', color: 'accent' },
      { size: 130, left: '70%', top: '18%', delay: '-12s', duration: '20s', color: 'primary' },
      { size: 110, left: '15%', top: '70%', delay: '-8s', duration: '24s', color: 'accent' },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <DocumentTitle title="About — The Story Behind ImageSqueeze" />
      <Header />

      <main>
        {/* HERO */}
        <section className="relative flex min-h-[80svh] items-center justify-center overflow-hidden pt-[calc(3.5rem+env(safe-area-inset-top))] sm:pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-24">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 20%, hsl(var(--primary) / 0.18), transparent),
                radial-gradient(ellipse 60% 40% at 80% 60%, hsl(var(--accent) / 0.12), transparent),
                radial-gradient(ellipse 50% 50% at 20% 80%, hsl(var(--primary) / 0.1), transparent),
                radial-gradient(ellipse 40% 30% at 70% 10%, hsl(var(--accent) / 0.08), transparent)
              `,
            }}
            aria-hidden
          />

          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {floatingShapes.map((shape, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-25"
                style={{
                  width: shape.size,
                  height: shape.size,
                  left: shape.left,
                  top: shape.top,
                  background:
                    shape.color === 'primary'
                      ? 'radial-gradient(circle, hsl(var(--primary) / 0.5), transparent)'
                      : 'radial-gradient(circle, hsl(var(--accent) / 0.5), transparent)',
                  filter: 'blur(70px)',
                }}
                animate={{
                  y: [0, -28, 0],
                  x: [0, 26, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: parseFloat(shape.duration),
                  delay: parseFloat(shape.delay),
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          <div className="container relative mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1 text-[11px] font-medium text-foreground sm:text-xs"
              >
                <Users size={14} weight="duotone" className="h-3.5 w-3.5 text-primary" />
                The team behind ImageSqueeze
              </motion.div>

              <motion.h1
                className="text-fluid-hero font-extrabold tracking-tight text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                We&apos;re building the web&apos;s most{' '}
                <span style={GRADIENT_TEXT}>private image tools</span>
              </motion.h1>

              <motion.p
                className="mx-auto mt-4 max-w-2xl text-fluid-body text-muted-foreground text-pretty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                ImageSqueeze is a tiny, independent studio of one. We build fast, free, fully client-side
                image, PDF, and file tools because we got tired of uploading our own photos to strangers.
              </motion.p>

              <motion.div
                className="mt-6 flex flex-wrap items-center justify-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <a
                  href="#mission"
                  className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                >
                  Read our story
                  <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <Envelope size={16} weight="duotone" />
                  Get in touch
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* BY THE NUMBERS */}
        <section ref={statsRef} className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpStagger}
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} active={statsVisible} />
            ))}
          </motion.div>
        </section>

        {/* MISSION / VISION / STORY */}
        <section id="mission" className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className={SECTION_TITLE}>What we believe</h2>
            <p className={SECTION_DESC}>
              Three short statements that guide every feature, every line of code, and every decision.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUpStagger}
            className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5"
          >
            {pillars.map((pillar) => (
              <motion.div
                key={pillar.title}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-[0_0_25px_rgba(124,58,237,0.12)]"
              >
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), transparent)', filter: 'blur(30px)' }}
                  aria-hidden
                />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <pillar.icon size={28} weight="duotone" className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* OUR VALUES */}
        <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className={SECTION_TITLE}>How we work</h2>
            <p className={SECTION_DESC}>
              Six principles we hold ourselves to. If we ever violate one, you can call us out in public.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpStagger}
            className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                className="group rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <value.icon size={22} weight="duotone" className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-3 text-sm font-bold tracking-tight">{value.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* TIMELINE */}
        <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className={SECTION_TITLE}>How we got here</h2>
            <p className={SECTION_DESC}>
              A short history of ImageSqueeze — from a weekend script to a privacy-first toolkit serving thousands.
            </p>
          </motion.div>

          <div className="relative mx-auto mt-12 max-w-3xl">
            <div
              className="pointer-events-none absolute left-3.5 top-2 bottom-2 w-px sm:left-1/2 sm:-translate-x-1/2"
              style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.4), transparent)' }}
              aria-hidden
            />

            <ol className="space-y-8 sm:space-y-10">
              {milestones.map((m, idx) => (
                <motion.li
                  key={m.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className={cn(
                    'relative flex gap-4 pl-10 sm:gap-8 sm:pl-0',
                    'sm:items-center',
                    idx % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  )}
                >
                  <div
                    className="absolute left-0 top-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background sm:left-1/2 sm:-translate-x-1/2"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                    aria-hidden
                  >
                    <m.icon size={14} weight="fill" className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>

                  <div className={cn('flex-1', idx % 2 === 0 ? 'sm:pr-10 sm:text-right' : 'sm:pl-10')}>
                    <div
                      className={cn(
                        'rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm transition-all hover:border-primary/40',
                        'sm:p-6'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary',
                          idx % 2 === 0 ? 'sm:justify-end' : ''
                        )}
                      >
                        <Calendar size={12} weight="duotone" />
                        {m.year}
                      </div>
                      <h3 className="mt-1.5 text-base font-bold tracking-tight sm:text-lg">{m.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                    </div>
                  </div>

                  <div className="hidden flex-1 sm:block" />
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* TECH STACK */}
        <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
              <Code size={12} weight="duotone" className="h-3 w-3" />
              The tech behind it
            </div>
            <h2 className={SECTION_TITLE}>Built on the shoulders of giants</h2>
            <p className={SECTION_DESC}>
              ImageSqueeze is assembled from best-in-class open-source libraries. We don&apos;t reinvent the wheel — we compose it beautifully.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpStagger}
            className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          >
            {techStack.map((tech) => (
              <motion.div
                key={tech.name}
                variants={fadeUp}
                className="group rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]"
              >
                <tech.icon size={24} weight="duotone" className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                <h3 className="mt-2.5 text-sm font-bold tracking-tight">{tech.name}</h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{tech.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* MEET THE FOUNDER */}
        <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm sm:p-8">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.15), transparent)', filter: 'blur(40px)' }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full"
                style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.15), transparent)', filter: 'blur(40px)' }}
                aria-hidden
              />

              <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
                <div className="flex-shrink-0">
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-black text-primary-foreground shadow-lg sm:h-28 sm:w-28"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                    aria-hidden
                  >
                    GL
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Girish Lade</h2>
                    <span className="rounded-full border border-primary/20 bg-primary/[0.07] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Founder &amp; Solo Dev
                    </span>
                  </div>
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
                    <MapPin size={12} weight="duotone" />
                    India · Building for the world
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Web developer, indie hacker, and privacy enthusiast. I built ImageSqueeze because I was tired of
                    uploading my own photos to a dozen different compression sites just to ship a product page. After
                    one weekend it became a tool I used every day — so I polished it and shared it.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    I also run{' '}
                    <a
                      href="https://ladestack.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      Lade Stack
                    </a>
                    , a small studio focused on local-first, privacy-respecting web tools.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <SocialChip href="https://github.com/girishlade111" icon={GithubLogo} label="GitHub" />
                    <SocialChip href="https://www.linkedin.com/in/girish-lade-075bba201/" icon={LinkedinLogo} label="LinkedIn" />
                    <SocialChip href="https://www.instagram.com/girish_lade_/" icon={InstagramLogo} label="Instagram" />
                    <SocialChip href="mailto:admin@ladestack.in" icon={Envelope} label="Email" />
                    <SocialChip href="https://ladestack.in" icon={Globe} label="ladestack.in" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* PRIVACY PLEDGE */}
        <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/40 to-accent/[0.08] p-6 backdrop-blur-sm sm:p-10">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/30">
                  <ShieldCheck size={28} weight="duotone" className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Our Privacy Pledge</div>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">If it runs in your browser, it stays in your browser</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    We&apos;re committed to the simplest possible privacy story. There is no privacy policy full of loopholes — there&apos;s just a list of things we promise not to do.
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                {pledge.map((line, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex gap-3"
                  >
                    <CheckCircle
                      size={20}
                      weight="fill"
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500"
                    />
                    <span className="text-sm leading-relaxed text-foreground/90 sm:text-[15px]">{line}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 border-t border-border/50 pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ListChecks size={14} weight="duotone" className="h-3.5 w-3.5" />
                  Read the full legalese in our{' '}
                  <Link to="/privacy" className="font-semibold text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <Link
                  to="/privacy"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  View policy
                  <ArrowRight size={12} weight="bold" />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-12 pb-safe sm:px-6 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-primary/20 bg-card/60 p-8 text-center backdrop-blur-sm sm:p-12"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background: `
                  radial-gradient(ellipse 60% 50% at 50% 0%, hsl(var(--primary) / 0.15), transparent),
                  radial-gradient(ellipse 50% 40% at 50% 100%, hsl(var(--accent) / 0.15), transparent)
                `,
              }}
              aria-hidden
            />
            <div className="relative">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30">
                <Rocket size={28} weight="duotone" className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Try ImageSqueeze —{' '}
                <span style={GRADIENT_TEXT}>no signup, no upload, no tracking</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                Three tools. Zero servers in the loop. Drop a file and watch it work — that&apos;s the whole pitch.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/"
                  className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                >
                  <Lightning size={16} weight="duotone" />
                  Compress Images
                </Link>
                <Link
                  to="/compress-pdf"
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/80 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-primary/40"
                >
                  <FileText size={16} weight="duotone" />
                  Compress PDF
                </Link>
                <Link
                  to="/bulk-rename"
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/80 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-primary/40"
                >
                  <ArrowsClockwise size={16} weight="duotone" />
                  Bulk Rename
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const StatCard = ({ stat, active }: { stat: typeof stats[number]; active: boolean }) => {
  const animated = useCountUp(active ? stat.value : 0, 1200);
  const formatted = stat.format === 'decimal' ? animated.toFixed(1) : Math.floor(animated).toLocaleString();

  return (
    <motion.div
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-all hover:border-primary/40 sm:p-5"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), transparent)', filter: 'blur(20px)' }}
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
          <stat.icon size={22} weight="duotone" className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-black tracking-tight tabular-nums sm:text-3xl">
              {formatted}
            </span>
            <span className="text-lg font-bold text-primary sm:text-xl">{stat.suffix}</span>
          </div>
          <div className="text-[11px] font-medium text-muted-foreground sm:text-xs">{stat.label}</div>
        </div>
      </div>
    </motion.div>
  );
};

const SocialChip = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof GithubLogo;
  label: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/80 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card"
  >
    <Icon size={14} weight="duotone" className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110" />
    {label}
  </a>
);

export default About;
