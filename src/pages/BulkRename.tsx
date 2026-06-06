import { useCallback, useRef, lazy, Suspense } from 'react';
import Header from '@/components/Header';
import ToolHero from '@/components/ToolHero';
import FileRenameUploadZone from '@/components/FileRenameUploadZone';
import { BlockSkeleton, CardSkeleton } from '@/components/Skeleton';
import { useFileRename } from '@/hooks/useFileRename';
import { useClipboardPaste } from '@/hooks/useClipboardPaste';
import { usePageDropZone } from '@/hooks/usePageDropZone';
import {
  ShieldCheck,
  Eye,
  Gift,
  Stack,
  Sparkle,
  DownloadSimple,
  TextAUnderline,
  Hash,
  TextT,
  TextAa,
  CalendarBlank,
  Scissors,
  ArrowsHorizontal,
  ArrowsClockwise,
  ArrowsLeftRight,
  Stamp,
  FileArchive,
  Shield,
  MagnifyingGlass,
} from '@phosphor-icons/react';

const Footer = lazy(() => import('@/components/Footer'));
const FileRenameRuleBuilder = lazy(() => import('@/components/FileRenameRuleBuilder'));
const FileRenamePreviewList = lazy(() => import('@/components/FileRenamePreviewList'));
const PageDropOverlay = lazy(() => import('@/components/PageDropOverlay'));
const ScrollToTop = lazy(() => import('@/components/ScrollToTop'));
const DocumentTitle = lazy(() => import('@/components/DocumentTitle'));
const MobileActionBar = lazy(() => import('@/components/MobileActionBar'));

const BulkRename = () => {
  const {
    files,
    rules,
    plan,
    changedCount,
    totalSize,
    isZipping,
    zipProgress,
    addFiles,
    removeFile,
    clearAll,
    addRule,
    updateRule,
    removeRule,
    moveRule,
    resetRules,
    downloadZip,
    formatBytes,
  } = useFileRename();

  const uploadRef = useRef<HTMLDivElement>(null);

  useClipboardPaste({ onPaste: (pasted) => addFiles(pasted) });

  const { isDragging } = usePageDropZone({
    onDrop: (dropped) => addFiles(dropped),
  });

  const handleAddMore = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = document.querySelector<HTMLInputElement>('input[type="file"]:not([accept])');
    input?.click();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <DocumentTitle title="Bulk File Rename — 13 Rule Types, Live Preview & ZIP" />
      </Suspense>
      <Header />
      <main>
        <ToolHero
          prefix="Bulk File"
          highlight="Rename"
          suffix="in Seconds"
          subhead="Rename up to 100 files at once with a live preview. Combine find & replace, prefix/suffix, sequential numbering, case changes, date stamps, trim, insert-at, counter extraction, reverse, and more — all in your browser."
          badges={[
            { icon: ShieldCheck, label: '100% Private' },
            { icon: Eye, label: 'Live Preview' },
            { icon: Gift, label: 'Free Forever' },
            { icon: Stack, label: 'ZIP Download' },
          ]}
        >
          <div ref={uploadRef}>
            <FileRenameUploadZone onFilesSelected={addFiles} fileCount={files.length} />
          </div>
          {files.length > 0 && (
            <Suspense fallback={<BlockSkeleton height={400} />}>
              <FileRenameRuleBuilder
                rules={rules}
                onAdd={addRule}
                onUpdate={updateRule}
                onRemove={removeRule}
                onMove={moveRule}
                onReset={resetRules}
              />
            </Suspense>
          )}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-3">
                <CardSkeleton height={100} />
                <CardSkeleton height={100} />
              </div>
            }
          >
            <FileRenamePreviewList
              files={files}
              plan={plan}
              changedCount={changedCount}
              totalSize={totalSize}
              formatBytes={formatBytes}
              isZipping={isZipping}
              zipProgress={zipProgress}
              onRemove={removeFile}
              onClearAll={clearAll}
              onAddMore={handleAddMore}
              onDownload={downloadZip}
              onReset={resetRules}
            />
          </Suspense>
        </ToolHero>

        {files.length > 0 && <StatsRow plan={plan} totalSize={totalSize} formatBytes={formatBytes} />}

        <HowItWorksRename />
        <FeaturesRename />
        <FaqRename />
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <PageDropOverlay visible={isDragging} />
        <ScrollToTop />
        <MobileActionBar
          visible={files.length > 0 && changedCount > 0}
          loading={isZipping}
          loadingText={`Zipping. ${zipProgress}%`}
          ctaLabel={`Download ${changedCount} renamed file${changedCount !== 1 ? 's' : ''}`}
          ctaIcon={DownloadSimple}
          onCta={downloadZip}
        />
      </Suspense>
    </div>
  );
};

