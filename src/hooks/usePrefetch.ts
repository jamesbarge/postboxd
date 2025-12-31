/**
 * Hover Prefetch Hook
 * Prefetches a page when the user hovers over an element
 *
 * This creates an "instant" navigation experience by loading the page
 * data during the ~200-400ms hover-to-click window. Similar to techniques
 * used by Amazon and other high-performance sites.
 */

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

interface UsePrefetchOptions {
  /** Delay before prefetching (ms) - prevents prefetch on accidental hovers */
  delay?: number;
}

/**
 * Returns handlers to prefetch a route on hover
 *
 * @example
 * const { onMouseEnter, onMouseLeave } = usePrefetch(`/film/${id}`);
 * <article onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
 */
export function usePrefetch(href: string, options: UsePrefetchOptions = {}) {
  const router = useRouter();
  const { delay = 50 } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRef = useRef(false);

  const onMouseEnter = useCallback(() => {
    // Only prefetch once per mount
    if (prefetchedRef.current) return;

    // Small delay to avoid prefetching on accidental hover-throughs
    timeoutRef.current = setTimeout(() => {
      router.prefetch(href);
      prefetchedRef.current = true;
    }, delay);
  }, [router, href, delay]);

  const onMouseLeave = useCallback(() => {
    // Cancel if mouse leaves before delay completes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // For touch devices - prefetch on touch start
  const onTouchStart = useCallback(() => {
    if (prefetchedRef.current) return;
    router.prefetch(href);
    prefetchedRef.current = true;
  }, [router, href]);

  return { onMouseEnter, onMouseLeave, onTouchStart };
}
