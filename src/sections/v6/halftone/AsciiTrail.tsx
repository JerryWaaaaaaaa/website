import { useEffect, useRef, type RefObject } from 'react';
import './AsciiTrail.css';

/** Character sets for the trail. "Ramp" sets read light → dense. */
export const ASCII_CHARSETS = {
  ramp: ' .:-=+*#%@',
  binary: '01',
  hex: '0123456789ABCDEF',
  symbols: '!@#$%^&*()[]{}<>?/\\|~',
  slashes: '/\\|-_+',
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  // Letters with symbols mixed in (~2:1), for the tile trail.
  mixed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+=?!@/<>{}[]',
  alnum: 'abcdefghijklmnopqrstuvwxyz0123456789',
  dots: '.:·•oO0@',
  code: '{}[]()<>;:=+-*/&|!?',
} as const;
export type AsciiCharset = keyof typeof ASCII_CHARSETS;

/**
 * Glyph colouring. solid: one colour; mix: each glyph picks one of the colours
 * at random; heat: cool → hot by the cell's heat. "custom" uses params.color;
 * "customMix" uses params.mixColors (the four pickers in the dial kit);
 * "background" samples the colorSource canvas under each tile (falling back to
 * customMix until there is one).
 */
type Palette = { label: string; kind: 'solid' | 'mix' | 'heat'; colors: string[] };
export const ASCII_PALETTES = {
  custom: { label: 'Custom (Color)', kind: 'solid', colors: [] },
  customMix: { label: 'Custom mix (Colors 1–4)', kind: 'mix', colors: [] },
  background: { label: 'Sample background', kind: 'solid', colors: [] },
  white: { label: 'White', kind: 'solid', colors: ['#ffffff'] },
  black: { label: 'Black', kind: 'solid', colors: ['#000000'] },
  blue: { label: 'Blue', kind: 'solid', colors: ['#0c5cff'] },
  lavender: { label: 'Lavender', kind: 'solid', colors: ['#e0d5ff'] },
  rose: { label: 'Rose', kind: 'solid', colors: ['#fb327e'] },
  roseLight: { label: 'Rose light', kind: 'solid', colors: ['#ffe3ee'] },
  teal: { label: 'Teal', kind: 'solid', colors: ['#5ecbc4'] },
  heroMix: { label: 'Mix · hero gradient', kind: 'mix', colors: ['#ccbbf9', '#4674cf', '#d6e5fd', '#5ecbc4'] },
  brandMix: { label: 'Mix · brand', kind: 'mix', colors: ['#0c5cff', '#fb327e', '#e0d5ff', '#ffffff'] },
  // brandMix with lavender and white deepened so white glyphs read on the tiles.
  tileMix: { label: 'Mix · brand (tiles)', kind: 'mix', colors: ['#0c5cff', '#fb327e', '#8b6cf0', '#4674cf'] },
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

/** glyph: coloured letters; tile: a coloured square per cell with a white letter. */
export const ASCII_STYLES = ['glyph', 'tile'] as const;
export type AsciiStyle = (typeof ASCII_STYLES)[number];

/** Glyph typeface. General Sans is loaded site-wide (Fontshare, 400/500). */
export const ASCII_FONTS = {
  mono: "ui-monospace, 'SF Mono', Menlo, monospace",
  generalSans: "'General Sans', sans-serif",
} as const;
export type AsciiFont = keyof typeof ASCII_FONTS;

export type AsciiTrailParams = {
  style: AsciiStyle;
  /** Tile style: gap between squares, CSS px. */
  tileGap: number;
  /** Tile style: square corner radius, CSS px. */
  tileRadius: number;
  font: AsciiFont;
  /** Three tile sizes, picked by heat (bigger where hotter). */
  multiSize: boolean;
  /** Tile sizes per tier, as multiples of cellSize (≥ 1, ascending). */
  size1: number;
  size2: number;
  size3: number;
  /** Average heat (0–1) an area needs to draw as one tier-2 tile. */
  size2Heat: number;
  /** Average heat (0–1) an area needs to draw as one tier-3 tile. */
  size3Heat: number;
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
  /** Used when palette is "customMix": each lit cell picks one at random. */
  mixColors: string[];
  blendMode: AsciiBlendMode;
  opacity: number;
};

/** The tuned V6 trail (hero DialKit defaults); the CTA reuses it as-is. */
export const ASCII_TRAIL_DEFAULTS: AsciiTrailParams = {
  style: 'glyph',
  tileGap: 1,
  tileRadius: 2,
  font: 'mono',
  multiSize: false,
  size1: 1,
  size2: 1.5,
  size3: 2.5,
  size2Heat: 0.3,
  size3Heat: 0.55,
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
  mixColors: ['#0c5cff', '#fb327e', '#8b6cf0', '#4674cf'], // = tileMix
  blendMode: 'lighten',
  opacity: 0.9,
};

/** The mesh variant's trail: coloured squares with white letters, drawn normally. */
export const ASCII_TILE_DEFAULTS: AsciiTrailParams = {
  ...ASCII_TRAIL_DEFAULTS,
  style: 'tile',
  font: 'generalSans',
  multiSize: true,
  palette: 'background',
  blendMode: 'normal',
  opacity: 1,
  cellSize: 14,
};

type Props = {
  params: AsciiTrailParams;
  className?: string;
  /** Canvas under the trail (e.g. the mesh) for the "background" palette. */
  colorSource?: RefObject<HTMLCanvasElement | null>;
};

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
export function AsciiTrail({ params, className, colorSource }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const resetRef = useRef<(() => void) | null>(null);
  const colorSourceRef = useRef(colorSource);
  colorSourceRef.current = colorSource;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.closest('section') ?? canvas?.parentElement;
    if (!canvas || !host) return;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Canvas text won't trigger a webfont load; warm General Sans up front.
    document.fonts?.load(`500 16px ${ASCII_FONTS.generalSans}`).catch(() => {});

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

    // Ink offsets for optical centring, per (font, char): [dx, dy] from the
    // cell centre to the fillText origin (left / alphabetic).
    const inkCache = new Map<string, [number, number]>();
    const inkOffset = (ch: string, font: string) => {
      const key = `${font}|${ch}`;
      let o = inkCache.get(key);
      if (!o) {
        const m = ctx.measureText(ch);
        const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
        o = [m.actualBoundingBoxLeft - inkW / 2, (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2];
        inkCache.set(key, o);
      }
      return o;
    };

    /** A tile to draw: top-left corner and side (CSS px), size tier, heat, and the cell lending its glyph + tint. */
    type Tile = { x: number; y: number; side: number; tier: number; heat: number; src: number };

    /**
     * Lit cells as tiles. With multiSize, each tier tiles the canvas with its
     * own lattice (pitch = size × cell). Biggest first: a lattice square whose
     * base cells (centres inside it) average size3Heat becomes a tier-3 tile
     * and claims those cells; then tier 2 on unclaimed cells at size2Heat; the
     * rest falls to tier 1. Empty cells count as cold, so big tiles only form
     * where the trail is solidly hot. Non-integer sizes can overlap slightly
     * at the edges; tiles draw smallest first so big ones sit on top.
     */
    const collectTiles = (p: AsciiTrailParams): Tile[] => {
      if (!p.multiSize) {
        return lit.map((i) => ({
          x: (i % cols) * cell,
          y: Math.floor(i / cols) * cell,
          side: cell,
          tier: 0,
          heat: heat[i],
          src: i,
        }));
      }
      const pitch = [p.size1, p.size2, p.size3].map((m) => Math.max(1, m) * cell);
      const threshold = [0, p.size2Heat, p.size3Heat];
      const claimed = new Uint8Array(cols * rows);
      const out: Tile[] = [];
      for (let tier = 2; tier >= 0; tier--) {
        const P = pitch[tier];
        const lcols = Math.ceil((cols * cell) / P);
        const squares = new Set<number>();
        for (const i of lit) {
          if (claimed[i]) continue;
          const cx = ((i % cols) + 0.5) * cell;
          const cy = (Math.floor(i / cols) + 0.5) * cell;
          squares.add(Math.floor(cy / P) * lcols + Math.floor(cx / P));
        }
        for (const key of squares) {
          const x0 = (key % lcols) * P;
          const y0 = Math.floor(key / lcols) * P;
          // Base cells whose centres fall inside [x0, x0 + P).
          const c0 = Math.ceil(x0 / cell - 0.5);
          const c1 = Math.min(cols - 1, Math.ceil((x0 + P) / cell - 0.5) - 1);
          const r0 = Math.ceil(y0 / cell - 0.5);
          const r1 = Math.min(rows - 1, Math.ceil((y0 + P) / cell - 0.5) - 1);
          let sum = 0;
          let n = 0;
          let src = -1;
          let blocked = false;
          for (let r = r0; r <= r1 && !blocked; r++) {
            for (let c = c0; c <= c1; c++) {
              const i = r * cols + c;
              if (claimed[i]) {
                blocked = true;
                break;
              }
              sum += heat[i];
              n++;
              if (isLit[i] && (src < 0 || heat[i] > heat[src])) src = i;
            }
          }
          if (blocked || src < 0 || !n) continue;
          const avg = sum / n;
          if (tier > 0 && avg < threshold[tier]) continue;
          out.push({ x: x0, y: y0, side: P, tier, heat: tier > 0 ? avg : Math.max(avg, MIN_HEAT), src });
          for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) claimed[r * cols + c] = 1;
        }
      }
      return out;
    };

    // Background sampling: the source canvas scaled down to one pixel per
    // grid cell (the browser averages each cell's area), read back once a frame.
    const sampleCanvas = document.createElement('canvas');
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    const sampleBackground = (): Uint8ClampedArray | null => {
      const src = colorSourceRef.current?.current;
      if (!src || !src.width || !src.height || !sampleCtx) return null;
      const tr = canvas.getBoundingClientRect();
      const sr = src.getBoundingClientRect();
      if (!sr.width || !sr.height) return null;
      const kx = src.width / sr.width;
      const ky = src.height / sr.height;
      if (sampleCanvas.width !== cols || sampleCanvas.height !== rows) {
        sampleCanvas.width = cols;
        sampleCanvas.height = rows;
      }
      sampleCtx.clearRect(0, 0, cols, rows);
      sampleCtx.drawImage(
        src,
        (tr.left - sr.left) * kx,
        (tr.top - sr.top) * ky,
        cols * cell * kx,
        rows * cell * ky,
        0,
        0,
        cols,
        rows,
      );
      return sampleCtx.getImageData(0, 0, cols, rows).data;
    };

    const draw = () => {
      const p = paramsRef.current;
      const chars = charset();
      const bg = p.palette === 'background' ? sampleBackground() : null;
      // "background" without a source yet behaves as customMix.
      const palKey = p.palette === 'background' && !bg ? 'customMix' : p.palette;
      const pal: Palette = ASCII_PALETTES[palKey] ?? ASCII_PALETTES.custom;
      const own = palKey === 'customMix' && p.mixColors.length ? p.mixColors : [p.color];
      const colors = (pal.colors.length ? pal.colors : own).map(hexToRgb);
      // Solid / heat / background: one group. Mix: one group per colour, picked per cell.
      const groups = pal.kind === 'mix' ? colors.length : 1;
      const tiles = p.style === 'tile';
      const family = ASCII_FONTS[p.font] ?? ASCII_FONTS.mono;
      const weight = tiles && p.font === 'mono' ? 600 : 500;
      ctx.clearRect(0, 0, w, h);
      // Bucket by (tier, colour group, heat) so fillStyle / font change per
      // bucket, not per tile (sampled colours set fillStyle per tile).
      const perTier = BUCKETS * groups;
      const buckets: Tile[][] = Array.from({ length: perTier * 3 }, () => []);
      for (const tile of collectTiles(p)) {
        const b = Math.min(BUCKETS - 1, Math.floor(tile.heat * BUCKETS));
        buckets[tile.tier * perTier + (tint[tile.src] % groups) * BUCKETS + b].push(tile);
      }
      /** Sampled background colour at a tile's centre, as rgba. */
      const bgStyle = (tile: Tile, alpha: number) => {
        const c = Math.min(cols - 1, Math.floor((tile.x + tile.side / 2) / cell));
        const r = Math.min(rows - 1, Math.floor((tile.y + tile.side / 2) / cell));
        const o = (r * cols + c) * 4;
        return `rgba(${bg![o]},${bg![o + 1]},${bg![o + 2]},${alpha})`;
      };
      buckets.forEach((list, key) => {
        if (!list.length) return;
        const side = list[0].side;
        const k = key % perTier;
        const t = ((k % BUCKETS) + 0.5) / BUCKETS;
        const [cr, cg, cb] = pal.kind === 'heat' ? ramp(colors, t) : colors[Math.floor(k / BUCKETS)];
        const alpha = Math.min(1, t * 1.4) * p.opacity;
        const fill = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx.fillStyle = fill;
        if (tiles) {
          // Squares in the cell's colour, then white glyphs on top.
          const gap = Math.min(side - 1, Math.max(0, p.tileGap));
          const inner = side - gap;
          const radius = Math.min(inner / 2, Math.max(0, p.tileRadius) * (side / cell));
          const square = (tile: Tile) => {
            const x = tile.x + gap / 2;
            const y = tile.y + gap / 2;
            if (radius > 0) ctx.roundRect(x, y, inner, inner, radius);
            else ctx.rect(x, y, inner, inner);
          };
          if (bg) {
            for (const tile of list) {
              ctx.fillStyle = bgStyle(tile, alpha);
              ctx.beginPath();
              square(tile);
              ctx.fill();
            }
          } else {
            ctx.beginPath();
            list.forEach(square);
            ctx.fill();
          }
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        }
        // Tiles: the glyph sits inside its square, so it's set a little smaller.
        const fontPx = tiles ? Math.round(side * 0.72) : side;
        const font = `${weight} ${fontPx}px ${family}`;
        ctx.font = font;
        // Tiles centre each glyph's ink in its square; plain glyphs keep the
        // advance-box centring they've always had.
        ctx.textAlign = tiles ? 'left' : 'center';
        ctx.textBaseline = tiles ? 'alphabetic' : 'middle';
        for (const tile of list) {
          const ch = p.byHeat
            ? chars[Math.min(chars.length - 1, Math.floor(tile.heat * chars.length))]
            : chars[glyph[tile.src] % chars.length];
          if (ch === ' ') continue;
          const cx = tile.x + side / 2;
          const cy = tile.y + side / 2;
          if (tiles) {
            const [dx, dy] = inkOffset(ch, font);
            ctx.fillText(ch, cx + dx, cy + dy);
          } else {
            if (bg) ctx.fillStyle = bgStyle(tile, alpha);
            ctx.fillText(ch, cx, cy);
          }
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
