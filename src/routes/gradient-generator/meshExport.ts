import type { MeshPreset } from './mesh';
import { renderMeshStill } from '../../sections/v6/mesh/meshRenderer';

export type ExportAspectId = 'square' | 'wide' | 'hero';
export type Multiplier = 1 | 2 | 4;

/**
 * Export frames, in CSS px (× multiplier on download). The warp pattern is
 * laid out relative to the frame's aspect, so the stage previews the same one.
 */
export const EXPORT_ASPECTS: Array<{ id: ExportAspectId; label: string; width: number; height: number }> = [
  { id: 'square', label: '1:1', width: 1024, height: 1024 },
  { id: 'wide', label: '16:9', width: 1600, height: 900 },
  { id: 'hero', label: 'Hero', width: 1440, height: 900 },
];

export function getAspect(id: ExportAspectId) {
  return EXPORT_ASPECTS.find((a) => a.id === id) ?? EXPORT_ASPECTS[0];
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'mesh'
  );
}

/** Renders the mesh's first frame (plus its noise layer) and downloads it as a PNG. */
export async function downloadMeshPng(
  preset: MeshPreset,
  aspectId: ExportAspectId = 'square',
  multiplier: Multiplier = 2,
): Promise<void> {
  const aspect = getAspect(aspectId);
  const canvas = await renderMeshStill(preset.params, {
    width: aspect.width,
    height: aspect.height,
    scale: multiplier,
  });

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png'),
  );
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(preset.name)}-${aspect.label.replace(':', 'x').toLowerCase()}-${multiplier}x.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
