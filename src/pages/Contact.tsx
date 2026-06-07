import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  EnvelopeSimple,
  Envelope,
  GithubLogo,
  LinkedinLogo,
  InstagramLogo,
  Code,
  Globe,
  MapPin,
  Clock,
  Sparkle,
  ArrowUpRight,
  ArrowRight,
  ChatCircleDots,
  Lightning,
  Copy,
  Check,
  Handshake,
  Compass,
  Pulse,
} from '@phosphor-icons/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentTitle from '@/components/DocumentTitle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PrimaryCTA from '@/components/PrimaryCTA';
import { cn } from '@/lib/utils';
import { pageSeo } from '@/config/seo';

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

const primaryChannels = [
  {
    icon: Envelope,
    title: 'Email',
    desc: 'Best for detailed questions, partnerships, and press inquiries.',
    handle: 'admin@ladestack.in',
    href: 'mailto:admin@ladestack.in',
    copyable: true,
  },
  {
    icon: GithubLogo,
    title: 'GitHub',
    desc: 'Report bugs, file issues, or follow along with the open-source work.',
    handle: 'girishlade111',
    href: 'https://github.com/girishlade111',
    copyable: false,
  },
  {
    icon: Globe,
    title: 'Website',
    desc: 'Browse the rest of the Lade Stack portfolio and other tools.',
    handle: 'ladestack.in',
    href: 'https://ladestack.in',
    copyable: false,
  },
];

const socialProfiles = [
  {
    icon: InstagramLogo,
    label: 'Instagram',
    handle: '@girish_lade_',
    href: 'https://www.instagram.com/girish_lade_/',
    accent: 'from-pink-500/15 to-orange-500/10',
  },
  {
    icon: LinkedinLogo,
    label: 'LinkedIn',
    handle: 'Girish Lade',
    href: 'https://www.linkedin.com/in/girish-lade-075bba201/',
    accent: 'from-blue-500/15 to-sky-500/10',
  },
  {
    icon: GithubLogo,
    label: 'GitHub',
    handle: 'girishlade111',
    href: 'https://github.com/girishlade111',
    accent: 'from-foreground/15 to-foreground/5',
  },
  {
    icon: Code,
    label: 'CodePen',
    handle: 'Girish Lade',
    href: 'https://codepen.io/Girish-Lade-the-looper',
    accent: 'from-emerald-500/15 to-teal-500/10',
  },
  {
    icon: Envelope,
    label: 'Email',
    handle: 'admin@ladestack.in',
    href: 'mailto:admin@ladestack.in',
    accent: 'from-primary/20 to-accent/10',
  },
  {
    icon: Globe,
    label: 'Website',
    handle: 'ladestack.in',
    href: 'https://ladestack.in',
    accent: 'from-violet-500/15 to-fuchsia-500/10',
  },
];

const orbitIcons = [
  { icon: GithubLogo, angle: 0 },
  { icon: LinkedinLogo, angle: 60 },
  { icon: InstagramLogo, angle: 120 },
  { icon: Code, angle: 180 },
  { icon: Globe, angle: 240 },
  { icon: ChatCircleDots, angle: 300 },
];

const expectations = [
  {
    icon: Lightning,
    title: 'Quick replies',
    desc: 'Most messages get a personal response within 24–48 hours on business days. DMs on Instagram or LinkedIn are usually the fastest.',
  },
  {
    icon: MapPin,
    title: 'Based in India',
    desc: 'IST timezone, but working with users across the globe. Async-friendly, flexible hours, no meeting required.',
    liveClock: true,
  },
  {
    icon: Handshake,
    title: 'Open to all',
    desc: 'Bug reports, feature ideas, collabs, kind words, or tough love — every message is read, and the good ideas often ship.',
  },
];

