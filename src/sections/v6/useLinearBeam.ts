import { useLayoutEffect, type RefObject } from 'react';

/** The beam window's head sits at 95% of the conic (see windowStops in useBeamDials). */
const HEAD_DEG = 0.95 * 360;
const STEPS = 96;

/**
 * Conic angle (0deg = 12 o'clock, clockwise) of the point `s` px along the
 * border of a w × h box, starting at top-centre and walking clockwise.
 */
function borderAngle(s: number, w: number, h: number) {
  const hw = w / 2;
  const hh = h / 2;
  // Perimeter segments from top-centre: top-right half, right, bottom, left, top-left half.
  let x: number;
  let y: number;
  if (s <= hw) [x, y] = [s, -hh];
  else if ((s -= hw) <= h) [x, y] = [hw, -hh + s];
  else if ((s -= h) <= w) [x, y] = [hw - s, hh];
  else if ((s -= w) <= h) [x, y] = [-hw, hh - s];
  else [x, y] = [-hw + (s - h), -hh];
  const a = (Math.atan2(x, -y) * 180) / Math.PI;
  return a < 0 ? a + 360 : a;
}

/** Keyframes that move the beam head an equal border distance per unit time. */
function linearKeyframes(w: number, h: number, motion: string) {
  if (motion === 'angle') {
    // Constant angular speed: the window itself spins evenly.
    return [
      { offset: 0, '--v6-glow-angle': `${-HEAD_DEG}deg` },
      { offset: 1, '--v6-glow-angle': `${360 - HEAD_DEG}deg` },
    ] as Keyframe[];
  }
  const p = 2 * (w + h);
  const frames: Keyframe[] = [];
  let prev = 0;
  let turns = 0;
  for (let i = 0; i <= STEPS; i++) {
    let a = i === STEPS ? 360 : borderAngle((p * i) / STEPS, w, h);
    if (a + turns < prev - 180) turns += 360; // unwrap past 360
    a += turns;
    prev = a;
    frames.push({ offset: i / STEPS, '--v6-glow-angle': `${(a - HEAD_DEG).toFixed(2)}deg` } as Keyframe);
  }
  return frames;
}

/**
 * Replaces the beam's CSS spin (constant angular speed, which on a wide pill
 * crawls along the long edges and whips round the ends) with a Web Animation
 * whose keyframes follow the border, so the head travels at a constant
 * linear speed. Rebuilt on resize and when --beam-speed changes on <html>
 * (the dial panel), keeping the current lap progress.
 */
export function useLinearBeam(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let anim: Animation | null = null;
    let key = '';
    const build = () => {
      // Layout size, not getBoundingClientRect: entrance transforms mustn't skew the path.
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (!width || !height) return;
      const speed = parseFloat(getComputedStyle(el).getPropertyValue('--beam-speed')) || 3.8;
      const motion = getComputedStyle(el).getPropertyValue('--beam-motion').trim() || 'angle';
      const next = `${Math.round(width)}x${Math.round(height)}@${speed}/${motion}`;
      if (next === key) return;
      key = next;
      const progress = anim ? ((anim.currentTime as number) % (anim.effect!.getTiming().duration as number)) / (anim.effect!.getTiming().duration as number) : 0;
      anim?.cancel();
      const duration = speed * 1000;
      anim = el.animate(linearKeyframes(width, height, motion), { duration, iterations: Infinity, easing: 'linear' });
      anim.currentTime = progress * duration;
      el.dataset.linear = '';
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    const mo = new MutationObserver(build);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => {
      ro.disconnect();
      mo.disconnect();
      anim?.cancel();
      delete el.dataset.linear;
    };
  }, [ref]);
}
