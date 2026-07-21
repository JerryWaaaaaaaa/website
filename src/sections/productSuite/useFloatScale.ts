import { useEffect, useRef } from 'react';

/**
 * Keeps the product-suite spill-floats (pie card, comments, AI popovers, …) in
 * proportion to the main screen card as it shrinks.
 *
 * The floats are authored at fixed pixel sizes tuned against the desktop card
 * width (--page-max-width = 1200px). Their offsets are already %-of-card, but
 * their sizes were not — so on tablet/mobile they stayed desktop-sized and
 * overflowed. This writes `--psuite-float-scale = min(1, cardWidth / 1200)` on
 * the wrapper; each float multiplies its own scale by that var (see the mockup
 * CSS), so it tracks the card exactly the way the mockup stage already does.
 *
 * Attach the returned ref to the `.psuite-v5-screen-wrap` element (the floats'
 * positioning ancestor) so the var inherits down to every float layer.
 */
const CARD_DESIGN_WIDTH = 1200;

export function useFloatScale<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const scale = Math.min(1, el.clientWidth / CARD_DESIGN_WIDTH);
      el.style.setProperty('--psuite-float-scale', String(scale));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return ref;
}
