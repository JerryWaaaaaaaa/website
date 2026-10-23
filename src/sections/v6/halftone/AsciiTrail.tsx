import { useEffect, useRef } from 'react';
import './AsciiTrail.css';

/** Character sets for the trail. "Ramp" sets read light → dense. */
export const ASCII_CHARSETS = {
  ramp: ' .:-=+*#%@',
  binary: '01',
  hex: '0123456789ABCDEF',
  symbols: '!@#$%^&*()[]{}<>?/\\|~',
  slashes: '/\\|-_+',
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alnum: 'abcdefghijklmnopqrstuvwxyz0123456789',
  dots: '.:·•oO0@',
  code: '{}[]()<>;:=+-*/&|!?',
} as const;
export type AsciiCharset = keyof typeof ASCII_CHARSETS;

/**
 * Glyph colouring. solid: one colour; mix: each glyph picks one of the colours
 * at random; heat: cool → hot by the cell's heat. "custom" uses params.color.
 */
type Palette = { label: string; kind: 'solid' | 'mix' | 'heat'; colors: string[] };
export const ASCII_PALETTES = {
  custom: { label: 'Custom (Color)', kind: 'solid', colors: [] },
  white: { label: 'White', kind: 'solid', colors: ['#ffffff'] },
  black: { label: 'Black', kind: 'solid', colors: ['#000000'] },
  blue: { label: 'Blue', kind: 'solid', colors: ['#0c5cff'] },
  lavender: { label: 'Lavender', kind: 'solid', colors: ['#e0d5ff'] },
  rose: { label: 'Rose', kind: 'solid', colors: ['#fb327e'] },
  roseLight: { label: 'Rose light', kind: 'solid', colors: ['#ffe3ee'] },
  teal: { label: 'Teal', kind: 'solid', colors: ['#5ecbc4'] },
  heroMix: { label: 'Mix · hero gradient', kind: 'mix', colors: ['#ccbbf9', '#4674cf', '#d6e5fd', '#5ecbc4'] },
  brandMix: { label: 'Mix · brand', kind: 'mix', colors: ['#0c5cff', '#fb327e', '#e0d5ff', '#ffffff'] },
  heatBlueRose: { label: 'Heat · blue → rose', kind: 'heat', colors: ['#0c5cff', '#fb327e'] },
  heatLavenderWhite: { label: 'Heat · lavender → white', kind: 'heat', colors: ['#ccbbf9', '#ffffff'] },
  heatTealWhite: { label: 'Heat · blue → teal → white', kind: 'heat', colors: ['#4674cf', '#5ecbc4', '#ffffff'] },
} satisfies Record<string, Palette>;
export type AsciiPalette = keyof typeof ASCII_PALETTES;

/** CSS mix-blend-mode values worth trying over the halftone. */
export const ASCII_BLEND_MODES = [
  'normal',
  'screen',
  'overlay',
  'soft-light',
  'hard-light',
  'color-dodge',
  'color-burn',
  'lighten',
  'darken',
  'multiply',
  'difference',
  'exclusion',
  'plus-lighter',
  'hue',
  'saturation',
  'color',
  'luminosity',
] as const;
export type AsciiBlendMode = (typeof ASCII_BLEND_MODES)[number];

export type AsciiTrailParams = {
  charset: AsciiCharset;
  /** Pick the glyph by heat (light chars as it cools) instead of at random. */
  byHeat: boolean;
  /** Grid cell, CSS px (also the font size). */
  cellSize: number;
  /** Brush radius at rest, CSS px. */
  radius: number;
  /** Extra radius at full cursor speed, as a multiple of radius (0 = speed has no effect). */
  speedBoost: number;
  /** Cursor speed (px/ms) that counts as "full speed" for speedBoost. */
  maxSpeed: number;
  /** Heat added per brush pass at the brush centre (0–1). */
  intensity: number;
  /** Half-life of the heat, ms. */
  halfLife: number;
  /** Glyph re-rolls per second per lit cell. */
  flicker: number;
  palette: AsciiPalette;
  /** Used when palette is "custom". */
  color: string;
  blendMode: AsciiBlendMode;
  opacity: number;
};

