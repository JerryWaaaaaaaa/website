import { coverBackground, GRAIN_DATA_URI } from './cover';

/**
 * A generated blog cover: reused gradient background + grain/dither texture +
 * title overlay. Deterministic per `slug`. Size/aspect come from `className`
 * (e.g. bc--card / bc--featured / bc--hero); the text scales via container query.
 */
export function BlogCover({
  slug,
  text,
  className = '',
}: {
  slug: string;
  text: string;
  className?: string;
}) {
  return (
    <div className={`bc ${className}`.trim()} style={{ background: coverBackground(slug) }}>
      <span className="bc-grain" style={{ backgroundImage: `url("${GRAIN_DATA_URI}")` }} aria-hidden="true" />
      <span className="bc-scrim" aria-hidden="true" />
      <span className="bc-text">{text}</span>
    </div>
  );
}
