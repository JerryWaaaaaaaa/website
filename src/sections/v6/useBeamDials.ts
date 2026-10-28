import { useLayoutEffect } from 'react';
import { useDialKit } from 'dialkit';

type Tuple = [number, number, number, number];
type Brand = 'blue' | 'lilac' | 'pink' | 'teal';

const BEAM = {
  strength: 1, // master opacity
  hoverOnly: true,
  hover: { delay: 0, fadeIn: 950, fadeOut: 700 }, // ms
  motion: 'angle' as 'angle' | 'border', // constant spin, or constant speed along the border
  speed: 1.6, // s per lap
  floor: 0.63, // window mask opacity outside the beam (dim base ring)
  maskBlur: 11.5, // % of the ring the window mask is Gaussian-blurred by
  arc: 56, // % of the ring the beam window covers
  blobSize: 2.35, // scale of the colour ellipses
  stroke: { width: 1, opacity: 0.8 },
  inner: { opacity: 0.8, depth: 25, shadow: 0.33 },
  bloom: { opacity: 0.8, blur: 5.5 },
  colors: { blue: '#3e76f9', lilac: '#bfd1ee', pink: '#fd6dcf', teal: '#d29ef5' },
};

/**
 * Colour blobs parked around the button's perimeter (pink left, teal top,
 * blue right — as the reference). Sizes are px at blobSize 1.
 */
const BLOBS: { c: Brand; at: string; w: number; h: number }[] = [
  { c: 'pink', at: '0% 50%', w: 90, h: 60 },
  { c: 'pink', at: '18% 0%', w: 70, h: 28 },
  { c: 'teal', at: '48% 0%', w: 80, h: 28 },
  { c: 'lilac', at: '80% 0%', w: 70, h: 28 },
  { c: 'blue', at: '100% 50%', w: 70, h: 60 },
  { c: 'blue', at: '72% 100%', w: 120, h: 30 },
  { c: 'lilac', at: '38% 100%', w: 90, h: 28 },
  { c: 'teal', at: '6% 100%', w: 50, h: 28 },
];

const pct = (n: number) => `${+n.toFixed(2)}%`;
const white = (a: number) => `rgba(255, 255, 255, ${a})`;

/** Smootherstep (Perlin): zero slope and curvature at both ends, so ramps fade organically. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const SAMPLES = 12; // stops per ramp — enough that the eased curve reads smooth

/** Sample `curve` (0–1 opacity) over [from, to] % of the conic as white stops. */
function ramp(from: number, to: number, curve: (t: number) => number) {
  return Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const t = i / SAMPLES;
    return `${white(+curve(t).toFixed(3))} ${pct(from + (to - from) * t)}`;
  });
}

/** Window opacity (0–1) at `x` % of the conic: eased tail → full → eased head, ending at 95%. */
function windowProfile(x: number, arc: number) {
  const e = 95;
  const s0 = e - arc;
  const tail = s0 + arc * 0.34;
  const head = s0 + arc * 0.77;
  if (x <= s0 || x >= e) return 0;
  if (x < tail) return ease((x - s0) / (tail - s0));
  if (x > head) return 1 - ease((x - head) / (e - head));
  return 1;
}

/**
 * Conic stops for the travelling window. `blur` (in % of the ring, ≈3.6deg
 * each) Gaussian-blurs the opacity profile around the circle — a real mask
 * blur, done once here since CSS can't filter a mask-image. `floor` lifts
 * the whole ring to a dim base so the edge never goes fully dark.
 */
function windowStops(arc: number, blur: number, floor: number) {
  const RES = 0.5; // % per sample
  const n = Math.round(100 / RES);
  const raw = Array.from({ length: n }, (_, i) => windowProfile(i * RES, arc));
  let out = raw;
  if (blur > 0) {
    const r = Math.ceil((blur * 3) / RES);
    const k = Array.from({ length: r * 2 + 1 }, (_, j) => Math.exp(-(((j - r) * RES) ** 2) / (2 * blur * blur)));
    const sum = k.reduce((a, b) => a + b, 0);
    out = raw.map((_, i) => k.reduce((acc, w, j) => acc + w * raw[(i + j - r + n) % n], 0) / sum);
  }
  // Every 1% (plus the wrap point) keeps the stop list ~100 long.
  const stops: string[] = [];
  for (let i = 0; i <= n; i += 2) stops.push(`${white(+(floor + (1 - floor) * out[i % n]).toFixed(3))} ${pct(i * RES)}`);
  return stops.join(', ');
}

