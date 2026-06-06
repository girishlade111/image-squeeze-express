import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface MobileActionBarProps {
  visible: boolean;
  loading?: boolean;
  loadingText?: string;
  ctaLabel: string;
  ctaEmoji?: string;
  onCta: () => void;
  disabled?: boolean;
}

/**
 * Sticky bottom action bar shown only on mobile. It slides up once the user
 * has scrolled past the upload zone (e.g. into the queue) so the primary CTA
 * (compress / download) is always reachable with one thumb. Hidden on
 * `sm:` and up — the inline buttons in each tool page take over.
 */
const MobileActionBar = ({
  visible,
  loading = false,
  loadingText,
  ctaLabel,
  ctaEmoji = '⚡',
  onCta,
  disabled = false,
}: MobileActionBarProps) => {
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) setShouldRender(true);
    else {
      const t = setTimeout(() => setShouldRender(false), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed inset-x-0 bottom-0 z-30 px-3 pb-safe pt-2 sm:hidden"
        >
          <div className="rounded-2xl border border-border/50 bg-card/95 p-2 shadow-elev-3 backdrop-blur-xl">
            <button
              onClick={onCta}
              disabled={disabled || loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary-foreground shadow-md transition-opacity disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingText ?? 'Working…'}
                </>
              ) : (
                <>
                  <span aria-hidden>{ctaEmoji}</span>
                  {ctaLabel}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileActionBar;