/** The tuned V6 trail (hero DialKit defaults); the CTA reuses it as-is. */
export const ASCII_TRAIL_DEFAULTS: AsciiTrailParams = {
  charset: 'letters',
  byHeat: true,
  cellSize: 10,
  radius: 35,
  speedBoost: 3,
  maxSpeed: 3,
  intensity: 0.6,
  halfLife: 475,
  flicker: 3,
  palette: 'brandMix',
  color: '#e5fffb',
  blendMode: 'lighten',
  opacity: 0.9,
};

type Props = { params: AsciiTrailParams; className?: string };

const MAX_DPR = 2;
const MIN_HEAT = 0.02; // below this a cell is dark and dropped
const BUCKETS = 12; // heat quantisation for batched fillStyle changes

type RGB = [number, number, number];
function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Sample a multi-stop ramp at t ∈ [0, 1]. */
function ramp(stops: RGB[], t: number): RGB {
  if (stops.length === 1) return stops[0];
  const x = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1);
  const k = Math.floor(x);
  const f = x - k;
  return stops[k].map((v, j) => Math.round(v + (stops[k + 1][j] - v) * f)) as RGB;
}

/**
 * Cursor heatmap rendered as ASCII: moving the pointer deposits heat into a
 * character grid, each lit cell shows a glyph whose opacity follows its heat,
 * and the heat decays exponentially so the trail fades out behind the cursor.
 * Faster cursor movement paints a wider brush.
 * Listens on the surrounding section (this layer is pointer-events: none) and
 * only animates while something is lit. Desktop pointers only; off for
 * reduced motion.
 */
