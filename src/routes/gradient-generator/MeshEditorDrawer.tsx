import { useEffect, useRef, useState } from 'react';
import { MeshGradient } from '../../sections/v6/mesh/MeshGradient';
import {
  GRAIN_BLENDS,
  MESH_MODES,
  patchGrid,
  type GrainBlend,
  type MeshGradientParams,
} from '../../sections/v6/mesh/meshRenderer';
import { V6_MESH } from '../../sections/v6/mesh/meshPreset';
import {
  MESH_RANGES,
  GRID_MAX,
  GRID_MIN,
  WEIGHT_MAX,
  WEIGHT_MIN,
  addPatchColumn,
  addPatchRow,
  removePatchColumn,
  removePatchRow,
  RAMP_MAX,
  RAMP_MIN,
  cloneMeshParams,
  meshParamsToTs,
  type MeshPreset,
} from './mesh';
import {
  EXPORT_ASPECTS,
  downloadMeshPng,
  getAspect,
  type ExportAspectId,
  type Multiplier,
} from './meshExport';
import type { GradientStore } from './useGradientStore';

type Props = {
  preset: MeshPreset;
  store: GradientStore;
  onClose: () => void;
  onDuplicated: (newId: string) => void;
};

type RangeKey = keyof typeof MESH_RANGES;
type SetParams = (update: Partial<MeshGradientParams>) => void;

const HEX = /^#[0-9a-f]{6}$/i;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const decimals = (step: number) => (String(step).split('.')[1] ?? '').length;

function ParamSlider({
  label,
  name,
  params,
  onChange,
}: {
  label: string;
  name: RangeKey;
  params: MeshGradientParams;
  onChange: SetParams;
}) {
  const { min, max, step } = MESH_RANGES[name];
  const value = params[name];
  return (
    <label className="gg-slider-row">
      <span className="gg-slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange({ [name]: Number(e.target.value) })}
      />
      <span className="gg-slider-value">{value.toFixed(decimals(step))}</span>
    </label>
  );
}

