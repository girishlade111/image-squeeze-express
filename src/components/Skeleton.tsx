import { Lightning } from "@phosphor-icons/react";

/**
 * Skeleton placeholders for code-split chunks.
 *
 * The default `Suspense fallback={<div className="min-h-screen bg-background" />}`
 * pattern leaves a flash of blank background during route transitions. These
 * skeletons are the same neutral warm-cream/dark surface as the real content
 * but with subtle pulses so the user sees that something is loading and the
 * page is not stuck.
 */

const PULSE = "animate-pulse rounded-lg bg-muted/60";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function RouteSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className={`min-h-[100svh] bg-background ${className}`}
    >
      <div className="h-14 border-b border-border/10" />
      <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
        <div className={`h-12 w-3/4 max-w-xl ${PULSE}`} />
        <div className={`mt-4 h-6 w-1/2 max-w-md ${PULSE}`} />
        <div className={`mt-10 h-10 w-40 ${PULSE}`} />
        <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
          <Lightning size={14} weight="duotone" className="animate-pulse text-primary" />
          <span>Loading…</span>
        </div>
      </div>
    </div>
  );
}

export function BlockSkeleton({
  height = 200,
  className = "",
}: SkeletonProps & { height?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading section"
      className={`w-full rounded-2xl border border-border/20 bg-card/30 ${PULSE} ${className}`}
      style={{ minHeight: height }}
    />
  );
}

export function CardSkeleton({
  height = 180,
  className = "",
}: SkeletonProps & { height?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading card"
      className={`rounded-2xl border border-border/30 bg-card/60 p-5 shadow-sm ${className}`}
      style={{ minHeight: height }}
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 shrink-0 ${PULSE}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-3.5 w-2/3 ${PULSE}`} />
          <div className={`h-3 w-1/2 ${PULSE}`} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className={`h-3 w-full ${PULSE}`} />
        <div className={`h-3 w-5/6 ${PULSE}`} />
      </div>
    </div>
  );
}

export function QueueSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading queue"
      className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${className}`}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} height={84} />
      ))}
    </div>
  );
}
