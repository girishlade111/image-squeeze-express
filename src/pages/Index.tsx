import { lazy, Suspense, useCallback, useRef } from 'react';
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
import { useImageUpload } from '@/hooks/useImageUpload';
import { useSettings } from '@/hooks/useSettings';
import { useClipboardPaste } from '@/hooks/useClipboardPaste';
import { usePageDropZone } from '@/hooks/usePageDropZone';

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
    isProcessing,
    progress,
    processingText,
    currentItem,
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

  // Provide the source-image dims to the settings panel so aspect ratio can auto-compute
  const sourceDims = files
    .filter((f) => f.originalWidth > 0 && f.originalHeight > 0)
    .map((f) => ({ width: f.originalWidth, height: f.originalHeight }));

  return (
    <div className="min-h-screen bg-background">
      <DocumentTitle title="Free Online Image Compressor — Up to 90% Smaller & Private" />
      <Header />
      <main>
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
            onRemove={removeFile}
            onClearAll={clearAll}
            onProcessAll={() => processAll(settings)}
            onRetry={(id) => processFiles([id], settings)}
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
          <LazySection>
            <FAQSection />
          </LazySection>
          <Footer />
        </Suspense>
      </main>

      <PageDropOverlay visible={isDragging} />
      <ScrollToTop />
    </div>
  );
};

export default Index;
