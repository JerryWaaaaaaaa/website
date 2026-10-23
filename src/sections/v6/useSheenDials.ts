import type { CSSProperties } from 'react';
import { useDialKit, type DialConfig } from 'dialkit';

type Tuple = [number, number, number, number];

export type SheenStop = {
  color: string; // hex
  opacity: number; // 0–1
  position: number; // 0–1 of one band period
};
export type Sheen = { angle: number; stops: SheenStop[] };

const BLEND_MODES = ['overlay', 'soft-light', 'hard-light', 'screen', 'color-dodge', 'normal'];

type Shared = { blend: string; intensity: number; period: number; travel: number };

const SHARED: Shared = {
  blend: 'soft-light',
  intensity: 0.66,
  period: 1470, // px per repeat of the stops
  travel: 1.15, // band movement per px the card moves on the stage
};

export type TiltParams = {
  max: number; // deg at full lean
  perspective: number; // px
  reach: number; // px past the card edge the cursor still leans it
  ease: number; // per-frame approach to the target (0–1)
  shift: number; // sheen px per deg of tilt
};
export type GlareParams = { intensity: number; size: number; color: string };

const TILT: TiltParams = { max: 10, perspective: 900, reach: 260, ease: 0.12, shift: 14 };
const GLARE: GlareParams = { intensity: 0.55, size: 55, color: '#ffffff' };

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/** A repeating band; the first stop is repeated at the end so it wraps seamlessly. */
function sheenGradient({ angle, stops }: Sheen, period: number) {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const parts = sorted.map((s) => `${rgba(s.color, s.opacity)} ${s.position * period}px`);
  parts.push(`${rgba(sorted[0].color, sorted[0].opacity)} ${period}px`);
  return `repeating-linear-gradient(${angle}deg, ${parts.join(', ')})`;
}

function buildConfig(sheens: Record<string, Sheen>) {
  const cards: Record<string, DialConfig> = {};
  for (const [key, sheen] of Object.entries(sheens)) {
    const folder: DialConfig = { _collapsed: true, angle: [sheen.angle, 0, 360, 1] as Tuple };
    sheen.stops.forEach((s, i) => {
      folder[`stop${i + 1}`] = {
        _collapsed: true,
        color: { type: 'color', default: s.color },
        opacity: [s.opacity, 0, 1, 0.01] as Tuple,
        position: [s.position, 0, 1, 0.01] as Tuple,
      };
    });
    cards[key] = folder;
  }
  return {
    blend: { type: 'select' as const, options: BLEND_MODES, default: SHARED.blend },
    intensity: [SHARED.intensity, 0, 1, 0.01] as Tuple,
    period: [SHARED.period, 200, 2000, 10] as Tuple,
    travel: [SHARED.travel, 0, 3, 0.05] as Tuple,
    tilt: {
      _collapsed: true,
      max: [TILT.max, 0, 30, 0.5] as Tuple,
      perspective: [TILT.perspective, 300, 2500, 10] as Tuple,
      reach: [TILT.reach, 0, 800, 10] as Tuple,
      ease: [TILT.ease, 0.02, 1, 0.01] as Tuple,
      shift: [TILT.shift, -40, 40, 0.5] as Tuple,
    },
    glare: {
      _collapsed: true,
      intensity: [GLARE.intensity, 0, 1, 0.01] as Tuple,
      size: [GLARE.size, 10, 150, 1] as Tuple, // % of the card's width / height (ellipse radii)
      color: { type: 'color' as const, default: GLARE.color },
    },
    ...cards,
  } satisfies DialConfig;
}

/**
 * DialKit panel for the Open platform cards' metallic finish: shared sheen
 * blend / strength / band size / travel, cursor tilt + glare, and a gradient
 * editor (angle + stops) per card. Returns a style getter that sets a card's
 * --sheen-* vars, plus the live tilt / glare values for useCardTilt.
 * `sheens` must be stable (a module constant) — it seeds the panel's defaults.
 */
export function useSheenDials(name: string, sheens: Record<string, Sheen>) {
  const d = useDialKit(name, buildConfig(sheens)) as Record<string, unknown> &
    Shared & { tilt: TiltParams; glare: GlareParams };

  const style = (key: string): CSSProperties => {
    const folder = d[key] as Record<string, unknown> & { angle: number };
    const sheen: Sheen = {
      angle: folder.angle,
      stops: sheens[key].stops.map((_, i) => folder[`stop${i + 1}`] as SheenStop),
    };
    return {
      '--sheen': sheenGradient(sheen, d.period),
      '--sheen-blend': d.blend,
      '--sheen-intensity': d.intensity,
      '--sheen-travel': d.travel,
      '--sheen-shift': `${d.tilt.shift}px`,
      '--tilt-perspective': `${d.tilt.perspective}px`,
      '--glare': rgba(d.glare.color, d.glare.intensity),
      '--glare-size': `${d.glare.size}%`,
    } as CSSProperties;
  };

  return { style, tilt: d.tilt };
}
