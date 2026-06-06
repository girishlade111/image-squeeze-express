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
  Quotes,
  Buildings,
  Cpu,
  Cube,
  Wrench,
  GraduationCap,
  Briefcase,
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
  { icon: Users, value: 25000, suffix: '+', label: 'Active Users', format: 'number' as const },
  { icon: Images, value: 1.2, suffix: 'M+', label: 'Images Compressed', format: 'decimal' as const },
  { icon: FileText, value: 85000, suffix: '+', label: 'PDFs Optimized', format: 'number' as const },
  { icon: Stack, value: 100, suffix: '%', label: 'Client-Side', format: 'number' as const },
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

          <motion.div
            ref={statsRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpStagger}
            className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} active={statsVisible} />
            ))}
          </motion.div>
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

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:gap-5 lg:grid-cols-5">
            {/* Founder card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <GradientCard hover={false} className="overflow-hidden">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
                  <ProfileImage
                    src={profileImg}
                    alt="Girish Lade, founder of ImageSqueeze"
                    className="w-32 sm:w-40 lg:w-44"
                    fallbackInitials="GL"
                    naturalWidth={1024}
                    naturalHeight={1536}
                    showStatus
                  />

                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">Girish Lade</h3>
                      <span className="rounded-full border border-primary/25 bg-primary/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
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
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
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
              </GradientCard>
            </motion.div>

            {/* Pull quote + skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4 sm:space-y-5 lg:col-span-2"
            >
              <GradientCard hover={false} className="h-full">
                <Quotes size={28} weight="duotone" className="h-7 w-7 text-primary" />
                <p className="mt-3 text-base font-medium leading-relaxed text-foreground/90">
                  The best software is the kind that respects its users. No dark patterns, no data harvesting, no
                  unnecessary complexity.
                </p>
                <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span
                    className="h-px w-6"
                    style={{
                      background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                    }}
                  />
                  Girish Lade
                </p>
              </GradientCard>

              <GradientCard hover={false}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">What I do</p>
                <ul className="mt-3 space-y-2.5">
                  <li className="flex items-center gap-2.5 text-xs">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Cpu size={14} weight="duotone" className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="text-foreground/90">Design &amp; build web tools</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase size={14} weight="duotone" className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="text-foreground/90">Run Lade Stack studio</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap size={14} weight="duotone" className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="text-foreground/90">Ship small, learn fast</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Wrench size={14} weight="duotone" className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="text-foreground/90">Maintain a lean stack</span>
                  </li>
                </ul>
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

const StatCard = ({ stat, active }: { stat: typeof stats[number]; active: boolean }) => {
  const animated = useCountUp(active ? stat.value : 0, 1200);
  const formatted = stat.format === 'decimal' ? animated.toFixed(1) : Math.floor(animated).toLocaleString();

  return (
    <motion.div variants={fadeUp} className="h-full">
      <GradientCard hover={true} className="h-full">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
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
      </GradientCard>
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
