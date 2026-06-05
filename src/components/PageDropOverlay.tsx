import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, Sparkles } from 'lucide-react';

interface PageDropOverlayProps {
  visible: boolean;
}

/**
 * Full-page overlay shown when files are being dragged over the document.
 * Sits below the header (z-50) but above all content.
 */
const PageDropOverlay = ({ visible }: PageDropOverlayProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="relative mx-4 flex w-full max-w-xl flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-primary bg-card/80 p-12 text-center shadow-2xl"
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          >
            <div
              className="absolute inset-0 -z-10 rounded-3xl opacity-50"
              style={{
                background:
                  'radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--primary) / 0.2), transparent)',
                filter: 'blur(20px)',
              }}
              aria-hidden
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <CloudUpload className="h-8 w-8 text-primary" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-lg font-bold">Drop your images</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Release to add them to the queue
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              100% private — nothing is uploaded
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageDropOverlay;
