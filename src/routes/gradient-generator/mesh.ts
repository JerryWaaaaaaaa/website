import {
  GRAIN_BLENDS,
  MAX_RAMP,
  MESH_MODES,
  PATCH_GRID_MAX,
  PATCH_GRID_MIN,
  PATCH_WEIGHT_MAX,
  PATCH_WEIGHT_MIN,
  patchGrid,
  type GrainBlend,
  type MeshGradientParams,
  type MeshMode,
  type MeshPatchPoint,
} from '../../sections/v6/mesh/meshRenderer';
import { V6_MESH } from '../../sections/v6/mesh/meshPreset';

export const RAMP_MIN = 2;
export const RAMP_MAX = MAX_RAMP;
export const GRID_MIN = PATCH_GRID_MIN;
export const GRID_MAX = PATCH_GRID_MAX;
export const WEIGHT_MIN = PATCH_WEIGHT_MIN;
export const WEIGHT_MAX = PATCH_WEIGHT_MAX;

/** A saved mesh: the same params the V6 hero / CTA <MeshGradient> takes. */
export type MeshPreset = {
  id: string;
  name: string;
  params: MeshGradientParams;
};

type NumericKey = {
  [K in keyof MeshGradientParams]-?: MeshGradientParams[K] extends number ? K : never;
}[keyof MeshGradientParams];

/** Slider bounds — the same ranges the V6 DialKit panel (useMeshDials) exposes. */
export const MESH_RANGES: Record<NumericKey, { min: number; max: number; step: number }> = {
  speed: { min: 0, max: 5, step: 0.05 },
  scale: { min: 0.2, max: 6, step: 0.05 },
  warp: { min: 0, max: 6, step: 0.05 },
  contrast: { min: 0.5, max: 6, step: 0.05 },
  dither: { min: 0, max: 0.5, step: 0.005 },
  offsetX: { min: -1, max: 1, step: 0.005 },
  offsetY: { min: -1, max: 1, step: 0.005 },
  drift: { min: 0, max: 30, step: 0.5 },
  patchDither: { min: 0, max: 0.2, step: 0.002 },
  grain: { min: 0, max: 1, step: 0.01 },
  grainSize: { min: 32, max: 512, step: 8 },
};

export function cloneMeshParams(p: MeshGradientParams): MeshGradientParams {
  return { ...p, ramp: [...p.ramp], patches: p.patches.map((pt) => ({ ...pt })) };
}

export function cloneMesh(preset: MeshPreset): MeshPreset {
  return { ...preset, params: cloneMeshParams(preset.params) };
}

/**
 * Starters. Both read V6_MESH live, so they always match what the hero and
 * CTA currently ship.
 */
export const DEFAULT_MESH_PRESETS: MeshPreset[] = [
  { id: 'v6-warp', name: 'Hero / CTA · Warp', params: cloneMeshParams(V6_MESH) },
  {
    id: 'v6-patches',
    name: 'Hero / CTA · Patches',
    params: { ...cloneMeshParams(V6_MESH), mode: 'patches' },
  },
];

export function newMeshPreset(): MeshPreset {
  return {
    id: `mesh-${Date.now().toString(36)}`,
    name: 'Untitled mesh',
    params: cloneMeshParams(V6_MESH),
  };
}

const HEX = /^#[0-9a-f]{6}$/i;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Coerces stored / pasted params into valid ones, falling back to V6_MESH field by field. */
export function normalizeMeshParams(value: unknown): MeshGradientParams {
  const base = cloneMeshParams(V6_MESH);
  if (!value || typeof value !== 'object') return base;
  const v = value as Partial<Record<keyof MeshGradientParams, unknown>>;
  const out: MeshGradientParams = { ...base };
  (Object.keys(MESH_RANGES) as NumericKey[]).forEach((key) => {
    const n = Number(v[key]);
    if (v[key] !== undefined && Number.isFinite(n)) {
      out[key] = clamp(n, MESH_RANGES[key].min, MESH_RANGES[key].max);
    }
  });
  if (MESH_MODES.includes(v.mode as MeshMode)) out.mode = v.mode as MeshMode;
  if (GRAIN_BLENDS.includes(v.grainBlend as GrainBlend)) out.grainBlend = v.grainBlend as GrainBlend;
  if (Array.isArray(v.ramp)) {
    const ramp = v.ramp.filter((c): c is string => typeof c === 'string' && HEX.test(c)).slice(0, RAMP_MAX);
    if (ramp.length >= RAMP_MIN) out.ramp = ramp;
  }
  const cols = Math.round(Number(v.cols ?? patchGrid(base).cols));
  const rows = Math.round(Number(v.rows ?? patchGrid(base).rows));
  const gridOk = [cols, rows].every((n) => Number.isFinite(n) && n >= GRID_MIN && n <= GRID_MAX);
  if (gridOk && Array.isArray(v.patches) && v.patches.length === cols * rows) {
    if (v.cols !== undefined || v.rows !== undefined) {
      out.cols = cols;
      out.rows = rows;
    }
    out.patches = (v.patches as unknown[]).map((_, i) => {
      // Fallback home: an even grid position.
      const home = base.patches[i] ?? {
        x: ((i % cols) / (cols - 1)) * 100,
        y: (Math.floor(i / cols) / (rows - 1)) * 100,
        color: '#ffffff',
      };
      const p = (v.patches as unknown[])[i] as Partial<Record<'x' | 'y' | 'color' | 'weight', unknown>> | null;
      const point: MeshGradientParams['patches'][number] = {
        x: clamp(Number(p?.x ?? home.x) || 0, 0, 100),
        y: clamp(Number(p?.y ?? home.y) || 0, 0, 100),
        color: typeof p?.color === 'string' && HEX.test(p.color) ? p.color : home.color,
      };
      const weight = Number(p?.weight);
      if (p?.weight !== undefined && Number.isFinite(weight) && weight !== 1) {
        point.weight = clamp(weight, WEIGHT_MIN, WEIGHT_MAX);
      }
      return point;
    });
  }
  return out;
}

