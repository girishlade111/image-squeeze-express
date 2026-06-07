import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FileText, Plus, Download, Loader2, RotateCcw } from 'lucide-react';
import type { RenameFile } from '@/hooks/useFileRename';
import type { RenamePlanEntry } from '@/utils/fileRenamer';

interface FileRenamePreviewListProps {
  files: RenameFile[];
  plan: RenamePlanEntry[];
  changedCount: number;
  totalSize: number;
  formatBytes: (n: number) => string;
  isZipping: boolean;
  zipProgress: number;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onAddMore: () => void;
  onDownload: () => void;
  onReset: () => void;
}

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  const dot = str.lastIndexOf('.');
  const ext = dot >= 0 ? str.slice(dot) : '';
  const base = str.slice(0, Math.max(1, max - ext.length - 1));
  return `${base}…${ext}`;
}

function highlightDiff(original: string, renamed: string): React.ReactNode {
  // Render the renamed name and split into common/changed spans relative to
  // the original. We use a longest-common-subsequence-free greedy diff for
  // brevity: highlight the suffix after the common prefix and before the
  // common suffix.
  if (original === renamed) return <>{renamed}</>;
  let start = 0;
  const minLen = Math.min(original.length, renamed.length);
  while (start < minLen && original[start] === renamed[start]) start++;
  let end = 0;
  while (
    end < minLen - start &&
    original[original.length - 1 - end] === renamed[renamed.length - 1 - end]
  ) {
    end++;
  }
  const head = renamed.slice(0, start);
  const changed = renamed.slice(start, renamed.length - end);
  const tail = renamed.slice(renamed.length - end);
  return (
    <>
      {head}
      <span className="rounded bg-primary/15 px-0.5 font-semibold text-primary">
        {changed}
      </span>
      {tail}
    </>
  );
}

const FileRenamePreviewList = ({
  files,
  plan,
  changedCount,
  totalSize,
  formatBytes,
  isZipping,
  zipProgress,
  onRemove,
  onClearAll,
  onAddMore,
  onDownload,
  onReset,
}: FileRenamePreviewListProps) => {
  const [hoverId, setHoverId] = useState<string | null>(null);

  if (files.length === 0) return null;

  return (
    <motion.div
      className="mx-auto mt-6 max-w-xl"
      layout
      role="region"
      aria-label="File rename preview"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground sm:text-xs">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </p>
          {changedCount > 0 ? (
            <Badge
              variant="outline"
              className="rounded-full border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary sm:py-0 sm:text-[9px]"
            >
              {changedCount} renamed
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full border-border/40 bg-secondary/40 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground sm:py-0 sm:text-[9px]"
            >
              No changes yet
            </Badge>
          )}
          <span className="text-xs text-muted-foreground sm:text-[10px]">
            · {formatBytes(totalSize)} total
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground sm:h-7 sm:px-2 sm:text-[10px]"
            onClick={onAddMore}
            aria-label="Add more files"
          >
            <Plus className="mr-0.5 h-3.5 w-3.5 sm:h-2.5 sm:w-2.5" /> Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-destructive sm:h-7 sm:px-2 sm:text-[10px]"
            onClick={onClearAll}
            aria-label="Remove all files"
          >
            Clear
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isZipping && (
          <motion.div
            className="mb-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            aria-live="polite"
          >
            <div className="relative h-1.5 overflow-hidden rounded-full bg-secondary/50">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${zipProgress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="mt-1.5 text-center text-xs text-muted-foreground tabular-nums sm:text-[10px]">
              Building ZIP… {zipProgress}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="space-y-1.5" layout>
        <AnimatePresence mode="popLayout" initial={false}>
          {files.map((f, i) => {
            const entry = plan[i];
            return (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.97, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, x: 16 }}
                transition={{ duration: 0.18, delay: i * 0.01 }}
                onMouseEnter={() => setHoverId(f.id)}
                onMouseLeave={() => setHoverId(null)}
                className="group relative rounded-xl border border-border/40 bg-card/60 p-3 transition-colors hover:border-primary/30 sm:p-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/40 sm:h-9 sm:w-9">
                    <FileText
                      className={`h-5 w-5 sm:h-4 sm:w-4 ${
                        entry?.changed ? 'text-primary' : 'text-muted-foreground'
                      }`}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {entry?.changed ? (
                      <div className="space-y-0.5">
                        <p
                          className="truncate text-sm text-muted-foreground line-through sm:text-[11px]"
                          title={entry.originalName}
                        >
                          {truncate(entry.originalName, 50)}
                        </p>
                        <p
                          className="truncate font-mono text-sm font-semibold text-foreground sm:text-[12px]"
                          title={entry.renamedName}
                        >
                          {highlightDiff(entry.originalName, entry.renamedName)}
                        </p>
                      </div>
                    ) : (
                      <p
                        className="truncate font-mono text-sm text-foreground sm:text-[12px]"
                        title={f.name}
                      >
                        {truncate(f.name, 60)}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground sm:text-[10px]">
                      {formatBytes(f.size)}
                      {f.type && f.type !== 'application/octet-stream' && (
                        <> · {f.type.split('/').pop()?.toUpperCase()}</>
                      )}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => onRemove(f.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity sm:h-7 sm:w-7 ${
                      hoverId === f.id ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                    }`}
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-4 w-4 sm:h-3 sm:w-3" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isZipping}
          className="h-10 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground sm:h-9 sm:text-[11px]"
          aria-label="Reset all rules"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5 sm:h-3 sm:w-3" /> Clear rules
        </Button>
        <Button
          onClick={onDownload}
          disabled={isZipping || files.length === 0}
          className="h-12 rounded-xl text-base font-semibold text-primary-foreground shadow-md sm:h-10 sm:text-sm"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
          }}
          aria-label="Download renamed files as ZIP"
        >
          {isZipping ? (
            <>
              <Loader2 className="mr-1.5 h-5 w-5 animate-spin sm:h-4 sm:w-4" />
              Building ZIP…
            </>
          ) : (
            <>
              <Download className="mr-1.5 h-5 w-5 sm:h-4 sm:w-4" />
              Download renamed ZIP
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default FileRenamePreviewList;
