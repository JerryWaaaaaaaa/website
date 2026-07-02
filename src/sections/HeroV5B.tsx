import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import './HeroV5.css';
import './HeroV5B.css';

const PRODUCTS = [
  {
    name: 'Sheets',
    color: '#019F5C',
    image: '/hero-browser/sheets-ui.png',
    url: 'sheets.zoom.com',
  },
  {
    name: 'Canvas',
    color: '#3579FD',
    image: '/hero-browser/canvas-ui.png',
    url: 'canvas.zoom.com',
  },
  {
    name: 'Slides',
    color: '#FB327E',
    image: '/hero-browser/slides-UI.png',
    url: 'slides.zoom.com',
  },
  {
    name: 'Paper',
    color: '#3579FD',
    image: '/hero-browser/paper-ui.png',
    url: 'paper.zoom.com',
  },
];

// Bottom product-suite badges, split into three story groups. Hovering a group
// magnifies its icons (Mac-Dock style) and reveals the group's caption beneath
// the row. Icons come straight from public/Icon.
const SUITE_GROUPS = [
  {
    id: 'office',
    caption: 'Replacing Office and Google Suite',
    items: [
      { name: 'Paper', icon: '/Icon/product-icons/paper-fill.svg' },
      { name: 'Slides', icon: '/Icon/product-icons/slides-fill.svg' },
      { name: 'Sheets', icon: '/Icon/product-icons/sheets-fill.svg' },
    ],
  },
  {
    id: 'notion',
    caption: 'Replacing Notion',
    items: [
      { name: 'Canvas', icon: '/Icon/product-icons/canvas-fill.svg' },
      { name: 'Data table', icon: '/Icon/product-icons/datatable-fill.svg' },
    ],
  },
  {
    id: 'productivity',
    caption: 'And other productivity tools',
    items: [
      { name: 'Hub', icon: '/Icon/Hub.svg' },
      { name: 'Mail', icon: '/Icon/icon_mail.svg' },
      { name: 'Calendar', icon: '/Icon/icon_calendar.svg' },
      { name: 'Meeting', icon: '/Icon/Video.svg' },
    ],
  },
];

// Single rotation clock for the whole hero: the tagline word, browser URL, and
// product image are all driven off `activeIndex`, so they advance together.
const ROTATION_INTERVAL = 2200;

// Mac-Dock-style magnetic magnification for the hovered group's icons: the icon
// nearest the cursor gets the full boost, neighbors taper off smoothly. JS only
// computes the proximity factor (1 at the cursor → 0 past the radius); CSS
// multiplies it by the tunable --suite-magnify-max (driven by the dial kit).
const MAGNIFY_RADIUS = 100; // px of horizontal influence
function magnifyFactor(dist: number) {
  if (dist >= MAGNIFY_RADIUS) return 0;
  return 0.5 * (1 + Math.cos((Math.PI * dist) / MAGNIFY_RADIUS)); // 1→0
}

