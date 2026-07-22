import { useEffect, useRef } from 'react';

/**
 * A single fixed backdrop that sits behind the whole page and recolors as the
 * reader scrolls from one section into the next. Sections declare their color on
 * a `[data-scroll-bg]` wrapper (see pageVersions.tsx); whichever wrapper is
 * crossing the viewport's vertical centerline "wins" and its color is written to
 * `--scroll-bg-color`. The actual fade is a CSS `background-color` transition on
 * `.scroll-bg` (see index.css) — so this is a trigger-based, timed recolor, not
 * a scroll-linked gradient.
 */
export function ScrollBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const zones = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scroll-bg]')
    );
    if (zones.length === 0) return;

    const setColor = (color: string | undefined) => {
      if (color) el.style.setProperty('--scroll-bg-color', color);
    };

    // Seed with the first zone so the backdrop is coherent before any scroll.
    setColor(zones[0].dataset.scrollBg);

    // Root collapsed to a centerline: a zone "wins" while it straddles the
    // middle of the viewport, so the recolor fires as each section takes over
    // the fold rather than the instant its top edge appears. The winning zone
    // also gets [data-active] so section-scoped decorations (e.g. the Open
    // Platform header wash) can fade in on the same 600ms clock as the recolor.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            setColor(target.dataset.scrollBg);
            zones.forEach((zone) =>
              zone.toggleAttribute('data-active', zone === target)
            );
          }
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    zones.forEach((zone) => observer.observe(zone));
    return () => observer.disconnect();
  }, []);

  return <div className="scroll-bg" ref={ref} aria-hidden="true" />;
}