/** Params as a TS constant, ready to paste over V6_MESH in sections/v6/mesh/meshPreset.ts. */
export function meshParamsToTs(p: MeshGradientParams, name = 'V6_MESH'): string {
  const n = (x: number) => String(Math.round(x * 1000) / 1000);
  const lines = [
    `export const ${name}: MeshGradientParams = {`,
    `  mode: '${p.mode}',`,
    `  scale: ${n(p.scale)},`,
    `  warp: ${n(p.warp)},`,
    `  contrast: ${n(p.contrast)},`,
    `  dither: ${n(p.dither)},`,
    `  offsetX: ${n(p.offsetX)},`,
    `  offsetY: ${n(p.offsetY)},`,
    `  ramp: [${p.ramp.map((c) => `'${c}'`).join(', ')}],`,
    ...(p.cols !== undefined || p.rows !== undefined
      ? [`  cols: ${patchGrid(p).cols},`, `  rows: ${patchGrid(p).rows},`]
      : []),
    `  patches: [`,
    ...p.patches.map((pt) => {
      const weight = pt.weight !== undefined && pt.weight !== 1 ? `, weight: ${n(pt.weight)}` : '';
      return `    { x: ${n(pt.x)}, y: ${n(pt.y)}, color: '${pt.color}'${weight} },`;
    }),
    `  ],`,
    `  patchDither: ${n(p.patchDither)},`,
    `  speed: ${n(p.speed)},`,
    `  drift: ${n(p.drift)},`,
    `  grain: ${n(p.grain)},`,
    `  grainSize: ${n(p.grainSize)},`,
    `  grainBlend: '${p.grainBlend}',`,
    `};`,
  ];
  return lines.join('\n');
}

// --- Patch grid editing --------------------------------------------------------

function mixHex(a: string, b: string): string {
  const ch = (hex: string, k: number) => parseInt(hex.slice(1 + k * 2, 3 + k * 2), 16);
  return `#${[0, 1, 2]
    .map((k) => Math.round((ch(a, k) + ch(b, k)) / 2).toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Halfway between two points: colours blended, weights averaged. */
const between = (a: MeshPatchPoint, b: MeshPatchPoint): MeshPatchPoint => {
  const weight = ((a.weight ?? 1) + (b.weight ?? 1)) / 2;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    color: mixHex(a.color, b.color),
    ...(weight !== 1 ? { weight } : {}),
  };
};

type GridEdit = { params: MeshGradientParams; index: number };

/**
 * Inserts a column of points after point `index`'s column (before it when
 * that's the last column), halfway between its neighbours. Returns the new
 * params and the index of the inserted point in `index`'s row.
 */
export function addPatchColumn(p: MeshGradientParams, index: number): GridEdit | null {
  const { cols, rows } = patchGrid(p);
  if (cols >= GRID_MAX) return null;
  const r = Math.floor(index / cols);
  const left = Math.min(index % cols, cols - 2);
  const patches: MeshPatchPoint[] = [];
  for (let row = 0; row < rows; row++) {
    const line = p.patches.slice(row * cols, (row + 1) * cols);
    line.splice(left + 1, 0, between(line[left], line[left + 1]));
    patches.push(...line);
  }
  return { params: { ...p, cols: cols + 1, rows, patches }, index: r * (cols + 1) + left + 1 };
}

/** Inserts a row of points after point `index`'s row (before it when that's the last row). */
export function addPatchRow(p: MeshGradientParams, index: number): GridEdit | null {
  const { cols, rows } = patchGrid(p);
  if (rows >= GRID_MAX) return null;
  const c = index % cols;
  const top = Math.min(Math.floor(index / cols), rows - 2);
  const row = (k: number) => p.patches.slice(k * cols, (k + 1) * cols);
  const added = row(top).map((a, i) => between(a, row(top + 1)[i]));
  const patches = [...p.patches.slice(0, (top + 1) * cols), ...added, ...p.patches.slice((top + 1) * cols)];
  return { params: { ...p, cols, rows: rows + 1, patches }, index: (top + 1) * cols + c };
}

/** Removes point `index`'s column. Returns the index of the point that takes its place. */
export function removePatchColumn(p: MeshGradientParams, index: number): GridEdit | null {
  const { cols, rows } = patchGrid(p);
  if (cols <= GRID_MIN) return null;
  const r = Math.floor(index / cols);
  const c = index % cols;
  const patches = p.patches.filter((_, i) => i % cols !== c);
  return { params: { ...p, cols: cols - 1, rows, patches }, index: r * (cols - 1) + Math.min(c, cols - 2) };
}

/** Removes point `index`'s row. */
export function removePatchRow(p: MeshGradientParams, index: number): GridEdit | null {
  const { cols, rows } = patchGrid(p);
  if (rows <= GRID_MIN) return null;
  const r = Math.floor(index / cols);
  const c = index % cols;
  const patches = p.patches.filter((_, i) => Math.floor(i / cols) !== r);
  return { params: { ...p, cols, rows: rows - 1, patches }, index: Math.min(r, rows - 2) * cols + c };
}