export function AsciiTrail({ params, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const resetRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.closest('section') ?? canvas?.parentElement;
    if (!canvas || !host) return;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let cell = 0;
    let cols = 0;
    let rows = 0;
    let heat = new Float32Array(0);
    let glyph = new Uint8Array(0);
    let tint = new Uint8Array(0); // per-cell colour index for "mix" palettes
    let lit: number[] = []; // indices of cells with heat (kept sparse)
    let isLit = new Uint8Array(0);
    let raf = 0;
    let lastT = 0;
    let last: { x: number; y: number; t: number; r: number } | null = null;
    let speed = 0; // smoothed cursor speed, px/ms

    const charset = () => ASCII_CHARSETS[paramsRef.current.charset] ?? ASCII_CHARSETS.ramp;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(4, paramsRef.current.cellSize);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      heat = new Float32Array(cols * rows);
      glyph = new Uint8Array(cols * rows);
      tint = new Uint8Array(cols * rows);
      isLit = new Uint8Array(cols * rows);
      lit = [];
      ctx.clearRect(0, 0, w, h);
    };
    resetRef.current = layout;

    /** Add heat in a soft disc of radius r around (x, y). */
    const deposit = (x: number, y: number, r: number) => {
      const p = paramsRef.current;
      const c0 = Math.max(0, Math.floor((x - r) / cell));
      const c1 = Math.min(cols - 1, Math.floor((x + r) / cell));
      const r0 = Math.max(0, Math.floor((y - r) / cell));
      const r1 = Math.min(rows - 1, Math.floor((y + r) / cell));
      const n = charset().length;
      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          const dx = (col + 0.5) * cell - x;
          const dy = (row + 0.5) * cell - y;
          const d = Math.sqrt(dx * dx + dy * dy) / r;
          if (d >= 1) continue;
          const f = (1 - d) * (1 - d);
          const i = row * cols + col;
          heat[i] = Math.min(1, heat[i] + p.intensity * f);
          if (!isLit[i] && heat[i] >= MIN_HEAT) {
            isLit[i] = 1;
            lit.push(i);
            glyph[i] = Math.floor(Math.random() * n);
            tint[i] = Math.floor(Math.random() * 256);
          }
        }
      }
    };

    const draw = () => {
      const p = paramsRef.current;
      const chars = charset();
      const pal: Palette = ASCII_PALETTES[p.palette] ?? ASCII_PALETTES.custom;
      const colors = (pal.colors.length ? pal.colors : [p.color]).map(hexToRgb);
      // Solid / heat: one group. Mix: one group per colour, picked per cell.
      const groups = pal.kind === 'mix' ? colors.length : 1;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `500 ${cell}px ui-monospace, 'SF Mono', Menlo, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Bucket by (colour group, heat) so fillStyle changes per bucket, not per cell.
      const buckets: number[][] = Array.from({ length: BUCKETS * groups }, () => []);
      for (const i of lit) {
        const b = Math.min(BUCKETS - 1, Math.floor(heat[i] * BUCKETS));
        buckets[(tint[i] % groups) * BUCKETS + b].push(i);
      }
      buckets.forEach((cells, key) => {
        if (!cells.length) return;
        const t = ((key % BUCKETS) + 0.5) / BUCKETS;
        const [cr, cg, cb] =
          pal.kind === 'heat' ? ramp(colors, t) : colors[Math.floor(key / BUCKETS)];
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, t * 1.4) * p.opacity})`;
        for (const i of cells) {
          const ch = p.byHeat
            ? chars[Math.min(chars.length - 1, Math.floor(heat[i] * chars.length))]
            : chars[glyph[i] % chars.length];
          if (ch === ' ') continue;
          ctx.fillText(ch, ((i % cols) + 0.5) * cell, (Math.floor(i / cols) + 0.5) * cell);
        }
      });
    };

    const tick = (t: number) => {
      raf = 0;
      const dt = lastT ? Math.min(t - lastT, 64) : 16;
      lastT = t;
      const p = paramsRef.current;
      const decay = Math.pow(0.5, dt / Math.max(1, p.halfLife));
      const reroll = Math.min(1, (p.flicker * dt) / 1000);
      const n = charset().length;
      const next: number[] = [];
      for (const i of lit) {
        heat[i] *= decay;
        if (heat[i] < MIN_HEAT) {
          heat[i] = 0;
          isLit[i] = 0;
          continue;
        }
        if (Math.random() < reroll) glyph[i] = Math.floor(Math.random() * n);
        next.push(i);
      }
      lit = next;
      draw();
      if (lit.length) raf = requestAnimationFrame(tick);
      else lastT = 0;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const p = paramsRef.current;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = e.timeStamp;
      const dist = last ? Math.hypot(x - last.x, y - last.y) : 0;
      // Smoothed speed so one jittery event doesn't pop the brush size.
      if (last && t > last.t) speed += (dist / (t - last.t) - speed) * 0.35;
      const s = Math.min(1, speed / Math.max(0.01, p.maxSpeed));
      const r = Math.max(cell, p.radius * (1 + p.speedBoost * s));
      // Fill the gap since the last event so fast swipes leave a solid stroke,
      // easing the radius between the two events.
      const step = cell * 0.75;
      if (last) {
        const n = Math.min(64, Math.floor(dist / step));
        for (let k = 1; k <= n; k++) {
          const f = k / (n + 1);
          deposit(last.x + (x - last.x) * f, last.y + (y - last.y) * f, last.r + (r - last.r) * f);
        }
      }
      deposit(x, y, r);
      last = { x, y, t, r };
      schedule();
    };
    const onLeave = () => {
      last = null;
      speed = 0;
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      resetRef.current = null;
    };
  }, []);

  // Cell size changes the grid: rebuild it (clears the current trail).
  useEffect(() => {
    resetRef.current?.();
  }, [params.cellSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`v6-ascii-trail${className ? ` ${className}` : ''}`}
      style={{ mixBlendMode: params.blendMode }}
      aria-hidden="true"
    />
  );
}
