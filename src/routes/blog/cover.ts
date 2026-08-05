/**
 * Automatic blog-cover helpers.
 *
 * Covers reuse the gradient generator's **mesh** presets (point-based Gaussian
 * blends, rendered by <MeshCanvas>) with the generator's default palette;
 * <BlogCover> layers a grain/dither texture and a title overlay on top.
 *
 * Deterministic per seed: a small string hash picks the mesh preset, so a
 * post's cover is stable across reloads.
 */
import { DEFAULT_MESH_PRESETS, type MeshPreset } from '../gradient-generator/mesh';

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) & 0x7fffffff;
  return h;
}

/** Deterministically pick a mesh preset for a seed (e.g. slug). */
export function meshFor(seed: string): MeshPreset {
  return DEFAULT_MESH_PRESETS[hash(seed) % DEFAULT_MESH_PRESETS.length];
}

/**
 * Grayscale film-grain as an SVG data URI (fractalNoise → desaturated), tiled
 * and blended over the gradient for the "shader-like" texture.
 */
export const GRAIN_DATA_URI =
  'data:image/svg+xml,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>" +
      "<filter id='n'>" +
      "<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>" +
      "<feColorMatrix type='saturate' values='0'/>" +
      '</filter>' +
      "<rect width='100%' height='100%' filter='url(#n)'/>" +
      '</svg>'
  );
