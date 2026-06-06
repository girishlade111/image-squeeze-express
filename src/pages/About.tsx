import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
  Quotes,
  Buildings,
  Cpu,
  Cube,
  Wrench,
  GraduationCap,
  Briefcase,
  Share,
  TrendUp,
} from '@phosphor-icons/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentTitle from '@/components/DocumentTitle';
import ProfileImage from '@/components/ProfileImage';
import profileImg from '@/assets/profile.png';
import { cn } from '@/lib/utils';

function useCountUp(target: number, duration = 1200) {
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

const SECTION_DIVIDER = (
  <div className="mx-auto my-12 h-px w-full max-w-3xl sm:my-16">
    <div
      className="h-full w-full"
      style={{
        background:
          'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.25), hsl(var(--accent) / 0.25), transparent)',
      }}
    />
  </div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const fadeUpStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

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
  {
    icon: Users,
    value: 25000,
    suffix: '+',
    label: 'Active Users',
    format: 'number' as const,
    progress: 85,
    trend: '+18%',
    sparkline: [12, 18, 25, 32, 40, 52, 65, 78, 85, 95],
    description: 'People who trust ImageSqueeze to handle their images every month — and tell their friends.',
    featured: true,
  },
  {
    icon: Images,
    value: 1.2,
    suffix: 'M+',
    label: 'Images Compressed',
    format: 'decimal' as const,
    progress: 92,
    trend: '+24%',
    sparkline: [5, 8, 12, 18, 25, 35, 48, 60, 75, 92],
  },
  {
    icon: FileText,
    value: 85000,
    suffix: '+',
    label: 'PDFs Optimized',
    format: 'number' as const,
    progress: 78,
    trend: '+12%',
    sparkline: [10, 14, 20, 28, 35, 45, 55, 62, 70, 78],
  },
  {
    icon: Stack,
    value: 100,
    suffix: '%',
    label: 'Client-Side',
    format: 'number' as const,
    progress: 100,
    trend: 'Always',
    sparkline: [95, 96, 97, 98, 99, 99, 100, 100, 100, 100],
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    desc: 'Your images, PDFs, and renamed files never leave your browser. Zero servers, zero uploads, zero tracking.',
  },
  {
    icon: Lightning,
    title: 'Speed Obsessed',
    desc: 'Web Workers, Canvas API, and lazy-loaded engines deliver results in milliseconds. We benchmark every release.',
  },
  {
    icon: Handshake,
    title: 'Forever Free',
    desc: 'No accounts. No paywalls. No "Pro" tier. ImageSqueeze will always be free for personal and commercial use.',
  },
  {
    icon: Sparkle,
    title: 'Delightful UX',
    desc: 'Smooth animations, dark mode, keyboard shortcuts, and instant feedback. Tools that feel as polished as the apps you use daily.',
  },
  {
    icon: Code,
    title: 'Open Foundations',
    desc: 'Built on React, Vite, pdf-lib, browser-image-compression. Open standards all the way down — no proprietary black boxes.',
  },
  {
    icon: Heart,
    title: 'No Dark Patterns',
    desc: 'No cookie banners, no email harvesting, no upsells, no fake urgency. Just a tool that does its job, with respect for your time.',
  },
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
    desc: 'Full rewrite in React + Vite + TypeScript. Added 9 social-media presets, advanced transforms, and a real quality-vs-size iteration loop.',
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
    desc: 'Third tool. 13-rule rename engine, live preview with diff highlight, ZIP download. Regex, numbering, case conversion, date stamping.',
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

const stack = [
  { name: 'React 18', desc: 'UI framework', icon: Code, group: 'Core' },
  { name: 'TypeScript', desc: 'Type safety', icon: FileText, group: 'Core' },
  { name: 'Vite', desc: 'Build & dev server', icon: Lightning, group: 'Core' },
  { name: 'Tailwind CSS', desc: 'Utility-first styles', icon: PaintBrush, group: 'Core' },
  { name: 'shadcn/ui', desc: 'Accessible primitives', icon: Cube, group: 'Core' },
  { name: 'Framer Motion', desc: 'Animations', icon: Pulse, group: 'Core' },
  { name: 'pdf-lib', desc: 'PDF rebuilder', icon: Bookmarks, group: 'Engines' },
  { name: 'pdfjs-dist', desc: 'PDF parser & rasterizer', icon: PenNib, group: 'Engines' },
  { name: 'browser-image-compression', desc: 'Image encoder (Web Worker)', icon: Images, group: 'Engines' },
  { name: 'JSZip', desc: 'ZIP packing', icon: Stack, group: 'Engines' },
  { name: 'Phosphor Icons', desc: '9,000+ duotone icons', icon: Sparkle, group: 'Design' },
  { name: 'Vercel Edge', desc: 'Hosting & CDN', icon: Cloud, group: 'Infra' },
];

const pledge = [
  'We never see your files. Processing happens entirely in your browser using JavaScript.',
  'We don\'t store any telemetry that could identify you. No cookies, no fingerprinting, no third-party trackers.',
  'We don\'t ask for an email, a phone number, or any personally identifying information.',
  'Our code is auditable. The bundled JavaScript is the only thing that runs on your device — and you can verify it.',
  'We honor the "Do Not Track" browser setting. If you enable it, even our cookieless analytics stay silent.',
  'We\'ll never sell the project, the domain, or the user base to a data-broker ad network. We\'d rather shut it down.',
];

const quickFacts = [
  { icon: Calendar, label: 'Founded', value: '2024' },
  { icon: MapPin, label: 'Based in', value: 'India' },
  { icon: Users, label: 'Team size', value: '1 (solo)' },
  { icon: Buildings, label: 'Status', value: 'Active' },
];

const SectionHeader = ({
  number,
  title,
  subtitle,
  align = 'center',
}: {
  number: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.5 }}
    className={cn(align === 'center' && 'text-center')}
  >
    <div
      className={cn(
        'flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs',
        align === 'center' ? 'justify-center' : ''
      )}
    >
      <span
        className="font-mono text-base font-black"
        style={GRADIENT_TEXT}
      >
        {number}
      </span>
      <span className="h-px w-8 bg-gradient-to-r from-primary/40 to-transparent sm:w-10" />
      <span>Section</span>
    </div>
    <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl text-balance">
      {title}
    </h2>
    {subtitle && (
      <p
        className={cn(
          'mt-3 text-sm text-muted-foreground text-pretty sm:text-base',
          align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'
        )}
      >
        {subtitle}
      </p>
    )}
  </motion.div>
);

const GradientCard = ({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) => (
  <div
    className={cn(
      'group relative rounded-2xl p-px transition-all duration-300',
      hover && 'hover:shadow-[0_0_30px_rgba(124,58,237,0.12)]',
      className
    )}
    style={{
      background:
        'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.1), hsl(var(--primary) / 0.05))',
    }}
  >
    <div
      className="rounded-[15px] border border-border/40 bg-card/70 p-5 backdrop-blur-sm transition-colors group-hover:bg-card/85 sm:p-6"
    >
      {children}
    </div>
  </div>
);

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
                  href="#section-01"
                  className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                >
                  Read our story
                  <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <Lightning size={16} weight="duotone" />
                  Try the tools
                </Link>
              </motion.div>

              {/* Quick facts strip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-10 grid grid-cols-2 gap-2 sm:mt-14 sm:grid-cols-4 sm:gap-3"
              >
                {quickFacts.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-xl border border-border/40 bg-card/50 px-3 py-3 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card/70"
                  >
                    <f.icon size={18} weight="duotone" className="mx-auto h-4 w-4 text-primary" />
                    <div className="mt-1.5 text-base font-bold tracking-tight sm:text-lg">{f.value}</div>
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                      {f.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {SECTION_DIVIDER}

        {/* 01 — WHO WE ARE */}
        <section id="section-01" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="01"
            title="Who we are"
            subtitle="Three short statements that guide every feature, every line of code, and every decision we make."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpStagger}
            className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5"
          >
            {pillars.map((p) => (
              <motion.div key={p.title} variants={fadeUp}>
                <GradientCard className="h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/25">
                    <p.icon size={28} weight="duotone" className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </GradientCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {SECTION_DIVIDER}

        {/* 02 — BY THE NUMBERS */}
        <section id="section-02" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="02"
            title="By the numbers"
            subtitle="The kind of things that matter to a small team — quietly compounding, one user at a time."
          />

          <div className="relative mt-10">
            {/* Background pattern — subtle dot grid */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 opacity-50"
              aria-hidden
              style={{
                backgroundImage:
                  'radial-gradient(circle, hsl(var(--primary) / 0.12) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
              }}
            />

            {/* Floating sparkles */}
            <FloatingSparkles />

            <div
              ref={statsRef}
              className="grid gap-3 sm:gap-4 lg:grid-cols-3"
            >
              {/* Featured stat — spans 2 cols on lg */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
              >
                <FeaturedStatCard stat={stats[0]} active={statsVisible} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <StatCard stat={stats[3]} active={statsVisible} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <StatCard stat={stats[1]} active={statsVisible} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:col-span-2"
              >
                <StatCard stat={stats[2]} active={statsVisible} wide />
              </motion.div>
            </div>
          </div>
        </section>

        {SECTION_DIVIDER}

        {/* 03 — OUR VALUES */}
        <section id="section-03" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="03"
            title="How we work"
            subtitle="Six principles we hold ourselves to. If we ever violate one, you can call us out in public."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpStagger}
            className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          >
            {values.map((v) => (
              <motion.div key={v.title} variants={fadeUp}>
                <GradientCard className="h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <v.icon size={22} weight="duotone" className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold tracking-tight sm:text-base">{v.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">{v.desc}</p>
                </GradientCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {SECTION_DIVIDER}

        {/* 04 — THE JOURNEY */}
        <section id="section-04" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="04"
            title="The journey"
            subtitle="A short history of ImageSqueeze — from a weekend script to a privacy-first toolkit serving thousands."
          />

          <div className="relative mx-auto mt-12 max-w-3xl">
            <div
              className="pointer-events-none absolute left-3.5 top-2 bottom-2 w-px sm:left-1/2 sm:-translate-x-1/2"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.4), transparent)',
              }}
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
                    'relative flex gap-4 pl-10 sm:gap-8 sm:pl-0 sm:items-center',
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
                    <GradientCard hover={true}>
                      <div
                        className={cn(
                          'flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-primary',
                          idx % 2 === 0 ? 'sm:justify-end' : ''
                        )}
                      >
                        <Calendar size={12} weight="duotone" />
                        {m.year}
                      </div>
                      <h3 className="mt-1.5 text-base font-bold tracking-tight sm:text-lg">{m.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                    </GradientCard>
                  </div>

                  <div className="hidden flex-1 sm:block" />
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {SECTION_DIVIDER}

        {/* 05 — THE STACK */}
        <section id="section-05" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="05"
            title="The stack"
            subtitle="ImageSqueeze is assembled from best-in-class open-source libraries. We don't reinvent the wheel — we compose it beautifully."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpStagger}
            className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          >
            {stack.map((tech) => (
              <motion.div key={tech.name} variants={fadeUp}>
                <GradientCard className="h-full">
                  <tech.icon size={24} weight="duotone" className="h-6 w-6 text-primary" />
                  <h3 className="mt-2.5 text-sm font-bold tracking-tight">{tech.name}</h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{tech.desc}</p>
                  <div className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {tech.group}
                  </div>
                </GradientCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {SECTION_DIVIDER}

        {/* 06 — MEET THE FOUNDER */}
        <section id="section-06" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="06"
            title="Meet the founder"
            subtitle="ImageSqueeze is a one-person studio. Here's who's behind the pixels."
          />

          <div className="mx-auto mt-10 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5 }}
            >
              <GradientCard hover={false} className="overflow-hidden p-0">
                {/* HERO — image + name + pull quote */}
                <div className="relative overflow-hidden border-b border-border/30 bg-gradient-to-br from-primary/[0.12] via-card/40 to-accent/[0.12] p-6 sm:p-8 lg:p-10">
                  <div
                    className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
                    style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), transparent)', filter: 'blur(60px)' }}
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full"
                    style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.2), transparent)', filter: 'blur(60px)' }}
                    aria-hidden
                  />

                  <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
                    <ProfileImage
                      src={profileImg}
                      alt="Girish Lade, founder of ImageSqueeze"
                      className="w-40 sm:w-52 lg:w-56"
                      fallbackInitials="GL"
                      naturalWidth={1024}
                      naturalHeight={1536}
                      showStatus
                    />

                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <h3 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[2.75rem]">
                        <span style={GRADIENT_TEXT}>Girish</span>{' '}
                        <span className="text-foreground">Lade</span>
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-xs sm:justify-start">
                        <span className="rounded-full border border-primary/25 bg-primary/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Founder &amp; Solo Dev
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MapPin size={12} weight="duotone" />
                          India
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                          Active
                        </span>
                      </div>

                      <blockquote className="relative mt-5 sm:mt-6">
                        <Quotes
                          size={32}
                          weight="fill"
                          className="absolute -left-1 -top-3 h-7 w-7 text-primary/15 sm:-left-1.5 sm:-top-4 sm:h-8 sm:w-8"
                          aria-hidden
                        />
                        <p className="pl-6 text-base font-medium leading-relaxed text-foreground/90 italic sm:pl-8 sm:text-lg">
                          The best software is the kind that respects its users — no dark patterns, no data harvesting,
                          no unnecessary complexity.
                        </p>
                      </blockquote>

                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        Web developer, indie hacker, and privacy enthusiast. Built ImageSqueeze after a tired weekend of
                        uploading his own photos to a dozen different compression sites. He also runs{' '}
                        <a
                          href="https://ladestack.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline"
                        >
                          Lade Stack
                        </a>
                        , a small studio focused on local-first web tools.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FOOTER — skills + social */}
                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-7 lg:p-8">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      <Briefcase size={12} weight="duotone" />
                      What I do
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <SkillChip icon={Cpu} label="Design &amp; build" />
                      <SkillChip icon={Briefcase} label="Run Lade Stack" />
                      <SkillChip icon={GraduationCap} label="Ship small" />
                      <SkillChip icon={Wrench} label="Lean stack" />
                    </div>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      <Share size={12} weight="duotone" />
                      Find me on
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <SocialLink href="https://github.com/girishlade111" icon={GithubLogo} label="GitHub" />
                      <SocialLink href="https://www.linkedin.com/in/girish-lade-075bba201/" icon={LinkedinLogo} label="LinkedIn" />
                      <SocialLink href="https://www.instagram.com/girish_lade_/" icon={InstagramLogo} label="Instagram" />
                      <SocialLink href="mailto:admin@ladestack.in" icon={Envelope} label="Email" />
                      <SocialLink href="https://ladestack.in" icon={Globe} label="ladestack.in" />
                    </div>
                  </div>
                </div>
              </GradientCard>
            </motion.div>
          </div>
        </section>

        {SECTION_DIVIDER}

        {/* 07 — THE PLEDGE */}
        <section id="section-07" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="07"
            title="The privacy pledge"
            subtitle="We're committed to the simplest possible privacy story. No loopholes, no fine print — just a list of things we promise not to do."
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-10 max-w-3xl"
          >
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/40 to-accent/[0.08] p-6 backdrop-blur-sm sm:p-10">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--accent) / 0.15), transparent)',
                  filter: 'blur(60px)',
                }}
                aria-hidden
              />

              <div className="relative">
                <ul className="space-y-3 sm:space-y-4">
                  {pledge.map((line, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="flex gap-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                        <CheckCircle size={16} weight="fill" className="h-4 w-4 text-emerald-500" />
                      </span>
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
            </div>
          </motion.div>
        </section>

        {SECTION_DIVIDER}

        {/* CTA */}
        <section className="container mx-auto px-4 py-8 pb-safe sm:px-6 sm:py-16">
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
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
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

const StatCard = ({
  stat,
  active,
  wide = false,
}: {
  stat: (typeof stats)[number];
  active: boolean;
  wide?: boolean;
}) => {
  const animated = useCountUp(active ? stat.value : 0, 1400);
  const formatted = stat.format === 'decimal' ? animated.toFixed(1) : Math.floor(animated).toLocaleString();
  const ringSize = 64;

  return (
    <GradientCard hover={true} className="h-full overflow-hidden p-0">
      <div className={`flex h-full flex-col gap-4 p-5 ${wide ? 'sm:flex-row sm:items-center sm:gap-5 sm:p-6' : ''}`}>
        {/* Circular progress ring + icon */}
        <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
          <CircularProgress progress={stat.progress} size={ringSize} active={active} />
          <div
            className="absolute inset-0 m-auto flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))',
            }}
          >
            <stat.icon size={22} weight="duotone" className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-0.5">
            <span
              className="text-2xl font-black tracking-tight tabular-nums sm:text-3xl"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatted}
            </span>
            <span className="text-lg font-bold text-primary sm:text-xl">{stat.suffix}</span>
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-muted-foreground sm:text-xs">{stat.label}</div>

          {/* Trend + sparkline */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendUp size={10} weight="bold" />
              {stat.trend}
            </span>
            <div className="flex-1 opacity-90">
              <Sparkline data={stat.sparkline} active={active} width={wide ? 120 : 72} height={20} />
            </div>
          </div>
        </div>
      </div>
    </GradientCard>
  );
};

const FeaturedStatCard = ({ stat, active }: { stat: (typeof stats)[number]; active: boolean }) => {
  const animated = useCountUp(active ? stat.value : 0, 1600);
  const formatted = stat.format === 'decimal' ? animated.toFixed(1) : Math.floor(animated).toLocaleString();
  const ringSize = 140;

  return (
    <GradientCard hover={true} className="relative h-full overflow-hidden p-0">
      {/* Decorative orbs */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), transparent)', filter: 'blur(50px)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.2), transparent)', filter: 'blur(50px)' }}
        aria-hidden
      />

      <div className="relative flex h-full flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        {/* Large circular ring + icon */}
        <div className="relative flex-shrink-0 self-center sm:self-auto" style={{ width: ringSize, height: ringSize }}>
          <CircularProgress progress={stat.progress} size={ringSize} active={active} strokeWidth={5} />
          <div
            className="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--accent) / 0.25))',
            }}
          >
            <stat.icon size={40} weight="duotone" className="h-9 w-9 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            The headline number
          </p>
          <div className="mt-1.5 flex items-baseline justify-center gap-1 sm:justify-start">
            <span
              className="text-5xl font-black tracking-tight tabular-nums sm:text-6xl"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatted}
            </span>
            <span className="text-2xl font-bold text-primary sm:text-3xl">{stat.suffix}</span>
          </div>
          <div className="mt-1 text-sm font-semibold sm:text-base">{stat.label}</div>

          {stat.description && (
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {stat.description}
            </p>
          )}

          {/* Trend + sparkline */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendUp size={11} weight="bold" />
              {stat.trend} vs last month
            </span>
            <div className="flex-shrink-0">
              <Sparkline data={stat.sparkline} active={active} width={180} height={28} />
            </div>
          </div>
        </div>
      </div>
    </GradientCard>
  );
};

