import { useEffect, useRef } from 'react';
import { useDialKit } from 'dialkit';

const MAX_DPR = 2;
/**
 * Heat brush, same model as the hero's ASCII trail (AsciiTrail): each pointer
 * move stamps a soft disc of heat along the path, the disc widens with cursor
 * speed, and heat halves every HALF_LIFE ms, so the lit area is a smeared,
 * organic trail rather than a circle pinned to the cursor.
 */
const DEFAULTS = {
  radius: 79, // brush radius at rest, px
  speedBoost: 1.2, // extra radius at full speed, × radius
  maxSpeed: 3, // px/ms that counts as full speed
  intensity: 0.27, // heat per brush pass at the centre
  halfLife: 420, // ms
  growSize: 2.2, // dot size at full heat, px
  growRadius: 1.2, // corner radius once grown, px
  edgeNoise: 0.55, // how far the brush edge wobbles, × radius
  noiseScale: 370, // px per wobble blob
  grain: 0.35, // per-dot scatter mixed into the wobble (0–1)
};
type Params = typeof DEFAULTS;
const SETTLED = 0.01;

/** Deterministic hash → [0, 1). */
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
/** Smooth 2D value noise → [-1, 1]. */
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}

type RGB = [number, number, number];

function readColor(el: Element, name: string, fallback: RGB): RGB {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const m = /^#([0-9a-f]{6})$/i.exec(v);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function readPx(el: Element, name: string, fallback: number) {
  const v = parseFloat(getComputedStyle(el).getPropertyValue(name));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/**
 * V6 panel dot grid background: drop <DotGrid /> as the first child of any
 * section (Open platform, Templates) to fill it. Every instance shares one
 * "Dot grid" DialKit panel (stable id), so they always use the same params.
 * Crisp --v6-dot-size dots every
 * --v6-dot-gap across the whole panel. Around the cursor the dots stay put but
 * swell from --v6-dot-size up to growSize rounded stipples, keeping --v6-dot-color.
 * Heat is painted by a speed-scaled brush along
 * the cursor path and decays with a half-life, as in the hero's ASCII trail.
 * Listens on the surrounding section (this layer is pointer-events: none),
 * redraws only the dirty box around active dots, and only animates while
 * something is moving and the panel is on screen. Static on touch and with
 * reduced motion.
 */
export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dials = useDialKit('Dot grid', {
    radius: [DEFAULTS.radius, 10, 240, 1],
    speedBoost: [DEFAULTS.speedBoost, 0, 4, 0.05],
    maxSpeed: [DEFAULTS.maxSpeed, 0.5, 10, 0.1],
    intensity: [DEFAULTS.intensity, 0.05, 1, 0.01],
    halfLife: [DEFAULTS.halfLife, 50, 2000, 5],
    growSize: [DEFAULTS.growSize, 1, 8, 0.1],
    growRadius: [DEFAULTS.growRadius, 0, 4, 0.1],
    edgeNoise: [DEFAULTS.edgeNoise, 0, 1, 0.01],
    noiseScale: [DEFAULTS.noiseScale, 10, 400, 1],
    grain: [DEFAULTS.grain, 0, 1, 0.01],
  }, { id: 'v6-dot-grid' }) as Params;
  // The canvas loop reads the live dial values without re-running the effect.
  const params = useRef<Params>(dials);
  params.current = dials;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.closest('section') ?? canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;
    const interactive =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cold = readColor(canvas, '--v6-dot-color', [156, 182, 230]);
    const fill = `rgb(${cold.join(',')})`;
    const size = readPx(canvas, '--v6-dot-size', 1);
    const gap = readPx(canvas, '--v6-dot-gap', 13);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let heat = new Float32Array(0);
    let isActive = new Uint8Array(0);
    let active: number[] = [];
    let prevBox: [number, number, number, number] | null = null;
    let last: { x: number; y: number; t: number; r: number } | null = null;
    let speed = 0;
    let visible = true;
    let raf = 0;
    let lastT = 0;

    // Snap to device pixels so small dots stay crisp while they grow.
    const snap = (v: number) => Math.round(v * dpr) / dpr;

    /** Draw rest dots in [c0..c1] × [r0..r1], skipping active ones. */
    const drawRest = (c0: number, c1: number, r0: number, r1: number) => {
      ctx.fillStyle = fill;
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (isActive[r * cols + c]) continue;
          ctx.fillRect(c * gap, r * gap, size, size);
        }
      }
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / gap) + 1;
      rows = Math.floor(h / gap) + 1;
      heat = new Float32Array(cols * rows);
      isActive = new Uint8Array(cols * rows);
      active = [];
      prevBox = null;
      ctx.clearRect(0, 0, w, h);
      drawRest(0, cols - 1, 0, rows - 1);
    };

    const tick = (t: number) => {
      raf = 0;
      const P = params.current;
      const dt = lastT ? Math.min(t - lastT, 64) : 16;
      lastT = t;
      const decay = Math.pow(0.5, dt / P.halfLife);

      const next: number[] = [];
      let bx0 = Infinity;
      let by0 = Infinity;
      let bx1 = -Infinity;
      let by1 = -Infinity;
      for (const i of active) {
        const c = i % cols;
        const r = (i - c) / cols;
        heat[i] *= decay;
        if (heat[i] < SETTLED) {
          heat[i] = 0;
          isActive[i] = 0;
        } else {
          next.push(i);
        }
        bx0 = Math.min(bx0, c);
        bx1 = Math.max(bx1, c);
        by0 = Math.min(by0, r);
        by1 = Math.max(by1, r);
      }
      active = next;

      // Repaint the union of last frame's box and this one's, padded by a cell.
      const box: [number, number, number, number] | null =
        bx1 >= bx0 ? [bx0, bx1, by0, by1] : null;
      const u = [box, prevBox].filter(Boolean) as [number, number, number, number][];
      if (u.length) {
        const c0 = Math.max(0, Math.min(...u.map((b) => b[0])) - 1);
        const c1 = Math.min(cols - 1, Math.max(...u.map((b) => b[1])) + 1);
        const r0 = Math.max(0, Math.min(...u.map((b) => b[2])) - 1);
        const r1 = Math.min(rows - 1, Math.max(...u.map((b) => b[3])) + 1);
        const x0 = c0 * gap - gap / 2;
        const y0 = r0 * gap - gap / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, y0, (c1 - c0 + 1) * gap, (r1 - r0 + 1) * gap);
        ctx.clip();
        ctx.clearRect(x0, y0, (c1 - c0 + 1) * gap, (r1 - r0 + 1) * gap);
        drawRest(c0, c1, r0, r1);
        // Active dots keep the rest colour; only their size follows the heat.
        ctx.fillStyle = fill;
        for (const i of active) {
          const c = i % cols;
          const r = (i - c) / cols;
          const s = size + (P.growSize - size) * heat[i];
          // Grow around the rest dot's centre so the grid never shifts.
          const x = snap(c * gap + (size - s) / 2);
          const y = snap(r * gap + (size - s) / 2);
          if (s - size < 0.25) {
            ctx.fillRect(x, y, s, s);
          } else {
            ctx.beginPath();
            ctx.roundRect(x, y, s, s, Math.min(s / 2, P.growRadius));
            ctx.fill();
          }
        }
        ctx.restore();
      }
      prevBox = box;

      if (active.length && visible) raf = requestAnimationFrame(tick);
      else lastT = 0;
    };
    const schedule = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    /** Add heat in a soft disc of radius rad around (x, y). */
    // The disc's edge is pushed in and out by smooth noise (plus a little
    // per-dot grain), so the lit patch reads as an organic blot, not a circle.
    const deposit = (x: number, y: number, rad: number) => {
      const P = params.current;
      const reach = rad * (1 + P.edgeNoise);
      const c0 = Math.max(0, Math.floor((x - reach) / gap));
      const c1 = Math.min(cols - 1, Math.ceil((x + reach) / gap));
      const r0 = Math.max(0, Math.floor((y - reach) / gap));
      const r1 = Math.min(rows - 1, Math.ceil((y + reach) / gap));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const px = c * gap;
          const py = r * gap;
          const n =
            (1 - P.grain) * noise(px / P.noiseScale, py / P.noiseScale) +
            P.grain * (hash(c, r) * 2 - 1);
          const edge = rad * (1 + P.edgeNoise * n);
          const d = Math.hypot(px - x, py - y) / Math.max(1, edge);
          if (d >= 1) continue;
          const i = r * cols + c;
          heat[i] = Math.min(1, heat[i] + P.intensity * (1 - d) ** 2);
          if (!isActive[i] && heat[i] >= SETTLED) {
            isActive[i] = 1;
            active.push(i);
          }
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = e.timeStamp;
      const dist = last ? Math.hypot(x - last.x, y - last.y) : 0;
      // Smoothed speed so one jittery event doesn't pop the brush size.
      if (last && t > last.t) speed += (dist / (t - last.t) - speed) * 0.35;
      const P = params.current;
      const rad = P.radius * (1 + P.speedBoost * Math.min(1, speed / P.maxSpeed));
      // Fill the gap since the last event so fast swipes leave a solid stroke.
      if (last) {
        const n = Math.min(64, Math.floor(dist / (gap * 0.75)));
        for (let k = 1; k <= n; k++) {
          const f = k / (n + 1);
          deposit(last.x + (x - last.x) * f, last.y + (y - last.y) * f, last.r + (rad - last.r) * f);
        }
      }
      deposit(x, y, rad);
      last = { x, y, t, r: rad };
      schedule();
    };
    const onLeave = () => {
      last = null;
      speed = 0;
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    let io: IntersectionObserver | null = null;
    if (interactive) {
      host.addEventListener('pointermove', onMove, { passive: true });
      host.addEventListener('pointerleave', onLeave, { passive: true });
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && active.length) schedule();
      });
      io.observe(canvas);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="v6-dot-grid" aria-hidden="true" />;
}
