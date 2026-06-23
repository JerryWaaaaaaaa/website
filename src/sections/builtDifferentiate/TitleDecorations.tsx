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

/** Zoom AI Companion style emblem: a bold 4-point sparkle plus a small one. */
export function AISparkle() {
  return (
    <svg
      className="kp-sparkle"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="kp-sparkle-grad" x1="2" y1="30" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0c5cff" />
          <stop offset="1" stopColor="#5b9bff" />
        </linearGradient>
      </defs>
      {/* large sparkle */}
      <path
        d="M13 5 C13 12 14 13 21 13 C14 13 13 14 13 21 C13 14 12 13 5 13 C12 13 13 12 13 5 Z"
        fill="url(#kp-sparkle-grad)"
      />
      {/* small sparkle */}
      <path
        d="M26 4 C26 7.5 26.5 8 30 8 C26.5 8 26 8.5 26 12 C26 8.5 25.5 8 22 8 C25.5 8 26 7.5 26 4 Z"
        fill="url(#kp-sparkle-grad)"
      />
    </svg>
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
    <svg
      className="kp-hand"
      viewBox="0 0 24 24"
      fill="#ffffff"
      stroke="#131619"
      strokeWidth={1}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 11.2V4.4a1.5 1.5 0 0 1 3 0V10l.55-1.25a1.25 1.25 0 0 1 2.36.83l-.2 1.05.62-.42a1.25 1.25 0 0 1 1.9 1.4l-.3 1.2.45-.08a1.2 1.2 0 0 1 1.4 1.4l-.55 2.9A3 3 0 0 1 15.7 21H12.4a4 4 0 0 1-3.2-1.6l-3.05-4.05a1.4 1.4 0 0 1 2.12-1.82L9 13.6z" />
    </svg>
  );
}
