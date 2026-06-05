import { useCallback, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PdfUploadZone from '@/components/PdfUploadZone';
import PdfQueue from '@/components/PdfQueue';
import PdfSettingsPanel from '@/components/PdfSettingsPanel';
import PdfResultsSection from '@/components/PdfResultsSection';
import { usePdfUpload } from '@/hooks/usePdfUpload';
import { useClipboardPaste } from '@/hooks/useClipboardPaste';
import { usePageDropZone } from '@/hooks/usePageDropZone';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield } from 'lucide-react';
import type { PdfQualityPreset } from '@/utils/pdfProcessor';
import { PDF_QUALITY_PRESETS } from '@/utils/pdfProcessor';

const CompressPdf = () => {
  const {
    files,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    processFiles,
    retryFile,
    isProcessing,
    progress,
    processingText,
    currentItem,
    hasFiles,
    allDone,
    processedFiles,
    readyCount,
  } = usePdfUpload();

  const [preset, setPreset] = useState<PdfQualityPreset>('medium');
  const [quality, setQuality] = useState<number>(PDF_QUALITY_PRESETS.medium.quality);
  const uploadRef = useRef<HTMLDivElement>(null);

  useClipboardPaste({
    onPaste: (pasted) => {
      // Filter to PDFs only when pasting on this page
      const pdfs = pasted.filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (pdfs.length > 0) addFiles(pdfs);
    },
  });

  const { isDragging } = usePageDropZone({
    onDrop: (dropped) => {
      const pdfs = dropped.filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (pdfs.length > 0) addFiles(pdfs);
    },
  });

  const handleAddMore = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = document.querySelector<HTMLInputElement>('input[type="file"][accept*="pdf"]');
    input?.click();
  }, []);

  const settings = { quality, scale: PDF_QUALITY_PRESETS.medium.scale, maxWidth: PDF_QUALITY_PRESETS.medium.maxWidth };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section
          className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-12 pb-12"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 20%, hsl(var(--primary) / 0.18), transparent),
                radial-gradient(ellipse 60% 40% at 80% 60%, hsl(var(--accent) / 0.12), transparent),
                radial-gradient(ellipse 50% 50% at 20% 80%, hsl(var(--primary) / 0.1), transparent)
              `,
            }}
            aria-hidden
          />

          <div className="container relative mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <motion.h1
                className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Compress PDFs{' '}
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Up to 90%
                </span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Smaller & Free
              </motion.h1>

              <motion.p
                className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Shrink PDF files right in your browser. We re-render every page as a
                compressed image and rebuild the document — no uploads, no login.
              </motion.p>

              <motion.div
                className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {[
                  { emoji: '🔒', label: '100% Private' },
                  { emoji: '⚡', label: 'Runs Locally' },
                  { emoji: '🆓', label: 'Free Forever' },
                  { emoji: '📦', label: 'Batch (5)' },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    <span className="text-xs" aria-hidden>
                      {badge.emoji}
                    </span>
                    {badge.label}
                  </div>
                ))}
              </motion.div>

              <motion.div
                className="mx-auto mt-6 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div ref={uploadRef}>
                  <PdfUploadZone onFilesSelected={addFiles} pdfCount={files.length} />
                </div>
              </motion.div>

              {hasFiles && (
                <PdfSettingsPanel
                  preset={preset}
                  onPresetChange={setPreset}
                  quality={quality}
                  onQualityChange={setQuality}
                />
              )}

              <PdfQueue
                files={files}
                isProcessing={isProcessing}
                progress={progress}
                processingText={processingText}
                currentItem={currentItem}
                onRemove={removeFile}
                onClearAll={clearAll}
                onProcessAll={() => processAll(settings)}
                onRetry={(id) => processFiles([id], settings)}
                onAddMore={handleAddMore}
                allDone={allDone}
                readyCount={readyCount}
              />
            </div>
          </div>
        </section>

        {allDone && processedFiles.length > 0 && (
          <PdfResultsSection files={processedFiles} onReset={clearAll} />
        )}

        <HowItWorksPdf />
        <FeaturesPdf />
        <FaqPdf />
        <Footer />
      </main>

      <PageDropOverlayPdf visible={isDragging} />
    </div>
  );
};

const HowItWorksPdf = () => {
  const steps = [
    {
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      title: '1. Upload PDFs',
      desc: 'Drag & drop up to 5 files. Nothing leaves your device.',
    },
    {
      icon: <Zap className="h-4 w-4 text-primary" />,
      title: '2. Pick a level',
      desc: 'Choose Strong, Balanced, or Light. Adjust the slider for fine control.',
    },
    {
      icon: <Shield className="h-4 w-4 text-primary" />,
      title: '3. Compress & save',
      desc: 'We rebuild each PDF with re-rendered pages — you get a smaller file.',
    },
  ];
  return (
    <section className="container mx-auto mt-20 px-4">
      <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
        How it works
      </h2>
      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-border/40 bg-card/60 p-4 text-center"
          >
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              {s.icon}
            </div>
            <p className="text-sm font-semibold">{s.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const FeaturesPdf = () => {
  const features = [
    { emoji: '🔒', title: 'Private', desc: 'Files never leave your browser. No server uploads.' },
    { emoji: '⚡', title: 'Fast', desc: 'Re-renders each page in parallel-friendly chunks.' },
    { emoji: '📦', title: 'Batch', desc: 'Compress up to 5 PDFs at once. ZIP download included.' },
    { emoji: '🎚️', title: 'Three levels', desc: 'Strong, Balanced, or Light — pick what fits.' },
  ];
  return (
    <section className="container mx-auto mt-16 px-4">
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border/40 bg-card/60 p-3 text-center"
          >
            <div className="text-2xl">{f.emoji}</div>
            <p className="mt-1 text-xs font-semibold">{f.title}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const FaqPdf = () => {
  const faqs = [
    {
      q: 'How does browser-based PDF compression work?',
      a: 'We parse your PDF, render each page to a canvas, and re-encode it as a JPEG. Then we rebuild the PDF from those images. This reliably shrinks image-heavy PDFs while keeping them readable.',
    },
    {
      q: 'Will my text remain selectable?',
      a: 'No — pages become image-only PDFs after compression. If you need searchable text, use a server-side tool or a different compression strategy.',
    },
    {
      q: 'Is there a file size limit?',
      a: 'Each PDF can be up to 100 MB, and you can process up to 5 PDFs at a time. Larger files take longer to render.',
    },
    {
      q: 'Are my files uploaded anywhere?',
      a: 'No. Everything runs locally in your browser using pdf.js and pdf-lib. Closing the tab is the only "delete" you need.',
    },
  ];
  return (
    <section className="container mx-auto mt-16 max-w-2xl px-4 pb-12">
      <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
        PDF Compression FAQ
      </h2>
      <div className="mt-6 space-y-2">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-border/40 bg-card/60 p-3 open:bg-card/80"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
              {f.q}
              <span className="ml-2 text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-xs text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

// Inline import to avoid creating a new component file for this thin wrapper
import PageDropOverlay from '@/components/PageDropOverlay';
const PageDropOverlayPdf = ({ visible }: { visible: boolean }) => (
  <PageDropOverlay visible={visible} />
);

export default CompressPdf;
