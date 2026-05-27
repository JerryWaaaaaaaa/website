import type { PaletteKey } from './presets';

export const POINTS_MIN = 2;
export const POINTS_MAX = 8;

/** Bounds on `softness` (0..1). Maps to Gaussian sigma in renderMesh. */
export const SOFTNESS_MIN = 0;
export const SOFTNESS_MAX = 1;

export type MeshPoint = {
  /** 0..100, percent of canvas width */
  x: number;
  /** 0..100, percent of canvas height */
  y: number;
  paletteKey: PaletteKey;
  /** 0..1, relative influence among points */
  weight: number;
};

export type MeshPreset = {
  id: string;
  name: string;
  /** 0..1, controls Gaussian sigma (low = crisp, high = dreamy) */
  softness: number;
  points: MeshPoint[];
};

const p = (
  x: number,
  y: number,
  paletteKey: PaletteKey,
  weight = 1,
): MeshPoint => ({ x, y, paletteKey, weight });

export function clampPoints<T>(points: T[]): T[] {
  if (points.length <= POINTS_MAX) return points;
  return points.slice(0, POINTS_MAX);
}

export const DEFAULT_MESH_PRESETS: MeshPreset[] = [
  {
    id: 'aurora-soft',
    name: 'Aurora Soft',
    softness: 0.55,
    points: [
      p(8, 12, 'c1', 1),
      p(35, 40, 'c2', 0.9),
      p(72, 32, 'c3', 0.9),
      p(60, 78, 'c4', 0.85),
      p(95, 90, 'c1', 0.7),
    ],
  },
  {
    id: 'aurora-bold',
    name: 'Aurora Bold',
    softness: 0.35,
    points: [
      p(15, 20, 'c4', 1),
      p(70, 15, 'c3', 1),
      p(35, 80, 'c4', 0.9),
      p(85, 70, 'c3', 0.95),
      p(50, 50, 'c1', 0.55),
    ],
  },
  {
    id: 'crescent',
    name: 'Crescent',
    softness: 0.3,
    points: [
      p(20, 12, 'c4', 1),
      p(55, 8, 'c3', 0.95),
      p(85, 18, 'c4', 1),
      p(35, 85, 'c1', 1),
    ],
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    softness: 0.6,
    points: [
      p(50, 45, 'c3', 1),
      p(5, 5, 'c1', 0.7),
      p(95, 5, 'c1', 0.7),
      p(5, 95, 'c1', 0.7),
      p(95, 95, 'c1', 0.7),
    ],
  },
  {
    id: 'horizon',
    name: 'Horizon',
    softness: 0.4,
    points: [
      p(15, 10, 'c4', 1),
      p(50, 8, 'c3', 1),
      p(85, 10, 'c4', 1),
      p(20, 55, 'c2', 0.9),
      p(80, 55, 'c2', 0.9),
      p(50, 95, 'c1', 0.95),
    ],
  },
  {
    id: 'dawn',
    name: 'Dawn',
    softness: 0.5,
    points: [
      p(85, 20, 'c4', 1),
      p(70, 50, 'c3', 0.85),
      p(20, 30, 'c2', 0.8),
      p(15, 80, 'c1', 1),
      p(55, 88, 'c2', 0.7),
    ],
  },
  {
    id: 'glacier',
    name: 'Glacier',
    softness: 0.22,
    points: [
      p(20, 25, 'c1', 1),
      p(70, 15, 'c2', 0.95),
      p(40, 70, 'c2', 0.9),
      p(85, 80, 'c4', 0.95),
    ],
  },
  {
    id: 'bloom',
    name: 'Bloom',
    softness: 0.4,
    points: [
      p(50, 50, 'c3', 1),
      p(50, 12, 'c4', 0.85),
      p(15, 65, 'c2', 0.85),
      p(85, 65, 'c1', 0.95),
    ],
  },
  {
    id: 'tide',
    name: 'Tide',
    softness: 0.28,
    points: [
      p(8, 30, 'c2', 1),
      p(0, 75, 'c1', 0.9),
      p(45, 50, 'c3', 0.55),
      p(92, 25, 'c4', 1),
      p(100, 70, 'c3', 0.95),
      p(60, 95, 'c2', 0.7),
    ],
  },
  {
    id: 'nebula',
    name: 'Nebula',
    softness: 0.7,
    points: [
      p(18, 22, 'c4', 1),
      p(72, 18, 'c2', 0.85),
      p(30, 58, 'c3', 0.95),
      p(80, 55, 'c4', 0.85),
      p(15, 85, 'c1', 0.7),
      p(60, 90, 'c3', 0.8),
      p(95, 92, 'c2', 0.7),
    ],
  },
  {
    id: 'stained-glass',
    name: 'Stained Glass',
    softness: 0.15,
    points: [
      p(20, 25, 'c4', 1),
      p(75, 20, 'c3', 1),
      p(30, 75, 'c2', 1),
      p(85, 80, 'c4', 1),
      p(55, 50, 'c1', 1),
    ],
  },
  {
    id: 'whisper',
    name: 'Whisper',
    softness: 0.65,
    points: [
      p(50, 50, 'c1', 1),
      p(15, 20, 'c2', 0.4),
      p(85, 30, 'c3', 0.45),
      p(40, 88, 'c4', 0.4),
    ],
  },
  {
    id: 'aether',
    name: 'Aether',
    softness: 0.45,
    points: [
      p(50, 8, 'c4', 1),
      p(50, 95, 'c1', 1),
      p(18, 45, 'c3', 0.75),
      p(82, 55, 'c3', 0.75),
      p(50, 50, 'c2', 0.55),
    ],
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    softness: 0.4,
    points: [
      p(30, 40, 'c2', 1),
      p(70, 60, 'c2', 0.95),
      p(10, 10, 'c3', 0.85),
      p(90, 85, 'c4', 0.95),
      p(85, 15, 'c1', 0.7),
    ],
  },
  {
    id: 'prism',
    name: 'Prism',
    softness: 0.35,
    points: [
      p(15, 18, 'c4', 1),
      p(82, 22, 'c3', 1),
      p(18, 78, 'c2', 1),
      p(82, 82, 'c1', 1),
    ],
  },
  {
    id: 'mist',
    name: 'Mist',
    softness: 0.72,
    points: [
      p(20, 20, 'c1', 1),
      p(75, 25, 'c2', 0.95),
      p(25, 75, 'c2', 0.95),
      p(80, 78, 'c1', 1),
      p(50, 50, 'c3', 0.4),
    ],
  },
  {
    id: 'ember',
    name: 'Ember',
    softness: 0.32,
    points: [
      p(82, 18, 'c4', 1),
      p(65, 50, 'c3', 0.95),
      p(35, 30, 'c2', 0.8),
      p(15, 85, 'c1', 1),
    ],
  },
  {
    id: 'vapor',
    name: 'Vapor',
    softness: 0.5,
    points: [
      p(50, 8, 'c3', 1),
      p(15, 35, 'c2', 0.9),
      p(85, 35, 'c2', 0.9),
      p(50, 65, 'c1', 1),
      p(50, 95, 'c1', 1),
    ],
  },
  {
    id: 'iris',
    name: 'Iris',
    softness: 0.4,
    points: [
      p(50, 50, 'c1', 1),
      p(50, 12, 'c3', 0.9),
      p(50, 88, 'c3', 0.9),
      p(12, 50, 'c4', 0.95),
      p(88, 50, 'c4', 0.95),
    ],
  },
  {
    id: 'dusk',
    name: 'Dusk',
    softness: 0.5,
    points: [
      p(50, 10, 'c4', 1),
      p(50, 95, 'c1', 1),
      p(12, 60, 'c3', 0.7),
      p(88, 40, 'c3', 0.7),
      p(50, 55, 'c2', 0.6),
    ],
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    softness: 0.4,
    points: [
      p(8, 8, 'c1', 1),
      p(38, 38, 'c2', 0.95),
      p(68, 68, 'c3', 0.95),
      p(95, 95, 'c4', 1),
    ],
  },
  {
    id: 'frost',
    name: 'Frost',
    softness: 0.55,
    points: [
      p(18, 18, 'c1', 1),
      p(80, 22, 'c2', 0.95),
      p(25, 80, 'c2', 0.9),
      p(75, 75, 'c1', 0.95),
      p(50, 50, 'c3', 0.6),
    ],
  },
];
