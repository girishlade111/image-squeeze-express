import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  buildRenamePlan,
  sanitizeFileName,
  DEFAULT_RULES,
  type RenameRule,
  type RenamePlanEntry,
} from '@/utils/fileRenamer';

// JSZip (~100 KB) and file-saver (~3 KB) are only needed when the user
// actually downloads a renamed archive. We defer both to first download.
const loadZip = () => import('jszip');
const loadSaver = () => import('file-saver');

export interface RenameFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

export const MAX_RENAME_FILES = 100;
export const MAX_RENAME_SIZE = 200 * 1024 * 1024;

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function useFileRename() {
  const [files, setFiles] = useState<RenameFile[]>([]);
  const [rules, setRules] = useState<RenameRule[]>(DEFAULT_RULES);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Roll up live stats from the latest plan so the UI doesn't have to compute
  // them itself. We map down to the minimal shape the engine needs (id, name,
  // lastModified) and let it ignore the rest.
  const plan: RenamePlanEntry[] = useMemo(
    () =>
      buildRenamePlan({
        files: files.map((f) => ({
          id: f.id,
          name: f.name,
          lastModified: f.file.lastModified,
        })),
        rules,
      }),
    [files, rules]
  );

  const changedCount = useMemo(
    () => plan.filter((p) => p.changed).length,
    [plan]
  );

  const totalSize = useMemo(
    () => files.reduce((s, f) => s + f.size, 0),
    [files]
  );

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    const oversized = incoming.filter((f) => f.size > MAX_RENAME_SIZE);
    if (oversized.length > 0) {
      toast.error(
        `${oversized.length} file${oversized.length > 1 ? 's' : ''} exceed the 200 MB limit and were skipped.`,
        { description: oversized.map((f) => f.name).slice(0, 2).join(', ') }
      );
    }
    const valid = incoming.filter((f) => f.size <= MAX_RENAME_SIZE);
    if (valid.length === 0) return;

    setFiles((prev) => {
      const remaining = MAX_RENAME_FILES - prev.length;
      if (remaining <= 0) {
        toast.warning(`⚠️ Free version supports up to ${MAX_RENAME_FILES} files at once.`);
        return prev;
      }
      const toAdd = valid.slice(0, remaining);
      if (valid.length > remaining) {
        toast.warning(
          `⚠️ Only ${remaining} file${remaining > 1 ? 's' : ''} added — limit is ${MAX_RENAME_FILES} per session.`
        );
      }
      return [
        ...prev,
        ...toAdd.map((file) => ({
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
        })),
      ];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setZipProgress(0);
  }, []);

  const setRulesList = useCallback((next: RenameRule[]) => {
    setRules(next);
  }, []);

  const addRule = useCallback((rule: RenameRule) => {
    setRules((prev) => [...prev, rule]);
  }, []);

  const updateRule = useCallback((index: number, patch: Partial<RenameRule>) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? ({ ...r, ...patch } as RenameRule) : r))
    );
  }, []);

  const removeRule = useCallback((index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveRule = useCallback((index: number, direction: -1 | 1) => {
    setRules((prev) => {
      const next = [...prev];
      const j = index + direction;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }, []);

  const resetRules = useCallback(() => setRules(DEFAULT_RULES), []);

  /**
   * Builds a ZIP in memory containing every file under its renamed name and
   * triggers a download. The original files are streamed into the archive
   * one-by-one so peak memory stays bounded.
   */
  const downloadZip = useCallback(async () => {
    if (files.length === 0) {
      toast.info('No files to rename. Add some first.');
      return;
    }

    setIsZipping(true);
    setZipProgress(0);

    try {
      const [{ default: JSZip }, { saveAs }] = await Promise.all([loadZip(), loadSaver()]);
      const zip = new JSZip();
      const folder = zip.folder('renamed') ?? zip;

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const entry = plan[i];
        const targetName = sanitizeFileName(entry?.renamedName ?? f.name);
        folder.file(targetName, f.file);
        setZipProgress(Math.round(((i + 1) / files.length) * 90));
      }

      const blob = await zip.generateAsync(
        { type: 'blob', compression: 'STORE' },
        (meta) => setZipProgress(90 + Math.round(meta.percent / 10))
      );

      saveAs(blob, 'ls-image-compressor_renamed.zip');
      setZipProgress(100);
      toast.success(
        `✅ Renamed ${changedCount === 0 ? files.length : changedCount} of ${files.length} files. ZIP downloaded.`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`❌ Failed to build ZIP: ${message}`);
    } finally {
      // Keep the progress bar visible briefly so users see the 100% state
      setTimeout(() => {
        setIsZipping(false);
        setZipProgress(0);
      }, 400);
    }
  }, [files, plan, changedCount]);

  return {
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
    setRules: setRulesList,
    addRule,
    updateRule,
    removeRule,
    moveRule,
    resetRules,
    downloadZip,
    formatBytes,
  };
}
