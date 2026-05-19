import { useState } from 'react';
import { MeshCanvas } from './MeshCanvas';
import { downloadMeshPng } from './meshExport';
import type { MeshPreset } from './mesh';
import type { Palette } from './presets';

type Props = {
  preset: MeshPreset;
  palette: Palette;
  onEdit: () => void;
};

export function MeshCard({ preset, palette, onEdit }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadMeshPng(preset, palette, 2);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      className="gg-card"
      onClick={onEdit}
      aria-label={`Edit ${preset.name} mesh`}
    >
      <div className="gg-card-surface">
        <MeshCanvas preset={preset} palette={palette} />
      </div>
      <div className="gg-card-noise" aria-hidden="true" />
      <div className="gg-card-name">{preset.name}</div>
      <div className="gg-card-actions">
        <span className="gg-card-name-hover">{preset.name}</span>
        <span
          className="gg-card-copy"
          onClick={handleDownload}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleDownload(e as unknown as React.MouseEvent);
            }
          }}
        >
          {downloading ? 'Saving…' : 'Download PNG'}
        </span>
      </div>
    </button>
  );
}