export function HeroV5B() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [hintShift, setHintShift] = useState(0);

  const rowRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const hint =
    SUITE_GROUPS.find((g) => g.id === hoveredGroup)?.caption ?? '';

  // Center the hint under the hovered group: the hint box is centered on the
  // row, so we translate it by (group center − row center).
  const focusGroup = (id: string) => {
    setHoveredGroup(id);
    const g = groupRefs.current[id]?.getBoundingClientRect();
    const r = rowRef.current?.getBoundingClientRect();
    if (g && r) setHintShift(g.left + g.width / 2 - (r.left + r.width / 2));
  };

  const reduceMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Per-icon magnetic scale, written straight to the DOM to avoid a re-render
  // on every pointer move (and the scale→layout feedback that state would add).
  const handleMove = (id: string, clientX: number) => {
    if (reduceMotion()) return;
    const groupEl = groupRefs.current[id];
    if (!groupEl) return;
    groupEl
      .querySelectorAll<HTMLElement>('.hero-v5-suite-badge')
      .forEach((badge) => {
        const rect = badge.getBoundingClientRect();
        const dist = Math.abs(clientX - (rect.left + rect.width / 2));
        badge.style.setProperty('--mag', magnifyFactor(dist).toFixed(3));
      });
  };

  const releaseGroup = (id: string) => {
    setHoveredGroup(null);
    groupRefs.current[id]
      ?.querySelectorAll<HTMLElement>('.hero-v5-suite-badge')
      .forEach((badge) => {
        badge.style.setProperty('--mag', '0');
      });
  };

  return (
    <section className="hero-v5">
      <div className="hero-v5-inner">
        {/* Left copy column */}
        <div className="hero-v5-copy">
          <h1 className="h1 hero-v5-heading">
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
            <span className="hero-v5-rotating">
              <span className="sr-only">{PRODUCTS[activeIndex].name}</span>
              <span
                className="hero-v5-rotating-slide"
                key={activeIndex}
                style={{ color: PRODUCTS[activeIndex].color }}
                aria-hidden="true"
              >
                <span className="hero-v5-rotating-word">
                  {PRODUCTS[activeIndex].name}
                </span>
              </span>
            </span>
          </h1>

          <p className="hero-v5-subtitle">
            Zoom AI Productivity Suite captures every conversation and turns it
            into a deliverable — so your work is ready when the meeting ends.
          </p>

          <Button variant="primary">Get started for free</Button>
        </div>

        {/* Right product stage + persistent browser window */}
        <div className="hero-v5-stage">
          {/* Persistent browser-window chrome (Figma node 3208:9370). The frame
              never changes; only the content inside rotates + skeleton-loads. */}
          <div className="hero-v5-browser">
            <div className="hero-v5-browser-nav">
              <div className="hero-v5-traffic" aria-hidden="true">
                <span className="dot dot-close" />
                <span className="dot dot-min" />
                <span className="dot dot-zoom" />
              </div>
              <div className="hero-v5-url">
                <span className="hero-v5-url-text" key={activeIndex}>
                  {PRODUCTS[activeIndex].url}
                </span>
                <img
                  src="/hero-browser/refresh.svg"
                  alt=""
                  className="hero-v5-url-refresh"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="hero-v5-browser-content">
              {PRODUCTS.map((p, i) => (
                <img
                  key={p.name}
                  src={p.image}
                  alt={`${p.name} preview`}
                  className="hero-v5-product-img"
                  style={{ opacity: activeIndex === i ? 1 : 0 }}
                  aria-hidden={activeIndex !== i}
                />
              ))}
            </div>

            <div className="hero-v5-meeting">
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

      {/* Bottom product suite story — grouped with Dock-style hover */}
      <div className="hero-v5-suite">
        <p className="hero-v5-suite-caption">
          Get maximum productivity with the whole Zoom products
        </p>
        <div
          ref={rowRef}
          className={`hero-v5b-suite-row${
            hoveredGroup ? ' is-hovering' : ''
          }`}
        >
          {SUITE_GROUPS.map((group) => (
            <div className="hero-v5b-suite-cluster" key={group.id}>
              <div
                ref={(el) => {
                  groupRefs.current[group.id] = el;
                }}
                className={`hero-v5b-suite-group${
                  hoveredGroup === group.id ? ' is-active' : ''
                }`}
                onMouseEnter={() => focusGroup(group.id)}
                onMouseMove={(e) => handleMove(group.id, e.clientX)}
                onMouseLeave={() => releaseGroup(group.id)}
                onFocus={() => focusGroup(group.id)}
                onBlur={() => releaseGroup(group.id)}
                tabIndex={0}
                aria-label={group.caption}
              >
                {group.items.map((product) => (
                  <div key={product.name} className="hero-v5-suite-badge">
                    <img
                      src={product.icon}
                      alt=""
                      className="hero-v5-suite-icon"
                      width={48}
                      height={48}
                    />
                    <span className="hero-v5-suite-label">{product.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p
          className={`hero-v5b-suite-hint${hint ? ' is-visible' : ''}`}
          style={{ transform: `translateX(${hintShift}px)` }}
          aria-live="polite"
        >
          {hint || ' '}
        </p>
      </div>
    </section>
  );
}
