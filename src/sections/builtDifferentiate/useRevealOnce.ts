import { useEffect, useRef, useState } from 'react';

/**
 * Fires once when the element first scrolls into view. Returns a ref to attach
 * and a boolean that latches `true` on first intersection and never resets — so
 * an entrance animation plays a single time, when the element actually appears,
 * rather than on mount (which can be off-screen) or on every scroll pass.
 */
export function useRevealOnce<T extends HTMLElement = HTMLDivElement>(
  rootMargin = '-12% 0px'
) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed, rootMargin]);

  return { ref, revealed };
}
