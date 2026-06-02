import { useEffect, useState, type CSSProperties } from 'react';
import { Button } from '../components/Button';

const PRODUCTS = [
  {
    name: 'Slides',
    color: '#fb327e',
    icon: '/Icon/product-slides.svg',
    image: '/hero-may-images/slides.png',
  },
  {
    name: 'Sheets',
    color: '#23a52d',
    icon: '/Icon/product-sheet.svg',
    image: '/hero-may-images/sheets.png',
  },
  {
    name: 'Canvas',
    color: '#0d6bde',
    icon: '/Icon/product-docs.svg',
    image: '/hero-may-images/canvas.png',
  },
  {
    name: 'Data table',
    color: '#23a52d',
    icon: '/Icon/product-datatable.svg',
    image: '/hero-may-images/datatable.png',
  },
];

// Must match --rotation-interval in .hero-rotating (src/index.css) so the
// crossfading product image stays in phase with the CSS word-roll tagline.
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

        {/* Right product stage + floating meeting window */}
        <div className="hero-v3-stage">
          <div className="hero-v3-product">
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
