import { useEffect, useState, type CSSProperties } from 'react';
import { Button } from '../components/Button';

const PRODUCTS = [
  {
    name: 'Slides',
    color: '#fb327e',
    icon: '/Icon/product-slides.svg',
    image: '/hero-browser/slides-UI.png',
    url: 'slides.zoom.com',
    layout: 'slides',
  },
  {
    name: 'Sheets',
    color: '#23a52d',
    icon: '/Icon/product-sheet.svg',
    image: '/hero-browser/sheets-ui.png',
    url: 'sheets.zoom.com',
    layout: 'sheets',
  },
  {
    name: 'Canvas',
    color: '#0d6bde',
    icon: '/Icon/product-docs.svg',
    image: '/hero-browser/canvas-ui.png',
    url: 'canvas.zoom.com',
    layout: 'canvas',
  },
  {
    name: 'Data table',
    color: '#23a52d',
    icon: '/Icon/product-datatable.svg',
    image: '/hero-browser/datatable-ui.png',
    url: 'datatable.zoom.com',
    layout: 'datatable',
  },
];

// Must match --rotation-interval in .hero-rotating (src/index.css) so the
// crossfading product image stays in phase with the CSS word-roll tagline.
const ROTATION_INTERVAL = 2200;

// Placeholder silhouettes that loosely echo each product's real layout, so the
// skeleton-load feels specific to the content that's about to appear.
function SkeletonShapes({ layout }: { layout: string }) {
  switch (layout) {
    case 'slides':
      return (
        <div className="sk-slides">
          <div className="sk-rail">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="sk-thumb" />
            ))}
          </div>
          <div className="sk-stage">
            <div className="sk-title" />
            <div className="sk-row sk-mid" />
            <div className="sk-row sk-narrow" />
            <div className="sk-photo" />
          </div>
        </div>
      );
    case 'sheets':
      return (
        <div className="sk-sheets">
          <div className="sk-toolbar" />
          <div className="sk-grid">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="sk-cell" />
            ))}
          </div>
        </div>
      );
    case 'canvas':
      return (
        <div className="sk-doc">
          <div className="sk-title" />
          <div className="sk-row sk-wide" />
          <div className="sk-row sk-wide" />
          <div className="sk-row sk-mid" />
          <div className="sk-gap" />
          <div className="sk-row sk-wide" />
          <div className="sk-row sk-wide" />
          <div className="sk-row sk-narrow" />
        </div>
      );
    case 'datatable':
      return (
        <div className="sk-board">
          {Array.from({ length: 4 }).map((_, c) => (
            <div key={c} className="sk-col">
              <div className="sk-col-head" />
              <div className="sk-card" />
              <div className="sk-card" />
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

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
            {'You just talk, Let AI turns your meeting into'
              .split(' ')
              .map((word, i) => (
                <span key={i} style={{ whiteSpace: 'nowrap' }}>
                  {word}
                </span>
              ))}

            {/* Rotating product carousel — pure CSS, word-by-word (matches V2) */}
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

          <p className="hero-v3-subtitle">
            AI meeting flow handles all the meeting grunt work, so you can focus
            on what really matters
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

              {/* Skeleton-load overlay — remounts on every rotation so its
                  one-shot CSS animation replays, faking a content load. */}
              <div
                className="hero-v3-skeleton"
                key={activeIndex}
                aria-hidden="true"
              >
                <SkeletonShapes layout={PRODUCTS[activeIndex].layout} />
              </div>
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
