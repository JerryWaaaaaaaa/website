import { useRef, useState } from 'react';
import { BlobCanvas } from './BlobCanvas';
import {
  BLOB_BLUR_MAX,
  BLOB_BLUR_MIN,
  BLOB_MAX,
  BLOB_MIN,
  BLOB_SIZE_MAX,
  BLOB_SIZE_MIN,
  BLOB_STARTERS,
} from './blob';
import {
  blobToSvgString,
  downloadBlobPng,
  downloadBlobSvg,
} from './blobExport';
import {
  PALETTE_KEYS,
  type Palette,
  type PaletteKey,
} from './presets';
import { getToken } from './tokens';
import type { GradientStore } from './useGradientStore';

type Props = {
  store: GradientStore;
  palette: Palette;
};

type Multiplier = 1 | 2 | 4;

function PaletteKeyPicker({
  value,
  palette,
  onChange,
  compact = false,
}: {
  value: PaletteKey;
  palette: Palette;
  onChange: (next: PaletteKey) => void;
  compact?: boolean;
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
            <span
              className="gg-color-dot"
              style={{ background: token.hex }}
              aria-hidden="true"
            />
            {!compact && <span>{key}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function BlobEditor({ store, palette }: Props) {
  const { blob } = store;
  const stageRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ index: number; pointerId: number } | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [multiplier, setMultiplier] = useState<Multiplier>(2);
  const [busy, setBusy] = useState<'svg' | 'png' | 'copy-svg' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => setFeedback(null), 1500);
  };

  const selectedShape = blob.shapes[selectedIndex];

  const handlePointerDown = (event: React.PointerEvent, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedIndex(index);
    dragState.current = { index, pointerId: event.pointerId };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragState.current;
    if (!drag) return;
    if (event.pointerId !== drag.pointerId) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const xPct = ((event.clientX - rect.left) / rect.width) * 100;
    const yPct = ((event.clientY - rect.top) / rect.height) * 100;
    store.moveBlobShape(drag.index, xPct, yPct);
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    const drag = dragState.current;
    if (!drag) return;
    if (event.pointerId !== drag.pointerId) return;
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
    dragState.current = null;
  };

  const handleAddBlob = () => {
    if (blob.shapes.length >= BLOB_MAX) return;
    store.addBlobShape();
    setSelectedIndex(Math.min(blob.shapes.length, BLOB_MAX - 1));
  };

  const handleRemoveBlob = () => {
    if (blob.shapes.length <= BLOB_MIN) return;
    store.removeBlobShape(selectedIndex);
    setSelectedIndex(Math.max(0, selectedIndex - 1));
  };

  const handleLoadStarter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value;
    if (!id) return;
    store.loadBlobStarter(id);
    setSelectedIndex(0);
    event.target.value = '';
  };

  const handleCopySvg = async () => {
    setBusy('copy-svg');
    try {
      const svg = blobToSvgString(blob, palette);
      await navigator.clipboard.writeText(svg);
      showFeedback('SVG copied');
    } catch {
      // ignore
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadSvg = async () => {
    setBusy('svg');
    try {
      await downloadBlobSvg(blob, palette);
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadPng = async () => {
    setBusy('png');
    try {
      await downloadBlobPng(blob, palette, multiplier);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="gg-blob-shell">
      <div className="gg-blob-stage-wrap">
        <div className="gg-canvas-stage gg-blob-stage" ref={stageRef}>
          <div className="gg-canvas-stage-surface">
            <BlobCanvas preset={blob} palette={palette} />
          </div>
          <div className="gg-canvas-stage-overlay" aria-hidden="true">
            {blob.shapes.map((shape, idx) => {
              const token = getToken(palette[shape.paletteKey]);
              const isActive = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`gg-point-handle ${isActive ? 'is-selected' : ''}`}
                  style={{
                    left: `${shape.x}%`,
                    top: `${shape.y}%`,
                    background: token.hex,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, idx)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  aria-label={`Blob ${idx + 1} (${shape.paletteKey})`}
                  title={`Blob ${idx + 1} · ${shape.paletteKey}`}
                />
              );
            })}
          </div>
        </div>

        <div className="gg-blob-toolbar">
          <label className="gg-name-input gg-blob-name-input">
            <span className="gg-panel-eyebrow">Workspace name</span>
            <input
              type="text"
              value={blob.name}
              onChange={(e) => store.setBlobName(e.target.value)}
            />
          </label>
          <div className="gg-blob-toolbar-actions">
            <button
              type="button"
              className="gg-btn"
              onClick={handleCopySvg}
              disabled={busy === 'copy-svg'}
            >
              {busy === 'copy-svg' ? 'Copying…' : 'Copy SVG'}
            </button>
            <button
              type="button"
              className="gg-btn"
              onClick={handleDownloadSvg}
              disabled={busy === 'svg'}
            >
              {busy === 'svg' ? 'Saving…' : 'Download SVG'}
            </button>
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
              <button
                type="button"
                className="gg-btn gg-btn-primary"
                onClick={handleDownloadPng}
                disabled={busy === 'png'}
              >
                {busy === 'png' ? 'Saving…' : `PNG ${multiplier}x`}
              </button>
            </div>
            {feedback && <span className="gg-feedback">{feedback}</span>}
          </div>
        </div>
      </div>

      <aside className="gg-blob-panel" aria-label="Blob editor controls">
        <section className="gg-drawer-section">
          <label className="gg-blob-starter">
            <span className="gg-panel-eyebrow">Starter template</span>
            <select
              defaultValue=""
              onChange={handleLoadStarter}
              className="gg-blob-starter-select"
            >
              <option value="" disabled>
                Load a starter…
              </option>
              {BLOB_STARTERS.map((starter) => (
                <option key={starter.id} value={starter.id}>
                  {starter.name}
                </option>
              ))}
            </select>
          </label>
          <p className="gg-helper-text">
            Loading a starter replaces the current workspace. Edits are saved
            automatically.
          </p>
        </section>

        <section className="gg-drawer-section">
          <div className="gg-drawer-section-head">
            <div className="gg-panel-eyebrow">
              Blobs · {blob.shapes.length}
            </div>
            <button
              type="button"
              className="gg-btn gg-btn-sm"
              onClick={handleAddBlob}
              disabled={blob.shapes.length >= BLOB_MAX}
            >
              + Add blob
            </button>
          </div>
          <ul className="gg-shape-list">
            {blob.shapes.map((shape, idx) => {
              const token = getToken(palette[shape.paletteKey]);
              const isActive = idx === selectedIndex;
              return (
                <li key={idx}>
                  <button
                    type="button"
                    className={`gg-shape-row ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <span
                      className="gg-shape-row-pip"
                      style={{ background: token.hex }}
                      aria-hidden="true"
                    />
                    <span className="gg-shape-row-name">
                      Blob {idx + 1}
                    </span>
                    <span className="gg-shape-row-meta">
                      {Math.round(shape.x)}%, {Math.round(shape.y)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {selectedShape && (
          <section className="gg-drawer-section">
            <div className="gg-drawer-section-head">
              <div className="gg-panel-eyebrow">Blob {selectedIndex + 1}</div>
              <button
                type="button"
                className="gg-btn gg-btn-ghost gg-btn-sm"
                onClick={handleRemoveBlob}
                disabled={blob.shapes.length <= BLOB_MIN}
              >
                Remove
              </button>
            </div>

            <PaletteKeyPicker
              value={selectedShape.paletteKey}
              palette={palette}
              onChange={(paletteKey) =>
                store.updateBlobShape(selectedIndex, { paletteKey })
              }
            />

            <label className="gg-slider-row">
              <span className="gg-slider-label">X</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(selectedShape.x)}
                onChange={(e) =>
                  store.moveBlobShape(
                    selectedIndex,
                    Number(e.target.value),
                    selectedShape.y,
                  )
                }
              />
              <span className="gg-slider-value">
                {Math.round(selectedShape.x)}%
              </span>
            </label>

            <label className="gg-slider-row">
              <span className="gg-slider-label">Y</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(selectedShape.y)}
                onChange={(e) =>
                  store.moveBlobShape(
                    selectedIndex,
                    selectedShape.x,
                    Number(e.target.value),
                  )
                }
              />
              <span className="gg-slider-value">
                {Math.round(selectedShape.y)}%
              </span>
            </label>

            <label className="gg-slider-row">
              <span className="gg-slider-label">Size</span>
              <input
                type="range"
                min={BLOB_SIZE_MIN}
                max={BLOB_SIZE_MAX}
                step={1}
                value={Math.round(selectedShape.sizePct)}
                onChange={(e) =>
                  store.updateBlobShape(selectedIndex, {
                    sizePct: Number(e.target.value),
                  })
                }
              />
              <span className="gg-slider-value">
                {Math.round(selectedShape.sizePct)}%
              </span>
            </label>

            <label className="gg-slider-row">
              <span className="gg-slider-label">Blur</span>
              <input
                type="range"
                min={BLOB_BLUR_MIN}
                max={BLOB_BLUR_MAX}
                step={1}
                value={Math.round(selectedShape.blurPct)}
                onChange={(e) =>
                  store.updateBlobShape(selectedIndex, {
                    blurPct: Number(e.target.value),
                  })
                }
              />
              <span className="gg-slider-value">
                {Math.round(selectedShape.blurPct)}%
              </span>
            </label>

            <label className="gg-slider-row">
              <span className="gg-slider-label">Alpha</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(selectedShape.alpha * 100)}
                onChange={(e) =>
                  store.updateBlobShape(selectedIndex, {
                    alpha: Number(e.target.value) / 100,
                  })
                }
              />
              <span className="gg-slider-value">
                {Math.round(selectedShape.alpha * 100)}%
              </span>
            </label>
          </section>
        )}

        <section className="gg-drawer-section">
          <button
            type="button"
            className="gg-btn gg-btn-ghost"
            onClick={() => {
              if (
                window.confirm(
                  'Reset the blob workspace to the default Aurora starter?',
                )
              ) {
                store.resetBlob();
                setSelectedIndex(0);
              }
            }}
          >
            Reset workspace
          </button>
        </section>
      </aside>
    </div>
  );
}
