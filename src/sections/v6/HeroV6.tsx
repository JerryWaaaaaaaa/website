import { AgentCta } from './AgentCta';
import './HeroV6.css';

/** V6 hero (Figma 260:56297): chip headline over a halftone photo + product UI. */
export function HeroV6() {
  return (
    <section className="v6-hero" aria-labelledby="v6-hero-title">
      <img className="v6-hero-bg" src="/v6/hero/bg.webp" alt="" aria-hidden="true" />

      <div className="v6-hero-copy">
        <h1 className="v6-chips v6-hero-title" id="v6-hero-title">
          <span className="v6-chips-row">
            <span className="v6-chip-line v6-chip-line--blue">You just talk</span>
          </span>
          <span className="v6-chips-row">
            <span className="v6-hero-emblem" aria-hidden="true">
              <img src="/Icon/ai-tag.svg" alt="" />
            </span>
            <span className="v6-chip-line v6-chip-line--pink">AI builds you</span>
            <span className="v6-chip-line v6-chip-line--rose">Slides</span>
          </span>
        </h1>

        <div className="v6-prompt-pill v6-hero-pill">
          <p>AI meeting flow handles all the meeting grunt work, so you can focus on what really matters</p>
          <AgentCta>Get started for free</AgentCta>
        </div>
      </div>

      <div className="v6-hero-ui">
        <img
          className="v6-hero-tracker"
          src="/v6/hero/project-tracker.png"
          alt="Zoom Canvas project tracker board generated from a meeting"
          width={2400}
          height={1642}
        />

        <div className="v6-selfview" aria-hidden="true">
          <div className="v6-selfview-bar">
            <span className="v6-selfview-layouts">
              <span className="v6-layout v6-layout--strip" />
              <span className="v6-layout v6-layout--wide" />
              <span className="v6-layout v6-layout--split" />
              <img className="v6-layout" src="/v6/hero/layout-grid.svg" alt="" />
            </span>
            <img className="v6-layout" src="/v6/hero/resize.svg" alt="" />
          </div>
          <div className="v6-selfview-video">
            <img src="/v6/hero/webcam-lea.webp" alt="" />
            <span className="v6-selfview-name">Lea Hanh</span>
          </div>
        </div>
      </div>
    </section>
  );
}