const StatsRow = ({
  plan,
  totalSize,
  formatBytes,
}: {
  plan: { changed: boolean }[];
  totalSize: number;
  formatBytes: (n: number) => string;
}) => {
  const changed = plan.filter((p) => p.changed).length;
  return (
    <section className="container mx-auto mt-12 max-w-3xl px-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
          <p className="text-[10px] font-medium text-muted-foreground">Files</p>
          <p className="mt-0.5 text-base font-bold tabular-nums sm:text-lg">
            {plan.length}
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
          <p className="text-[10px] font-medium text-muted-foreground">Will rename</p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-primary sm:text-lg">
            {changed}
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
          <p className="text-[10px] font-medium text-muted-foreground">Total size</p>
          <p className="mt-0.5 text-base font-bold tabular-nums sm:text-lg">
            {formatBytes(totalSize)}
          </p>
        </div>
      </div>
    </section>
  );
};

const HowItWorksRename = () => {
  const steps = [
    {
      icon: Sparkle,
      title: '1. Add files',
      desc: 'Drop up to 100 files of any type. Nothing leaves your device.',
    },
    {
      icon: Eye,
      title: '2. Build rules',
      desc: 'Stack 13 rule types - find/replace, prefixes, numbers, case, dates, trim, and more. Preview updates live.',
    },
    {
      icon: DownloadSimple,
      title: '3. Download',
      desc: 'Hit the button to get a ZIP of all your renamed files, ready to use.',
    },
  ];
  return (
    <section className="container mx-auto mt-20 px-4">
      <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
        How it works
      </h2>
      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((s) => {
          const StepIcon = s.icon;
          return (
            <div
              key={s.title}
              className="rounded-2xl border border-border/40 bg-card/60 p-4 text-center"
            >
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <StepIcon size={20} weight="duotone" aria-hidden />
              </div>
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const FeaturesRename = () => {
  const features = [
    { icon: MagnifyingGlass, title: 'Find & Replace', desc: 'Plain text or full regex support with case sensitivity toggle.' },
    { icon: Hash, title: 'Sequential Numbers', desc: 'Add 001_, 002_, . with custom position, separator, and padding.' },
    { icon: TextAa, title: 'Case Conversion', desc: 'Switch between lowercase, UPPERCASE, Title, and Sentence case.' },
    { icon: TextAUnderline, title: 'Prefix & Suffix', desc: 'Insert text at the start or end of every name. Extensions stay safe.' },
    { icon: ArrowsHorizontal, title: 'Whitespace', desc: 'Replace spaces with dashes, underscores, or remove them entirely.' },
    { icon: CalendarBlank, title: 'Date Stamp', desc: 'Insert the file mtime as a prefix or suffix in 7 date formats.' },
    { icon: Scissors, title: 'Trim / Truncate', desc: 'Strip characters from the ends or cap names to a max length with ellipsis.' },
    { icon: ArrowsLeftRight, title: 'Insert At', desc: 'Inject text at any character index - negatives count from the end.' },
    { icon: Stamp, title: 'Counter From Name', desc: 'Re-sequence the number already in the filename (fixes broken sequences).' },
    { icon: ArrowsClockwise, title: 'Reverse Name', desc: 'Flip the base name backwards - extensions are always preserved.' },
    { icon: TextT, title: 'Replace Extension', desc: 'Change, lowercase, uppercase, or strip the file extension.' },
    { icon: Shield, title: 'Name Sanitisation', desc: 'Illegal characters are stripped so every OS can open the result.' },
  ];
  return (
    <section className="container mx-auto mt-16 px-4">
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-2xl border border-border/40 bg-card/60 p-3 text-center"
            >
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon size={22} weight="duotone" aria-hidden />
              </div>
              <p className="mt-2 text-xs font-semibold">{f.title}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const FaqRename = () => {
  const faqs = [
    {
      q: 'Do you upload my files?',
      a: 'No. All renaming and ZIP creation happens locally in your browser. The original files are not read by any server.',
    },
    {
      q: 'Are extensions preserved?',
      a: 'Yes. Only the base name is renamed. The extension (e.g. ".jpg", ".pdf") is always kept untouched.',
    },
    {
      q: 'What happens if two files end up with the same name?',
      a: 'The renamer detects collisions and appends " (2)", " (3)", etc. to keep every file unique inside the ZIP.',
    },
    {
      q: 'Can I undo my rules?',
      a: 'Yes — use the "Reset" button in the rules panel to clear every rule, or remove individual rules with the trash icon.',
    },
    {
      q: 'Is there a limit?',
      a: 'You can rename up to 100 files per session, each up to 200 MB. The free plan supports it all.',
    },
    {
      q: 'Can I change or normalise the file extension?',
      a: 'Yes. Add a "Replace Extension" rule to set, lowercase, uppercase, or strip the extension entirely (e.g. ".JPEG" → ".jpg"). Other rules never touch the extension.',
    },
  ];
  return (
    <section className="container mx-auto mt-16 max-w-2xl px-4 pb-12">
      <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
        Bulk Rename FAQ
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

export default BulkRename;
