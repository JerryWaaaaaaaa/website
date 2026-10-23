import { useEffect, useRef } from 'react';

const MAX_DPR = 2;
/** Cursor influence radius, px. */
const RADIUS = 150;
/** Max pull toward the cursor, px (never more than PULL_CAP of the gap to it). */
const PULL = 9;
const PULL_CAP = 0.45;
/** Spring time constant for dots following / releasing the cursor, ms. */
const EASE_MS = 90;
/** Heat added per second at the cursor centre; heat half-life once it leaves. */
const HEAT_RATE = 2.2;
const HEAT_HALF_LIFE = 650;
/** Colour steps between the rest and hot dot colours. */
const BUCKETS = 16;
const SETTLED = 0.01;

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
 * V6 panel dot grid (Open platform, Templates): crisp --v6-dot-size dots every
 * --v6-dot-gap across the whole panel. Around the cursor the dots are pulled
 * toward it like iron filings to a magnet and heat up from --v6-dot-color to
 * --v6-dot-color-hot; heat builds while the cursor lingers and decays after it
 * moves on, leaving a heatmap trail.
 * Listens on the surrounding section (this layer is pointer-events: none),
 * redraws only the dirty box around active dots, and only animates while
 * something is moving and the panel is on screen. Static on touch and with
 * reduced motion.
 */
export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.closest('section') ?? canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;
    const interactive =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cold = readColor(canvas, '--v6-dot-color', [156, 182, 230]);
    const hot = readColor(canvas, '--v6-dot-color-hot', [12, 92, 255]);
    const size = readPx(canvas, '--v6-dot-size', 1);
    const gap = readPx(canvas, '--v6-dot-gap', 13);
    const shades = Array.from({ length: BUCKETS + 1 }, (_, b) => {
      const t = b / BUCKETS;
      return `rgb(${cold.map((c, j) => Math.round(c + (hot[j] - c) * t)).join(',')})`;
    });

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let ox = new Float32Array(0); // current offset toward the cursor
    let oy = new Float32Array(0);
    let heat = new Float32Array(0);
    let isActive = new Uint8Array(0);
    let active: number[] = [];
    let prevBox: [number, number, number, number] | null = null;
    let pointer: { x: number; y: number } | null = null;
    let visible = true;
    let raf = 0;
    let lastT = 0;

    // Snap to device pixels so 1px dots stay crisp while they move.
    const snap = (v: number) => Math.round(v * dpr) / dpr;

    /** Draw rest dots in [c0..c1] × [r0..r1], skipping active ones. */
    const drawRest = (c0: number, c1: number, r0: number, r1: number) => {
      ctx.fillStyle = shades[0];
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
      ox = new Float32Array(cols * rows);
      oy = new Float32Array(cols * rows);
      heat = new Float32Array(cols * rows);
      isActive = new Uint8Array(cols * rows);
      active = [];
      prevBox = null;
      ctx.clearRect(0, 0, w, h);
      drawRest(0, cols - 1, 0, rows - 1);
    };

    const tick = (t: number) => {
      raf = 0;
      const dt = lastT ? Math.min(t - lastT, 64) : 16;
      lastT = t;
      const follow = 1 - Math.exp(-dt / EASE_MS);
      const decay = Math.pow(0.5, dt / HEAT_HALF_LIFE);

      // Pull in every dot under the cursor's influence.
      let pc0 = 0;
      let pc1 = -1;
      let pr0 = 0;
      let pr1 = -1;
      if (pointer) {
        pc0 = Math.max(0, Math.floor((pointer.x - RADIUS) / gap));
        pc1 = Math.min(cols - 1, Math.ceil((pointer.x + RADIUS) / gap));
        pr0 = Math.max(0, Math.floor((pointer.y - RADIUS) / gap));
        pr1 = Math.min(rows - 1, Math.ceil((pointer.y + RADIUS) / gap));
        for (let r = pr0; r <= pr1; r++) {
          for (let c = pc0; c <= pc1; c++) {
            const i = r * cols + c;
            if (!isActive[i]) {
              isActive[i] = 1;
              active.push(i);
            }
          }
        }
      }

      const next: number[] = [];
      let bx0 = Infinity;
      let by0 = Infinity;
      let bx1 = -Infinity;
      let by1 = -Infinity;
      for (const i of active) {
        const c = i % cols;
        const r = (i - c) / cols;
        const gx = c * gap;
        const gy = r * gap;
        let tx = 0;
        let ty = 0;
        heat[i] *= decay;
        if (pointer && c >= pc0 && c <= pc1 && r >= pr0 && r <= pr1) {
          const dx = pointer.x - gx;
          const dy = pointer.y - gy;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS && d > 0.001) {
            const f = (1 - d / RADIUS) ** 2;
            const pull = Math.min(PULL * f, d * PULL_CAP);
            tx = (dx / d) * pull;
            ty = (dy / d) * pull;
            heat[i] = Math.min(1, heat[i] + (HEAT_RATE * f * dt) / 1000);
          }
        }
        ox[i] += (tx - ox[i]) * follow;
        oy[i] += (ty - oy[i]) * follow;
        if (
          tx === 0 &&
          ty === 0 &&
          heat[i] < SETTLED &&
          Math.abs(ox[i]) < SETTLED &&
          Math.abs(oy[i]) < SETTLED
        ) {
          heat[i] = ox[i] = oy[i] = 0;
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

      // Repaint the union of last frame's box and this one's (a dot can drift
      // up to PULL px, so pad by a cell).
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
        // Active dots, grouped by heat so fillStyle changes per shade.
        const buckets: number[][] = Array.from({ length: BUCKETS + 1 }, () => []);
        for (const i of active) buckets[Math.round(heat[i] * BUCKETS)].push(i);
        buckets.forEach((dots, b) => {
          if (!dots.length) return;
          ctx.fillStyle = shades[b];
          for (const i of dots) {
            const c = i % cols;
            const r = (i - c) / cols;
            ctx.fillRect(snap(c * gap + ox[i]), snap(r * gap + oy[i]), size, size);
          }
        });
        ctx.restore();
      }
      prevBox = box;

      if ((active.length || pointer) && visible) raf = requestAnimationFrame(tick);
      else lastT = 0;
    };
    const schedule = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
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
        if (visible && (active.length || pointer)) schedule();
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
