import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Button } from '../components/Button';
import { RIBBON_DEFAULTS } from '../components/RibbonControls';
import { HeroTranscript } from './HeroTranscript';
import './HeroV4.css';

// Mail, Calendar and Hub have no dedicated screenshot yet — reuse an existing
// hero screen as a stand-in placeholder.
const PLACEHOLDER_SCREEN = '/hero-browser/canvas-ui.png';

type Tab = {
  key: string;
  label: string;
  icon: string;
  screen: string;
  color: string;
  tint: string;
};

const TABS: Tab[] = [
  {
    key: 'slides',
    label: 'Slides',
    icon: '/Icon/product-slides.svg',
    screen: '/hero-browser/slides-UI.png',
    color: '#fb327e',
    tint: 'rgba(254, 193, 216, 0.2)',
  },
  {
    key: 'sheets',
    label: 'Sheets',
    icon: '/Icon/product-sheet.svg',
    screen: '/hero-browser/sheets-ui.png',
    color: '#019f5c',
    tint: 'rgba(1, 159, 92, 0.12)',
  },
  {
    key: 'datatable',
    label: 'Data table',
    icon: '/Icon/product-datatable.svg',
    screen: '/hero-browser/datatable-ui.png',
    color: '#019f5c',
    tint: 'rgba(1, 159, 92, 0.12)',
  },
  {
    key: 'canvas',
    label: 'Canvas',
    icon: '/Icon/product-docs.svg',
    screen: '/hero-browser/canvas-ui.png',
    color: '#3579fd',
    tint: 'rgba(53, 121, 253, 0.12)',
  },
  {
    key: 'paper',
    label: 'Paper',
    icon: '/Icon/product-classic-doc.svg',
    screen: '/hero-browser/paper-ui.png',
    color: '#0d6bde',
    tint: 'rgba(13, 107, 222, 0.12)',
  },
  {
    key: 'hub',
    label: 'Hub',
    icon: '/Icon/Hub.svg',
    screen: PLACEHOLDER_SCREEN,
    color: '#2a2b2d',
    tint: 'rgba(42, 43, 45, 0.1)',
  },
  {
    key: 'mail',
    label: 'Mail',
    icon: '/Icon/icon_mail.svg',
    screen: PLACEHOLDER_SCREEN,
    color: '#0e72ed',
    tint: 'rgba(14, 114, 237, 0.12)',
  },
  {
    key: 'calendar',
    label: 'Calendar',
    icon: '/Icon/icon_calendar.svg',
    screen: PLACEHOLDER_SCREEN,
    color: '#0e72ed',
    tint: 'rgba(14, 114, 237, 0.12)',
  },
];

// Single left ribbon — enters flat/horizontal from the left edge of the
// viewport and runs straight into the vertical center of the product screen's
// left edge, tucking behind the (opaque) screen so it reads as going into the
// document. The path is recomputed at runtime from the measured screen geometry
// so it stays anchored at any window width (see HeroV4 below); this constant is
// only the first-paint fallback, tuned for a ~1440px viewport.
const HERO_V4_RIBBON_CURVE_FALLBACK = 'M -220 742 C -40 742 120 742 240 742';

export function HeroV4() {
  const [active, setActive] = useState('slides');
  const sectionRef = useRef<HTMLElement>(null);
  const [curveD, setCurveD] = useState(HERO_V4_RIBBON_CURVE_FALLBACK);

  // Anchor the ribbon to the product screen's left-edge center regardless of
  // window size: the HeroTranscript SVG scales with width while the screen
  // reflows, so a fixed viewBox path drifts. Recompute the flat path from the
  // measured SVG + screen rects, and re-run on resize.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    const compute = () => {
      const svg = section.querySelector<SVGSVGElement>('.hero-transcript svg');
      const screen = section.querySelector<HTMLElement>('.hero-v4-screen');
      if (!svg || !screen) return;
      const s = svg.getBoundingClientRect();
      const r = screen.getBoundingClientRect();
      if (!s.width || !s.height) return;
      // Convert client px into the SVG's viewBox units (top-left = 0, -30).
      const toVbX = (cx: number) => (cx - s.left) * (1440 / s.width);
      const toVbY = (cy: number) => (cy - s.top) * (290 / s.height) - 30;
      const y = toVbY(r.top + r.height / 2);
      const startX = toVbX(s.left - 220);
      const endX = toVbX(r.left + 32);
      const c1 = startX + (endX - startX) * 0.35;
      const c2 = startX + (endX - startX) * 0.7;
      setCurveD(
        `M ${startX.toFixed(1)} ${y.toFixed(1)} C ${c1.toFixed(1)} ${y.toFixed(1)} ${c2.toFixed(1)} ${y.toFixed(1)} ${endX.toFixed(1)} ${y.toFixed(1)}`,
      );
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(section);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <section className="hero-v4" ref={sectionRef}>
      {/* Curved transcript ribbon — enters from the left edge into the document */}
      <HeroTranscript {...RIBBON_DEFAULTS} curveD={curveD} />

      {/* Tagline */}
      <div className="hero-v4-tagline">
        <h1 className="hero-v4-heading">Meetings that actually deliver.</h1>
        <p className="hero-v4-subtitle">
          Your conversations don't end at goodbye — they become the work.
        </p>
        <Button variant="primary">Get started for free</Button>
      </div>

      {/* Product tabs + screen */}
      <div className="hero-v4-suite">
        <div className="hero-v4-tabs" role="tablist" aria-label="Zoom productivity suite">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.key)}
                className="hero-v4-tab"
                style={
                  { '--tab-color': tab.color, '--tab-tint': tab.tint } as CSSProperties
                }
              >
                <img
                  src={tab.icon}
                  alt=""
                  className="hero-v4-tab-icon"
                  width={32}
                  height={32}
                />
                <span className="hero-v4-tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hero-v4-screen">
          {TABS.map((tab) => (
            <img
              key={tab.key}
              src={tab.screen}
              alt={`${tab.label} preview`}
              className="hero-v4-screen-img"
              style={{ opacity: tab.key === active ? 1 : 0 }}
              aria-hidden={tab.key !== active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