/** Native colour swatch + hex field; the field commits once it holds a full #rrggbb. */
function ColorField({
  label,
  value,
  onChange,
  onRemove,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  onRemove?: () => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <div className="gg-color-field">
      <span className="gg-slider-label">{label}</span>
      <input
        type="color"
        className="gg-color-swatch"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} colour`}
      />
      <input
        type="text"
        className="gg-color-hex"
        value={draft}
        spellCheck={false}
        onChange={(e) => {
          const next = e.target.value.trim();
          setDraft(next);
          if (HEX.test(next)) onChange(next.toLowerCase());
        }}
        onBlur={() => setDraft(value)}
        aria-label={`${label} hex`}
      />
      {onRemove && (
        <button
          type="button"
          className="gg-btn gg-btn-ghost gg-btn-sm"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="gg-mode-toggle gg-mode-toggle-sm" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={`gg-mode-btn ${value === o.value ? 'is-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Live preview at the export aspect. Patches: drag any control point. Warp: drag to pan. */
function MeshStage({
  params,
  aspect,
  selected,
  onSelect,
  onChange,
}: {
  params: MeshGradientParams;
  aspect: { width: number; height: number };
  selected: number;
  onSelect: (index: number) => void;
  onChange: SetParams;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<
    | { kind: 'point'; index: number; pointerId: number }
    | { kind: 'pan'; pointerId: number; x: number; y: number; ox: number; oy: number }
    | null
  >(null);

  const rect = () => stageRef.current?.getBoundingClientRect();

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const r = rect();
    if (!d || !r || e.pointerId !== d.pointerId || !r.width || !r.height) return;
    if (d.kind === 'pan') {
      onChange({
        offsetX: clamp(d.ox + (e.clientX - d.x) / r.width, -1, 1),
        offsetY: clamp(d.oy + (e.clientY - d.y) / r.height, -1, 1),
      });
      return;
    }
    const x = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
    const y = clamp(((e.clientY - r.top) / r.height) * 100, 0, 100);
    onChange({ patches: params.patches.map((p, i) => (i === d.index ? { ...p, x, y } : p)) });
  };

  const endDrag = (e: React.PointerEvent) => {
    if (drag.current?.pointerId !== e.pointerId) return;
    drag.current = null;
  };

  const isWarp = params.mode === 'warp';

  return (
    <div
      className="gg-canvas-stage"
      ref={stageRef}
      style={{ aspectRatio: `${aspect.width} / ${aspect.height}` }}
    >
      <div className="gg-canvas-stage-surface">
        <MeshGradient params={params} />
      </div>
      <div
        className={`gg-canvas-stage-overlay ${isWarp ? 'is-pannable' : ''}`}
        onPointerDown={(e) => {
          if (!isWarp) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = {
            kind: 'pan',
            pointerId: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            ox: params.offsetX,
            oy: params.offsetY,
          };
        }}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {!isWarp &&
          params.patches.map((point, idx) => (
            <button
              key={idx}
              type="button"
              className={`gg-point-handle ${idx === selected ? 'is-selected' : ''}`}
              style={{ left: `${point.x}%`, top: `${point.y}%`, background: point.color }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(idx);
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { kind: 'point', index: idx, pointerId: e.pointerId };
              }}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              aria-label={`Point ${idx + 1}`}
              title={`Point ${idx + 1}`}
            />
          ))}
      </div>
    </div>
  );
}

export function MeshEditorDrawer({ preset, store, onClose, onDuplicated }: Props) {
  const [aspectId, setAspectId] = useState<ExportAspectId>('hero');
  const [multiplier, setMultiplier] = useState<Multiplier>(2);
  const [busy, setBusy] = useState(false);
  const [selectedRaw, setSelected] = useState(4); // centre point of the default 3 × 3
  const [copied, setCopied] = useState(false);

  const params = preset.params;
  const aspect = getAspect(aspectId);
  const set: SetParams = (update) => store.updateMeshParams(preset.id, update);

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
      await downloadMeshPng(preset, aspectId, multiplier);
    } finally {
      setBusy(false);
    }
  };

  const copyTs = () => {
    navigator.clipboard
      .writeText(meshParamsToTs(params))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  const setRamp = (ramp: string[]) => set({ ramp });
  const selected = Math.min(selectedRaw, params.patches.length - 1);
  const grid = patchGrid(params);
  const editGrid = (edit: typeof addPatchColumn) => {
    const result = edit(params, selected);
    if (!result) return;
    set(result.params);
    setSelected(result.index);
  };
  const point = params.patches[selected];
  const setPoint = (update: Partial<MeshGradientParams['patches'][number]>) =>
    set({ patches: params.patches.map((p, i) => (i === selected ? { ...p, ...update } : p)) });
  const weight = point?.weight ?? 1;

  return (
    <div className="gg-drawer-root">
      <div className="gg-drawer-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="gg-drawer gg-drawer-wide" aria-label={`${preset.name} mesh editor`}>
        <header className="gg-drawer-head">
          <MeshStage
            params={params}
            aspect={aspect}
            selected={selected}
            onSelect={setSelected}
            onChange={set}
          />
          <div className="gg-drawer-meta">
            <label className="gg-name-input">
              <span className="gg-panel-eyebrow">Name</span>
              <input
                type="text"
                value={preset.name}
                onChange={(e) => store.updateMesh(preset.id, (p) => ({ ...p, name: e.target.value }))}
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
              <div className="gg-panel-eyebrow">Mode</div>
              <Segmented
                label="Mesh mode"
                options={MESH_MODES.map((m) => ({ value: m, label: m === 'warp' ? 'Warp' : 'Patches' }))}
                value={params.mode}
                onChange={(mode) => set({ mode })}
              />
            </div>
            <p className="gg-helper-text">
              {params.mode === 'warp'
                ? 'Liquid ribbons through the colour ramp. Drag the preview to pan.'
                : 'A grid of colour points. Drag any point anywhere; the gradient always reaches the edges.'}
            </p>
            <ParamSlider label="Speed" name="speed" params={params} onChange={set} />
          </section>

          {params.mode === 'warp' ? (
            <>
              <section className="gg-drawer-section">
                <div className="gg-panel-eyebrow">Liquid</div>
                <ParamSlider label="Scale" name="scale" params={params} onChange={set} />
                <ParamSlider label="Warp" name="warp" params={params} onChange={set} />
                <ParamSlider label="Contrast" name="contrast" params={params} onChange={set} />
                <ParamSlider label="Dither" name="dither" params={params} onChange={set} />
                <ParamSlider label="Offset X" name="offsetX" params={params} onChange={set} />
                <ParamSlider label="Offset Y" name="offsetY" params={params} onChange={set} />
              </section>

              <section className="gg-drawer-section">
                <div className="gg-drawer-section-head">
                  <div className="gg-panel-eyebrow">Ramp · {params.ramp.length}</div>
                  <button
                    type="button"
                    className="gg-btn gg-btn-sm"
                    onClick={() => setRamp([...params.ramp, params.ramp[params.ramp.length - 1]])}
                    disabled={params.ramp.length >= RAMP_MAX}
                  >
                    + Add colour
                  </button>
                </div>
                {params.ramp.map((c, i) => (
                  <ColorField
                    key={i}
                    label={`Colour ${i + 1}`}
                    value={c}
                    onChange={(hex) => setRamp(params.ramp.map((x, j) => (j === i ? hex : x)))}
                    onRemove={
                      params.ramp.length > RAMP_MIN
                        ? () => setRamp(params.ramp.filter((_, j) => j !== i))
                        : undefined
                    }
                  />
                ))}
              </section>
            </>
          ) : (
            <>
              <section className="gg-drawer-section">
                <div className="gg-panel-eyebrow">Patches</div>
                <div className="gg-drawer-section-head">
                  <span className="gg-helper-text">
                    Grid · {grid.cols} × {grid.rows} ({params.patches.length} points)
                  </span>
                  <div className="gg-grid-edit">
                    {(
                      [
                        ['+ Column', addPatchColumn, grid.cols >= GRID_MAX],
                        ['− Column', removePatchColumn, grid.cols <= GRID_MIN],
                        ['+ Row', addPatchRow, grid.rows >= GRID_MAX],
                        ['− Row', removePatchRow, grid.rows <= GRID_MIN],
                      ] as const
                    ).map(([label, edit, disabled]) => (
                      <button
                        key={label}
                        type="button"
                        className="gg-btn gg-btn-sm"
                        onClick={() => editGrid(edit)}
                        disabled={disabled}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="gg-helper-text">
                  Adding splits the space next to the selected point (blended colours); removing deletes
                  the selected point’s column or row. {GRID_MIN}–{GRID_MAX} per side.
                </p>
                <ParamSlider label="Drift" name="drift" params={params} onChange={set} />
                <ParamSlider label="Dither" name="patchDither" params={params} onChange={set} />
              </section>

              {point && (
                <section className="gg-drawer-section">
                  <div className="gg-panel-eyebrow">Point {selected + 1}</div>
                  <ColorField label="Colour" value={point.color} onChange={(color) => setPoint({ color })} />
                  {(['x', 'y'] as const).map((axis) => (
                    <label key={axis} className="gg-slider-row">
                      <span className="gg-slider-label">{axis.toUpperCase()}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.5}
                        value={point[axis]}
                        onChange={(e) => setPoint({ [axis]: Number(e.target.value) })}
                      />
                      <span className="gg-slider-value">{point[axis].toFixed(1)}%</span>
                    </label>
                  ))}
                  <div className="gg-drawer-section-head">
                    <span className="gg-helper-text">
                      Weight · how much of the canvas this point’s colour covers
                    </span>
                    {weight !== 1 && (
                      <button
                        type="button"
                        className="gg-btn gg-btn-ghost gg-btn-sm"
                        onClick={() => setPoint({ weight: undefined })}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <label className="gg-slider-row">
                    <span className="gg-slider-label">Weight</span>
                    <input
                      type="range"
                      min={WEIGHT_MIN}
                      max={WEIGHT_MAX}
                      step={0.05}
                      value={weight}
                      onChange={(e) => setPoint({ weight: Number(e.target.value) })}
                    />
                    <span className="gg-slider-value">{weight.toFixed(2)}×</span>
                  </label>
                </section>
              )}
            </>
          )}

          <section className="gg-drawer-section">
            <div className="gg-panel-eyebrow">Noise</div>
            <ParamSlider label="Amount" name="grain" params={params} onChange={set} />
            <ParamSlider label="Size" name="grainSize" params={params} onChange={set} />
            <label className="gg-slider-row">
              <span className="gg-slider-label">Blend</span>
              <select
                className="gg-blob-starter-select"
                value={params.grainBlend}
                onChange={(e) => set({ grainBlend: e.target.value as GrainBlend })}
              >
                {GRAIN_BLENDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="gg-drawer-section">
            <div className="gg-panel-eyebrow">Export</div>
            <div className="gg-mesh-export-row">
              <Segmented
                label="Export aspect"
                options={EXPORT_ASPECTS.map((a) => ({ value: a.id, label: a.label }))}
                value={aspectId}
                onChange={setAspectId}
              />
              <Segmented
                label="Export multiplier"
                options={([1, 2, 4] as Multiplier[]).map((m) => ({ value: m, label: `${m}x` }))}
                value={multiplier}
                onChange={setMultiplier}
              />
              <span className="gg-slider-value">
                {aspect.width * multiplier}×{aspect.height * multiplier}
              </span>
            </div>
          </section>

          <section className="gg-drawer-section">
            <div className="gg-drawer-section-head">
              <div className="gg-panel-eyebrow">Code</div>
              <button type="button" className="gg-btn gg-btn-sm" onClick={copyTs}>
                {copied ? 'Copied' : 'Copy as TS'}
              </button>
            </div>
            <p className="gg-helper-text">
              Paste over <code>V6_MESH</code> in <code>sections/v6/mesh/meshPreset.ts</code> to ship it
              to the hero and CTA.
            </p>
            <pre className="gg-css-block">{meshParamsToTs(params)}</pre>
          </section>
        </div>

        <footer className="gg-drawer-foot">
          <button
            type="button"
            className="gg-btn gg-btn-primary"
            onClick={handleDownload}
            disabled={busy}
          >
            {busy ? 'Saving…' : `Download ${multiplier}x`}
          </button>
          <button
            type="button"
            className="gg-btn"
            onClick={() =>
              // Replace (not merge) so a custom grid size goes back to the default.
              store.updateMeshParams(preset.id, () => ({ ...cloneMeshParams(V6_MESH), mode: params.mode }))
            }
            title="Restore the hero / CTA values (keeps the current mode)"
          >
            Reset
          </button>
          <button
            type="button"
            className="gg-btn"
            onClick={() => onDuplicated(store.duplicateMesh(preset.id))}
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
