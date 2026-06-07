/**
 * History storage for processed files (images and PDFs).
 *
 * Persists the last `MAX_HISTORY_ENTRIES` processed files in localStorage as
 * base64 data URLs so the user can re-download them after closing the tab.
 *
 * Note: localStorage has a ~5-10 MB origin-wide limit. Base64 inflates
 * binary data by ~33%, so each entry costs ~1.3x the original file size.
 * The 50-entry cap keeps total usage bounded; older entries are pruned
 * automatically when a new one is added.
 */

export type HistoryTool = 'image' | 'pdf';

export interface ImageHistoryMeta {
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  processedWidth: number;
  processedHeight: number;
  reduction: number;
  format: string;
  quality: number;
}

export interface PdfHistoryMeta {
  pageCount: number;
  reduction: number;
  finalQuality: number;
  finalDpi: number;
}

export interface HistoryEntry {
  id: string;
  tool: HistoryTool;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: number;
  dataUrl: string;
  image?: ImageHistoryMeta;
  pdf?: PdfHistoryMeta;
}

const STORAGE_KEY = 'ls-image-compressor-history';
export const MAX_HISTORY_ENTRIES = 50;

const isValidEntry = (e: unknown): e is HistoryEntry => {
  if (!e || typeof e !== 'object') return false;
  const o = e as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.fileName === 'string' &&
    typeof o.fileSize === 'number' &&
    typeof o.mimeType === 'string' &&
    typeof o.createdAt === 'number' &&
    typeof o.dataUrl === 'string' &&
    (o.tool === 'image' || o.tool === 'pdf')
  );
};

export const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.filter(isValidEntry);
    return valid.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
};

const writeHistory = (entries: HistoryEntry[]): void => {
  try {
    const pruned = entries
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  } catch (err) {
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      try {
        const reduced = entries
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, Math.max(1, Math.floor(MAX_HISTORY_ENTRIES / 2)));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
      } catch {
        /* storage full — silently drop oldest half */
      }
    }
  }
};

export const addHistoryEntry = (entry: HistoryEntry): HistoryEntry[] => {
  const current = loadHistory();
  const next = [entry, ...current.filter((e) => e.id !== entry.id)];
  writeHistory(next);
  return next.sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteHistoryEntry = (id: string): HistoryEntry[] => {
  const current = loadHistory();
  const next = current.filter((e) => e.id !== id);
  writeHistory(next);
  return next;
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage disabled — non-fatal */
  }
};

export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const dataUrlToBlob = (dataUrl: string): Blob => {
  const [meta = '', b64 = ''] = dataUrl.split(',');
  const mime = meta.match(/data:([^;]+)/)?.[1] ?? 'application/octet-stream';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

export const downloadHistoryEntry = (entry: HistoryEntry): void => {
  const blob = dataUrlToBlob(entry.dataUrl);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = entry.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const formatRelativeDate = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(timestamp).toLocaleDateString();
};
