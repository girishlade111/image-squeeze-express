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
import profileImg from '@/assets/profile.webp';
import profileAvif from '@/assets/profile.avif';
import profileWebp2x from '@/assets/profile@2x.webp';
import profileAvif2x from '@/assets/profile@2x.avif';
import { cn } from '@/lib/utils';
import { pageSeo } from '@/config/seo';

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

const formatCompact = (value: number, format: 'number' | 'decimal'): string => {
  if (format === 'decimal') return value.toFixed(1);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.floor(value / 1_000)}K`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.floor(value).toString();
};

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
    desc: 'LS Image Compressor started in 2024 as a weekend project by Girish Lade. After uploading sensitive product photos to five different compression services, he built the tool he wished existed — one that runs entirely in the browser.',
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
    description: 'People who trust LS Image Compressor to handle their images every month — and tell their friends.',
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
    desc: 'No accounts. No paywalls. No "Pro" tier. LS Image Compressor will always be free for personal and commercial use.',
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
    title: 'LS Image Compressor v1',
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

const stack: { name: string; desc: string; icon: typeof Code; group: string }[] = [
  { name: 'React 18', desc: 'UI framework', icon: Code, group: 'Foundation' },
  { name: 'TypeScript', desc: 'Type safety', icon: FileText, group: 'Foundation' },
  { name: 'Vite', desc: 'Build & dev server', icon: Lightning, group: 'Foundation' },
  { name: 'Tailwind CSS', desc: 'Utility-first styles', icon: PaintBrush, group: 'Interface' },
  { name: 'shadcn/ui', desc: 'Accessible primitives', icon: Cube, group: 'Interface' },
  { name: 'Framer Motion', desc: 'Animations', icon: Pulse, group: 'Interface' },
  { name: 'pdf-lib', desc: 'PDF rebuilder', icon: Bookmarks, group: 'Engines' },
  { name: 'pdfjs-dist', desc: 'PDF parser & rasterizer', icon: PenNib, group: 'Engines' },
  { name: 'browser-image-compression', desc: 'Image encoder', icon: Images, group: 'Engines' },
  { name: 'JSZip', desc: 'ZIP packing', icon: Stack, group: 'Engines' },
  { name: 'Phosphor Icons', desc: '9,000+ duotone icons', icon: Sparkle, group: 'Delivery' },
  { name: 'Vercel Edge', desc: 'Hosting & CDN', icon: Cloud, group: 'Delivery' },
];

const STACK_LAYER_ORDER = ['Foundation', 'Interface', 'Engines', 'Delivery'];

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

  const stackLayers = useMemo(() => {
    const grouped = new Map<string, typeof stack>();
    for (const tech of stack) {
      const list = grouped.get(tech.group) ?? [];
      list.push(tech);
      grouped.set(tech.group, list);
    }
    return STACK_LAYER_ORDER.filter((g) => grouped.has(g)).map((label, i) => ({
      label,
      index: i + 1,
      items: grouped.get(label)!,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DocumentTitle {...pageSeo.about} />
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
                The team behind LS Image Compressor
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
                LS Image Compressor is a tiny, independent studio of one. We build fast, free, fully client-side
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
                  className="group inline-flex h-12 items-center gap-2 rounded-full px-5 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] sm:h-auto sm:px-4 sm:py-2.5 sm:text-sm"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                >
                  Read our story
                  <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </a>
                <Link
                  to="/"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border/50 bg-card/60 px-5 text-base font-semibold backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card sm:h-auto sm:px-4 sm:py-2.5 sm:text-sm"
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
                    <f.icon size={18} weight="duotone" className="mx-auto h-5 w-5 text-primary sm:h-4 sm:w-4" />
                    <div className="mt-1.5 text-lg font-bold tracking-tight sm:text-lg">{f.value}</div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
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
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4 }}
              className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 sm:mb-3 sm:py-1 sm:text-[10px]"
            >
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
              </span>
              Live Dashboard · Tracking since 2024
            </motion.div>
            <SectionHeader
              number="02"
              title="By the numbers"
              subtitle="The kind of things that matter to a small team — quietly compounding, one user at a time."
            />
          </div>

          <div className="relative mt-10">
            {/* Background — soft gradient mesh */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
              <div
                className="absolute -left-20 top-0 h-72 w-72 rounded-full"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.12), transparent 70%)', filter: 'blur(40px)' }}
              />
              <div
                className="absolute -right-20 bottom-0 h-72 w-72 rounded-full"
                style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.12), transparent 70%)', filter: 'blur(40px)' }}
              />
              {/* Subtle grid lines */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(hsl(var(--primary) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.06) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                  maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
                  WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
                }}
              />
            </div>

            {/* Floating sparkles */}
            <FloatingSparkles />

            <div ref={statsRef} className="grid gap-3 sm:gap-4 lg:grid-cols-3">
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
            subtitle="A short history of LS Image Compressor — from a weekend script to a privacy-first toolkit serving thousands."
          />

          <div className="relative mx-auto mt-14 max-w-3xl">
            {/* Background dot grid */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 opacity-50"
              aria-hidden
              style={{
                backgroundImage:
                  'radial-gradient(circle, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
                maskImage:
                  'radial-gradient(ellipse 70% 80% at 50% 50%, black, transparent)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 70% 80% at 50% 50%, black, transparent)',
              }}
            />

            {/* Spine glow (blurred backdrop) */}
            <div
              className="pointer-events-none absolute left-3.5 top-0 bottom-0 w-4 -translate-x-1/2 sm:left-1/2 sm:translate-x-0"
              style={{
                background:
                  'linear-gradient(to bottom, transparent 5%, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3), transparent 95%)',
                filter: 'blur(8px)',
              }}
              aria-hidden
            />

            {/* Spine line */}
            <div
              className="pointer-events-none absolute left-3.5 top-0 bottom-0 w-px sm:left-1/2 sm:-translate-x-px"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.5) 10%, hsl(var(--accent) / 0.5) 90%, transparent)',
              }}
              aria-hidden
            />

            <ol className="space-y-10 sm:space-y-14">
              {milestones.map((m, idx) => {
                const isLatest = idx === milestones.length - 1;
                const isLeft = idx % 2 === 0;
                return (
                  <motion.li
                    key={m.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                    className={cn(
                      'relative pl-12 sm:pl-0',
                      isLeft
                        ? 'sm:flex sm:flex-row sm:items-center sm:gap-10'
                        : 'sm:flex sm:flex-row-reverse sm:items-center sm:gap-10'
                    )}
                  >
                    {/* Latest milestone pulsing aura */}
                    {isLatest && (
                      <span
                        className="absolute left-0 top-1 z-0 h-12 w-12 -translate-x-1/2 rounded-full sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
                        style={{
                          background:
                            'radial-gradient(circle, hsl(var(--primary) / 0.5), transparent 65%)',
                          filter: 'blur(6px)',
                        }}
                        aria-hidden
                      />
                    )}

                    {/* Milestone node */}
                    <div
                      className="absolute left-0 top-1 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
                      style={{
                        background:
                          'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                        boxShadow:
                          '0 0 20px hsl(var(--primary) / 0.4), 0 0 0 4px hsl(var(--background))',
                      }}
                      aria-hidden
                    >
                      <m.icon
                        size={18}
                        weight="duotone"
                        className="h-4 w-4 text-primary-foreground"
                      />
                    </div>

                    {/* Card */}
                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                      className={cn(
                        'group relative overflow-hidden rounded-2xl border border-border/40 bg-card/70 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 sm:p-6 sm:flex-1',
                        isLeft ? 'sm:text-right' : 'sm:text-left'
                      )}
                      style={{
                        boxShadow: '0 4px 24px -8px hsl(var(--primary) / 0.12)',
                      }}
                    >
                      {/* Hover gradient overlay */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{
                          background:
                            'linear-gradient(135deg, hsl(var(--primary) / 0.06), transparent 50%, hsl(var(--accent) / 0.06))',
                        }}
                        aria-hidden
                      />

                      {/* Side accent bar (faces the timeline) */}
                      <span
                        className={cn(
                          'absolute top-0 h-full w-1 transition-all duration-300 group-hover:w-1.5',
                          isLeft ? 'right-0' : 'left-0'
                        )}
                        style={{
                          background:
                            'linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--accent)))',
                        }}
                        aria-hidden
                      />

                      <div className="relative">
                        {/* Year pill + Now badge */}
                        <div
                          className={cn(
                            'flex flex-wrap items-center gap-2',
                            isLeft ? 'sm:justify-end' : 'sm:justify-start'
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                            <Calendar size={11} weight="duotone" />
                            {m.year}
                          </span>
                          {isLatest && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </span>
                              Now
                            </span>
                          )}
                        </div>

                        {/* Title row with icon tile */}
                        <div
                          className={cn(
                            'mt-3 flex items-start gap-3',
                            isLeft ? 'sm:flex-row-reverse' : 'sm:flex-row'
                          )}
                        >
                          <div
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                            style={{
                              background:
                                'linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--accent) / 0.18))',
                              boxShadow:
                                'inset 0 0 0 1px hsl(var(--primary) / 0.18)',
                            }}
                          >
                            <m.icon
                              size={20}
                              weight="duotone"
                              className="h-5 w-5 text-primary"
                            />
                          </div>
                          <h3 className="flex-1 text-base font-bold tracking-tight sm:text-lg">
                            {m.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                          {m.desc}
                        </p>
                      </div>
                    </motion.div>

                    {/* Empty side (alternating layout balance) */}
                    <div className="hidden sm:block sm:flex-1" aria-hidden />
                  </motion.li>
                );
              })}
            </ol>

            {/* Today indicator at end of timeline */}
            <div className="relative mt-6 flex flex-col items-center sm:mt-10">
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-background"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  boxShadow:
                    '0 0 24px hsl(var(--primary) / 0.5), 0 0 0 4px hsl(var(--background))',
                }}
              >
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                </span>
              </div>
              <span className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Today
              </span>
            </div>
          </div>
        </section>

        {SECTION_DIVIDER}

        {/* 05 — THE STACK */}
        <section id="section-05" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="05"
            title="The stack"
            subtitle="LS Image Compressor is assembled from best-in-class open-source libraries. We don't reinvent the wheel — we compose it beautifully."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpStagger}
            className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
          >
            {stackLayers.map((layer) => (
              <motion.div
                key={layer.label}
                variants={fadeUp}
                className="rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-primary/30 hover:bg-card/55 sm:p-6"
              >
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                      aria-hidden
                    />
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/80">
                      {layer.label}
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">
                    {String(layer.index).padStart(2, '0')}
                  </span>
                </div>

                <div className="mt-4 divide-y divide-border/30">
                  {layer.items.map((tech) => (
                    <div
                      key={tech.name}
                      className="group/tech flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover/tech:bg-primary/15">
                        <tech.icon size={15} weight="duotone" className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold tracking-tight text-foreground/90">
                          {tech.name}
                        </div>
                        <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                          {tech.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-center"
          >
            <span className="font-mono text-[11px] font-semibold text-foreground/70 tabular-nums">
              {stack.length}
            </span>
            <span className="text-[11px] text-muted-foreground">dependencies</span>
            <span className="text-muted-foreground/30" aria-hidden>·</span>
            <span className="font-mono text-[11px] font-semibold text-foreground/70 tabular-nums">0</span>
            <span className="text-[11px] text-muted-foreground">trackers</span>
            <span className="text-muted-foreground/30" aria-hidden>·</span>
            <span className="font-mono text-[11px] font-semibold text-foreground/70 tabular-nums">100%</span>
            <span className="text-[11px] text-muted-foreground">open source</span>
          </motion.div>
        </section>

        {SECTION_DIVIDER}

        {/* 06 — MEET THE FOUNDER */}
        <section id="section-06" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="06"
            title="Meet the founder"
            subtitle="LS Image Compressor is a one-person studio. Here's who's behind the pixels."
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
                      alt="Girish Lade, founder of LS Image Compressor"
                      className="w-40 sm:w-52 lg:w-56"
                      fallbackInitials="GL"
                      naturalWidth={1024}
                      naturalHeight={1536}
                      showStatus
                      sources={[
                        {
                          type: 'image/avif',
                          srcSet: `${profileAvif} 1x, ${profileAvif2x} 2x`,
                        },
                        {
                          type: 'image/webp',
                          srcSet: `${profileImg} 1x, ${profileWebp2x} 2x`,
                        },
                      ]}
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
                        Web developer, indie hacker, and privacy enthusiast. Built LS Image Compressor after a tired weekend of
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
                Try LS Image Compressor —{' '}
                <span style={GRADIENT_TEXT}>no signup, no upload, no tracking</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                Three tools. Zero servers in the loop. Drop a file and watch it work — that&apos;s the whole pitch.
              </p>
              <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <Link
                  to="/"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] sm:h-auto sm:px-5 sm:py-2.5 sm:text-sm"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                >
                  <Lightning size={16} weight="duotone" />
                  Compress Images
                </Link>
                <Link
                  to="/compress-pdf"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border/50 bg-card/80 px-5 text-base font-semibold backdrop-blur-sm transition-colors hover:border-primary/40 sm:h-auto sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <FileText size={16} weight="duotone" />
                  Compress PDF
                </Link>
                <Link
                  to="/bulk-rename"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border/50 bg-card/80 px-5 text-base font-semibold backdrop-blur-sm transition-colors hover:border-primary/40 sm:h-auto sm:px-5 sm:py-2.5 sm:text-sm"
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
  const formatted = formatCompact(animated, stat.format);
  const ringSize = 64;

  return (
    <GradientCard hover={true} className="h-full overflow-hidden p-0">
      <div className={`flex h-full flex-col gap-4 p-5 ${wide ? 'sm:flex-row sm:items-center sm:gap-5 sm:p-6' : ''}`}>
        {/* Circular progress ring + icon with halo */}
        <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
          <CircularProgress progress={stat.progress} size={ringSize} active={active} />
          <IconHalo>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--accent) / 0.25))',
              }}
            >
              <stat.icon size={22} weight="duotone" className="h-5 w-5 text-primary" />
            </div>
          </IconHalo>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-0.5">
            <span
              className="text-3xl font-black tracking-tight tabular-nums sm:text-4xl"
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
              <Sparkline data={stat.sparkline} active={active} width={wide ? 140 : 84} height={22} />
            </div>
          </div>
        </div>
      </div>
    </GradientCard>
  );
};

const FeaturedStatCard = ({ stat, active }: { stat: (typeof stats)[number]; active: boolean }) => {
  const animated = useCountUp(active ? stat.value : 0, 1600);
  const formatted = formatCompact(animated, stat.format);
  const ringSize = 140;

  return (
    <div className="relative h-full overflow-hidden rounded-2xl p-px">
      {/* Animated gradient border */}
      <div className="animated-gradient-border absolute inset-0 rounded-2xl" aria-hidden />
      <div className="relative h-full overflow-hidden rounded-[15px] border border-border/40 bg-card/70 backdrop-blur-sm">
        {/* Decorative orbs */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.18), transparent)', filter: 'blur(50px)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.18), transparent)', filter: 'blur(50px)' }}
          aria-hidden
        />

        {/* Live indicator */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 sm:right-5 sm:top-5 sm:text-[10px]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </div>

        <div className="relative flex h-full flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6 lg:p-7">
          {/* Large circular ring + icon with halo */}
          <div className="relative flex-shrink-0 self-center sm:self-auto" style={{ width: ringSize, height: ringSize }}>
            <CircularProgress progress={stat.progress} size={ringSize} active={active} strokeWidth={5} />
            <IconHalo size="lg">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3))',
                }}
              >
                <stat.icon size={40} weight="duotone" className="h-9 w-9 text-primary" />
              </div>
            </IconHalo>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              The headline number
            </p>
            <div className="mt-1 flex items-baseline justify-center gap-1 sm:justify-start">
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
      </div>
    </div>
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
  const fillGradId = useId();
  const strokeGradId = useId();
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
        <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={strokeGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>

      {/* Baseline grid */}
      <line
        x1={pad}
        y1={height - pad}
        x2={width - pad}
        y2={height - pad}
        stroke="hsl(var(--border) / 0.3)"
        strokeWidth="0.5"
        strokeDasharray="1.5 1.5"
      />

      {/* Fill area */}
      <motion.path
        d={fillPath}
        fill={`url(#${fillGradId})`}
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      />

      {/* Gradient stroke line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={`url(#${strokeGradId})`}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={active ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
      />

      {/* Data point dots */}
      {points.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="1.25"
          fill="hsl(var(--primary))"
          initial={{ scale: 0, opacity: 0 }}
          animate={active ? { scale: 1, opacity: 0.7 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.25, delay: 0.5 + i * 0.04 }}
        />
      ))}

      {/* Endpoint dot with pulse */}
      <motion.circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="3"
        fill="hsl(var(--accent))"
        initial={{ scale: 0, opacity: 0 }}
        animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.3, delay: 1.5 }}
      />
      <motion.circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="3"
        fill="hsl(var(--accent))"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={
          active
            ? { scale: [0.5, 2.5, 2.5], opacity: [0, 0.5, 0] }
            : { scale: 0.5, opacity: 0 }
        }
        transition={{ duration: 2, delay: 1.8, repeat: Infinity, ease: 'easeOut' }}
      />
    </svg>
  );
};

const IconHalo = ({ children, size = 'sm' }: { children: React.ReactNode; size?: 'sm' | 'lg' }) => {
  const sizeClass = size === 'lg' ? 'h-20 w-20' : 'h-10 w-10';
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer pulsing halo */}
      <motion.div
        className={`absolute rounded-full ${sizeClass}`}
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      {/* Inner content */}
      <div className="relative">{children}</div>
    </div>
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
