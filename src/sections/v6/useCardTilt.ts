import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { TiltParams } from './useSheenDials';

type State = { rx: number; ry: number; gx: number; gy: number; go: number };
const KEYS: (keyof State)[] = ['rx', 'ry', 'gx', 'gy', 'go'];
const REST: State = { rx: 0, ry: 0, gx: 50, gy: 50, go: 0 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Cursor tilt + glare for the `[data-card]` cards on a stage. Each card leans
 * away under the cursor (the point you hover dips, as in React Bits' tilted /
 * reflective cards) and fades back to flat over `reach` px past its edge; the
 * glare spot follows the cursor in the card's own (rotated) frame. Values are
 * eased per frame and written to the card as --rx / --ry (deg, unitless),
 * --gx / --gy (%) and --go (0–1) for its face to use. Only active when `media`
 * matches and the stage isn't `data-revealed="false"`.
 */
export function useCardTilt(
  stageRef: RefObject<HTMLElement | null>,
  media: string,
  params: TiltParams,
) {
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const mq = window.matchMedia(media);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const current = new Map<HTMLElement, State>();
    const target = new Map<HTMLElement, State>();
    let frame = 0;

    const cards = () =>
      Array.from(stageRef.current?.querySelectorAll<HTMLElement>('[data-card]') ?? []);

    const tick = () => {
      frame = 0;
      const k = paramsRef.current.ease;
      let moving = false;
      for (const card of cards()) {
        const t = target.get(card) ?? REST;
        const c = current.get(card) ?? { ...REST };
        for (const key of KEYS) {
          const delta = t[key] - c[key];
          c[key] = Math.abs(delta) < 0.01 ? t[key] : c[key] + delta * k;
          if (c[key] !== t[key]) moving = true;
        }
        current.set(card, c);
        card.style.setProperty('--rx', c.rx.toFixed(3));
        card.style.setProperty('--ry', c.ry.toFixed(3));
        card.style.setProperty('--gx', `${c.gx.toFixed(2)}%`);
        card.style.setProperty('--gy', `${c.gy.toFixed(2)}%`);
        card.style.setProperty('--go', c.go.toFixed(3));
      }
      if (moving) frame = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const relax = () => {
      for (const card of cards()) {
        const t = target.get(card);
        target.set(card, { ...REST, gx: t?.gx ?? 50, gy: t?.gy ?? 50 });
      }
      kick();
    };

    const onMove = (e: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage || !mq.matches || stage.dataset.revealed === 'false') return;
      const { max, reach } = paramsRef.current;
      const lean = still.matches ? 0 : max;
      for (const card of cards()) {
        // Pointer in the card's own frame: undo its resting z-rotation.
        const box = card.getBoundingClientRect();
        const vx = e.clientX - (box.left + box.width / 2);
        const vy = e.clientY - (box.top + box.height / 2);
        const r = (parseFloat(card.style.getPropertyValue('--r')) * Math.PI) / 180 || 0;
        const lx = vx * Math.cos(r) + vy * Math.sin(r);
        const ly = -vx * Math.sin(r) + vy * Math.cos(r);
        const hw = card.offsetWidth / 2;
        const hh = card.offsetHeight / 2;
        const outside = Math.hypot(Math.max(Math.abs(lx) - hw, 0), Math.max(Math.abs(ly) - hh, 0));
        const weight = reach > 0 ? clamp(1 - outside / reach, 0, 1) : outside > 0 ? 0 : 1;
        const nx = clamp(lx / hw, -1, 1);
        const ny = clamp(ly / hh, -1, 1);
        target.set(card, {
          rx: -ny * lean * weight,
          ry: nx * lean * weight,
          gx: 50 + (lx / (2 * hw)) * 100,
          gy: 50 + (ly / (2 * hh)) * 100,
          go: weight,
        });
      }
      kick();
    };

    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', relax);
    mq.addEventListener('change', relax);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', relax);
      mq.removeEventListener('change', relax);
    };
  }, [stageRef, media]);
}
