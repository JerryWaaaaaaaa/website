import type { GradientPreset, Layer, Palette } from './presets';
import { resolveToken } from './tokens';

function alphaToHex(alpha: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(alpha)));
  return clamped.toString(16).padStart(2, '0');
}

function layerToCss(layer: Layer, palette: Palette): string {
  const color = resolveToken(palette[layer.paletteKey]);
  const alpha = alphaToHex(layer.alpha);
  return `radial-gradient(${layer.shape} at ${layer.xPct}% ${layer.yPct}%, ${color}${alpha} 0%, transparent ${layer.sizePct}%)`;
}

export function buildBackgroundCss(
  palette: Palette,
  preset: GradientPreset,
): string {
  const parts = preset.layers.map((layer) => layerToCss(layer, palette));
  parts.push(resolveToken(palette[preset.basePaletteKey]));
  return parts.join(', ');
}

export function buildBackgroundCssMultiline(
  palette: Palette,
  preset: GradientPreset,
): string {
  const parts = preset.layers.map((layer) => `  ${layerToCss(layer, palette)}`);
  parts.push(`  ${resolveToken(palette[preset.basePaletteKey])}`);
  return `background:\n${parts.join(',\n')};`;
}

export function serializeAllAsCss(
  palette: Palette,
  presets: GradientPreset[],
): string {
  const blocks = presets.map((preset) => {
    const className = `.gradient-${preset.id}`;
    return `${className} {\n${buildBackgroundCssMultiline(palette, preset)
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')}\n}`;
  });
  return blocks.join('\n\n');
}

export function serializeAllAsJson(
  palette: Palette,
  presets: GradientPreset[],
): string {
  return JSON.stringify({ palette, presets }, null, 2);
}
