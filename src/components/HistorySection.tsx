import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, History, X, FileText, Image as ImageIcon, ChevronDown, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import useHistory from '@/hooks/useHistory';
import { formatBytes, formatRelativeDate, type HistoryEntry, type HistoryTool } from '@/utils/historyStorage';

interface HistorySectionProps {
  tool: HistoryTool;
  title?: string;
  description?: string;
}

const formatDimensions = (w?: number, h?: number) =>
  w && h ? `${w}×${h}` : null;

const HistoryCard = ({
  entry,
  onDownload,
  onDelete,
}: {
  entry: HistoryEntry;
  onDownload: (e: HistoryEntry) => void;
  onDelete: (e: HistoryEntry) => void;
}) => {
  const isImage = entry.tool === 'image';
  const img = entry.image;
  const pdf = entry.pdf;

  return (
    <motion.div
      layout
      variants={fadeInUp}
      className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 p-3 backdrop-blur-sm transition-colors hover:border-border hover:bg-card/70"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/40">
        {isImage && entry.dataUrl ? (
          <img
            src={entry.dataUrl}
            alt={entry.fileName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : isImage ? (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        ) : (
          <FileText className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground" title={entry.fileName}>
            {entry.fileName}
          </p>
          {isImage && entry.mimeType?.includes('webp') && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">WebP</span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-medium">{formatBytes(entry.fileSize)}</span>
          {isImage && img && (
            <>
              <span className="text-border">·</span>
              <span>{formatDimensions(img.processedWidth, img.processedHeight) ?? '—'}</span>
              <span className="text-border">·</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">▼ {img.reduction}%</span>
            </>
          )}
          {entry.tool === 'pdf' && pdf && (
            <>
              <span className="text-border">·</span>
              <span>{pdf.pageCount} {pdf.pageCount === 1 ? 'page' : 'pages'}</span>
              <span className="text-border">·</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">▼ {pdf.reduction}%</span>
            </>
          )}
          <span className="text-border">·</span>
          <span>{formatRelativeDate(entry.createdAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDownload(entry)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          aria-label={`Download ${entry.fileName}`}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(entry)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Remove ${entry.fileName} from history`}
          title="Remove from history"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const HistorySection = ({ tool, title, description }: HistorySectionProps) => {
  const { entries, totalCount, removeEntry, clear, download } = useHistory(tool);
  const [showAll, setShowAll] = useState(false);

  const handleDownload = useCallback(
    (entry: HistoryEntry) => {
      download(entry);
      toast.success(`Downloaded ${entry.fileName}`);
    },
    [download]
  );

  const handleDelete = useCallback(
    (entry: HistoryEntry) => {
      removeEntry(entry.id);
      toast.info(`Removed ${entry.fileName} from history`);
    },
    [removeEntry]
  );

  const handleClearAll = useCallback(() => {
    if (entries.length === 0) return;
    clear();
    toast.success('History cleared');
  }, [clear, entries.length]);

  const visibleEntries = useMemo(
    () => (showAll ? entries : entries.slice(0, 6)),
    [entries, showAll]
  );

  if (entries.length === 0) return null;

  const heading = title ?? 'Recent Files';
  const subhead = description ?? (tool === 'image'
    ? 'Your last 50 compressed images, ready to re-download.'
    : 'Your last 50 compressed PDFs, ready to re-download.');

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-4 flex items-center justify-between gap-3 sm:mb-6"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{heading}</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {entries.length} {entries.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">{subhead}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleClearAll}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive sm:px-3 sm:py-2 sm:text-sm"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear all</span>
        </motion.button>
      </motion.div>

      <motion.div
        variants={staggerContainer(50)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="space-y-2"
      >
        <AnimatePresence initial={false}>
          {visibleEntries.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {entries.length > 6 && (
        <div className="mt-3 flex justify-center sm:mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAll((s) => !s)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            {showAll ? 'Show less' : `Show all ${entries.length}`}
            <motion.span animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
          </motion.button>
        </div>
      )}

      {totalCount >= 45 && (
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Storage is filling up — old entries will be removed automatically.
        </p>
      )}
    </section>
  );
};

export default HistorySection;
