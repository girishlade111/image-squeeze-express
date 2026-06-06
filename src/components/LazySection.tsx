import { useEffect, useRef, useState, ReactNode } from 'react';
import { BlockSkeleton } from '@/components/Skeleton';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  rootMargin?: string;
  minHeight?: number;
  /**
   * Custom placeholder. Defaults to `<BlockSkeleton />` for a neutral
   * loading state. Pass `null` to render nothing (keeps the section's
   * intrinsic height for layout stability).
   */
  placeholder?: ReactNode;
  /**
   * If true (default), defer the actual mount to the next idle frame
   * after the section scrolls into view. This keeps the main thread
   * free for the LCP and first-input critical path.
   */
  defer?: boolean;
}

const LazySection = ({
  children,
  className,
  id,
  rootMargin = '200px',
  minHeight = 200,
  placeholder,
  defer = true,
}: LazySectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(!defer);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!visible || mounted) return;
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === 'function') {
      ric(() => setMounted(true), { timeout: 1500 });
    } else {
      setTimeout(() => setMounted(true), 200);
    }
  }, [visible, mounted]);

  return (
    <div ref={ref} id={id} className={className}>
      {mounted ? (
        children
      ) : (
        <>
          {placeholder === null ? (
            <div style={{ minHeight }} aria-hidden />
          ) : (
            placeholder ?? <BlockSkeleton height={minHeight} />
          )}
        </>
      )}
    </div>
  );
};

export default LazySection;
