import { useEffect } from 'react';

interface DocumentTitleProps {
  title: string;
  /** Optional suffix. Defaults to "LS Image Compressor". */
  suffix?: string;
  /** When true, the title is set even if it's already the same. Defaults to false. */
  force?: boolean;
}

/**
 * Side-effect-only component that sets `document.title` for the current route.
 * Falls back to the original title on unmount so navigation back to a page that
 * doesn't set its own title doesn't leave a stale one behind.
 */
const DocumentTitle = ({ title, suffix = 'LS Image Compressor', force = false }: DocumentTitleProps) => {
  useEffect(() => {
    const previous = document.title;
    const next = suffix && !title.includes(suffix) ? `${title} · ${suffix}` : title;
    if (force || document.title !== next) {
      document.title = next;
    }
    return () => {
      document.title = previous;
    };
  }, [title, suffix, force]);

  return null;
};

export default DocumentTitle;
