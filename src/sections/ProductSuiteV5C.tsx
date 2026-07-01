import { useEffect, useState } from 'react';
// Reuse the V5 section/screen/float layout wholesale; this file only adds the
// segmented-slider navigation styles.
import './ProductSuiteV5.css';
import './ProductSuiteV5C.css';
import { SlidesMockup } from './productSuite/SlidesMockup';
import { VoiceOverPanel } from './productSuite/VoiceOverPanel';
import {
  SheetsMockup,
  AiFormulaTooltip,
  SheetsContextCard,
} from './productSuite/SheetsMockup';
import {
  PaperMockup,
  PaperComments,
  PaperSuggestions,
  PaperHistory,
} from './productSuite/PaperMockup';
import {
  CanvasMockup,
  CanvasComments,
  CanvasPolishedMenu,
  CanvasReaction,
} from './productSuite/CanvasMockup';

type Product = {
  key: string;
  label: string;
  icon: string;
  screen: string;
  color: string;
  video?: string;
};

const PRODUCTS: Product[] = [
  {
    key: 'canvas',
    label: 'Canvas',
    icon: '/Icon/product-docs.svg',
    screen: '/product-suite-assets/canvas-ui.png',
    color: '#3579fd',
    // Canvas renders as a live, animated DOM mockup (see CanvasMockup).
  },
  {
    key: 'slides',
    label: 'Slides',
    icon: '/Icon/product-slides.svg',
    screen: '/product-suite-assets/slides-UI.png',
    color: '#fb327e',
    // Slides renders as a live, animated DOM mockup (see SlidesMockup).
  },
  {
    key: 'sheets',
    label: 'Sheets',
    icon: '/Icon/product-sheet.svg',
    screen: '/product-suite-assets/sheets.png',
    color: '#019f5c',
    // Sheets renders as a live, animated DOM mockup (see SheetsMockup).
  },
  {
    key: 'paper',
    label: 'Paper',
    icon: '/Icon/product-classic-doc.svg',
    screen: '/product-suite-assets/paper-ui.png',
    color: '#0d6bde',
  },
  {
    key: 'datatable',
    label: 'Data table',
    icon: '/Icon/product-datatable.svg',
    screen: '/product-suite-assets/datatable-ui.png',
    color: '#019f5c',
  },
];

