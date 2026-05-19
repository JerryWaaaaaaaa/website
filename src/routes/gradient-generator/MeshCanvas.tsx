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

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Render a bilinearly-interpolated mesh gradient to a canvas via ImageData.
 * Uses smoothstep interpolation so neighboring cells blend without visible
 * tile edges.
 */
export function renderMesh(
  ctx: CanvasRenderingContext2D,
  preset: MeshPreset,
  palette: Palette,
  width: number,
  height: number,
): void {
  const { rows, cols, cells } = preset;
  const cellColors: Rgb[] = cells.map((paletteKey) =>
    hexToRgb(resolveToken(palette[paletteKey])),
  );

  const img = ctx.createImageData(width, height);
  const data = img.data;

  const lastRow = rows - 1;
  const lastCol = cols - 1;

  for (let y = 0; y < height; y++) {
    const v = height === 1 ? 0 : y / (height - 1);
    const fy = v * lastRow;
    const y0 = Math.min(Math.floor(fy), lastRow);
    const y1 = Math.min(y0 + 1, lastRow);
    const ty = smoothstep(fy - y0);

    for (let x = 0; x < width; x++) {
      const u = width === 1 ? 0 : x / (width - 1);
      const fx = u * lastCol;
      const x0 = Math.min(Math.floor(fx), lastCol);
      const x1 = Math.min(x0 + 1, lastCol);
      const tx = smoothstep(fx - x0);

      const c00 = cellColors[y0 * cols + x0];
      const c10 = cellColors[y0 * cols + x1];
      const c01 = cellColors[y1 * cols + x0];
      const c11 = cellColors[y1 * cols + x1];

      const top_r = c00.r + (c10.r - c00.r) * tx;
      const top_g = c00.g + (c10.g - c00.g) * tx;
      const top_b = c00.b + (c10.b - c00.b) * tx;
      const bot_r = c01.r + (c11.r - c01.r) * tx;
      const bot_g = c01.g + (c11.g - c01.g) * tx;
      const bot_b = c01.b + (c11.b - c01.b) * tx;

      const r = top_r + (bot_r - top_r) * ty;
      const g = top_g + (bot_g - top_g) * ty;
      const b = top_b + (bot_b - top_b) * ty;

      const offset = (y * width + x) * 4;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
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
  className?: string;
  style?: React.CSSProperties;
};

const DEFAULT_W = 256;
const DEFAULT_H = 192;

export function MeshCanvas({
  preset,
  palette,
  width = DEFAULT_W,
  height = DEFAULT_H,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    renderMeshToCanvas(canvas, preset, palette, width, height);
  }, [preset, palette, width, height]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        imageRendering: 'auto',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
