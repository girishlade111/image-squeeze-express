import { useEffect } from 'react';

interface PasteOptions {
  onPaste: (files: File[]) => void;
  enabled?: boolean;
}

/**
 * Listens for paste events at the document level and extracts image files.
 * Skips paste events whose target is a form input.
 */
export function useClipboardPaste({ onPaste, enabled = true }: PasteOptions) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
      }
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.items)
        .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter((f): f is File => !!f);
      if (files.length > 0) {
        e.preventDefault();
        onPaste(files);
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [onPaste, enabled]);
}
