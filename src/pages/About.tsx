import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Zap, Globe, Users, Heart, Code } from 'lucide-react';

const values = [
  { icon: Shield, title: 'Privacy First', desc: 'Your images never leave your browser. Zero server uploads, zero tracking, zero data collection. What happens in your browser stays in your browser.' },
  { icon: Zap, title: 'Speed Matters', desc: 'We leverage Web Workers and Canvas API for instant processing. No waiting for server round-trips — results appear in milliseconds.' },
  { icon: Globe, title: 'Accessible to All', desc: 'Free forever, no accounts, no paywalls. ImageSqueeze works on any modern browser across desktop, tablet, and mobile devices.' },
  { icon: Users, title: 'Built for Everyone', desc: 'Whether you\'re a photographer, social media manager, developer, or blogger — ImageSqueeze handles your image optimization needs.' },
  { icon: Heart, title: 'Open & Transparent', desc: 'We believe in transparency. Our compression algorithms use industry-standard libraries with no hidden quality degradation.' },
  { icon: Code, title: 'Modern Technology', desc: 'Built with React, TypeScript, and Tailwind CSS. We use browser-image-compression and Canvas API for reliable, high-quality output.' },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 pt-24 pb-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          About{' '}
          <span style={{ background: 'linear-gradient(135deg, #4F46E5, #0D9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ImageSqueeze
          </span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          ImageSqueeze is a <strong className="text-foreground">free, privacy-focused image optimization tool</strong> that runs entirely in your browser. We built it because we were tired of uploading sensitive images to random servers just to compress them.
        </p>

        {/* Mission */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Our Mission</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We believe image optimization should be <strong className="text-foreground">free, instant, and private</strong>. Every day, millions of people upload their personal photos, business assets, and confidential documents to online compression tools — trusting unknown servers with their data.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            ImageSqueeze eliminates that trust problem entirely. By processing everything client-side using JavaScript's Canvas API and Web Workers, your images <strong className="text-foreground">never leave your device</strong>. There's no server to hack, no database to breach, and no data to sell.
          </p>
        </section>

        {/* Values */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Our Values</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-3 text-sm font-bold">{v.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What we do */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">What ImageSqueeze Does</h2>
          <ul className="mt-6 space-y-4 text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-1 text-primary font-bold">•</span>
              <span><strong className="text-foreground">Compresses images up to 90%</strong> — using advanced algorithms that maintain visual quality while dramatically reducing file size.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-primary font-bold">•</span>
              <span><strong className="text-foreground">Resizes for any platform</strong> — with one-click presets for Instagram, LinkedIn, Facebook, Twitter/X, YouTube, and WhatsApp.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-primary font-bold">•</span>
              <span><strong className="text-foreground">Converts between formats</strong> — transform JPG, PNG, and other formats to WebP for 30% smaller file sizes at the same quality.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 text-primary font-bold">•</span>
              <span><strong className="text-foreground">Batch processes up to 50 images at once</strong> — with real-time progress tracking and one-click ZIP download.</span>
            </li>
          </ul>
        </section>

        {/* Team */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Built by Lade Stack</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            ImageSqueeze is created and maintained by{' '}
            <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
              Lade Stack
            </a>
            , a team passionate about building useful, privacy-respecting web tools. We believe the best software is the kind that respects its users — no dark patterns, no data harvesting, no unnecessary complexity.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Have questions, feedback, or feature requests? We'd love to hear from you. Reach out via our{' '}
            <a href="/contact" className="font-semibold text-primary hover:underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
