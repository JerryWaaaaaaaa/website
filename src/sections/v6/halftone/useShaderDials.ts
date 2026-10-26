import { useDialKit, type DialConfig } from 'dialkit';
import type { GradientStop, HalftoneParams } from './HalftoneImage';
import {
  ASCII_BLEND_MODES,
  ASCII_CHARSETS,
  ASCII_FONTS,
  ASCII_PALETTES,
  ASCII_STYLES,
  ASCII_TRAIL_DEFAULTS,
  type AsciiBlendMode,
  type AsciiCharset,
  type AsciiFont,
  type AsciiPalette,
  type AsciiStyle,
  type AsciiTrailParams,
} from './AsciiTrail';

type RGBA = GradientStop['color'];
const toHex = ([r, g, b]: RGBA) =>
  '#' + [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string): RGBA => {
  const n = parseInt(hex.slice(1, 7), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
};
type Tuple = [number, number, number, number];

type Options = {
  /** Spec values; gradient stops each get a Stop<n> folder. */
  params: HalftoneParams;
  /**
   * Multiplier from the Dot Size dial to params.dotSize — lets the dial read in
   * Figma's units when the shader takes another (e.g. photo px → frame px).
   */
  dotSizeUnit?: number;
  ascii?: AsciiTrailParams;
  asciiEnabled?: boolean;
};

/** The "ascii" DialKit folder (cursor trail), shared by every V6 background. */
export function asciiDialConfig(ascii: AsciiTrailParams, enabled = true) {
  return {
    _collapsed: true,
    enabled,
    style: {
      type: 'select' as const,
      options: [...ASCII_STYLES],
      default: ascii.style,
    },
    tileGap: [ascii.tileGap, 0, 8, 0.5] as Tuple, // style "tile"
    tileRadius: [ascii.tileRadius, 0, 12, 0.5] as Tuple, // style "tile"
    font: {
      type: 'select' as const,
      options: Object.keys(ASCII_FONTS) as AsciiFont[],
      default: ascii.font,
    },
    // Three tile sizes (× cell), bigger where the trail is hottest.
    multiSize: ascii.multiSize,
    size1: [ascii.size1, 1, 4, 0.05] as Tuple,
    size2: [ascii.size2, 1, 4, 0.05] as Tuple,
    size3: [ascii.size3, 1, 4, 0.05] as Tuple,
    size2Heat: [ascii.size2Heat, 0, 1, 0.01] as Tuple,
    size3Heat: [ascii.size3Heat, 0, 1, 0.01] as Tuple,
    charset: {
      type: 'select' as const,
      options: (Object.keys(ASCII_CHARSETS) as AsciiCharset[]).map((k) => ({
        value: k,
        label: `${k} ${ASCII_CHARSETS[k].trim().slice(0, 8)}`,
      })),
      default: ascii.charset,
    },
    byHeat: ascii.byHeat, // ramp-style: denser glyph where hotter
    cellSize: [ascii.cellSize, 6, 40, 1] as Tuple,
    radius: [ascii.radius, 10, 300, 5] as Tuple, // at rest
    speedBoost: [ascii.speedBoost, 0, 8, 0.1] as Tuple, // extra radius × at full speed
    maxSpeed: [ascii.maxSpeed, 0.5, 10, 0.1] as Tuple, // px/ms counted as full speed
    intensity: [ascii.intensity, 0.05, 1, 0.05] as Tuple,
    halfLife: [ascii.halfLife, 50, 3000, 25] as Tuple, // ms
    flicker: [ascii.flicker, 0, 30, 0.5] as Tuple, // glyph re-rolls / s
    palette: {
      type: 'select' as const,
      options: (Object.keys(ASCII_PALETTES) as AsciiPalette[]).map((k) => ({
        value: k,
        label: ASCII_PALETTES[k].label,
      })),
      default: ascii.palette,
    },
    color: { type: 'color' as const, default: ascii.color }, // palette "custom"
    // Palette "customMix": pick each tile / glyph colour by hand.
    mixColors: Object.fromEntries(
      ascii.mixColors.map((c, i) => [`color${i + 1}`, { type: 'color' as const, default: c }]),
    ) as Record<string, { type: 'color'; default: string }>,
    blendMode: {
      type: 'select' as const,
      options: [...ASCII_BLEND_MODES],
      default: ascii.blendMode,
    },
    opacity: [ascii.opacity, 0, 1, 0.05] as Tuple,
  } satisfies DialConfig;
}

/** Reads an asciiDialConfig folder's live values back into trail params. */
export function readAsciiDials(folder: Record<string, unknown> & { enabled: boolean }) {
  const { enabled: asciiOn, mixColors, ...rest } = folder;
  const ascii = {
    ...rest,
    mixColors: Object.values((mixColors ?? {}) as Record<string, string>),
    style: rest.style as AsciiStyle,
    font: rest.font as AsciiFont,
    charset: rest.charset as AsciiCharset,
    palette: rest.palette as AsciiPalette,
    blendMode: rest.blendMode as AsciiBlendMode,
  } as AsciiTrailParams;
  return { ascii, asciiOn };
}

function buildConfig({ params, dotSizeUnit = 1, ascii = ASCII_TRAIL_DEFAULTS, asciiEnabled = true }: Options) {
  const stops: Record<string, DialConfig> = {};
  params.gradient.forEach((s, i) => {
    stops[`stop${i + 1}`] = {
      _collapsed: true,
      position: [s.position, 0, 1, 0.005] as Tuple,
      color: { type: 'color', default: toHex(s.color) },
    };
  });
  return {
    dotSize: [params.dotSize / dotSizeUnit, 1, 20, 0.1] as Tuple,
    dotScale: [params.dotScale, 0, 3, 0.05] as Tuple,
    softness: [params.softness, 0, 2, 0.01] as Tuple,
    rotation: [params.rotation, 0, 360, 1] as Tuple,
    spin: [params.rotationSpeed ?? 0, -5, 5, 0.05] as Tuple, // deg/s, loops through 360; 0 = static
    center: {
      _collapsed: true,
      x: [params.center[0], 0, 100, 0.5] as Tuple,
      y: [params.center[1], 0, 100, 0.5] as Tuple,
    },
    ...stops,
    // Cursor trail: a decaying heatmap drawn as ASCII glyphs.
    ascii: asciiDialConfig(ascii, asciiEnabled),
  } satisfies DialConfig;
}

/**
 * Registers a DialKit panel for one halftone section (shader + ASCII trail) and
 * returns the live values. Hero and CTA share it so their controls match.
 * `opts` must be stable (a module constant) — it seeds the panel's defaults.
 */
export function useShaderDials(name: string, opts: Options) {
  const config = buildConfig(opts);
  const d = useDialKit(name, config) as Record<string, unknown> & {
    dotSize: number;
    dotScale: number;
    softness: number;
    rotation: number;
    spin: number;
    center: { x: number; y: number };
    ascii: Record<string, unknown> & { enabled: boolean };
  };

  const params: HalftoneParams = {
    gradient: opts.params.gradient
      .map((_, i) => d[`stop${i + 1}`] as { position: number; color: string })
      .map((s) => ({ position: s.position, color: fromHex(s.color) }))
      .sort((a, b) => a.position - b.position),
    dotSize: d.dotSize * (opts.dotSizeUnit ?? 1),
    dotScale: d.dotScale,
    softness: d.softness,
    rotation: d.rotation,
    rotationSpeed: d.spin,
    center: [d.center.x, d.center.y],
  };
  return { params, ...readAsciiDials(d.ascii) };
}