export function ProductSuiteV5C() {
  const [active, setActive] = useState('slides');
  const [paused, setPaused] = useState(false);
  // Bumped on every segment click so the fill remounts and the countdown replays
  // from the start — even when the clicked bar is already the active one.
  const [runId, setRunId] = useState(0);
  const activeIndex = PRODUCTS.findIndex((p) => p.key === active);

  // Pause autoplay while the tab is hidden so it doesn't burst-catch-up on return.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Advance to the next product. Fired by the active fill bar's animationend so
  // the countdown and the switch share one clock (no interval/animation drift).
  const advance = () => {
    setActive((cur) => {
      const i = PRODUCTS.findIndex((p) => p.key === cur);
      return PRODUCTS[(i + 1) % PRODUCTS.length].key;
    });
  };

  // Manual selection: switch (or re-trigger) and restart the countdown.
  const select = (key: string) => {
    setActive(key);
    setRunId((n) => n + 1);
  };

  return (
    <section className="psuite-v5 psuite-v5c">
      <h2 className="psuite-v5-heading">For every task you need</h2>

      <div className="psuite-v5-body">
        <div
          className="psuite-v5c-slider"
          role="tablist"
          aria-label="Zoom productivity suite"
        >
          {PRODUCTS.map((product, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={product.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={product.label}
                className="psuite-v5c-seg"
                onClick={() => select(product.key)}
              >
                {isActive && (
                  <span
                    key={`${active}-${runId}`}
                    className="psuite-v5c-fill"
                    data-paused={paused ? 'true' : undefined}
                    style={{ background: product.color }}
                    onAnimationEnd={advance}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="psuite-v5-screen-wrap">
          <div className="psuite-v5-screen">
            {PRODUCTS.map((product) => {
              if (product.key === 'slides') {
                return (
                  <div
                    key="slides"
                    className="psuite-v5-screen-live"
                    style={{
                      opacity: active === 'slides' ? 1 : 0,
                      pointerEvents: active === 'slides' ? 'auto' : 'none',
                    }}
                    aria-hidden={active !== 'slides'}
                  >
                    <SlidesMockup active={active === 'slides'} />
                  </div>
                );
              }
              if (product.key === 'sheets') {
                return (
                  <div
                    key="sheets"
                    className="psuite-v5-screen-live"
                    style={{
                      opacity: active === 'sheets' ? 1 : 0,
                      pointerEvents: active === 'sheets' ? 'auto' : 'none',
                    }}
                    aria-hidden={active !== 'sheets'}
                  >
                    <SheetsMockup active={active === 'sheets'} />
                  </div>
                );
              }
              if (product.key === 'paper') {
                return (
                  <div
                    key="paper"
                    className="psuite-v5-screen-live"
                    style={{
                      opacity: active === 'paper' ? 1 : 0,
                      pointerEvents: active === 'paper' ? 'auto' : 'none',
                    }}
                    aria-hidden={active !== 'paper'}
                  >
                    <PaperMockup active={active === 'paper'} />
                  </div>
                );
              }
              if (product.key === 'canvas') {
                return (
                  <div
                    key="canvas"
                    className="psuite-v5-screen-live"
                    style={{
                      opacity: active === 'canvas' ? 1 : 0,
                      pointerEvents: active === 'canvas' ? 'auto' : 'none',
                    }}
                    aria-hidden={active !== 'canvas'}
                  >
                    <CanvasMockup active={active === 'canvas'} />
                  </div>
                );
              }
              return product.video ? (
                <video
                  key={product.key}
                  src={product.video}
                  poster={product.screen}
                  className="psuite-v5-screen-img"
                  style={{ opacity: product.key === active ? 1 : 0 }}
                  aria-hidden={product.key !== active}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  key={product.key}
                  src={product.screen}
                  alt={`${product.label} preview`}
                  className="psuite-v5-screen-img"
                  style={{ opacity: product.key === active ? 1 : 0 }}
                  aria-hidden={product.key !== active}
                />
              );
            })}
          </div>

          {/* Floating Slides UI panels that spill outside the card (shown on Slides). */}
          <div
            className="psuite-v5-floats"
            style={{ opacity: active === 'slides' ? 1 : 0 }}
            aria-hidden={active !== 'slides'}
          >
            <img
              className="psuite-v5-float psuite-v5-float--prompt"
              src="/slides-mockup/prompt.png"
              alt=""
            />
            <img
              className="psuite-v5-float psuite-v5-float--notes"
              src="/slides-mockup/speaker-note.png"
              alt=""
            />
            <div className="psuite-v5-float psuite-v5-float--voice">
              <VoiceOverPanel />
            </div>
          </div>

          {/* Floating cards that spill over the card (shown on Sheets). */}
          <div
            className="shm-floats shm-floats--context"
            data-on={active === 'sheets' ? 'true' : 'false'}
            aria-hidden={active !== 'sheets'}
          >
            <SheetsContextCard />
          </div>
          <div
            className="shm-floats"
            data-on={active === 'sheets' ? 'true' : 'false'}
            aria-hidden={active !== 'sheets'}
          >
            <AiFormulaTooltip />
          </div>

          {/* Comments / suggestions / history widgets that spill outside the card
              (shown on Paper). */}
          <div
            className="ppm-floats"
            data-on={active === 'paper' ? 'true' : 'false'}
            aria-hidden={active !== 'paper'}
          >
            <PaperComments />
            <PaperSuggestions />
            <PaperHistory />
          </div>

          {/* Comments / polished-view menu / reaction widgets that spill outside
              the card (shown on Canvas). */}
          <div
            className="cnv-floats"
            data-on={active === 'canvas' ? 'true' : 'false'}
            aria-hidden={active !== 'canvas'}
          >
            <CanvasComments />
            <CanvasPolishedMenu />
            <CanvasReaction />
          </div>
        </div>
      </div>
    </section>
  );
}
