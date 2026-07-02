import { useEffect, useState } from 'react';
import { Button } from '../components/Button';

const PRODUCTS = [
  {
    name: 'Sheets',
    color: '#019F5C',
    icon: '/Icon/product-icons/sheets-fill.svg',
    image: '/hero-browser/sheets-ui.png',
    url: 'sheets.zoom.com',
  },
  {
    name: 'Canvas',
    color: '#3579FD',
    icon: '/Icon/product-icons/canvas-fill.svg',
    image: '/hero-browser/canvas-ui.png',
    url: 'canvas.zoom.com',
  },
  {
    name: 'Slides',
    color: '#FB327E',
    icon: '/Icon/product-icons/slides-fill.svg',
    image: '/hero-browser/slides-UI.png',
    url: 'slides.zoom.com',
  },
  {
    name: 'Paper',
    color: '#3579FD',
    icon: '/Icon/product-icons/paper-fill.svg',
    image: '/hero-browser/paper-ui.png',
    url: 'paper.zoom.com',
  },
];

// Single rotation clock for the whole hero: the tagline word, browser URL, and
// product image are all driven off `activeIndex`, so they advance together.
const ROTATION_INTERVAL = 2200;

export function HeroV3() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % PRODUCTS.length);
    }, ROTATION_INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="hero-v3">
      <div className="hero-v3-inner">
        {/* Left copy column */}
        <div className="hero-v3-copy">
          <h1 className="h1 hero-v3-heading">
            {'You just talk. AI builds your'
              .split(' ')
              .map((word, i) => (
                <span key={i} style={{ whiteSpace: 'nowrap' }}>
                  {word}
                </span>
              ))}

            {/* Rotating product — bound to activeIndex so the word stays in
                lockstep with the browser URL + product image. Remounting via
                key replays the one-shot roll-in on each rotation. */}
            <span className="hero-v3-rotating">
              <span className="sr-only">{PRODUCTS[activeIndex].name}</span>
              <span
                className="hero-v3-rotating-slide"
                key={activeIndex}
                style={{ color: PRODUCTS[activeIndex].color }}
                aria-hidden="true"
              >
                <img
                  src={PRODUCTS[activeIndex].icon}
                  alt=""
                  className="hero-v3-rotating-icon"
                />
                <span className="hero-v3-rotating-word">
                  {PRODUCTS[activeIndex].name}
                </span>
              </span>
            </span>
          </h1>

          <p className="hero-v3-subtitle">
            Zoom AI Productivity Suite captures every conversation and turns it
            into a deliverable — so your work is ready when the meeting ends.
          </p>

          <Button variant="primary">Get started for free</Button>
        </div>

        {/* Right product stage + persistent browser window */}
        <div className="hero-v3-stage">
          {/* Persistent browser-window chrome (Figma node 3208:9370). The frame
              never changes; only the content inside rotates + skeleton-loads. */}
          <div className="hero-v3-browser">
            <div className="hero-v3-browser-nav">
              <div className="hero-v3-traffic" aria-hidden="true">
                <span className="dot dot-close" />
                <span className="dot dot-min" />
                <span className="dot dot-zoom" />
              </div>
              <div className="hero-v3-url">
                <span className="hero-v3-url-text" key={activeIndex}>
                  {PRODUCTS[activeIndex].url}
                </span>
                <img
                  src="/hero-browser/refresh.svg"
                  alt=""
                  className="hero-v3-url-refresh"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="hero-v3-browser-content">
              {PRODUCTS.map((p, i) => (
                <img
                  key={p.name}
                  src={p.image}
                  alt={`${p.name} preview`}
                  className="hero-v3-product-img"
                  style={{ opacity: activeIndex === i ? 1 : 0 }}
                  aria-hidden={activeIndex !== i}
                />
              ))}
            </div>

            <div className="hero-v3-meeting">
              <video
                src="/hero-may-images/meeting-floating.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
