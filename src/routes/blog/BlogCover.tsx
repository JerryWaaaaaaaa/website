import type { ReactNode } from 'react';
import { MeshCanvas } from '../gradient-generator/MeshCanvas';
import { DEFAULT_PALETTE } from '../gradient-generator/presets';
import { GRAIN_DATA_URI, meshFor } from './cover';

/**
 * A generated blog cover: a mesh gradient (reused from the gradient generator)
 * + grain/dither texture. Deterministic per `slug`. Aspect comes from
 * `className` (bc--card / bc--featured / bc--hero); `size` is the canvas render
 * resolution (square; CSS scales it to fit).
 *
 * Pass `children` to overlay custom content (e.g. the card's title + hover
 * reveal); otherwise it renders a centered `text` label (featured/hero).
 */
export function BlogCover({
  slug,
  text,
  children,
  className = '',
  size = 320,
  width,
  height,
}: {
  slug: string;
  text?: string;
  children?: ReactNode;
  className?: string;
  /** Square render resolution; overridden by explicit `width`/`height`. */
  size?: number;
  /** Explicit render resolution (use for non-square covers like the hero). */
  width?: number;
  height?: number;
}) {
  return (
    <div className={`bc ${className}`.trim()}>
      <MeshCanvas
        preset={meshFor(slug)}
        palette={DEFAULT_PALETTE}
        width={width ?? size}
        height={height ?? size}
        style={{ position: 'absolute', inset: 0 }}
      />
      <span
        className="bc-grain"
        style={{ backgroundImage: `url("${GRAIN_DATA_URI}")` }}
        aria-hidden="true"
      />
      {children ??
        (text ? (
          <>
            <span className="bc-scrim" aria-hidden="true" />
            <span className="bc-text">{text}</span>
          </>
        ) : null)}
    </div>
  );
}
