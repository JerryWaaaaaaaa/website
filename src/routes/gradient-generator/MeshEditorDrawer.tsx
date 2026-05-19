import { useEffect, useState } from 'react';
import { MeshCanvas } from './MeshCanvas';
import { MESH_MAX, MESH_MIN, type MeshPreset } from './mesh';
import { downloadMeshPng } from './meshExport';
import {
  PALETTE_KEYS,
  type Palette,
  type PaletteKey,
} from './presets';
import { getToken } from './tokens';
import type { GradientStore } from './useGradientStore';

type Props = {
  preset: MeshPreset;
  palette: Palette;
  store: GradientStore;
  onClose: () => void;
  onDuplicated: (newId: string) => void;
};

type Multiplier = 1 | 2 | 4;

function MeshCellEditor({
  preset,
  palette,
  onCellChange,
}: {
  preset: MeshPreset;
  palette: Palette;
  onCellChange: (cellIndex: number, value: PaletteKey) => void;
}) {
  return (
    <div
      className="gg-mesh-grid-editor"
      style={{
        gridTemplateColumns: `repeat(${preset.cols}, minmax(0, 1fr))`,
      }}
    >
      {preset.cells.map((slot, idx) => {
        const token = getToken(palette[slot]);
        return (
          <div className="gg-mesh-cell" key={idx}>
            <span
              className="gg-mesh-cell-swatch"
              style={{ background: token.hex }}
              aria-hidden="true"
            />
            <div className="gg-mesh-cell-keys" role="radiogroup">
              {PALETTE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={slot === key}
                  className={`gg-mesh-cell-key ${slot === key ? 'is-active' : ''}`}
                  onClick={() => onCellChange(idx, key)}
                  title={`${key} · ${getToken(palette[key]).label}`}
                >
                  <span
                    className="gg-color-dot gg-color-dot-sm"
                    style={{ background: getToken(palette[key]).hex }}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MeshEditorDrawer({
  preset,
  palette,
  store,
  onClose,
  onDuplicated,
}: Props) {
  const [multiplier, setMultiplier] = useState<Multiplier>(2);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDownload = async () => {
    setBusy(true);
    try {
      await downloadMeshPng(preset, palette, multiplier);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gg-drawer-root">
      <div className="gg-drawer-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="gg-drawer" aria-label={`${preset.name} mesh editor`}>
        <header className="gg-drawer-head">
          <div className="gg-drawer-preview gg-drawer-preview-canvas">
            <MeshCanvas preset={preset} palette={palette} width={512} height={384} />
          </div>
          <div className="gg-drawer-meta">
            <label className="gg-name-input">
              <span className="gg-panel-eyebrow">Name</span>
              <input
                type="text"
                value={preset.name}
                onChange={(e) =>
                  store.updateMesh(preset.id, (p) => ({
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
            <div className="gg-panel-eyebrow">Grid size</div>
            <div className="gg-mesh-size-row">
              <label className="gg-mesh-size-field">
                <span>Rows</span>
                <input
                  type="number"
                  min={MESH_MIN}
                  max={MESH_MAX}
                  value={preset.rows}
                  onChange={(e) =>
                    store.resizeMesh(
                      preset.id,
                      Number(e.target.value),
                      preset.cols,
                    )
                  }
                />
              </label>
              <span className="gg-mesh-size-x">×</span>
              <label className="gg-mesh-size-field">
                <span>Cols</span>
                <input
                  type="number"
                  min={MESH_MIN}
                  max={MESH_MAX}
                  value={preset.cols}
                  onChange={(e) =>
                    store.resizeMesh(
                      preset.id,
                      preset.rows,
                      Number(e.target.value),
                    )
                  }
                />
              </label>
              <span className="gg-mesh-size-note">
                {MESH_MIN}–{MESH_MAX}
              </span>
            </div>
          </section>

          <section className="gg-drawer-section">
            <div className="gg-panel-eyebrow">
              Cells · {preset.rows}×{preset.cols}
            </div>
            <p className="gg-helper-text">
              Each cell picks a palette slot. Change a slot's token in the panel
              above and every cell using it updates.
            </p>
            <MeshCellEditor
              preset={preset}
              palette={palette}
              onCellChange={(idx, value) =>
                store.setMeshCell(preset.id, idx, value)
              }
            />
          </section>

          <section className="gg-drawer-section">
            <div className="gg-panel-eyebrow">Export</div>
            <div className="gg-mesh-export-row">
              <div
                className="gg-mode-toggle gg-mode-toggle-sm"
                role="radiogroup"
                aria-label="Export multiplier"
              >
                {([1, 2, 4] as Multiplier[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={multiplier === m}
                    className={`gg-mode-btn ${multiplier === m ? 'is-active' : ''}`}
                    onClick={() => setMultiplier(m)}
                  >
                    {m}x
                  </button>
                ))}
              </div>
              <span className="gg-slider-value">
                {1024 * multiplier}×{768 * multiplier}
              </span>
            </div>
          </section>
        </div>

        <footer className="gg-drawer-foot">
          <button
            type="button"
            className="gg-btn gg-btn-primary"
            onClick={handleDownload}
            disabled={busy}
          >
            {busy ? 'Saving…' : `Download PNG ${multiplier}x`}
          </button>
          <button
            type="button"
            className="gg-btn"
            onClick={() => {
              const newId = store.duplicateMesh(preset.id);
              onDuplicated(newId);
            }}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="gg-btn gg-btn-danger"
            onClick={() => {
              store.deleteMesh(preset.id);
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
