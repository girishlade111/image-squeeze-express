/**
 * Prefetching utilities for code-split routes and components.
 *
 * Why: After Vite splits the app into many small chunks, the network
 * waterfall (HTML → main.js → route.js) is what hurts perceived navigation
 * speed. Calling `prefetch(loader)` warms the browser cache for a chunk
 * so the moment a user actually navigates or opens a modal, the JS is
 * already in memory and the work is just to execute it.
 *
 * Three flavours:
 *
 *   1. `prefetch(loader)`            – manual fire-and-forget prefetch
 *   2. `usePrefetchOnHover(loader)`  – declarative hover/focus/touch trigger
 *   3. `prefetchOnIdle(loaders)`     – prefetch the most-likely-next routes
 *                                      after the browser is idle
 *
 * All three are deduped via a WeakSet so duplicate calls during the same
 * session are no-ops. The actual fetch happens inside `import()` so the
 * bundler can rewrite it to a hashed chunk URL at build time.
 */

import { useCallback, useRef, type MouseEvent, type FocusEvent } from "react";

type Loader = () => Promise<unknown>;
const prefetched = new WeakSet<Loader>();

const isBrowser = typeof window !== "undefined";

/**
 * Trigger a prefetch for a lazy chunk. Safe to call multiple times —
 * duplicates are silently dropped. Errors are swallowed and the loader
 * is removed from the cache so the next call can retry (e.g. after a
 * network blip).
 */
export function prefetch(loader: Loader): void {
  if (!isBrowser) return;
  if (prefetched.has(loader)) return;
  prefetched.add(loader);
  loader().catch(() => {
    prefetched.delete(loader);
  });
}

/**
 * Reusable event-handler factory for hover/focus/touch prefetching.
 * Spread the returned props onto any `<a>`/`<Link>`/`<button>`.
 *
 *   <Link to="/compress-pdf" {...usePrefetchOnHover(loadCompressPdf)} />
 *
 * Works in tandem with React Router — the prefetch fires before the user
 * actually clicks, so the route chunk is usually already cached by the
 * time navigation kicks off.
 */
export function usePrefetchOnHover<T extends Loader>(loader: T) {
  const ref = useRef(loader);
  ref.current = loader;

  const onPointerEnter = useCallback(
    (_e: MouseEvent<HTMLElement>) => prefetch(ref.current),
    []
  );
  const onFocus = useCallback(
    (_e: FocusEvent<HTMLElement>) => prefetch(ref.current),
    []
  );
  const onTouchStart = useCallback(() => prefetch(ref.current), []);

  return { onPointerEnter, onFocus, onTouchStart } as const;
}

/**
 * Schedule a batch of prefetches to fire during the browser's idle window.
 * Use after the main bundle has mounted to warm the chunks for the
 * routes the user is most likely to visit next.
 *
 *   useEffect(() => prefetchOnIdle([loadPdfPage, loadRenamePage]), []);
 */
export function prefetchOnIdle(loaders: Loader[], timeout = 2000): void {
  if (!isBrowser) return;
  const run = () => {
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      ric(
        () => {
          loaders.forEach((l) => prefetch(l));
        },
        { timeout }
      );
    } else {
      setTimeout(() => loaders.forEach((l) => prefetch(l)), 1500);
    }
  };

  if (document.readyState === "complete") {
    run();
  } else {
    window.addEventListener("load", run, { once: true });
  }
}
