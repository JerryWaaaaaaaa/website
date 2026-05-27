import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroTranscript } from '../sections/HeroTranscript';
import {
  RIBBON_DEFAULTS,
  RibbonControls,
  type RibbonConfig,
} from '../components/RibbonControls';
import './ribbon-tuner.css';

export function RibbonTuner() {
  const [config, setConfig] = useState<RibbonConfig>(RIBBON_DEFAULTS);

  return (
    <div className="rt-shell">
      <header className="rt-topbar">
        <div className="rt-topbar-inner">
          <div>
            <h1 className="rt-title">Ribbon Tuner</h1>
            <p className="rt-subtitle">Live-edit the hero ribbon's design parameters</p>
          </div>
          <Link to="/" className="rt-back-link">
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="rt-main">
        <aside className="rt-panel">
          <RibbonControls
            config={config}
            onChange={setConfig}
            onReset={() => setConfig(RIBBON_DEFAULTS)}
          />
        </aside>

        <section className="rt-preview">
          <h2 className="rt-preview-heading">Preview</h2>
          <div className="rt-preview-stage">
            <HeroTranscript {...config} />
          </div>
        </section>
      </main>
    </div>
  );
}
