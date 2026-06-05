import { useEffect, useRef, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  rootMargin?: string;
  minHeight?: number;
}

const LazySection = ({
  children,
  className,
  id,
  rootMargin = '200px',
  minHeight = 200,
}: LazySectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <div ref={ref} id={id} className={className}>
      {visible ? children : <div style={{ minHeight }} aria-hidden />}
    </div>
  );
};

export default LazySection;
