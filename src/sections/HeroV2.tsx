import { useState, type CSSProperties } from 'react';
import { Button } from '../components/Button';
import {
  RIBBON_DEFAULTS,
  type RibbonConfig,
} from '../components/RibbonControls';
import { RibbonTunerPanel } from '../components/RibbonTunerPanel';
import { HeroTranscript, type Speaker } from './HeroTranscript';

const PRODUCTS = [
  { name: 'Slides', color: '#fb327e', icon: '/Icon/product-slides.svg' },
  { name: 'Sheets', color: '#23a52d', icon: '/Icon/product-sheet.svg' },
  { name: 'Docs', color: '#0d6bde', icon: '/Icon/product-docs.svg' },
  { name: 'Data table', color: '#23a52d', icon: '/Icon/product-datatable.svg' },
];

const ARTIFACTS = [
  '/hero-images/sheets.png',
  '/hero-images/slides.png',
  '/hero-images/canvas.png',
  '/hero-images/data-table.png',
];

// Second ribbon — drawn left-to-right so text reads right-side-up; combined
// with `reverseText` on the second <HeroTranscript> below, the visual scroll
// flows opposite to ribbon 1.
const HERO_TRANSCRIPT_CURVE_2 =
  'M 720 230 C 791 101 899 34 1055 80 C 1156 106 1300 28 1162 -210';

const HERO_TRANSCRIPT_SPEAKERS_2: Speaker[] = [
  {
    name: 'Avery',
    src: '/avatars/Avatar.png',
    text: 'Roadmap check — Q3 launch is on track and beta feedback came in strong.',
  },
  {
    name: 'Mateo',
    src: '/avatars/Avatar-1.png',
    text: 'Any blockers from the design review yet?',
  },
  {
    name: 'Lila',
    src: '/avatars/Avatar-2.png',
    text: "Just one — we're aligning on the empty state pattern.",
  },
  {
    name: 'Theo',
    src: '/avatars/Avatar-3.png',
    text: 'I can have a final spec ready by Friday afternoon.',
  },
];

export function HeroV2() {
  const [ribbonConfig, setRibbonConfig] = useState<RibbonConfig>(RIBBON_DEFAULTS);

  return (
    <section className="hero-v2">
      {/* Curved transcript */}
      <HeroTranscript {...ribbonConfig} />
      <HeroTranscript
        {...ribbonConfig}
        speakers={HERO_TRANSCRIPT_SPEAKERS_2}
        curveD={HERO_TRANSCRIPT_CURVE_2}
        reverseText
      />

      {/* Prompt card */}
      <div className="hero-prompt">
        {/* Heading */}
        <h1 className="h1 hero-prompt-heading">
          {'You just talk, Let AI turns your meeting into '.split(' ').map((word, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap' }}>
              {word}
            </span>
          ))}

          {/* Rotating product carousel — pure CSS, word-by-word */}
          <span className="hero-rotating">
            <span className="sr-only">{PRODUCTS[0].name}</span>
            {PRODUCTS.map((p, i) => (
              <span
                key={p.name}
                className="hero-rotating-slide"
                style={{ '--slide-index': i, color: p.color } as CSSProperties}
                aria-hidden="true"
              >
                <img src={p.icon} alt="" className="hero-rotating-icon" />
                {p.name.split(' ').map((word, w) => (
                  <span
                    key={w}
                    className="hero-rotating-word"
                    style={{ '--word-index': w } as CSSProperties}
                  >
                    {word}
                  </span>
                ))}
              </span>
            ))}
          </span>
        </h1>

        {/* Subtitle + CTA row */}
        <div className="hero-prompt-row">
          <p className="hero-prompt-subtitle">
            AI meeting flow handles all the meeting grunt work, so you can focus on what really matters
          </p>
          <Button variant="primary">Get started today</Button>
        </div>
      </div>

      {/* Artifact carousel — looping marquee */}
      <div className="hero-artifact-wrap">
        <div className="hero-artifact-tilt">
          <div className="hero-artifact-track">
            {[...ARTIFACTS, ...ARTIFACTS].map((src, i) => (
              <div className="hero-artifact" key={i}>
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating ribbon tuner GUI */}
      <RibbonTunerPanel
        config={ribbonConfig}
        onChange={setRibbonConfig}
        defaults={RIBBON_DEFAULTS}
      />
    </section>
  );
}
