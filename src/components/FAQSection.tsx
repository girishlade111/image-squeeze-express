import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Is my image data safe?',
    a: 'Yes. All processing happens 100% in your browser. Your images are never uploaded to any server. We have zero access to your images.',
  },
  {
    q: 'What image formats are supported?',
    a: 'You can upload JPG, PNG, WebP, GIF, BMP, and AVIF. Output formats: JPG, PNG, WebP.',
  },
  {
    q: 'Is there a file size limit?',
    a: 'Free version supports images up to 25MB each. Larger files may slow down older devices.',
  },
  {
    q: 'Why should I use WebP?',
    a: 'WebP images are ~30% smaller than JPEG at the same visual quality, improving website load speed and Core Web Vitals score.',
  },
  {
    q: 'How many images can I compress at once?',
    a: 'Free version supports up to 10 images. Pro version supports 50+ images.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. ImageSqueeze is completely free, requires no login, no registration.',
  },
];

const FAQSection = () => (
  <section id="faq" className="container mx-auto mt-20 max-w-2xl px-4">
    <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
      Frequently Asked <span className="gradient-text">Questions</span>
    </h2>
    <Accordion type="single" collapsible className="space-y-2">
      {faqs.map((f, i) => (
        <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-2xl border-border/50 px-4">
          <AccordionTrigger className="text-sm font-medium hover:no-underline sm:text-base">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
);

export default FAQSection;
