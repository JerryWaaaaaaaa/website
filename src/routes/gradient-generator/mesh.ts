import type { PaletteKey } from './presets';

export const MESH_MIN = 2;
export const MESH_MAX = 5;

export type MeshPreset = {
  id: string;
  name: string;
  cols: number;
  rows: number;
  cells: PaletteKey[];
};

/** Returns a flat row-major array of length rows*cols filled with `fill`. */
export function emptyCells(rows: number, cols: number, fill: PaletteKey): PaletteKey[] {
  return new Array(rows * cols).fill(fill);
}

/**
 * Re-shape a `cells` array to new (rows, cols). Existing cells stay at the
 * same (row, col) index when in-bounds; new cells get `fill`.
 */
export function resizeCells(
  prev: PaletteKey[],
  prevRows: number,
  prevCols: number,
  nextRows: number,
  nextCols: number,
  fill: PaletteKey,
): PaletteKey[] {
  const next = emptyCells(nextRows, nextCols, fill);
  const rows = Math.min(prevRows, nextRows);
  const cols = Math.min(prevCols, nextCols);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      next[y * nextCols + x] = prev[y * prevCols + x];
    }
  }
  return next;
}

export const DEFAULT_MESH_PRESETS: MeshPreset[] = [
  {
    id: 'aurora-mesh',
    name: 'Aurora Mesh',
    cols: 3,
    rows: 3,
    cells: [
      'c1', 'c2', 'c3',
      'c2', 'c3', 'c4',
      'c1', 'c2', 'c3',
    ],
  },
  {
    id: 'dusk-mesh',
    name: 'Dusk Mesh',
    cols: 3,
    rows: 3,
    cells: [
      'c4', 'c3', 'c2',
      'c3', 'c2', 'c1',
      'c2', 'c1', 'c1',
    ],
  },
  {
    id: 'bloom-mesh',
    name: 'Bloom Mesh',
    cols: 3,
    rows: 3,
    cells: [
      'c1', 'c4', 'c1',
      'c3', 'c2', 'c3',
      'c1', 'c4', 'c1',
    ],
  },
  {
    id: 'horizon-mesh',
    name: 'Horizon Mesh',
    cols: 2,
    rows: 3,
    cells: [
      'c4', 'c3',
      'c3', 'c2',
      'c1', 'c1',
    ],
  },
  {
    id: 'prism-mesh',
    name: 'Prism Mesh',
    cols: 4,
    rows: 3,
    cells: [
      'c1', 'c2', 'c3', 'c4',
      'c2', 'c3', 'c4', 'c3',
      'c1', 'c2', 'c3', 'c4',
    ],
  },
  {
    id: 'iris-mesh',
    name: 'Iris Mesh',
    cols: 3,
    rows: 3,
    cells: [
      'c4', 'c1', 'c4',
      'c1', 'c3', 'c1',
      'c4', 'c1', 'c4',
    ],
  },
];
