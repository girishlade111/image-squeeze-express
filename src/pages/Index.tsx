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
import { useImageProcessor } from '@/hooks/useImageProcessor';

const Index = () => {
  const { files, addFiles, removeFile, clearAll: clearUploads } = useImageUpload();
  const {
    images,
    settings,
    setSettings,
    addImages,
    removeImage,
    clearAll,
    processAll,
    resetAll,
    isProcessing,
    progress,
    hasImages,
    allDone,
    processedImages,
  } = useImageProcessor();

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onFilesSelected={addFiles} imageCount={files.length}>
          <ImageQueue files={files} onRemove={removeFile} onClearAll={clearUploads} />
        </HeroSection>

        {hasImages && (
          <SettingsPanel
            settings={settings}
            setSettings={setSettings}
            totalOriginalSize={totalOriginalSize}
          />
        )}

        {allDone && processedImages.length > 0 && (
          <ResultsSection images={images} onReset={resetAll} />
        )}

        <SocialPresetsGrid setSettings={setSettings} />
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