const faqs = [
  {
    q: 'How quickly do you respond?',
    a: 'We typically respond within 24–48 hours on business days. For urgent issues, Instagram or LinkedIn DMs get the fastest reply. Email is best for anything that needs context or attachments.',
  },
  {
    q: 'Do you offer custom enterprise solutions?',
    a: "Yes. If you need a white-label image compression tool, bulk API access, or a custom integration, send us a message and we'll scope it out. We love working on weird, specific problems.",
  },
  {
    q: 'I found a bug — how do I report it?',
    a: "Send a message with a short description of the issue, your browser name and version, your OS, and any error messages you see. Screenshots or short screen recordings are incredibly helpful and shave hours off the fix.",
  },
  {
    q: 'Can I request a new feature?',
    a: "Absolutely — the most-requested features usually ship first. Tell us the problem you're trying to solve rather than the specific solution, and we'll figure out the right tool together.",
  },
  {
    q: 'Is LS Image Compressor hiring or open to collaboration?',
    a: "We're a one-person studio, but always open to conversations with designers, developers, and indie hackers who care about privacy-first tools. Drop us a line if that sounds like you.",
  },
];

function useIndiaClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatClock(date: Date, timezone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

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
      <span className="font-mono text-base font-black" style={GRADIENT_TEXT}>
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
    <div className="rounded-[15px] border border-border/40 bg-card/70 p-5 backdrop-blur-sm transition-colors group-hover:bg-card/85 sm:p-6">
      {children}
    </div>
  </div>
);

const OrbitingGraphic = () => {
  const radius = 46;
  const positions = orbitIcons.map(({ icon, angle }) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      icon,
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
    };
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px]">
      {/* Pulse rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }}
        aria-hidden
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-accent/20"
        animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeOut', delay: 1.3 }}
        aria-hidden
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeOut', delay: 2.6 }}
        aria-hidden
      />

      {/* Static dotted orbit line */}
      <div
        className="absolute inset-[14%] rounded-full border border-dashed border-border/40"
        aria-hidden
      />

      {/* Central gradient tile */}
      <motion.div
        className="absolute inset-[36%] flex items-center justify-center rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <EnvelopeSimple size={40} weight="duotone" className="h-10 w-10 text-primary-foreground sm:h-12 sm:w-12" />
      </motion.div>

      {/* Orbiting icons */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      >
        {positions.map((p, i) => (
          <motion.div
            key={i}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-border/40 bg-card/85 shadow-md backdrop-blur-sm sm:h-12 sm:w-12"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <p.icon size={20} weight="duotone" className="h-5 w-5 text-primary" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const CopyButton = ({ text, label = 'Copy' }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard', { description: text });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all',
        copied
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'border-border/50 bg-background/40 text-foreground/80 hover:border-primary/50 hover:bg-primary/[0.08] hover:text-primary'
      )}
    >
      {copied ? <Check size={12} weight="bold" /> : <Copy size={12} weight="bold" />}
      {copied ? 'Copied' : label}
    </button>
  );
};

const PrimaryChannelCard = ({
  channel,
  delay = 0,
}: {
  channel: (typeof primaryChannels)[number];
  delay?: number;
}) => {
  const Icon = channel.icon;
  return (
    <motion.a
      href={channel.href}
      target={channel.href.startsWith('http') ? '_blank' : undefined}
      rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay }}
      whileHover="hover"
      className="group relative block overflow-hidden rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/55 sm:p-7"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent)',
          filter: 'blur(40px)',
        }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/25"
          variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.1, rotate: 3 } }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Icon size={26} weight="duotone" className="h-6 w-6 text-primary" />
        </motion.div>
        {channel.copyable ? (
          <CopyButton text={channel.handle} label="Copy" />
        ) : (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-background/40 text-muted-foreground transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
            <ArrowUpRight size={14} weight="bold" />
          </span>
        )}
      </div>

      <h3 className="relative mt-5 text-base font-bold tracking-tight">{channel.title}</h3>
      <p className="relative mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
        {channel.desc}
      </p>
      <p className="relative mt-3 truncate font-mono text-[12px] font-semibold text-foreground/80 transition-colors group-hover:text-primary">
        {channel.handle}
      </p>
    </motion.a>
  );
};

