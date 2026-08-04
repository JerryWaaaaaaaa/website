import { MeshCanvas } from '../gradient-generator/MeshCanvas';
import { DEFAULT_PALETTE } from '../gradient-generator/presets';
import { GRAIN_DATA_URI, meshFor } from './cover';

/**
 * A generated blog cover: a mesh gradient (reused from the gradient generator)
 * + grain/dither texture + title overlay. Deterministic per `slug`. Aspect
 * comes from `className` (bc--card / bc--featured / bc--hero); `size` is the
 * canvas render resolution (square; CSS scales it to fit).
 */
export function BlogCover({
  slug,
  text,
  className = '',
  size = 320,
}: {
  slug: string;
  text: string;
  className?: string;
  size?: number;
}) {
  return (
    <div className={`bc ${className}`.trim()}>
      <MeshCanvas
        preset={meshFor(slug)}
        palette={DEFAULT_PALETTE}
        width={size}
        height={size}
        style={{ position: 'absolute', inset: 0 }}
      />
      <span
        className="bc-grain"
        style={{ backgroundImage: `url("${GRAIN_DATA_URI}")` }}
        aria-hidden="true"
      />
      <span className="bc-scrim" aria-hidden="true" />
      <span className="bc-text">{text}</span>
    </div>
  );
}
