import { useEffect, useRef } from 'react';

// Hover letter shuffle, shared by every agent CTA so they all scramble alike:
// each letter cycles through random glyphs (ASCII symbols + letters), then
// they settle back to the label left to right.
const SHUFFLE_GLYPHS = '!<>-_\\/[]{}=+*^?#%&@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SHUFFLE_MS = 560; // whole run
const SHUFFLE_HOLD = 0.3; // share of the run every letter stays scrambled
const SHUFFLE_STEP_MS = 45; // glyph re-roll interval

const randomGlyph = () => SHUFFLE_GLYPHS[Math.floor(Math.random() * SHUFFLE_GLYPHS.length)];

/**
 * Plays the shuffle into the overlay span; the real label stays underneath,
 * hidden, so the button keeps its width and screen readers its text.
 */
function useShuffle(label: string) {
  const overlayRef = useRef<HTMLSpanElement | null>(null);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const play = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Hovering off mid-run restarts it, so leave mirrors enter.
    cancelAnimationFrame(frame.current);
    const chars = [...label];
    const settleAt = chars.map(
      (_, i) => SHUFFLE_MS * (SHUFFLE_HOLD + (1 - SHUFFLE_HOLD) * ((i + 1) / chars.length)),
    );
    const start = performance.now();
    let lastStep = -Infinity;
    let glyphs = chars.map(randomGlyph);
    overlay.parentElement!.dataset.shuffling = 'true';

    const tick = (now: number) => {
      const t = now - start;
      if (now - lastStep >= SHUFFLE_STEP_MS) {
        glyphs = chars.map(randomGlyph);
        lastStep = now;
      }
      overlay.textContent = chars
        .map((c, i) => (c === ' ' || t >= settleAt[i] ? c : glyphs[i]))
        .join('');
      if (t < SHUFFLE_MS) {
        frame.current = requestAnimationFrame(tick);
      } else {
        frame.current = 0;
        delete overlay.parentElement!.dataset.shuffling;
      }
    };
    frame.current = requestAnimationFrame(tick);
  };

  return { overlayRef, play };
}

/**
 * The V6 "Agent prompt" button (Figma "Agent prompt"): a 48px circular media
 * slot followed by a Heading-4 label. Used by the hero + CTA (black, halftone
 * avatar) and the template gallery (pink, arrow icon). Hovering on and off
 * shuffles the (mono) label; the arrow variant also slides its arrow out to the right as a new one
 * slides in from the left.
 */
export function AgentCta({
  children,
  tone = 'dark',
  media = 'avatar',
  href = '#',
}: {
  children: string;
  tone?: 'dark' | 'pink';
  media?: 'avatar' | 'arrow';
  href?: string;
}) {
  const shuffle = useShuffle(children);

  return (
    <a
      className={`v6-agent${tone === 'pink' ? ' v6-agent--pink' : ''}`}
      href={href}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') shuffle.play();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') shuffle.play();
      }}
    >
      {media === 'avatar' ? (
        <img className="v6-agent-media" src="/v6/hero/cta-avatar.webp" alt="" aria-hidden="true" />
      ) : (
        <span className="v6-agent-icon" aria-hidden="true">
          <img src="/v6/templates/arrow.svg" alt="" width={24} height={24} />
          <img src="/v6/templates/arrow.svg" alt="" width={24} height={24} />
        </span>
      )}
      <span className="v6-agent-label">
        <span className="v6-agent-label-text">{children}</span>
        <span className="v6-agent-label-shuffle" ref={shuffle.overlayRef} aria-hidden="true" />
      </span>
    </a>
  );
}

/** Corner dot shown at the top-left of every V6 panel. */
export function PanelDot({ tone = 'gradient' }: { tone?: 'gradient' | 'blue' }) {
  return (
    <img
      className="v6-dot"
      src={tone === 'blue' ? '/v6/shared/dot-blue.svg' : '/v6/shared/dot-gradient.svg'}
      alt=""
      aria-hidden="true"
      width={12}
      height={12}
    />
  );
}
