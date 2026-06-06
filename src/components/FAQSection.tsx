import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Is my data safe? Do you upload my files anywhere?',
    a: 'No. Every tool runs 100% in your browser — image compression, PDF re-rendering, and file renaming all happen on your own device. Your files are never sent to a server, so we literally have no way to see, store, or share them. Closing the tab wipes everything.',
  },
  {
    q: 'What image formats are supported?',
    a: 'You can upload JPEG, PNG, WebP, AVIF, GIF, and BMP. Animated GIFs are accepted but will become static after Canvas re-encoding. For output, choose JPEG, PNG, WebP, or AVIF, or keep the original format. AVIF output needs a modern browser (Chrome 85+, Firefox 113+, or Safari 16+).',
  },
  {
    q: 'How does PDF compression work?',
    a: 'Each page of your PDF is rasterized into a JPEG image, and the result is rebuilt as a brand-new PDF. Three presets control the trade-off: Strong (smallest files, lowest quality), Balanced, and Light (largest files, highest quality). Because the engine is fully client-side, your documents never leave your device.',
  },
  {
    q: 'Will the text in my compressed PDF still be selectable?',
    a: 'No. Since the output is built from full-page JPEG renders, the text layer is replaced with an image. Selectable text, form fields, and search inside the PDF are lost. If you need to keep text selectable, this tool is not a good fit — it is optimized for image-heavy PDFs (scans, presentations, photo books) where visual size matters more than text editing.',
  },
  {
    q: 'How many files can I process at once?',
    a: 'Per tool: up to 50 images per batch (750 MB total), up to 5 PDFs per batch (100 MB each), and up to 100 files per rename batch (200 MB each). For larger runs, just split them into multiple rounds.',
  },
  {
    q: 'Is there a per-file size limit?',
    a: 'Yes — 25 MB per image, 100 MB per PDF, and 200 MB per file in the renamer. Files over the limit are skipped with a toast so the batch keeps going.',
  },
  {
    q: 'Why use WebP or AVIF instead of JPEG?',
    a: 'At the same visual quality, WebP is typically 25–35% smaller than JPEG and AVIF is 40–50% smaller. Both are supported by every modern browser, so the savings translate directly into faster page loads and lower bandwidth.',
  },
  {
    q: 'Will the social media presets stretch or distort my image?',
    a: 'Never. The aspect-ratio lock keeps the proportions intact, and the engine center-crops any mismatch so the result fills the target dimensions exactly (e.g. 1080×1080 for an Instagram post). Nine presets are built in: IG Post, IG Story, LinkedIn Post, LinkedIn Banner, WhatsApp DP, Twitter / X, Facebook Cover, YouTube Thumbnail, and Full HD.',
  },
  {
    q: 'What rename rules are available in Bulk Rename?',
    a: 'Thirteen: Find & Replace (with optional regex and case-insensitive), Add Prefix, Add Suffix, Numbering (with start/pad/separator), Case Change (lower / UPPER / Title / Sentence), Whitespace transform, Remove Characters, Insert Text at Position, Trim / Truncate, Replace Extension, Extract Counter, Reverse, and Date Stamp (insert the file\'s modified date in 7 formats). You can stack any combination and reorder them — a live preview shows the diff before you download.',
  },
  {
    q: 'Do I need to create an account? Is it really free?',
    a: 'No account, no sign-up, no email, no watermarks, no hidden fees. Every tool — image, PDF, and renamer — is fully free and unlimited apart from the per-batch caps documented above.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. The site is fully responsive and works on iOS Safari, Chrome for Android, and any modern mobile browser. You can upload from your camera roll, compress, and download straight to your phone.',
  },
  {
    q: 'Does the output have watermarks or quality loss I can\'t control?',
    a: 'No watermarks are ever added. For images, the quality slider (10–100%) and the AVIF / WebP / JPEG format choice give you direct control over the size/quality trade-off. The "Target File Size" field iteratively lowers the quality until the output fits a KB budget you set. For PDFs, the Strong / Balanced / Light presets are the dial.',
  },
];

const FAQSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="faq" className="container mx-auto mt-12 max-w-2xl px-4 sm:mt-24" ref={ref}>
      <h2
        className={`mb-10 text-center text-3xl font-extrabold tracking-tight sm:text-4xl transition-all duration-700 ${
          visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
        }`}
      >
        Frequently Asked{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-2)))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Questions
        </span>
      </h2>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className={`rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl px-5 transition-all duration-700 hover:border-primary/30 ${
              visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
            }`}
            style={{ animationDelay: visible ? `${i * 80}ms` : '0ms' }}
          >
            <AccordionTrigger className="py-4 text-sm font-semibold hover:no-underline sm:text-base [&[data-state=open]]:text-primary">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQSection;
