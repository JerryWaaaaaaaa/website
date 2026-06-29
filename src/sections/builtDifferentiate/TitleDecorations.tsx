import type { ReactNode } from 'react';
import './TitleDecorations.css';

/**
 * Decorative title pieces for the "Built Different" key points. Every piece is
 * built from inline SVG / CSS (no image exports) and sized in `em` so it scales
 * with whatever heading font-size each section variant uses. The structure is
 * kept animation-friendly: the underline exposes a normalized path length, the
 * highlight paints its background from a dedicated layer, and the sparkle / hand
 * live in their own absolutely-positioned nodes.
 */

/** Small pill that sits above a title (e.g. "missing from most AI slide tools"). */
export function TitleBadge({ children }: { children: ReactNode }) {
  return <span className="kp-badge">{children}</span>;
}

/** Wraps a phrase and draws a blue stroke beneath it. */
export function Underline({ children }: { children: ReactNode }) {
  return (
    <span className="kp-underline">
      {children}
      <span className="kp-underline-line" aria-hidden="true" />
    </span>
  );
}

/** Wraps a phrase with a marker-style highlight box behind it (and tints the text). */
export function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="kp-highlight">
      <span className="kp-highlight-fill" aria-hidden="true" />
      <span className="kp-highlight-text">{children}</span>
      <AISparkle />
    </span>
  );
}

/** Zoom AI Companion emblem rendered from the shared AI tag icon. */
export function AISparkle() {
  return (
    <img
      className="kp-sparkle"
      src="/Icon/ai-tag.svg"
      alt=""
      aria-hidden="true"
    />
  );
}

/** Dark inline button that recreates the in-meeting screenshare control. */
export function ScreenshareChip() {
  return (
    <span className="kp-chip" aria-hidden="true">
      <svg
        className="kp-chip-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M12 14.5 V8.5 M9 11 L12 8 L15 11" />
      </svg>
      <PointingHand />
    </span>
  );
}

/** Pointing-hand cursor that overlaps the screenshare chip. */
export function PointingHand() {
  return (
    <img
      className="kp-hand"
      src="/core-features/Pointing%20hand.svg"
      alt=""
      aria-hidden="true"
    />
  );
}
