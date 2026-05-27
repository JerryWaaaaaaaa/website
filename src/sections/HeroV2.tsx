import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/Button';
import RotatingText from '../components/RotatingText';
import {
  RIBBON_DEFAULTS,
  type RibbonConfig,
} from '../components/RibbonControls';
import { RibbonTunerPanel } from '../components/RibbonTunerPanel';
import { HeroTranscript } from './HeroTranscript';

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

export function HeroV2() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ribbonConfig, setRibbonConfig] = useState<RibbonConfig>(RIBBON_DEFAULTS);

  return (
    <section className="hero-v2">
      {/* Curved transcript */}
      <HeroTranscript {...ribbonConfig} />

      {/* Prompt card */}
      <div className="hero-prompt">
        {/* Heading */}
        <h1 className="h1 hero-prompt-heading">
          {'You just talk, Let AI turns your meeting into '.split(' ').map((word, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap' }}>
              {word}
            </span>
          ))}

          {/* Rotating product carousel */}
          <motion.span
            layout
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="hero-rotating"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={currentIndex}
                src={PRODUCTS[currentIndex].icon}
                alt=""
                className="hero-rotating-icon"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-120%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            </AnimatePresence>

            <RotatingText
              texts={PRODUCTS.map((p) => p.name)}
              colors={PRODUCTS.map((p) => p.color)}
              staggerDuration={0.025}
              staggerFrom="last"
              rotationInterval={2200}
              animatePresenceMode="popLayout"
              animatePresenceInitial={false}
              onNext={(index) => setCurrentIndex(index)}
              mainClassName="overflow-hidden"
              splitLevelClassName="overflow-hidden pb-0.5"
            />
          </motion.span>
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
