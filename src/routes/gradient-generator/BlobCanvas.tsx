import type { BlobPreset } from './blob';
import type { Palette } from './presets';
import { resolveToken } from './tokens';

const VIEW_W = 100;
const VIEW_H = 100;

type Props = {
  preset: BlobPreset;
  palette: Palette;
  /** Stable id prefix so multiple instances on the same page don't collide. */
  idPrefix?: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Render a Blob gradient as inline SVG: each shape is a circle with a
 * Gaussian-blur filter. The 4:3 viewBox keeps shapes from distorting when
 * the editor or card stretches the SVG.
 */
export function BlobCanvas({
  preset,
  palette,
  idPrefix = 'blob',
  className,
  style,
}: Props) {
  const baseFill = resolveToken(palette[preset.shapes[0]?.paletteKey ?? 'c1']);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: baseFill,
        ...style,
      }}
      aria-hidden="true"
    >
      <defs>
        {preset.shapes.map((shape, i) => {
          const rPx = (shape.sizePct / 100) * VIEW_H;
          const stdDev = Math.max(0.01, (shape.blurPct / 100) * rPx);
          return (
            <filter
              key={i}
              id={`${idPrefix}-blur-${i}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation={stdDev} />
            </filter>
          );
        })}
      </defs>
      {preset.shapes.map((shape, i) => {
        const cx = (shape.x / 100) * VIEW_W;
        const cy = (shape.y / 100) * VIEW_H;
        const r = (shape.sizePct / 100) * VIEW_H;
        const fill = resolveToken(palette[shape.paletteKey]);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={fill}
            opacity={shape.alpha}
            filter={`url(#${idPrefix}-blur-${i})`}
          />
        );
      })}
    </svg>
  );
}

export const BLOB_VIEW_W = VIEW_W;
export const BLOB_VIEW_H = VIEW_H;
