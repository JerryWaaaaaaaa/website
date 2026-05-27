import { useMemo } from 'react';
import './RibbonControls.css';

export interface RibbonConfig {
  avatarSize: number;
  avatarGap: number;
  avatarOffset: number;
  fontSize: number;
  ribbonThickness: number;
  ribbonColor: string;
  cycleMs: number;
}

export const RIBBON_DEFAULTS: RibbonConfig = {
  avatarSize: 48,
  avatarGap: 2,
  avatarOffset: 0,
  fontSize: 20,
  ribbonThickness: 58,
  ribbonColor: '#d2def2',
  cycleMs: 30000,
};

interface RibbonControlsProps {
  config: RibbonConfig;
  onChange: (next: RibbonConfig) => void;
  onReset?: () => void;
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

function RangeControl({ label, value, min, max, step = 1, unit = 'px', onChange }: RangeControlProps) {
  return (
    <div className="rc-control">
      <div className="rc-control-row">
        <span className="rc-control-label">{label}</span>
        <span className="rc-control-value">
          {value}
          {unit}
        </span>
      </div>
      <div className="rc-control-row">
        <input
          className="rc-range"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          className="rc-number"
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

export function RibbonControls({ config, onChange, onReset }: RibbonControlsProps) {
  const set = <K extends keyof RibbonConfig>(key: K) => (next: RibbonConfig[K]) =>
    onChange({ ...config, [key]: next });

  const snippet = useMemo(
    () =>
      `<HeroTranscript
  avatarSize={${config.avatarSize}}
  avatarGap={${config.avatarGap}}
  avatarOffset={${config.avatarOffset}}
  fontSize={${config.fontSize}}
  ribbonThickness={${config.ribbonThickness}}
  ribbonColor="${config.ribbonColor}"
  cycleMs={${config.cycleMs}}
/>`,
    [config],
  );

  const copySnippet = () => {
    navigator.clipboard.writeText(snippet).catch(() => {});
  };

  return (
    <div className="rc-root">
      <h3 className="rc-heading">Avatar</h3>
      <RangeControl
        label="Size"
        value={config.avatarSize}
        min={20}
        max={96}
        onChange={set('avatarSize')}
      />
      <RangeControl
        label="Outward offset from edge"
        value={config.avatarGap}
        min={0}
        max={40}
        onChange={set('avatarGap')}
      />
      <RangeControl
        label="Offset (perpendicular)"
        value={config.avatarOffset}
        min={-40}
        max={40}
        onChange={set('avatarOffset')}
      />

      <h3 className="rc-heading">Text</h3>
      <RangeControl
        label="Size"
        value={config.fontSize}
        min={12}
        max={32}
        onChange={set('fontSize')}
      />

      <h3 className="rc-heading">Ribbon</h3>
      <RangeControl
        label="Thickness"
        value={config.ribbonThickness}
        min={20}
        max={120}
        onChange={set('ribbonThickness')}
      />
      <div className="rc-control">
        <div className="rc-control-row">
          <span className="rc-control-label">Color</span>
          <span className="rc-control-value">{config.ribbonColor}</span>
        </div>
        <div className="rc-color-row">
          <input
            className="rc-color"
            type="color"
            value={config.ribbonColor}
            onChange={(e) => set('ribbonColor')(e.target.value)}
          />
          <input
            className="rc-color-hex"
            type="text"
            value={config.ribbonColor}
            onChange={(e) => set('ribbonColor')(e.target.value)}
          />
        </div>
      </div>

      <h3 className="rc-heading">Animation</h3>
      <RangeControl
        label="Cycle duration"
        value={config.cycleMs / 1000}
        min={5}
        max={60}
        step={1}
        unit="s"
        onChange={(seconds) => set('cycleMs')(seconds * 1000)}
      />

      {onReset && (
        <button type="button" className="rc-reset" onClick={onReset}>
          Reset to defaults
        </button>
      )}

      <div className="rc-snippet">
        <div className="rc-snippet-header">
          <span className="rc-snippet-label">JSX snippet</span>
          <button type="button" className="rc-snippet-copy" onClick={copySnippet}>
            Copy
          </button>
        </div>
        <pre>{snippet}</pre>
      </div>
    </div>
  );
}
