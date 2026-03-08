import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ImageQueue from '@/components/ImageQueue';
import SettingsPanel from '@/components/SettingsPanel';
import ResultsSection from '@/components/ResultsSection';
import SocialPresetsGrid from '@/components/SocialPresetsGrid';
import HowItWorks from '@/components/HowItWorks';
import FeaturesGrid from '@/components/FeaturesGrid';
import ProTeaser from '@/components/ProTeaser';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useSettings } from '@/hooks/useSettings';

const Index = () => {
  const {
    files,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    isProcessing,
    progress,
    hasFiles,
    allDone,
    processedFiles,
  } = useImageUpload();
  const { settings, update: updateSettings, resetResize } = useSettings();

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
            onRemove={removeFile}
            onClearAll={clearAll}
            onProcessAll={() => processAll(settings)}
            allDone={allDone}
          />
        </HeroSection>

        {allDone && processedFiles.length > 0 && (
          <ResultsSection files={processedFiles} onReset={clearAll} />
        )}

        <SocialPresetsGrid onSelectPreset={(w, h) => updateSettings({ width: w, height: h, selectedPreset: null })} />
        <HowItWorks />
        <FeaturesGrid />
        <ProTeaser />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;