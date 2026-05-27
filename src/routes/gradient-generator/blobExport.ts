import { BLOB_VIEW_H, BLOB_VIEW_W } from './BlobCanvas';
import type { BlobPreset } from './blob';
import type { Palette } from './presets';
import { resolveToken } from './tokens';

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'blob'
  );
}

/**
 * Serialize a blob preset to a standalone SVG string at the requested
 * pixel size. Output is self-contained: width, height, viewBox, and inline
 * hex fills — ready to paste into Figma, an HTML file, or a build pipeline.
 */
export function blobToSvgString(
  preset: BlobPreset,
  palette: Palette,
  width = BLOB_VIEW_W,
  height = BLOB_VIEW_H,
): string {
  const baseFill = resolveToken(palette[preset.shapes[0]?.paletteKey ?? 'c1']);
  const filters: string[] = [];
  const circles: string[] = [];

  preset.shapes.forEach((shape, i) => {
    const cx = (shape.x / 100) * BLOB_VIEW_W;
    const cy = (shape.y / 100) * BLOB_VIEW_H;
    const r = (shape.sizePct / 100) * BLOB_VIEW_H;
    const stdDev = Math.max(0.01, (shape.blurPct / 100) * r);
    const fill = resolveToken(palette[shape.paletteKey]);
    filters.push(
      `<filter id="blur-${i}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${stdDev.toFixed(3)}" /></filter>`,
    );
    circles.push(
      `<circle cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${r.toFixed(3)}" fill="${fill}" opacity="${shape.alpha.toFixed(3)}" filter="url(#blur-${i})" />`,
    );
  });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${BLOB_VIEW_W} ${BLOB_VIEW_H}" preserveAspectRatio="none">` +
    `<rect width="${BLOB_VIEW_W}" height="${BLOB_VIEW_H}" fill="${baseFill}" />` +
    `<defs>${filters.join('')}</defs>` +
    `${circles.join('')}` +
    `</svg>`
  );
}

export const BLOB_EXPORT_BASE_WIDTH = 1024;
export const BLOB_EXPORT_BASE_HEIGHT = 1024;

/** Rasterize the SVG to a PNG blob via an offscreen <img>. */
async function rasterizeSvg(
  svgString: string,
  width: number,
  height: number,
): Promise<Blob | null> {
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error('Failed to load SVG for rasterization'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0, width, height);

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png'),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadBlobSvg(
  preset: BlobPreset,
  palette: Palette,
): Promise<void> {
  const svg = blobToSvgString(
    preset,
    palette,
    BLOB_EXPORT_BASE_WIDTH,
    BLOB_EXPORT_BASE_HEIGHT,
  );
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(preset.name)}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadBlobPng(
  preset: BlobPreset,
  palette: Palette,
  multiplier: 1 | 2 | 4 = 2,
): Promise<void> {
  const width = BLOB_EXPORT_BASE_WIDTH * multiplier;
  const height = BLOB_EXPORT_BASE_HEIGHT * multiplier;
  const svg = blobToSvgString(preset, palette, width, height);
  const blob = await rasterizeSvg(svg, width, height);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(preset.name)}-${multiplier}x.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
