import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Tailwind class for the shape, e.g. "h-4 w-32" or "h-32 w-32 rounded-full". */
  shape?: string;
}

/**
 * Animated placeholder for content that is still loading. Uses a subtle
 * gradient sweep that respects `prefers-reduced-motion` (handled in index.css).
 */
const Skeleton = ({ shape = 'h-4 w-full', className = '', ...rest }: SkeletonProps) => (
  <div
    role="status"
    aria-label="Loading"
    className={`relative overflow-hidden rounded-md bg-foreground/[0.06] ${shape} ${className}`}
    {...rest}
  >
    <div
      aria-hidden
      className="absolute inset-0 shimmer-gradient"
    />
  </div>
);

export default Skeleton;