/** A soft bell-shaped white peak near the window's leading edge (the beam's hot head). */
function bloomStops(arc: number) {
  const p = 95 - arc + arc * 0.62;
  const w = arc * 0.37;
  const bell = (t: number) => Math.exp(-((t * 2 - 1) ** 2) * 4.5); // ≈0.01 at the ends
  return [`transparent 0%`, ...ramp(p - w / 2, p + w / 2, bell), `transparent ${pct(p + w / 2)}`].join(', ');
}

/**
 * "CTA beam" DialKit panel for the dark agent CTA's border beam (hero + CTA).
 * Writes --beam-* custom properties on <html>; removed on unmount. The angle
 * stays in CSS (var(--v6-glow-angle) is resolved on the button, not here).
 */
export function useBeamDials() {
  const d = useDialKit('CTA beam', {
    strength: [BEAM.strength, 0, 1, 0.01] as Tuple,
    hoverOnly: BEAM.hoverOnly,
    hover: {
      delay: [BEAM.hover.delay, 0, 600, 10] as Tuple,
      fadeIn: [BEAM.hover.fadeIn, 100, 2000, 10] as Tuple,
      fadeOut: [BEAM.hover.fadeOut, 50, 1500, 10] as Tuple,
    },
    motion: { type: 'select' as const, options: ['angle', 'border'], default: BEAM.motion },
    speed: [BEAM.speed, 0.5, 20, 0.1] as Tuple,
    floor: [BEAM.floor, 0, 1, 0.01] as Tuple,
    maskBlur: [BEAM.maskBlur, 0, 20, 0.5] as Tuple,
    arc: [BEAM.arc, 10, 95, 1] as Tuple,
    blobSize: [BEAM.blobSize, 0.3, 3, 0.05] as Tuple,
    stroke: {
      width: [BEAM.stroke.width, 0.5, 6, 0.5] as Tuple,
      opacity: [BEAM.stroke.opacity, 0, 1, 0.01] as Tuple,
    },
    inner: {
      opacity: [BEAM.inner.opacity, 0, 1, 0.01] as Tuple,
      depth: [BEAM.inner.depth, 2, 40, 1] as Tuple,
      shadow: [BEAM.inner.shadow, 0, 1, 0.01] as Tuple,
    },
    bloom: {
      _collapsed: true,
      opacity: [BEAM.bloom.opacity, 0, 1, 0.01] as Tuple,
      blur: [BEAM.bloom.blur, 0, 20, 0.5] as Tuple,
    },
    colors: {
      _collapsed: true,
      blue: { type: 'color' as const, default: BEAM.colors.blue },
      lilac: { type: 'color' as const, default: BEAM.colors.lilac },
      pink: { type: 'color' as const, default: BEAM.colors.pink },
      teal: { type: 'color' as const, default: BEAM.colors.teal },
    },
  }) as typeof BEAM;

  const k = d.blobSize;
  const vars: Record<string, string> = {
    '--beam-strength': String(d.strength),
    '--beam-rest': d.hoverOnly ? '0' : '1',
    '--beam-speed': `${d.speed}s`,
    '--beam-motion': d.motion,
    '--beam-delay': `${d.hover.delay}ms`,
    '--beam-fade-in': `${d.hover.fadeIn}ms`,
    '--beam-fade-out': `${d.hover.fadeOut}ms`,
    '--beam-stroke': `${d.stroke.width}px`,
    '--beam-stroke-opacity': String(d.stroke.opacity),
    '--beam-inner-opacity': String(d.inner.opacity),
    '--beam-depth': `${d.inner.depth}px`,
    '--beam-edge-shadow': String(d.inner.shadow),
    '--beam-bloom-opacity': String(d.bloom.opacity),
    '--beam-bloom-blur': `${d.bloom.blur}px`,
    '--beam-window': windowStops(d.arc, d.maskBlur, d.floor),
    '--beam-bloom-stops': bloomStops(d.arc),
    '--beam-blobs': BLOBS.map(
      (b) => `radial-gradient(ellipse ${b.w * k}px ${b.h * k}px at ${b.at}, ${d.colors[b.c]}, transparent)`,
    ).join(', '),
  };
  const key = JSON.stringify(vars);
  useLayoutEffect(() => {
    const root = document.documentElement.style;
    for (const [name, v] of Object.entries(vars)) root.setProperty(name, v);
    return () => {
      for (const name of Object.keys(vars)) root.removeProperty(name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
