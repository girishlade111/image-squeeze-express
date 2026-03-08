import { lazy, Suspense, useMemo } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ImageQueue from '@/components/ImageQueue';
import SettingsPanel from '@/components/SettingsPanel';
import LazySection from '@/components/LazySection';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useSettings } from '@/hooks/useSettings';

const ResultsSection = lazy(() => import('@/components/ResultsSection'));
const SocialPresetsGrid = lazy(() => import('@/components/SocialPresetsGrid'));
const HowItWorks = lazy(() => import('@/components/HowItWorks'));
const FeaturesGrid = lazy(() => import('@/components/FeaturesGrid'));
const ProTeaser = lazy(() => import('@/components/ProTeaser'));
const FAQSection = lazy(() => import('@/components/FAQSection'));
const Footer = lazy(() => import('@/components/Footer'));

const Index = () => {
  const {
    files,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    isProcessing,
    progress,
    processingText,
    hasFiles,
    allDone,
    processedFiles,
  } = useImageUpload();
  const { settings, update: updateSettings, resetResize } = useSettings();

  const handleProcessAll = useMemo(() => () => processAll(settings), [processAll, settings]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onFilesSelected={addFiles} imageCount={files.length}>
          {hasFiles && (
            <SettingsPanel settings={settings} onUpdate={updateSettings} onResetResize={resetResize} />
          )}
          <ImageQueue
            files={files}
            isProcessing={isProcessing}
            progress={progress}
            processingText={processingText}
            onRemove={removeFile}
            onClearAll={clearAll}
            onProcessAll={handleProcessAll}
            allDone={allDone}
          />
        </HeroSection>

        {allDone && processedFiles.length > 0 && (
          <Suspense fallback={null}>
            <ResultsSection files={processedFiles} onReset={clearAll} />
          </Suspense>
        )}

        <Suspense fallback={null}>
          <LazySection>
            <SocialPresetsGrid onSelectPreset={(w, h) => updateSettings({ width: w, height: h, selectedPreset: null })} />
          </LazySection>
          <LazySection>
            <HowItWorks />
          </LazySection>
          <LazySection>
            <FeaturesGrid />
          </LazySection>
          <LazySection>
            <ProTeaser />
          </LazySection>
          <LazySection>
            <FAQSection />
          </LazySection>
          <Footer />
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
