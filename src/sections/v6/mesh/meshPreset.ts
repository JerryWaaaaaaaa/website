import { ASCII_TILE_DEFAULTS, type AsciiTrailParams } from '../halftone/AsciiTrail';
import type { MeshGradientParams } from './MeshGradient';

/**
 * The DialKit-tuned "Mesh + tiles" look, shared by the V6 hero and CTA (each
 * still gets its own panel): a liquid warp of deep plum → violet → pink →
 * mint → blue under heavy soft-light grain.
 */
export const V6_MESH: MeshGradientParams = {
  mode: 'warp',
  scale: 1.85,
  warp: 0.95,
  contrast: 0.5,
  dither: 0.07,
  offsetX: 0,
  offsetY: -0.71,
  // Warp ramp, in order.
  ramp: ['#3d1d49', '#cc69e8', '#ff94b9', '#b3fff6', '#3d8bff'],
  // Patches: the same palette on a 3 × 3 mesh, deep red top-left flowing to
  // mint / blue bottom-right; the centre point sits off-centre for a bend.
  patches: [
    { x: 0, y: 0, color: '#861818' },
    { x: 55, y: 0, color: '#cc69e8' },
    { x: 100, y: 0, color: '#ff94b9' },
    { x: 0, y: 45, color: '#cc69e8' },
    { x: 38, y: 58, color: '#ff94b9' },
    { x: 100, y: 40, color: '#3d8bff' },
    { x: 0, y: 100, color: '#b3fff6' },
    { x: 62, y: 100, color: '#3d8bff' },
    { x: 100, y: 100, color: '#b3fff6' },
  ],
  patchGrain: 0.06,
  speed: 0.95,
  drift: 8,
  grain: 1,
  grainSize: 496,
  grainBlend: 'soft-light',
};

/**
 * Its tile trail: flush 16px tiles sampled from the mesh, a wide brush, and
 * 2× tiles only where it's hottest. Glyphs are random letters + symbols per
 * cell (not picked by heat, which made neighbours repeat the same letter).
 */
export const V6_TILE_TRAIL: AsciiTrailParams = {
  ...ASCII_TILE_DEFAULTS,
  tileGap: 0,
  tileRadius: 0,
  size1: 1,
  size2: 2,
  size3: 2,
  size2Heat: 0.8,
  size3Heat: 0.94,
  charset: 'mixed',
  byHeat: false,
  cellSize: 16,
  radius: 100,
  speedBoost: 1.1,
  maxSpeed: 3,
  intensity: 0.25,
  halfLife: 350,
  flicker: 12.5,
  palette: 'background',
  mixColors: ['#f8f2ff', '#e9f5ff', '#bfd1fb', '#98b6f5'], // fallback before the mesh draws
};

export const V6_MESH_DIALS = { mesh: V6_MESH, ascii: V6_TILE_TRAIL };
