import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Eye, Download, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileRenameUploadZone from '@/components/FileRenameUploadZone';
import FileRenameRuleBuilder from '@/components/FileRenameRuleBuilder';
import FileRenamePreviewList from '@/components/FileRenamePreviewList';
import PageDropOverlay from '@/components/PageDropOverlay';
import { useFileRename } from '@/hooks/useFileRename';
import { useClipboardPaste } from '@/hooks/useClipboardPaste';
import { usePageDropZone } from '@/hooks/usePageDropZone';

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
      <Header />
      <main>
        <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-12 pb-12">
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
                Bulk File{' '}
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Rename
                </span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                in Seconds
              </motion.h1>

              <motion.p
                className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Rename hundreds of files at once with a live preview. Combine find
                &amp; replace, prefix/suffix, sequential numbering, case changes,
                date stamps, trim, insert-at, counter extraction, reverse, and
                more — all in your browser.
              </motion.p>

              <motion.div
                className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {[
                  { emoji: '🔒', label: '100% Private' },
                  { emoji: '👁️', label: 'Live Preview' },
                  { emoji: '🆓', label: 'Free Forever' },
                  { emoji: '📦', label: 'ZIP Download' },
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
                  <FileRenameUploadZone onFilesSelected={addFiles} fileCount={files.length} />
                </div>
              </motion.div>

              {files.length > 0 && (
                <FileRenameRuleBuilder
                  rules={rules}
                  onAdd={addRule}
                  onUpdate={updateRule}
                  onRemove={removeRule}
                  onMove={moveRule}
                  onReset={resetRules}
                />
              )}

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
            </div>
          </div>
        </section>

        {files.length > 0 && <StatsRow plan={plan} totalSize={totalSize} formatBytes={formatBytes} />}

        <HowItWorksRename />
        <FeaturesRename />
        <FaqRename />
        <Footer />
      </main>

      <PageDropOverlay visible={isDragging} />
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
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      title: '1. Add files',
      desc: 'Drop up to 100 files of any type. Nothing leaves your device.',
    },
    {
      icon: <Eye className="h-4 w-4 text-primary" />,
      title: '2. Build rules',
      desc: 'Stack 13 rule types — find/replace, prefixes, numbers, case, dates, trim, and more. Preview updates live.',
    },
    {
      icon: <Download className="h-4 w-4 text-primary" />,
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

const FeaturesRename = () => {
  const features = [
    { emoji: '🔍', title: 'Find & Replace', desc: 'Plain text or full regex support with case sensitivity toggle.' },
    { emoji: '🔢', title: 'Sequential Numbers', desc: 'Add 001_, 002_, … with custom position, separator, and padding.' },
    { emoji: 'Aa', title: 'Case Conversion', desc: 'Switch between lowercase, UPPERCASE, Title, and Sentence case.' },
    { emoji: '📝', title: 'Prefix & Suffix', desc: 'Insert text at the start or end of every name. Extensions stay safe.' },
    { emoji: '🧹', title: 'Whitespace', desc: 'Replace spaces with dashes, underscores, or remove them entirely.' },
    { emoji: '📅', title: 'Date Stamp', desc: 'Insert the file mtime as a prefix or suffix in 7 date formats.' },
    { emoji: '✂️', title: 'Trim / Truncate', desc: 'Strip characters from the ends or cap names to a max length with ellipsis.' },
    { emoji: '🧷', title: 'Insert At', desc: 'Inject text at any character index — negatives count from the end.' },
    { emoji: '🔁', title: 'Counter From Name', desc: 'Re-sequence the number already in the filename (fixes broken sequences).' },
    { emoji: '🪞', title: 'Reverse Name', desc: 'Flip the base name backwards — extensions are always preserved.' },
    { emoji: '🗂️', title: 'Replace Extension', desc: 'Change, lowercase, uppercase, or strip the file extension.' },
    { emoji: '🛡️', title: 'Name Sanitisation', desc: 'Illegal characters are stripped so every OS can open the result.' },
  ];
  return (
    <section className="container mx-auto mt-16 px-4">
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
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
