/**
 * Automatic blog-cover backgrounds.
 *
 * Reuses the existing gradient generator (src/routes/gradient-generator) — its
 * `buildBackgroundCss` turns a preset + palette into a pure-CSS layered
 * radial-gradient, so every cover is cheap (no WebGL) and on-brand. We add a
 * grain/dither texture and a title overlay on top in <BlogCover>.
 *
 * The result is DETERMINISTIC per seed (a small string hash picks the preset and
 * palette), so a post's cover is stable across reloads.
 */
import { buildBackgroundCss } from '../gradient-generator/buildCss';
import { DEFAULT_PALETTE, DEFAULT_PRESETS } from '../gradient-generator/presets';

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) & 0x7fffffff;
  return h;
}

/**
 * Layered radial-gradient CSS `background` for a seed (e.g. slug), using the
 * Gradient Generator's own default palette (the four brand gradient stops).
 * Only the preset (composition) varies per seed, so every cover stays in one
 * cohesive, on-brand family — the same look the generator ships with. To
 * restyle, swap DEFAULT_PALETTE for a saved palette from the generator.
 */
export function coverBackground(seed: string): string {
  const preset = DEFAULT_PRESETS[hash(seed) % DEFAULT_PRESETS.length];
  return buildBackgroundCss(DEFAULT_PALETTE, preset);
}

/**
 * Static grayscale film-grain as an SVG data URI (fractalNoise → desaturated),
 * tiled and blended over the gradient for the "shader-like" texture. One shared
 * constant for every cover.
 */
export const GRAIN_DATA_URI =
  'data:image/svg+xml,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>" +
      "<filter id='n'>" +
      "<feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>" +
      "<feColorMatrix type='saturate' values='0'/>" +
      '</filter>' +
      "<rect width='100%' height='100%' filter='url(#n)'/>" +
      '</svg>'
  );
