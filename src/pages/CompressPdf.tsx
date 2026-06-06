import { useCallback, useRef, useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHero from '@/components/ToolHero';
import PdfUploadZone from '@/components/PdfUploadZone';
import PdfQueue from '@/components/PdfQueue';
import PdfSettingsPanel from '@/components/PdfSettingsPanel';
import PdfResultsSection from '@/components/PdfResultsSection';
import PdfInspector from '@/components/PdfInspector';
import ScrollToTop from '@/components/ScrollToTop';
import DocumentTitle from '@/components/DocumentTitle';
import ErrorBoundary from '@/components/ErrorBoundary';
import { usePdfUpload } from '@/hooks/usePdfUpload';
import { useClipboardPaste } from '@/hooks/useClipboardPaste';
import { usePageDropZone } from '@/hooks/usePageDropZone';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';
import type {
  PdfProcessSettings,
  PdfQualityPreset,
} from '@/utils/pdfProcessor';
import { PDF_QUALITY_PRESETS } from '@/utils/pdfProcessor';

const DEFAULT_PDF_SETTINGS: PdfProcessSettings = {
  ...PDF_QUALITY_PRESETS.medium,
  targetSizeKB: null,
  grayscale: false,
  stripMetadata: false,
  dpi: null,
  filenamePattern: '{name}_compressed.pdf',
  pageRange: null,
};

const CompressPdf = () => {
  const {
    files,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    processFiles,
    retryFile,
    previewOne,
    isProcessing,
    progress,
    processingText,
    currentItem,
    stats,
    hasFiles,
    allDone,
    processedFiles,
    readyCount,
  } = usePdfUpload();

  const [preset, setPreset] = useState<PdfQualityPreset>('medium');
  const [quality, setQuality] = useState<number>(DEFAULT_PDF_SETTINGS.quality);
  const [settings, setSettings] = useState<PdfProcessSettings>(DEFAULT_PDF_SETTINGS);
  const [inspectorId, setInspectorId] = useState<string | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  useClipboardPaste({
    onPaste: (pasted) => {
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

  const buildSettings = useCallback((): PdfProcessSettings => {
    const presetCfg = preset !== 'custom' ? PDF_QUALITY_PRESETS[preset] : null;
    return {
      ...presetCfg,
      ...settings,
      quality,
    };
  }, [preset, settings, quality]);

  const handleProcessAll = useCallback(() => {
    processAll(buildSettings());
  }, [processAll, buildSettings]);

  const handleRetry = useCallback(
    (id: string) => processFiles([id], buildSettings()),
    [processFiles, buildSettings]
  );

  const handleInspect = useCallback((id: string) => setInspectorId(id), []);
  const handlePreviewOne = useCallback(
    (id: string) => previewOne(id, buildSettings()),
    [previewOne, buildSettings]
  );

  const handleApplyRecommendation = useCallback(
    (id: string, recPreset: PdfQualityPreset, recQuality: number) => {
      const recCfg = recPreset !== 'custom' ? PDF_QUALITY_PRESETS[recPreset] : null;
      setPreset(recPreset);
      setQuality(recQuality);
      if (recCfg) {
        setSettings((prev) => ({
          ...prev,
          ...recCfg,
          quality: recQuality,
        }));
      }
      const file = files.find((f) => f.id === id);
      if (file) {
        toast.success(`✨ Applied recommendation to ${file.name}`, {
          description: `${recPreset.toUpperCase()} · q=${Math.round(recQuality * 100)}%`,
        });
      }
    },
    [files]
  );

  const handleDownload = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file?.processedFile) {
        saveAs(file.processedFile, file.processedFile.name);
        toast.success(`Downloading ${file.processedFile.name}`);
      }
    },
    [files]
  );

  const inspectorFile = useMemo(
    () => files.find((f) => f.id === inspectorId) ?? null,
    [files, inspectorId]
  );

  return (
    <div className="min-h-screen bg-background">
      <DocumentTitle title="Compress PDF — Up to 90% Smaller, Free & Private" />
      <Header />
      <main>
        <ToolHero
          prefix="Compress PDFs"
          highlight="Up to 90%"
          suffix="Smaller & Free"
          subhead="Shrink PDF files right in your browser. We re-render every page as a compressed image and rebuild the document — no uploads, no login, no watermarks."
          badges={[
            { emoji: '🔒', label: '100% Private' },
            { emoji: '⚡', label: 'Runs Locally' },
            { emoji: '🆓', label: 'Free Forever' },
            { emoji: '📦', label: 'Batch (5)' },
          ]}
        >
          <div ref={uploadRef}>
            <PdfUploadZone onFilesSelected={addFiles} pdfCount={files.length} />
          </div>
          {hasFiles && (
            <ErrorBoundary label="PDF settings">
              <PdfSettingsPanel
                preset={preset}
                onPresetChange={setPreset}
                quality={quality}
                onQualityChange={setQuality}
                settings={settings}
                onSettingsChange={setSettings}
              />
            </ErrorBoundary>
          )}
          <ErrorBoundary label="PDF queue">
            <PdfQueue
              files={files}
              isProcessing={isProcessing}
              progress={progress}
              processingText={processingText}
              currentItem={currentItem}
              onRemove={removeFile}
              onClearAll={clearAll}
              onProcessAll={handleProcessAll}
              onRetry={handleRetry}
              onAddMore={handleAddMore}
              allDone={allDone}
              readyCount={readyCount}
              onInspect={handleInspect}
              onApplyRecommendation={handleApplyRecommendation}
              stats={stats}
            />
          </ErrorBoundary>
        </ToolHero>

        {allDone && processedFiles.length > 0 && (
          <PdfResultsSection files={processedFiles} onReset={clearAll} />
        )}

        <HowItWorksPdf />
        <FeaturesPdf />
        <FaqPdf />
        <Footer />
      </main>

      <PageDropOverlayPdf visible={isDragging} />
      <ScrollToTop />

      <PdfInspector
        file={inspectorFile}
        open={inspectorId !== null}
        onOpenChange={(o) => !o && setInspectorId(null)}
        onApplyRecommendation={handleApplyRecommendation}
        onPreviewOne={handlePreviewOne}
        onDownload={handleDownload}
        getSettings={buildSettings}
      />
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
      desc: 'Choose Strong, Balanced, or Light. Adjust DPI, target size, B&W, and more.',
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
    { emoji: '🎯', title: 'Target size', desc: 'Iteratively reduce quality/DPI to hit a KB target.' },
    { emoji: '🔍', title: 'Inspector', desc: 'First-page thumbnail, smart recommendation, metadata.' },
  ];
  return (
    <section className="container mx-auto mt-16 px-4">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
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
      q: 'What is the "target size" feature?',
      a: 'When set, the engine iteratively reduces JPEG quality and DPI (down to safe minimums) until the output fits the target size in KB. Useful for email attachment limits.',
    },
    {
      q: 'Can I compress only specific pages?',
      a: 'Yes — use the page range inputs in the Advanced section to compress a subset of pages (e.g. 1-5 or 12-20).',
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

import PageDropOverlay from '@/components/PageDropOverlay';
const PageDropOverlayPdf = ({ visible }: { visible: boolean }) => (
  <PageDropOverlay visible={visible} />
);

export default CompressPdf;
