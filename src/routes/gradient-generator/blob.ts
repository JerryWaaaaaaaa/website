import type { PaletteKey } from './presets';

export const BLOB_MIN = 1;
export const BLOB_MAX = 8;

export const BLOB_SIZE_MIN = 8;
export const BLOB_SIZE_MAX = 120;
export const BLOB_BLUR_MIN = 0;
export const BLOB_BLUR_MAX = 100;

export type BlobShape = {
  /** 0..100, percent of canvas width */
  x: number;
  /** 0..100, percent of canvas height */
  y: number;
  /** 8..120, radius as percent of min(width, height) */
  sizePct: number;
  /** 0..100, Gaussian blur stdDeviation as percent of size */
  blurPct: number;
  paletteKey: PaletteKey;
  /** 0..1 */
  alpha: number;
};

export type BlobPreset = {
  id: string;
  name: string;
  shapes: BlobShape[];
};

const s = (
  x: number,
  y: number,
  sizePct: number,
  blurPct: number,
  paletteKey: PaletteKey,
  alpha = 0.85,
): BlobShape => ({ x, y, sizePct, blurPct, paletteKey, alpha });

export const BLOB_STARTERS: BlobPreset[] = [
  {
    id: 'starter-aurora',
    name: 'Aurora',
    shapes: [
      s(22, 30, 38, 55, 'c4', 0.9),
      s(72, 28, 32, 60, 'c3', 0.85),
      s(42, 78, 40, 65, 'c2', 0.9),
      s(82, 80, 28, 55, 'c1', 0.85),
    ],
  },
  {
    id: 'starter-cloudbed',
    name: 'Cloudbed',
    shapes: [
      s(28, 38, 48, 65, 'c1', 0.95),
      s(75, 30, 40, 60, 'c2', 0.9),
      s(55, 78, 44, 60, 'c2', 0.8),
      s(15, 82, 30, 65, 'c1', 0.9),
    ],
  },
  {
    id: 'starter-confetti',
    name: 'Confetti',
    shapes: [
      s(20, 24, 22, 40, 'c4', 0.85),
      s(68, 18, 26, 45, 'c3', 0.85),
      s(40, 52, 24, 40, 'c2', 0.85),
      s(82, 58, 22, 45, 'c4', 0.8),
      s(28, 82, 28, 45, 'c3', 0.85),
      s(74, 84, 22, 40, 'c1', 0.9),
    ],
  },
  {
    id: 'starter-tideline',
    name: 'Tideline',
    shapes: [
      s(15, 30, 50, 70, 'c4', 0.85),
      s(50, 50, 55, 70, 'c3', 0.85),
      s(85, 70, 50, 70, 'c2', 0.85),
    ],
  },
  {
    id: 'starter-spotlight',
    name: 'Spotlight',
    shapes: [
      s(50, 50, 55, 70, 'c3', 0.95),
      s(20, 20, 30, 65, 'c4', 0.6),
      s(80, 80, 30, 65, 'c4', 0.6),
      s(80, 22, 28, 65, 'c2', 0.55),
      s(20, 78, 28, 65, 'c2', 0.55),
    ],
  },
  {
    id: 'starter-orbit',
    name: 'Orbit',
    shapes: [
      s(50, 50, 35, 60, 'c1', 0.9),
      s(18, 50, 30, 55, 'c4', 0.85),
      s(82, 50, 30, 55, 'c3', 0.85),
      s(50, 12, 26, 55, 'c2', 0.8),
      s(50, 88, 26, 55, 'c2', 0.8),
    ],
  },
];

export function defaultBlob(): BlobPreset {
  return cloneBlob(BLOB_STARTERS[0]);
}

export function cloneBlob(preset: BlobPreset): BlobPreset {
  return {
    ...preset,
    shapes: preset.shapes.map((shape) => ({ ...shape })),
  };
}