const SocialProfileCard = ({
  profile,
  delay = 0,
}: {
  profile: (typeof socialProfiles)[number];
  delay?: number;
}) => {
  const Icon = profile.icon;
  return (
    <motion.a
      href={profile.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay }}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/60"
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          'bg-gradient-to-br',
          profile.accent
        )}
        style={{ filter: 'blur(24px)' }}
        aria-hidden
      />

      <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border/40 bg-background/40 transition-transform duration-300 group-hover:scale-110">
        <Icon size={22} weight="duotone" className="h-5 w-5 text-primary" />
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight">{profile.label}</p>
        <p className="truncate text-[12px] text-muted-foreground">{profile.handle}</p>
      </div>
      <ArrowUpRight
        size={14}
        weight="bold"
        className="relative flex-shrink-0 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
      />
    </motion.a>
  );
};

const LiveClockCard = () => {
  const now = useIndiaClock();
  const time = formatClock(now, 'Asia/Kolkata');
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <>
      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
        IST timezone, but working with users across the globe. Async-friendly, flexible
        hours, no meeting required.
      </p>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-2xl font-black tracking-tight tabular-nums sm:text-3xl"
            style={GRADIENT_TEXT}>
            {time}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
            Local time · IST
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          {greeting}
        </div>
      </div>
    </>
  );
};

