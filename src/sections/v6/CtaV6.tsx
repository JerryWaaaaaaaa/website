import { AgentCta } from './AgentCta';
import './CtaV6.css';

/** V6 closing CTA (Figma 260:56524) over the exported halftone background. */
export function CtaV6() {
  return (
    <section className="v6-panel v6-cta" aria-labelledby="v6-cta-title">
      <img className="v6-cta-bg" src="/v6/cta/bg.webp" alt="" aria-hidden="true" />
      <div className="v6-cta-copy">
        <h2 className="v6-chips v6-cta-title" id="v6-cta-title">
          <span className="v6-chips-row">
            <span className="v6-chip-line v6-chip-line--blue">Cut the busywork,</span>
          </span>
          <span className="v6-chips-row">
            <span className="v6-chip-line v6-chip-line--pink">keep the hours</span>
          </span>
        </h2>
        <div className="v6-prompt-pill">
          <p>Join 10,000+ top performers from 100+ customers who’ve transformed their meeting flow</p>
          <AgentCta>Get started for free</AgentCta>
        </div>
      </div>
    </section>
  );
}
