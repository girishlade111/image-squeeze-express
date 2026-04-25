import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Is my image data safe?',
    a: 'Absolutely. All processing happens 100% in your browser using JavaScript. Your images are never uploaded to any server — we literally have zero access to your files. Once you close the tab, everything is gone.',
  },
  {
    q: 'What formats are supported?',
    a: 'You can upload JPG, PNG, WebP, GIF, BMP, and AVIF images. For output, you can choose between JPEG, PNG, or WebP — or keep the original format.',
  },
  {
    q: 'Is there a file size limit?',
    a: 'The free version supports images up to 25 MB each. Larger files will still work but may be slower on older devices since all processing happens locally in your browser.',
  },
  {
    q: 'Why use WebP format?',
    a: 'WebP images are approximately 30% smaller than JPEG at the same visual quality. This means faster website load times, better Core Web Vitals scores, and lower bandwidth usage — all without sacrificing image quality.',
  },
  {
    q: 'How many images can I compress at once?',
    a: 'The free version supports up to 10 images in a single batch. The upcoming Pro version will support 50+ images at once with priority processing speed.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. ImageSqueeze is completely free and requires no login, no registration, and no email. Just open the page and start compressing.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes! ImageSqueeze is fully responsive and works on any modern mobile browser. You can upload images from your camera roll, compress them, and download — all from your phone.',
  },
  {
    q: 'What is the quality difference between settings?',
    a: 'At 80–100% quality, images look virtually identical to the original with modest size savings. At 50–79%, you get excellent web-quality images with significant compression. Below 50%, compression is aggressive — great for thumbnails or previews where file size matters most.',
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
    <section id="faq" className="container mx-auto mt-24 max-w-2xl px-4" ref={ref}>
      <h2
        className={`mb-10 text-center text-3xl font-extrabold tracking-tight sm:text-4xl transition-all duration-700 ${
          visible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
        }`}
      >
        Frequently Asked{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #4F46E5, #0D9488)',
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
