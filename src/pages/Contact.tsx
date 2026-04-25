import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Globe, Instagram, Linkedin, Github, CodepenIcon, MessageSquare, Clock, MapPin } from 'lucide-react';

const contactMethods = [
  {
    icon: Globe,
    title: 'Website',
    desc: 'Visit our main website for more tools and resources.',
    link: 'https://ladestack.in',
    linkText: 'ladestack.in',
    external: true,
  },
  {
    icon: Mail,
    title: 'Email',
    desc: 'For business inquiries, partnerships, or detailed support requests.',
    link: 'mailto:admin@ladestack.in',
    linkText: 'admin@ladestack.in',
    external: false,
  },
  {
    icon: Github,
    title: 'GitHub',
    desc: 'Check out our open source projects and contributions.',
    link: 'https://github.com/girishlade111',
    linkText: 'girishlade111',
    external: true,
  },
];

const socialProfiles = [
  { icon: Instagram, href: 'https://www.instagram.com/girish_lade_/', label: 'Instagram', handle: '@girish_lade_' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/girish-lade-075bba201/', label: 'LinkedIn', handle: 'Girish Lade' },
  { icon: Github, href: 'https://github.com/girishlade111', label: 'GitHub', handle: 'girishlade111' },
  { icon: CodepenIcon, href: 'https://codepen.io/Girish-Lade-the-looper', label: 'CodePen', handle: 'Girish Lade' },
  { icon: Mail, href: 'mailto:admin@ladestack.in', label: 'Email', handle: 'admin@ladestack.in' },
  { icon: Globe, href: 'https://ladestack.in', label: 'Website', handle: 'ladestack.in' },
];

const faqs = [
  { q: 'How quickly do you respond?', a: 'We typically respond within 24–48 hours on business days.' },
  { q: 'Do you offer custom enterprise solutions?', a: 'Yes! If you need a white-label image compression tool or API integration, reach out via email and we\'ll discuss your requirements.' },
  { q: 'I found a bug — how do I report it?', a: 'Please reach out via Instagram, LinkedIn, or email with a description of the issue, your browser name/version, and any error messages you see. Screenshots are very helpful!' },
  { q: 'Can I request a new feature?', a: 'Absolutely! We love hearing from users. Send us your ideas via any of the contact methods above.' },
];

const Contact = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 pt-24 pb-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-black tracking-tight">
          Get in{' '}
          <span style={{ background: 'linear-gradient(135deg, #4F46E5, #0D9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Touch
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Have a question, feedback, or feature request? We'd love to hear from you. Choose the best way to reach us below.
        </p>

        {/* Contact cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {contactMethods.map((m) => (
            <a
              key={m.title}
              href={m.link}
              target={m.external ? '_blank' : undefined}
              rel={m.external ? 'noopener noreferrer' : undefined}
              className="group rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 text-center transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <m.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-sm font-bold">{m.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              <p className="mt-3 text-sm font-semibold text-primary">{m.linkText}</p>
            </a>
          ))}
        </div>

        {/* Social profiles */}
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight">Connect on Social Media</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {socialProfiles.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold">{s.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{s.handle}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Info section */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold">Response Time</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We aim to respond to all inquiries within <strong className="text-foreground">24–48 hours</strong> during business days. For urgent issues, Instagram or LinkedIn DMs tend to get the fastest response.
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold">Location</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Lade Stack is based in <strong className="text-foreground">India</strong>. We work with clients and users worldwide. Our team operates across multiple time zones.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Common Questions</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
                <h3 className="text-sm font-bold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl border border-primary/20 bg-primary/[0.04] p-8 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-xl font-bold">We Value Your Feedback</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
            ImageSqueeze is built for you. Every feature request, bug report, and suggestion helps us make the tool better for everyone. Don't hesitate to reach out!
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;
