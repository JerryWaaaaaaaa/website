import { useState } from 'react';
import { buildBackgroundCss } from './buildCss';
import type { GradientPreset, Palette } from './presets';

type Props = {
  preset: GradientPreset;
  palette: Palette;
  onEdit: () => void;
};

export function GradientCard({ preset, palette, onEdit }: Props) {
  const [copied, setCopied] = useState(false);

  const background = buildBackgroundCss(palette, preset);

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`background: ${background};`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      className="gg-card"
      onClick={onEdit}
      aria-label={`Edit ${preset.name} gradient`}
    >
      <div className="gg-card-surface" style={{ background }} />
      <div className="gg-card-noise" aria-hidden="true" />
      <div className="gg-card-name">{preset.name}</div>
      <div className="gg-card-actions">
        <span className="gg-card-name-hover">{preset.name}</span>
        <span
          className="gg-card-copy"
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopy(e as unknown as React.MouseEvent);
            }
          }}
        >
          {copied ? '✓ Copied' : 'Copy CSS'}
        </span>
      </div>
    </button>
  );
}
