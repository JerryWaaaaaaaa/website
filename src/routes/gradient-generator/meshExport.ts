import type { MeshPreset } from './mesh';
import type { Palette } from './presets';
import { renderMeshToCanvas } from './MeshCanvas';

export const EXPORT_BASE_WIDTH = 1024;
export const EXPORT_BASE_HEIGHT = 1024;

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'mesh'
  );
}

export async function downloadMeshPng(
  preset: MeshPreset,
  palette: Palette,
  multiplier: 1 | 2 | 4 = 2,
): Promise<void> {
  const canvas = document.createElement('canvas');
  const width = EXPORT_BASE_WIDTH * multiplier;
  const height = EXPORT_BASE_HEIGHT * multiplier;
  renderMeshToCanvas(canvas, preset, palette, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png'),
  );
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
