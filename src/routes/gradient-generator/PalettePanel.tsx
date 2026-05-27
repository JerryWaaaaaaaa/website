import { useState } from 'react';
import { PALETTE_KEYS, type Palette, type PaletteKey } from './presets';
import type { TokenId } from './tokens';
import type { GeneratorMode } from './useGradientStore';
import { TokenPicker } from './TokenPicker';

type Props = {
  palette: Palette;
  onChange: (key: PaletteKey, token: TokenId) => void;
  onReset: () => void;
  mode: GeneratorMode;
  onModeChange: (mode: GeneratorMode) => void;
  onCopyAllCss?: () => void;
  onCopyAllJson: () => void;
  onCopyBlobSvg?: () => void;
};

const MODE_OPTIONS: Array<{ value: GeneratorMode; label: string }> = [
  { value: 'css', label: 'CSS' },
  { value: 'mesh', label: 'Mesh' },
  { value: 'blob', label: 'Blob' },
];

export function PalettePanel({
  palette,
  onChange,
  onReset,
  mode,
  onModeChange,
  onCopyAllCss,
  onCopyAllJson,
  onCopyBlobSvg,
}: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const fireFeedback = (msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => setFeedback(null), 1500);
  };

  return (
    <div className="gg-palette-panel">
      <div className="gg-palette-panel-head">
        <div className="gg-panel-eyebrow">Palette</div>

        <div className="gg-mode-toggle" role="tablist" aria-label="Generator mode">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={mode === option.value}
              className={`gg-mode-btn ${mode === option.value ? 'is-active' : ''}`}
              onClick={() => onModeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="gg-panel-actions">
          {mode === 'css' && onCopyAllCss && (
            <button
              type="button"
              className="gg-btn"
              onClick={() => {
                onCopyAllCss();
                fireFeedback('CSS copied');
              }}
            >
              Copy all as CSS
            </button>
          )}
          {mode === 'blob' && onCopyBlobSvg && (
            <button
              type="button"
              className="gg-btn"
              onClick={() => {
                onCopyBlobSvg();
                fireFeedback('SVG copied');
              }}
            >
              Copy as SVG
            </button>
          )}
          <button
            type="button"
            className="gg-btn"
            onClick={() => {
              onCopyAllJson();
              fireFeedback('JSON copied');
            }}
          >
            Copy as JSON
          </button>
          <button
            type="button"
            className="gg-btn gg-btn-ghost"
            onClick={onReset}
          >
            Reset to defaults
          </button>
          {feedback && <span className="gg-feedback">{feedback}</span>}
        </div>
      </div>

      <div className="gg-palette-row">
        {PALETTE_KEYS.map((key) => (
          <TokenPicker
            key={key}
            label={key}
            value={palette[key]}
            onChange={(token) => onChange(key, token)}
          />
        ))}
      </div>
    </div>
  );
}
