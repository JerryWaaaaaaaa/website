import { useCallback, useEffect, useRef, useState } from 'react';
import { MeshCanvas } from './MeshCanvas';
import {
  POINTS_MAX,
  POINTS_MIN,
  type MeshPoint,
  type MeshPreset,
} from './mesh';
import {
  EXPORT_BASE_HEIGHT,
  EXPORT_BASE_WIDTH,
  downloadMeshPng,
} from './meshExport';
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
            <span
              className="gg-color-dot"
              style={{ background: token.hex }}
              aria-hidden="true"
            />
            <span>{key}</span>
          </button>
        );
      })}
    </div>
  );
}

function PointStage({
  preset,
  palette,
  selectedIndex,
  isDragging,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  preset: MeshPreset;
  palette: Palette;
  selectedIndex: number;
  isDragging: boolean;
  onSelect: (index: number) => void;
  onMove: (index: number, xPct: number, yPct: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ index: number; pointerId: number } | null>(null);

  const handlePointerDown = (event: React.PointerEvent, index: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(index);
    dragState.current = { index, pointerId: event.pointerId };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    onDragStart();
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
    onMove(drag.index, xPct, yPct);
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
    onDragEnd();
  };

  return (
    <div className="gg-canvas-stage" ref={stageRef}>
      <div className="gg-canvas-stage-surface">
        <MeshCanvas
          preset={preset}
          palette={palette}
          width={isDragging ? undefined : 384}
          height={isDragging ? undefined : 384}
          lowRes={isDragging}
        />
      </div>
      <div className="gg-canvas-stage-overlay" aria-hidden="true">
        {preset.points.map((point, idx) => {
          const token = getToken(palette[point.paletteKey]);
          const isActive = idx === selectedIndex;
          return (
            <button
              key={idx}
              type="button"
              className={`gg-point-handle ${isActive ? 'is-selected' : ''}`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                background: token.hex,
              }}
              onPointerDown={(e) => handlePointerDown(e, idx)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              aria-label={`Point ${idx + 1} (${point.paletteKey})`}
              title={`Point ${idx + 1} · ${point.paletteKey}`}
            />
          );
        })}
      </div>
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (selectedIndex >= preset.points.length) {
      setSelectedIndex(Math.max(0, preset.points.length - 1));
    }
  }, [preset.points.length, selectedIndex]);

  const handleDownload = async () => {
    setBusy(true);
    try {
      await downloadMeshPng(preset, palette, multiplier);
    } finally {
      setBusy(false);
    }
  };

  const selectedPoint: MeshPoint | undefined = preset.points[selectedIndex];

  const handleMove = useCallback(
    (index: number, xPct: number, yPct: number) => {
      store.movePoint(preset.id, index, xPct, yPct);
    },
    [store, preset.id],
  );

  const handleAddPoint = () => {
    store.addPoint(preset.id);
    setSelectedIndex(Math.min(preset.points.length, POINTS_MAX - 1));
  };

  const handleRemovePoint = () => {
    if (preset.points.length <= POINTS_MIN) return;
    store.removePoint(preset.id, selectedIndex);
    setSelectedIndex(Math.max(0, selectedIndex - 1));
  };

  const softnessPct = Math.round(preset.softness * 100);

  return (
    <div className="gg-drawer-root">
      <div className="gg-drawer-overlay" onClick={onClose} aria-hidden="true" />
      <aside
        className="gg-drawer gg-drawer-wide"
        aria-label={`${preset.name} mesh editor`}
      >
        <header className="gg-drawer-head">
          <PointStage
            preset={preset}
            palette={palette}
            selectedIndex={selectedIndex}
            isDragging={isDragging}
            onSelect={setSelectedIndex}
            onMove={handleMove}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          />
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
            <div className="gg-drawer-section-head">
              <div className="gg-panel-eyebrow">
                Points · {preset.points.length}
              </div>
              <button
                type="button"
                className="gg-btn gg-btn-sm"
                onClick={handleAddPoint}
                disabled={preset.points.length >= POINTS_MAX}
              >
                + Add point
              </button>
            </div>
            <p className="gg-helper-text">
              Drag handles on the preview to move points. Each point pulls
              the gradient toward its palette color.
            </p>
          </section>

          <section className="gg-drawer-section">
            <label className="gg-slider-row">
              <span className="gg-slider-label">Softness</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={softnessPct}
                onChange={(e) =>
                  store.setMeshSoftness(preset.id, Number(e.target.value) / 100)
                }
              />
              <span className="gg-slider-value">{softnessPct}%</span>
            </label>
          </section>

          {selectedPoint && (
            <section className="gg-drawer-section">
              <div className="gg-drawer-section-head">
                <div className="gg-panel-eyebrow">
                  Point {selectedIndex + 1}
                </div>
                <button
                  type="button"
                  className="gg-btn gg-btn-ghost gg-btn-sm"
                  onClick={handleRemovePoint}
                  disabled={preset.points.length <= POINTS_MIN}
                  title={
                    preset.points.length <= POINTS_MIN
                      ? `Need at least ${POINTS_MIN} points`
                      : 'Remove this point'
                  }
                >
                  Remove
                </button>
              </div>

              <PaletteKeyPicker
                value={selectedPoint.paletteKey}
                palette={palette}
                onChange={(paletteKey) =>
                  store.setPointPaletteKey(preset.id, selectedIndex, paletteKey)
                }
              />

              <label className="gg-slider-row">
                <span className="gg-slider-label">X</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(selectedPoint.x)}
                  onChange={(e) =>
                    handleMove(
                      selectedIndex,
                      Number(e.target.value),
                      selectedPoint.y,
                    )
                  }
                />
                <span className="gg-slider-value">
                  {Math.round(selectedPoint.x)}%
                </span>
              </label>

              <label className="gg-slider-row">
                <span className="gg-slider-label">Y</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(selectedPoint.y)}
                  onChange={(e) =>
                    handleMove(
                      selectedIndex,
                      selectedPoint.x,
                      Number(e.target.value),
                    )
                  }
                />
                <span className="gg-slider-value">
                  {Math.round(selectedPoint.y)}%
                </span>
              </label>

              <label className="gg-slider-row">
                <span className="gg-slider-label">Weight</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(selectedPoint.weight * 100)}
                  onChange={(e) =>
                    store.setPointWeight(
                      preset.id,
                      selectedIndex,
                      Number(e.target.value) / 100,
                    )
                  }
                />
                <span className="gg-slider-value">
                  {Math.round(selectedPoint.weight * 100)}%
                </span>
              </label>
            </section>
          )}

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
                {EXPORT_BASE_WIDTH * multiplier}×
                {EXPORT_BASE_HEIGHT * multiplier}
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