const Contact = () => {
  const floatingShapes = useMemo(
    () => [
      { size: 220, left: '6%', top: '20%', delay: '0s', duration: '22s', color: 'primary' },
      { size: 170, left: '82%', top: '58%', delay: '-6s', duration: '26s', color: 'accent' },
      { size: 130, left: '72%', top: '14%', delay: '-12s', duration: '20s', color: 'primary' },
      { size: 110, left: '14%', top: '72%', delay: '-8s', duration: '24s', color: 'accent' },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <DocumentTitle {...pageSeo.contact} />
      <Header />

      <main>
        {/* HERO */}
        <section className="relative flex min-h-[85svh] items-center overflow-hidden pt-[calc(3.5rem+env(safe-area-inset-top))] sm:pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-24">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 20%, hsl(var(--primary) / 0.18), transparent),
                radial-gradient(ellipse 60% 40% at 80% 60%, hsl(var(--accent) / 0.14), transparent),
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
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr,1fr] lg:gap-16">
              {/* Text */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1 text-[11px] font-medium text-foreground sm:text-xs"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Available for collaboration
                </motion.div>

                <motion.h1
                  className="text-fluid-hero font-extrabold tracking-tight text-balance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                >
                  Let&apos;s start a{' '}
                  <span style={GRADIENT_TEXT}>conversation</span>
                </motion.h1>

                <motion.p
                  className="mx-auto mt-4 max-w-xl text-fluid-body text-muted-foreground text-pretty lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  Questions, feedback, or just want to say hi? Pick the channel that suits
                  you best — every message is read, and the good ones usually turn into
                  features.
                </motion.p>

                <motion.div
                  className="mt-7 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <PrimaryCTA href="mailto:admin@ladestack.in" size="md">
                    <PaperPlaneTiltIcon />
                    Send an email
                  </PrimaryCTA>
                  <a
                    href="https://github.com/girishlade111"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-border/50 bg-card/60 px-5 text-base font-semibold backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card sm:h-auto sm:py-2.5 sm:text-sm"
                  >
                    <GithubLogo size={16} weight="duotone" />
                    Browse GitHub
                  </a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground lg:justify-start"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Lightning size={12} weight="duotone" className="text-primary" />
                    Replies within 24h
                  </span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={12} weight="duotone" className="text-primary" />
                    Based in India
                  </span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Compass size={12} weight="duotone" className="text-primary" />
                    Worldwide
                  </span>
                </motion.div>
              </div>

              {/* Graphic */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              >
                <OrbitingGraphic />
              </motion.div>
            </div>
          </div>
        </section>

        {SECTION_DIVIDER}

        {/* 01 — PRIMARY CHANNELS */}
        <section id="primary-channels" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="01"
            title="Primary channels"
            subtitle="Three direct lines. The email is the most reliable — the others are great for quick or public conversations."
          />

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {primaryChannels.map((channel, i) => (
              <PrimaryChannelCard key={channel.title} channel={channel} delay={i * 0.08} />
            ))}
          </div>
        </section>

        {SECTION_DIVIDER}

        {/* 02 — AROUND THE WEB */}
        <section id="around-the-web" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="02"
            title="Around the web"
            subtitle="Catch the same conversation on the platforms you already use. Each card has a unique hover glow."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpStagger}
            className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
          >
            {socialProfiles.map((profile, i) => (
              <motion.div key={profile.label} variants={fadeUp}>
                <SocialProfileCard profile={profile} delay={i * 0.04} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {SECTION_DIVIDER}

        {/* 03 — WHAT TO EXPECT */}
        <section id="what-to-expect" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="03"
            title="What to expect"
            subtitle="A short, honest summary of how we work — no surprises, no corporate runaround."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpStagger}
            className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5"
          >
            {expectations.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={fadeUp} className="h-full">
                  <GradientCard className="h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon size={22} weight="duotone" className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold tracking-tight sm:text-base">
                      {item.title}
                    </h3>
                    {item.liveClock ? (
                      <LiveClockCard />
                    ) : (
                      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    )}
                  </GradientCard>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {SECTION_DIVIDER}

        {/* 04 — FAQ */}
        <section id="faq" className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <SectionHeader
            number="04"
            title="Common questions"
            subtitle="The things people ask most often, answered up front. If yours isn't here, just send a message."
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className={cn(
                    'border-border/30 px-4 sm:px-6',
                    i === faqs.length - 1 && 'border-b-0'
                  )}
                >
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline sm:text-[15px]">
                    <span className="flex items-center gap-3">
                      <span
                        className="font-mono text-[10px] font-bold tabular-nums text-muted-foreground/60"
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {f.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background: `
                  radial-gradient(ellipse 60% 50% at 50% 0%, hsl(var(--primary) / 0.15), transparent),
                  radial-gradient(ellipse 50% 40% at 50% 100%, hsl(var(--accent) / 0.15), transparent)
                `,
              }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <motion.div
                className="absolute right-6 top-6 text-primary/30"
                animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkle size={20} weight="fill" />
              </motion.div>
              <motion.div
                className="absolute bottom-6 left-8 text-primary/40"
                animate={{ rotate: [0, -10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <Sparkle size={14} weight="fill" />
              </motion.div>
            </div>

            <div className="relative">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30">
                <ChatCircleDots size={28} weight="duotone" className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Ready to start a{' '}
                <span style={GRADIENT_TEXT}>conversation?</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                One click to email, one click to GitHub. Pick whichever feels easier — we
                read everything that comes in.
              </p>
              <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <PrimaryCTA href="mailto:admin@ladestack.in">
                  <PaperPlaneTiltIcon />
                  admin@ladestack.in
                </PrimaryCTA>
                <a
                  href="https://github.com/girishlade111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border/50 bg-card/80 px-5 text-base font-semibold backdrop-blur-sm transition-colors hover:border-primary/40 sm:h-auto sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <GithubLogo size={16} weight="duotone" />
                  Open GitHub
                </a>
              </div>
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock size={12} weight="duotone" />
                Typical reply: 24–48 hours · Mon–Fri
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const PaperPlaneTiltIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
  >
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9 22 2z" />
  </svg>
);

export default Contact;
