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
import { DEFAULT_PRESETS, type Palette } from '../gradient-generator/presets';

/**
 * On-brand palette variants, all mapped to existing design tokens (see
 * gradient-generator/tokens.ts). Blue/purple/lavender family with enough depth
 * that white overlay text stays legible. Tune here to restyle every cover.
 */
const PALETTES: Palette[] = [
  { c1: 'gradient-stop-1', c2: 'gradient-stop-2', c3: 'gradient-stop-3', c4: 'gradient-stop-4' },
  { c1: 'gradient-stop-3', c2: 'gradient-stop-4', c3: 'blue', c4: 'gradient-stop-2' },
  { c1: 'pink', c2: 'gradient-stop-3', c3: 'gradient-stop-4', c4: 'blue' },
  { c1: 'gradient-stop-1', c2: 'pink', c3: 'gradient-stop-4', c4: 'blue' },
  { c1: 'gradient-stop-4', c2: 'blue', c3: 'gradient-stop-3', c4: 'pink' },
  { c1: 'shade-medium', c2: 'gradient-stop-3', c3: 'gradient-stop-4', c4: 'shade-dark' },
];

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) & 0x7fffffff;
  return h;
}

/** Layered radial-gradient CSS `background` value for a given seed (e.g. slug). */
export function coverBackground(seed: string): string {
  const h = hash(seed);
  const preset = DEFAULT_PRESETS[h % DEFAULT_PRESETS.length];
  const palette = PALETTES[(h >> 8) % PALETTES.length];
  return buildBackgroundCss(palette, preset);
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
