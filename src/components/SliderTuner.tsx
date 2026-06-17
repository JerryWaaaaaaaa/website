import { useMemo, useState } from 'react';
import { BezierEditor } from './BezierEditor';
import './SliderTuner.css';

export interface SliderConfig {
  /** Auto-advance cadence in milliseconds. */
  intervalMs: number;
  /** Transform transition duration in milliseconds. */
  slideMs: number;
  /** CSS timing function for the slide. */
  easing: string;
  /** Whether hovering the section pauses autoplay. */
  pauseOnHover: boolean;
  /** Opacity of the non-focused cards. */
  inactiveOpacity: number;
  /** Blur radius (px) applied to the non-focused cards. */
  inactiveBlur: number;
}

export const SLIDER_DEFAULTS: SliderConfig = {
  intervalMs: 2400,
  slideMs: 800,
  easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
  pauseOnHover: true,
  inactiveOpacity: 0.25,
  inactiveBlur: 4,
};

interface SliderTunerProps {
  config: SliderConfig;
  onChange: (next: SliderConfig) => void;
  defaults: SliderConfig;
}

interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (next: number) => void;
}

function RangeControl({ label, value, min, max, step = 1, unit = '', onChange }: RangeControlProps) {
  return (
    <div className="st-control">
      <div className="st-control-row">
        <span className="st-control-label">{label}</span>
        <span className="st-control-value">
          {value}
          {unit}
        </span>
      </div>
      <div className="st-control-row">
        <input
          className="st-range"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          className="st-number"
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) onChange(n);
          }}
        />
      </div>
    </div>
  );
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function SliderTuner({ config, onChange, defaults }: SliderTunerProps) {
  const [open, setOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const set = <K extends keyof SliderConfig>(key: K) => (next: SliderConfig[K]) =>
    onChange({ ...config, [key]: next });

  const snippet = useMemo(
    () =>
      `intervalMs: ${config.intervalMs},
slideMs: ${config.slideMs},
easing: '${config.easing}',
pauseOnHover: ${config.pauseOnHover},
inactiveOpacity: ${config.inactiveOpacity},
inactiveBlur: ${config.inactiveBlur},`,
    [config]
  );

  const copySnippet = () => {
    navigator.clipboard.writeText(snippet).catch(() => {});
  };

  // Persist the current config back into SLIDER_DEFAULTS on disk via the dev
  // server endpoint. Only works while `npm run dev` is running.
  const saveAsDefault = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/__save-slider-defaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
    window.setTimeout(() => setSaveStatus('idle'), 2500);
  };

  if (!open) {
    return (
      <button
        type="button"
        className="st-fab"
        aria-label="Open slider tuner"
        onClick={() => setOpen(true)}
      >
        <span className="st-fab-dot" aria-hidden="true" />
        Tune slider
      </button>
    );
  }

  return (
    <aside className="st-panel" role="dialog" aria-label="Slider tuner">
      <header className="st-panel-header">
        <div>
          <h2 className="st-panel-title">Slider Tuner</h2>
          <p className="st-panel-subtitle">Live-edit the slider timing</p>
        </div>
        <button
          type="button"
          className="st-close"
          aria-label="Close slider tuner"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </header>

      <div className="st-panel-body">
        <h3 className="st-heading">Timing</h3>
        <RangeControl
          label="Auto-advance interval"
          value={config.intervalMs}
          min={200}
          max={4000}
          step={100}
          unit="ms"
          onChange={set('intervalMs')}
        />
        <RangeControl
          label="Slide duration"
          value={config.slideMs}
          min={0}
          max={1500}
          step={50}
          unit="ms"
          onChange={set('slideMs')}
        />

        <h3 className="st-heading">Feel</h3>
        <div className="st-control">
          <div className="st-control-row">
            <span className="st-control-label">Easing</span>
          </div>
          <BezierEditor value={config.easing} onChange={set('easing')} />
        </div>

        <label className="st-toggle">
          <input
            type="checkbox"
            checked={config.pauseOnHover}
            onChange={(e) => set('pauseOnHover')(e.target.checked)}
          />
          <span>Pause on hover</span>
        </label>

        <RangeControl
          label="Inactive opacity"
          value={config.inactiveOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={set('inactiveOpacity')}
        />

        <RangeControl
          label="Inactive blur"
          value={config.inactiveBlur}
          min={0}
          max={20}
          step={0.5}
          unit="px"
          onChange={set('inactiveBlur')}
        />

        <div className="st-actions">
          <button type="button" className="st-reset" onClick={() => onChange(defaults)}>
            Reset to defaults
          </button>
          <button
            type="button"
            className="st-save"
            onClick={saveAsDefault}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving'
              ? 'Saving…'
              : saveStatus === 'saved'
                ? 'Saved ✓'
                : saveStatus === 'error'
                  ? 'Failed'
                  : 'Save as default'}
          </button>
        </div>

        <div className="st-snippet">
          <div className="st-snippet-header">
            <span className="st-snippet-label">SLIDER_DEFAULTS</span>
            <button type="button" className="st-snippet-copy" onClick={copySnippet}>
              Copy
            </button>
          </div>
          <pre>{snippet}</pre>
        </div>
      </div>
    </aside>
  );
}