const CircularProgress = ({
  progress,
  size,
  active,
  strokeWidth = 3,
}: {
  progress: number;
  size: number;
  active: boolean;
  strokeWidth?: number;
}) => {
  const gradientId = useId();
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 -rotate-90"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--border) / 0.4)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={
          active
            ? { strokeDashoffset: circumference - (circumference * progress) / 100 }
            : { strokeDashoffset: circumference }
        }
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  );
};

const Sparkline = ({
  data,
  active,
  width = 80,
  height = 24,
}: {
  data: number[];
  active: boolean;
  width?: number;
  height?: number;
}) => {
  const gradientId = useId();
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const linePath = `M ${points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L ')}`;
  const fillPath = `${linePath} L ${(width - pad).toFixed(2)},${height} L ${pad},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={fillPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={active ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
      />
      <motion.circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="2.5"
        fill="hsl(var(--primary))"
        initial={{ scale: 0, opacity: 0 }}
        animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.3, delay: 1.5 }}
      />
    </svg>
  );
};

const FloatingSparkles = () => {
  const sparkles = useMemo(
    () => [
      { left: '8%', top: '15%', size: 12, delay: '0s', duration: '6s' },
      { left: '88%', top: '25%', size: 10, delay: '-2s', duration: '7s' },
      { left: '12%', top: '70%', size: 14, delay: '-4s', duration: '8s' },
      { left: '85%', top: '80%', size: 11, delay: '-1s', duration: '6.5s' },
      { left: '50%', top: '5%', size: 9, delay: '-3s', duration: '7.5s' },
      { left: '45%', top: '92%', size: 10, delay: '-5s', duration: '8.5s' },
    ],
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {sparkles.map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/40"
          style={{ left: s.left, top: s.top }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: parseFloat(s.duration),
            delay: parseFloat(s.delay),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkle size={s.size} weight="fill" />
        </motion.div>
      ))}
    </div>
  );
};

const SkillChip = ({
  icon: Icon,
  label,
}: {
  icon: typeof Cpu;
  label: string;
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/40 px-2.5 py-1 text-[11px] font-medium text-foreground/85">
    <Icon size={12} weight="duotone" className="h-3 w-3 text-primary" />
    {label}
  </span>
);

const SocialLink = ({
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
    title={label}
    className="group inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-2.5 py-1 text-[11px] font-semibold text-foreground/80 backdrop-blur-sm transition-all hover:scale-[1.03] hover:border-primary/50 hover:bg-primary/[0.08] hover:text-primary"
  >
    <Icon size={14} weight="duotone" className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110" />
    {label}
  </a>
);

export default About;
