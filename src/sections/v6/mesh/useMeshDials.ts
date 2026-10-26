import { useEffect, useRef, useState } from 'react';
import { useDialKit, type DialConfig } from 'dialkit';
import { ASCII_TILE_DEFAULTS, type AsciiTrailParams } from '../halftone/AsciiTrail';
import { asciiDialConfig, readAsciiDials } from '../halftone/useShaderDials';
import {
  GRAIN_BLENDS,
  MESH_MODES,
  PATCH_COLS,
  PATCH_ROWS,
  type GrainBlend,
  type MeshGradientParams,
  type MeshMode,
} from './MeshGradient';

type Tuple = [number, number, number, number];

type Options = {
  /** Spec values; ramp colours and patch points each get dials. */
  mesh: MeshGradientParams;
  ascii?: AsciiTrailParams;
};

/** Patch point key, e.g. r1c2 = row 1, column 2. */
const patchKey = (i: number) => `r${Math.floor(i / PATCH_COLS) + 1}c${(i % PATCH_COLS) + 1}`;

/** Panel config with only the controls the given mode uses. */
function buildConfig(mesh: MeshGradientParams, ascii: AsciiTrailParams, mode: MeshMode) {
  const modeControls: DialConfig = {};
  if (mode === 'warp') {
    // Domain-warped noise through the ramp colours.
    modeControls.liquid = {
      scale: [mesh.scale, 0.2, 6, 0.05] as Tuple, // ribbons across the section
      warp: [mesh.warp, 0, 6, 0.05] as Tuple, // fold strength
      contrast: [mesh.contrast, 0.5, 6, 0.05] as Tuple, // band sharpness
      dither: [mesh.dither, 0, 0.5, 0.005] as Tuple, // grain
      offsetX: [mesh.offsetX, -1, 1, 0.005] as Tuple, // pan, × section width (+ right)
      offsetY: [mesh.offsetY, -1, 1, 0.005] as Tuple, // pan, × section height (+ down)
    };
    const ramp: DialConfig = { _collapsed: true };
    mesh.ramp.forEach((c, i) => {
      ramp[`color${i + 1}`] = { type: 'color', default: c };
    });
    modeControls.ramp = ramp;
  } else {
    // A 3 × 3 mesh of coloured control points. Edge points only slide along
    // their edge (corners are fixed), so each point only gets sliders for the
    // axes it can move on.
    const patches: DialConfig = {
      drift: [mesh.drift, 0, 30, 0.5] as Tuple, // % the free points wander
      grain: [mesh.patchGrain, 0, 0.3, 0.005] as Tuple,
    };
    mesh.patches.forEach((p, i) => {
      const r = Math.floor(i / PATCH_COLS);
      const c = i % PATCH_COLS;
      const point: DialConfig = { _collapsed: true, color: { type: 'color', default: p.color } };
      if (c > 0 && c < PATCH_COLS - 1) point.x = [p.x, 0, 100, 0.5] as Tuple;
      if (r > 0 && r < PATCH_ROWS - 1) point.y = [p.y, 0, 100, 0.5] as Tuple;
      patches[patchKey(i)] = point;
    });
    modeControls.patches = patches;
  }
  return {
    mode: { type: 'select' as const, options: [...MESH_MODES], default: mode },
    speed: [mesh.speed, 0, 5, 0.05] as Tuple, // 0 = static
    ...modeControls,
    noise: {
      _collapsed: true,
      amount: [mesh.grain, 0, 1, 0.01] as Tuple, // 0 = off
      size: [mesh.grainSize, 32, 512, 8] as Tuple, // px per noise tile; larger = coarser
      blend: { type: 'select' as const, options: [...GRAIN_BLENDS], default: mesh.grainBlend },
    },
    // Cursor trail: coloured tiles with white glyphs by default.
    ascii: asciiDialConfig(ascii),
  } satisfies DialConfig;
}

type Values = {
  mode?: string;
  speed?: number;
  liquid?: Partial<Record<'scale' | 'warp' | 'contrast' | 'dither' | 'offsetX' | 'offsetY', number>>;
  ramp?: Record<string, string | undefined>;
  patches?: Record<string, unknown>;
  noise?: { amount?: number; size?: number; blend?: string };
  ascii: Record<string, unknown> & { enabled: boolean };
};

/** Copies only the defined entries (a just-shown control has no value until DialKit catches up). */
function defined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/**
 * Registers a DialKit panel for one mesh-gradient section (mesh + ASCII trail)
 * and returns the live values. The mesh counterpart of useShaderDials.
 * The panel only shows the selected mode's controls. DialKit drops the values
 * of controls that leave the config, so the last value of every param is kept
 * here and seeds a mode's controls when it's shown again.
 * `opts` must be stable (a module constant) — it seeds the panel's defaults.
 */
export function useMeshDials(name: string, opts: Options) {
  const lastRef = useRef<MeshGradientParams>(opts.mesh);
  const [mode, setMode] = useState<MeshMode>(opts.mesh.mode);
  const d = useDialKit(
    name,
    buildConfig(lastRef.current, opts.ascii ?? ASCII_TILE_DEFAULTS, mode),
  ) as unknown as Values;

  const prev = lastRef.current;
  const next: Partial<MeshGradientParams> = defined({
    mode: MESH_MODES.includes(d.mode as MeshMode) ? (d.mode as MeshMode) : undefined,
    speed: d.speed,
    grain: d.noise?.amount,
    grainSize: d.noise?.size,
    grainBlend: d.noise?.blend as GrainBlend | undefined,
  });
  if (mode === 'warp' && d.liquid) {
    Object.assign(next, defined(d.liquid));
    next.ramp = prev.ramp.map((c, i) => d.ramp?.[`color${i + 1}`] ?? c);
  }
  if (mode === 'patches' && d.patches) {
    const pt = d.patches;
    if (typeof pt.drift === 'number') next.drift = pt.drift;
    if (typeof pt.grain === 'number') next.patchGrain = pt.grain;
    next.patches = prev.patches.map((home, i) => {
      const v = (pt[patchKey(i)] ?? {}) as { color?: string; x?: number; y?: number };
      return { color: v.color ?? home.color, x: v.x ?? home.x, y: v.y ?? home.y };
    });
  }
  const mesh: MeshGradientParams = { ...prev, ...next };
  lastRef.current = mesh;

  // A mode switch rebuilds the panel with that mode's controls.
  useEffect(() => {
    if (mesh.mode !== mode) setMode(mesh.mode);
  }, [mesh.mode, mode]);

  return { mesh, ...readAsciiDials(d.ascii) };
}
