import { useEffect, useRef } from 'react';

/**
 * A single fixed backdrop that sits behind the whole page and recolors as the
 * reader scrolls from one section into the next. Sections declare their color on
 * a `[data-scroll-bg]` wrapper (see pageVersions.tsx); whichever wrapper is
 * crossing the viewport's vertical centerline "wins" and its color is written to
 * `--scroll-bg-color`. The actual fade is a CSS `background-color` transition on
 * `.scroll-bg` (see index.css) — so this is a trigger-based, timed recolor, not
 * a scroll-linked gradient.
 *
 * The hero is special: its look is a radial gradient, which can't tween to/from
 * a flat color. So it gets its own fixed layer (`.scroll-bg-hero`) painted with
 * that gradient, which crossfades (opacity) out once the fold moves past the
 * hero — revealing the flat backdrop beneath. The hero's `[data-scroll-bg]`
 * wrapper is marked `[data-hero]` so we know when to show it.
 */
export function ScrollBackground() {
  const flatRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const flat = flatRef.current;
    const hero = heroRef.current;
    if (!flat) return;

    const zones = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scroll-bg]')
    );
    // No zones (non-v5 versions): keep the hero gradient layer hidden so it
    // can't show through any transparent legacy sections.
    if (zones.length === 0) {
      if (hero) hero.style.opacity = '0';
      return;
    }

    const activate = (target: HTMLElement) => {
      const color = target.dataset.scrollBg;
      if (color) flat.style.setProperty('--scroll-bg-color', color);
      zones.forEach((zone) =>
        zone.toggleAttribute('data-active', zone === target)
      );
      // Hero gradient layer is opaque only while the hero owns the fold.
      if (hero) hero.style.opacity = target.hasAttribute('data-hero') ? '1' : '0';
    };

    // Seed from the first zone (the hero) so the backdrop is coherent before any
    // scroll and there's no flash before the observer's first callback.
    activate(zones[0]);

    // Root collapsed to a centerline: a zone "wins" while it straddles the
    // middle of the viewport, so the recolor fires as each section takes over
    // the fold rather than the instant its top edge appears. The winning zone
    // also gets [data-active] so section-scoped decorations (e.g. the Open
    // Platform header wash) can fade in on the same 600ms clock as the recolor.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activate(entry.target as HTMLElement);
          }
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    zones.forEach((zone) => observer.observe(zone));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="scroll-bg" ref={flatRef} aria-hidden="true" />
      <div className="scroll-bg-hero" ref={heroRef} aria-hidden="true" />
    </>
  );
}
