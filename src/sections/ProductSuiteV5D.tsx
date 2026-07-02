import { useEffect, useState, type CSSProperties } from 'react';
// Reuse the V5 section/screen/float layout wholesale; this file only adds the
// horizontal tab-row navigation styles (see the Figma "Tab bar" design).
import './ProductSuiteV5.css';
import './ProductSuiteV5D.css';
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
import {
  DataTableMockup,
  DataTablePieCard,
  DataTableAiPopover,
} from './productSuite/DataTableMockup';

type Product = {
  key: string;
  label: string;
  icon: string;
  screen: string;
  color: string;
  video?: string;
};

// Order per the Figma tab-bar design: Paper, Slides, Sheets, Canvas, Data table.
const PRODUCTS: Product[] = [
  {
    key: 'paper',
    label: 'Paper',
    icon: '/Icon/product-icons/paper-fill.svg',
    screen: '/product-suite-assets/paper-ui.png',
    color: '#0d6bde',
  },
  {
    key: 'slides',
    label: 'Slides',
    icon: '/Icon/product-icons/slides-fill.svg',
    screen: '/product-suite-assets/slides-UI.png',
    color: '#fb327e',
    // Slides renders as a live, animated DOM mockup (see SlidesMockup).
  },
  {
    key: 'sheets',
    label: 'Sheets',
    icon: '/Icon/product-icons/sheets-fill.svg',
    screen: '/product-suite-assets/sheets.png',
    color: '#019f5c',
    // Sheets renders as a live, animated DOM mockup (see SheetsMockup).
  },
  {
    key: 'canvas',
    label: 'Canvas',
    icon: '/Icon/product-icons/canvas-fill.svg',
    screen: '/product-suite-assets/canvas-ui.png',
    color: '#3579fd',
    // Canvas renders as a live, animated DOM mockup (see CanvasMockup).
  },
  {
    key: 'datatable',
    label: 'Data table',
    icon: '/Icon/product-icons/datatable-fill.svg',
    screen: '/product-suite-assets/datatable-ui.png',
    color: '#019f5c',
  },
];

export function ProductSuiteV5D() {
  const [active, setActive] = useState('paper');
  const [paused, setPaused] = useState(false);
  // Bumped on every tab click so the underline remounts and the countdown replays
  // from the start — even when the clicked tab is already the active one.
  const [runId, setRunId] = useState(0);
  const activeIndex = PRODUCTS.findIndex((p) => p.key === active);

  // Staged reveal of the spilling Slides floats once the deck finishes
  // generating: speaker note → voice-over button → voice-over dropdown opens.
  const [slidesReady, setSlidesReady] = useState(false);
  const [noteIn, setNoteIn] = useState(false);
  const [voiceIn, setVoiceIn] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => {
    if (active !== 'slides' || !slidesReady) {
      setNoteIn(false);
      setVoiceIn(false);
      setVoiceOpen(false);
      return;
    }
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setNoteIn(true);
      setVoiceIn(true);
      setVoiceOpen(true);
      return;
    }
    const timers = [
      window.setTimeout(() => setNoteIn(true), 200),
      window.setTimeout(() => setVoiceIn(true), 650),
      window.setTimeout(() => setVoiceOpen(true), 1100),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active, slidesReady]);

  // Pause autoplay while the tab is hidden so it doesn't burst-catch-up on return.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Advance to the next product. Fired by the active underline's animationend so
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
    <section className="psuite-v5 psuite-v5d">
      <h2 className="psuite-v5-heading">For every task you need</h2>

      <div className="psuite-v5-body">
        <div
          className="psuite-v5d-tabs"
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
                className="psuite-v5d-tab"
                data-active={isActive ? 'true' : undefined}
                style={{ '--pc': product.color } as CSSProperties}
                onClick={() => select(product.key)}
              >
                {isActive ? (
                  // Active: full-color icon (the -fill svg has white marks that a
                  // CSS mask can't knock out, so render it as a real image).
                  <img
                    className="psuite-v5d-tab-icon"
                    src={product.icon}
                    alt=""
                    aria-hidden
                  />
                ) : (
                  // Inactive: the -mono silhouette recolored to the label color
                  // via mask + currentColor (single evenodd path, masks cleanly).
                  <span
                    className="psuite-v5d-tab-icon psuite-v5d-tab-icon--mono"
                    style={
                      {
                        '--icon': `url(${product.icon.replace('-fill', '-mono')})`,
                      } as CSSProperties
                    }
                    aria-hidden
                  />
                )}
                <span className="psuite-v5d-tab-label">{product.label}</span>
                {isActive && (
                  <span
                    key={`${active}-${runId}`}
                    className="psuite-v5d-underline"
                    data-paused={paused ? 'true' : undefined}
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
                    <SlidesMockup active={active === 'slides'} onReadyChange={setSlidesReady} />
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
              if (product.key === 'datatable') {
                return (
                  <div
                    key="datatable"
                    className="psuite-v5-screen-live"
                    style={{
                      opacity: active === 'datatable' ? 1 : 0,
                      pointerEvents: active === 'datatable' ? 'auto' : 'none',
                    }}
                    aria-hidden={active !== 'datatable'}
                  >
                    <DataTableMockup active={active === 'datatable'} />
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
              data-in={noteIn ? 'true' : 'false'}
            />
            <div className="psuite-v5-float psuite-v5-float--voice">
              <VoiceOverPanel
                visible={voiceIn}
                open={voiceOpen}
                onToggle={() => setVoiceOpen((o) => !o)}
              />
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

          {/* Pie-chart dashboard card + "Fill column with AI" popover that spill
              outside the card (shown on Data table). They pop in one by one once
              the Notes (AI) column has finished loading. */}
          <div
            className="dtm-floats dtm-floats--pie"
            data-on={active === 'datatable' ? 'true' : 'false'}
            aria-hidden={active !== 'datatable'}
          >
            <DataTablePieCard />
          </div>
          <div
            className="dtm-floats dtm-floats--ai"
            data-on={active === 'datatable' ? 'true' : 'false'}
            aria-hidden={active !== 'datatable'}
          >
            <DataTableAiPopover />
          </div>
        </div>
      </div>
    </section>
  );
}
