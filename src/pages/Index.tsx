import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ImageQueue from '@/components/ImageQueue';
import SettingsPanel from '@/components/SettingsPanel';
import LazySection from '@/components/LazySection';
import PageDropOverlay from '@/components/PageDropOverlay';
import ScrollToTop from '@/components/ScrollToTop';
import DocumentTitle from '@/components/DocumentTitle';
import ErrorBoundary from '@/components/ErrorBoundary';
import TrustBar from '@/components/TrustBar';
import ImageInspector from '@/components/ImageInspector';
import MobileActionBar from '@/components/MobileActionBar';
import { useImageUpload, type UploadedFile } from '@/hooks/useImageUpload';
import { useSettings } from '@/hooks/useSettings';
import { useClipboardPaste } from '@/hooks/useClipboardPaste';
import { usePageDropZone } from '@/hooks/usePageDropZone';
import { Lightning } from '@phosphor-icons/react';
import { toast } from 'sonner';

const ResultsSection = lazy(() => import('@/components/ResultsSection'));
const HowItWorks = lazy(() => import('@/components/HowItWorks'));
const FeaturesGrid = lazy(() => import('@/components/FeaturesGrid'));
const FAQSection = lazy(() => import('@/components/FAQSection'));
const Footer = lazy(() => import('@/components/Footer'));

const Index = () => {
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
  } = useImageUpload();

  const {
    settings,
    update: updateSettings,
    resetResize,
    applyQualityPreset,
    resetAll,
    setWidth,
    setHeight,
  } = useSettings();

  const [inspectorFileId, setInspectorFileId] = useState<string | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  // Page-level paste support
  useClipboardPaste({
    onPaste: (files) => addFiles(files),
  });

  // Page-level drag overlay
  const { isDragging } = usePageDropZone({
    onDrop: (files) => addFiles(files),
  });

  const handleAddMore = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Trigger the hidden file input via the upload zone
    const input = document.querySelector<HTMLInputElement>('input[type="file"][accept^="image"]');
    input?.click();
  }, []);

  // Open the inspector for a file by id (looks up the current file)
  const handleInspect = useCallback(
    (id: string) => setInspectorFileId(id),
    []
  );

  // Apply the smart recommendation to the *settings* (so the next batch run
  // uses the suggested format and quality). Toast to confirm.
  const handleApplyRecommendation = useCallback(
    (id: string, format: UploadedFile['metadata'] extends { recommendedFormat: infer F } ? F : never, quality: number) => {
      updateSettings({
        outputFormat: format,
        quality,
        autoOptimize: false,
        qualityPreset: 'custom',
      });
      toast.success(`✨ Settings updated to ${String(format).toUpperCase()} @ ${quality}%`, {
        description: 'Click "Compress" to process all images with these settings.',
      });
      void id;
    },
    [updateSettings]
  );

  // Provide the source-image dims to the settings panel so aspect ratio can auto-compute
  const sourceDims = files
    .filter((f) => f.originalWidth > 0 && f.originalHeight > 0)
    .map((f) => ({ width: f.originalWidth, height: f.originalHeight }));

  const inspectorFile = inspectorFileId
    ? files.find((f) => f.id === inspectorFileId) || null
    : null;

  return (
    <div className="min-h-screen bg-background">
      <DocumentTitle title="Free Online Image Compressor — Up to 90% Smaller & Private" />
      <Header />
      <main>
        <ErrorBoundary label="Image Compressor">
          <div ref={uploadRef} />
          <HeroSection onFilesSelected={addFiles} imageCount={files.length}>
            {hasFiles && (
              <SettingsPanel
                settings={settings}
                files={sourceDims}
                onUpdate={updateSettings}
                onResetResize={resetResize}
                onSetWidth={setWidth}
                onSetHeight={setHeight}
                onApplyPreset={applyQualityPreset}
                onResetAll={resetAll}
              />
            )}
            <ImageQueue
              files={files}
              isProcessing={isProcessing}
              progress={progress}
              processingText={processingText}
              currentItem={currentItem}
              stats={stats}
              onRemove={removeFile}
              onClearAll={clearAll}
              onProcessAll={() => processAll(settings)}
              onRetry={(id) => processFiles([id], settings)}
              onPreviewOne={(id) => previewOne(id, settings)}
              onInspect={handleInspect}
              onAddMore={handleAddMore}
              allDone={allDone}
              readyCount={readyCount}
            />
          </HeroSection>

          {allDone && processedFiles.length > 0 && (
            <Suspense fallback={null}>
              <ResultsSection files={processedFiles} onReset={clearAll} />
            </Suspense>
          )}

          <Suspense fallback={null}>
            <LazySection>
              <HowItWorks />
            </LazySection>
            <LazySection>
              <FeaturesGrid />
            </LazySection>
            <TrustBar />
            <LazySection>
              <FAQSection />
            </LazySection>
            <Footer />
          </Suspense>
        </ErrorBoundary>
      </main>

      <ImageInspector
        file={inspectorFile}
        open={!!inspectorFile}
        onOpenChange={(o) => !o && setInspectorFileId(null)}
        onApplyRecommendation={handleApplyRecommendation}
        onPreviewOne={(id) => previewOne(id, settings)}
      />

      <PageDropOverlay visible={isDragging} />
      <ScrollToTop />
      <MobileActionBar
        visible={hasFiles && !allDone && readyCount > 0}
        loading={isProcessing}
        loadingText="Compressing…"
        ctaLabel={`Compress ${readyCount} image${readyCount !== 1 ? 's' : ''}`}
        ctaIcon={Lightning}
        onCta={() => processAll(settings)}
      />
    </div>
  );
};

export default Index;
