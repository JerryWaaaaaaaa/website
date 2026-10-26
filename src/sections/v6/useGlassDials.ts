import { useLayoutEffect } from 'react';
import { useDialKit } from 'dialkit';

type Tuple = [number, number, number, number];

/** The V6 glass material (matches the index.css --v6-glass / --v6-glass-blur defaults). */
const GLASS = { color: '#143176', opacity: 0.3, blur: 20 };

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/**
 * "Glass" DialKit panel: tint colour, tint opacity and backdrop blur of the V6
 * glass (nav bar, self view, hero browser frame, tagline cards). Writes the
 * custom properties on <html> — the nav sits outside the page wrapper — and
 * removes them on unmount so other versions keep the stylesheet defaults.
 */
export function useGlassDials() {
  const d = useDialKit('Glass', {
    color: { type: 'color' as const, default: GLASS.color },
    opacity: [GLASS.opacity, 0, 1, 0.01] as Tuple,
    blur: [GLASS.blur, 0, 40, 1] as Tuple, // px
  }) as { color: string; opacity: number; blur: number };

  const fill = rgba(d.color, d.opacity);
  const blur = `blur(${d.blur}px)`;
  useLayoutEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--v6-glass', fill);
    root.setProperty('--v6-glass-blur', blur);
    return () => {
      root.removeProperty('--v6-glass');
      root.removeProperty('--v6-glass-blur');
    };
  }, [fill, blur]);
}
