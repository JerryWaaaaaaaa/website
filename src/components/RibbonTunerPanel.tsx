import { useState } from 'react';
import { RibbonControls, type RibbonConfig } from './RibbonControls';
import './RibbonTunerPanel.css';

interface RibbonTunerPanelProps {
  config: RibbonConfig;
  onChange: (next: RibbonConfig) => void;
  defaults: RibbonConfig;
}

export function RibbonTunerPanel({ config, onChange, defaults }: RibbonTunerPanelProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        className="rtp-fab"
        aria-label="Open ribbon tuner"
        onClick={() => setOpen(true)}
      >
        <span className="rtp-fab-dot" aria-hidden="true" />
        Tune ribbon
      </button>
    );
  }

  return (
    <aside className="rtp-panel" role="dialog" aria-label="Ribbon tuner">
      <header className="rtp-panel-header">
        <div>
          <h2 className="rtp-panel-title">Ribbon Tuner</h2>
          <p className="rtp-panel-subtitle">Live-edit the hero ribbon</p>
        </div>
        <button
          type="button"
          className="rtp-close"
          aria-label="Close ribbon tuner"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </header>

      <div className="rtp-panel-body">
        <RibbonControls
          config={config}
          onChange={onChange}
          onReset={() => onChange(defaults)}
        />
      </div>
    </aside>
  );
}
