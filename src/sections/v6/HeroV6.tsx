import { AgentCta } from './AgentCta';
import { HalftoneImage, type HalftoneParams, type ImagePlacement } from './halftone/HalftoneImage';
import './HeroV6.css';

// Figma 191:60298 effect stack: "Gradient map" then "Halftone". Figma renders
// the halftone on the 1237 × 1642 photo and the hero cover-scales that result
// into its 2200 px frame, so the dot size is given in frame px (scaleDots).
const HERO_HALFTONE: HalftoneParams = {
  gradient: [
    { position: 0.427885, color: [0.798963, 0.734289, 0.978929, 1] },
    { position: 0.581731, color: [0.27451, 0.454902, 0.811765, 1] },
    { position: 0.716346, color: [0.839216, 0.898039, 0.992157, 1] },
    { position: 1, color: [0.370106, 0.798747, 0.770178, 1] },
  ],
  dotSize: (5.5 * 2200) / 1237,
  dotScale: 1,
  softness: 1,
  rotation: 0,
  center: [50, 50],
};

// The portrait photo cover-filled into the 2200 × 1428 hero ("image-bg" 260:56298).
const HERO_PLACEMENT: ImagePlacement = {
  frame: [2200, 1428],
  left: 0,
  top: -52.25,
  width: 100,
  height: 204.5,
  scaleDots: true,
};

/**
 * V6 hero (Figma 260:56297): chip headline over a halftone photo + product UI.
 * The background is the Figma halftone rebuilt in WebGL (dots swell around the
 * cursor on desktop); the exported render (bg.webp) is the fallback.
 */
export function HeroV6() {
  return (
    <section className="v6-hero" aria-labelledby="v6-hero-title">
      <HalftoneImage
        className="v6-hero-bg"
        src="/v6/hero/source.webp"
        fallbackSrc="/v6/hero/bg.webp"
        params={HERO_HALFTONE}
        placement={HERO_PLACEMENT}
        interactive
      />

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
