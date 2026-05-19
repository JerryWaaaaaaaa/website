import { useEffect, useState } from 'react';
import {
  buildBackgroundCss,
  buildBackgroundCssMultiline,
} from './buildCss';
import {
  PALETTE_KEYS,
  type GradientPreset,
  type Layer,
  type LayerShape,
  type Palette,
  type PaletteKey,
} from './presets';
import { getToken } from './tokens';
import type { GradientStore } from './useGradientStore';

type Props = {
  preset: GradientPreset;
  palette: Palette;
  store: GradientStore;
  onClose: () => void;
  onDuplicated: (newId: string) => void;
};

const SHAPES: LayerShape[] = ['ellipse', 'circle'];

function ColorDot({ color }: { color: string }) {
  return (
    <span className="gg-color-dot" style={{ background: color }} aria-hidden="true" />
  );
}

function NumberSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  unit?: string;
}) {
  return (
    <label className="gg-slider-row">
      <span className="gg-slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="gg-slider-value">
        {value}
        {unit ?? ''}
      </span>
    </label>
  );
}

function PaletteKeyPicker({
  value,
  palette,
  onChange,
}: {
  value: PaletteKey;
  palette: Palette;
  onChange: (next: PaletteKey) => void;
}) {
  return (
    <div className="gg-palette-key-picker" role="radiogroup">
      {PALETTE_KEYS.map((key) => {
        const token = getToken(palette[key]);
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={value === key}
            className={`gg-palette-key-btn ${value === key ? 'is-active' : ''}`}
            onClick={() => onChange(key)}
            title={`${key} · ${token.label}`}
          >
            <ColorDot color={token.hex} />
            <span>{key}</span>
          </button>
        );
      })}
    </div>
  );
}

function LayerRow({
  layer,
  index,
  palette,
  onUpdate,
  onRemove,
  canRemove,
}: {
  layer: Layer;
  index: number;
  palette: Palette;
  onUpdate: (updater: (layer: Layer) => Layer) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="gg-layer">
      <div className="gg-layer-head">
        <span className="gg-layer-title">Layer {index + 1}</span>
        <div className="gg-layer-shape-toggle">
          {SHAPES.map((shape) => (
            <button
              key={shape}
              type="button"
              className={`gg-shape-btn ${layer.shape === shape ? 'is-active' : ''}`}
              onClick={() => onUpdate((l) => ({ ...l, shape }))}
            >
              {shape}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="gg-btn gg-btn-ghost gg-btn-sm"
          onClick={onRemove}
          disabled={!canRemove}
          title={canRemove ? 'Remove layer' : 'Need at least one layer'}
        >
          Remove
        </button>
      </div>

      <PaletteKeyPicker
        value={layer.paletteKey}
        palette={palette}
        onChange={(paletteKey) => onUpdate((l) => ({ ...l, paletteKey }))}
      />

      <NumberSlider
        label="X"
        value={layer.xPct}
        min={0}
        max={100}
        unit="%"
        onChange={(xPct) => onUpdate((l) => ({ ...l, xPct }))}
      />
      <NumberSlider
        label="Y"
        value={layer.yPct}
        min={0}
        max={100}
        unit="%"
        onChange={(yPct) => onUpdate((l) => ({ ...l, yPct }))}
      />
      <NumberSlider
        label="Size"
        value={layer.sizePct}
        min={0}
        max={100}
        unit="%"
        onChange={(sizePct) => onUpdate((l) => ({ ...l, sizePct }))}
      />
      <NumberSlider
        label="Alpha"
        value={layer.alpha}
        min={0}
        max={255}
        onChange={(alpha) => onUpdate((l) => ({ ...l, alpha }))}
      />
    </div>
  );
}

export function EditorDrawer({
  preset,
  palette,
  store,
  onClose,
  onDuplicated,
}: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const background = buildBackgroundCss(palette, preset);
  const cssBlock = buildBackgroundCssMultiline(palette, preset);

  const handleCopyCss = () => {
    navigator.clipboard.writeText(cssBlock).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="gg-drawer-root">
      <div
        className="gg-drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="gg-drawer" aria-label={`${preset.name} editor`}>
        <header className="gg-drawer-head">
          <div className="gg-drawer-preview" style={{ background }} />
          <div className="gg-drawer-meta">
            <label className="gg-name-input">
              <span className="gg-panel-eyebrow">Name</span>
              <input
                type="text"
                value={preset.name}
                onChange={(e) =>
                  store.updatePreset(preset.id, (p) => ({
                    ...p,
                    name: e.target.value,
                  }))
                }
              />
            </label>
            <button
              type="button"
              className="gg-drawer-close"
              onClick={onClose}
              aria-label="Close editor"
            >
              ×
            </button>
          </div>
        </header>

        <div className="gg-drawer-body">
          <section className="gg-drawer-section">
            <div className="gg-panel-eyebrow">Base color</div>
            <PaletteKeyPicker
              value={preset.basePaletteKey}
              palette={palette}
              onChange={(basePaletteKey) =>
                store.updatePreset(preset.id, (p) => ({ ...p, basePaletteKey }))
              }
            />
          </section>

          <section className="gg-drawer-section">
            <div className="gg-drawer-section-head">
              <div className="gg-panel-eyebrow">
                Layers · {preset.layers.length}
              </div>
              <button
                type="button"
                className="gg-btn gg-btn-sm"
                onClick={() => store.addLayer(preset.id)}
              >
                + Add layer
              </button>
            </div>
            <div className="gg-layer-list">
              {preset.layers.map((layer, index) => (
                <LayerRow
                  key={index}
                  layer={layer}
                  index={index}
                  palette={palette}
                  canRemove={preset.layers.length > 1}
                  onUpdate={(updater) =>
                    store.updateLayer(preset.id, index, updater)
                  }
                  onRemove={() => store.removeLayer(preset.id, index)}
                />
              ))}
            </div>
          </section>

          <section className="gg-drawer-section">
            <div className="gg-panel-eyebrow">CSS</div>
            <pre className="gg-css-block">{cssBlock}</pre>
          </section>
        </div>

        <footer className="gg-drawer-foot">
          <button
            type="button"
            className="gg-btn gg-btn-primary"
            onClick={handleCopyCss}
          >
            {copied ? '✓ Copied CSS' : 'Copy CSS'}
          </button>
          <button
            type="button"
            className="gg-btn"
            onClick={() => {
              const newId = store.duplicatePreset(preset.id);
              onDuplicated(newId);
            }}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="gg-btn gg-btn-danger"
            onClick={() => {
              store.deletePreset(preset.id);
              onClose();
            }}
          >
            Delete
          </button>
        </footer>
      </aside>
    </div>
  );
}
