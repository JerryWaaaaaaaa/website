import { useEffect, useRef } from 'react';
import type { MeshPreset } from './mesh';
import type { Palette } from './presets';
import { resolveToken } from './tokens';

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Render a Gaussian/RBF-weighted mesh gradient to a canvas via ImageData.
 *
 * For each pixel, every control point contributes a color weighted by
 *   w_i = point.weight * exp(-d² / (2 * sigma²))
 * where d is the Euclidean distance from the pixel to the point. The final
 * pixel color is the weight-normalized sum. This is roughly the same idea as
 * a 2D Gaussian RBF interpolator; the `softness` parameter maps sigma between
 * a crisp 10% of the canvas (low) and a dreamy 45% (high).
 */
export function renderMesh(
  ctx: CanvasRenderingContext2D,
  preset: MeshPreset,
  palette: Palette,
  width: number,
  height: number,
): void {
  const points = preset.points;
  if (points.length === 0) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const colors: Rgb[] = points.map((point) =>
    hexToRgb(resolveToken(palette[point.paletteKey])),
  );
  const px = points.map((point) => (point.x / 100) * width);
  const py = points.map((point) => (point.y / 100) * height);
  const pw = points.map((point) => Math.max(0, point.weight));

  const softness = Math.max(0, Math.min(1, preset.softness));
  const sigma = (0.1 + softness * 0.35) * Math.min(width, height);
  const twoSigmaSq = 2 * sigma * sigma;

  // If only one point, fill flat.
  if (points.length === 1) {
    const c = colors[0];
    ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const img = ctx.createImageData(width, height);
  const data = img.data;

  const n = points.length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let totalW = 0;
      let r = 0;
      let g = 0;
      let b = 0;

      for (let i = 0; i < n; i++) {
        const dx = x - px[i];
        const dy = y - py[i];
        const distSq = dx * dx + dy * dy;
        const w = pw[i] * Math.exp(-distSq / twoSigmaSq);
        totalW += w;
        const c = colors[i];
        r += c.r * w;
        g += c.g * w;
        b += c.b * w;
      }

      const inv = totalW > 0 ? 1 / totalW : 0;
      const offset = (y * width + x) * 4;
      data[offset] = r * inv;
      data[offset + 1] = g * inv;
      data[offset + 2] = b * inv;
      data[offset + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

export function renderMeshToCanvas(
  canvas: HTMLCanvasElement,
  preset: MeshPreset,
  palette: Palette,
  width: number,
  height: number,
): void {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  renderMesh(ctx, preset, palette, width, height);
}

type Props = {
  preset: MeshPreset;
  palette: Palette;
  width?: number;
  height?: number;
  /** When true, render at low res (256x192) and let CSS scale up — fast drag mode. */
  lowRes?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const DEFAULT_W = 256;
const DEFAULT_H = 256;
const LOW_RES_W = 192;
const LOW_RES_H = 192;

export function MeshCanvas({
  preset,
  palette,
  width,
  height,
  lowRes = false,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  const w = lowRes ? LOW_RES_W : (width ?? DEFAULT_W);
  const h = lowRes ? LOW_RES_H : (height ?? DEFAULT_H);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    renderMeshToCanvas(canvas, preset, palette, w, h);
  }, [preset, palette, w, h]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
