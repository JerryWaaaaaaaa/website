import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/Button';
import RotatingText from '../components/RotatingText';

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

const TRANSCRIPT_COPY =
  "In today's online meeting, I want to welcome everyone and thank you for joining us. It's great to see so many familiar faces and some new ones as well. I hope you're all doing well and staying safe. As we dive into our agenda, please feel free to share your thoughts and ideas.";

export function HeroV2() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section className="hero-v2">
      {/* Curved transcript */}
      <div className="hero-transcript" aria-hidden="true">
        <svg viewBox="0 -30 1440 290">
          <defs>
            <path
              id="hero-transcript-curve"
              d="M -101 89 C 134 227 200 60 380 30 C 540 5 660 90 720 230"
              fill="none"
            />
          </defs>
          {/* Ribbon background */}
          <path
            d="M -101 89 C 134 227 200 60 380 30 C 540 5 660 90 720 230"
            fill="none"
            stroke="#d2def2"
            strokeWidth="56"
            strokeLinecap="butt"
          />
          {/* Animated text on path — pixel offsets for seamless loop */}
          <text className="hero-transcript-text">
            <textPath href="#hero-transcript-curve">
              <animate
                attributeName="startOffset"
                from="-2720"
                to="0"
                dur="30s"
                repeatCount="indefinite"
              />
              {`${TRANSCRIPT_COPY}  ${TRANSCRIPT_COPY}  ${TRANSCRIPT_COPY}  ${TRANSCRIPT_COPY}`}
            </textPath>
          </text>
        </svg>
      </div>

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
    </section>
  );
}
