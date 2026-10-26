import { useEffect, useState, type CSSProperties } from 'react';
import { productFor, type Product, type ProductKey } from '../../data/products';
import { useFloatScale } from '../productSuite/useFloatScale';
import { SlidesMockup } from '../productSuite/SlidesMockup';
import { VoiceOverPanel } from '../productSuite/VoiceOverPanel';
import { SheetsMockup, AiFormulaTooltip, SheetsContextCard } from '../productSuite/SheetsMockup';
import {
  PaperMockup,
  PaperComments,
  PaperSuggestions,
  PaperHistory,
} from '../productSuite/PaperMockup';
import {
  CanvasMockup,
  CanvasComments,
  CanvasPolishedMenu,
  CanvasReaction,
} from '../productSuite/CanvasMockup';
import {
  DataTableMockup,
  DataTablePieCard,
  DataTableAiPopover,
} from '../productSuite/DataTableMockup';
import { PanelDot } from './AgentCta';
// The screen / float layout of the live mockups is shared with V5.
import '../ProductSuiteV5.css';
import './ProductSlideshowV6.css';

// Tab order per the Figma tab bar (260:39567).
const ORDER: ProductKey[] = ['slides', 'sheets', 'paper', 'canvas', 'datatable'];
const PRODUCTS = ORDER.map((k) => productFor(k)!) as Product[];

// Halftone background per slide.
const BACKGROUNDS: Record<ProductKey, string> = {
  slides: '/v6/slideshow/bg-slides.webp',
  sheets: '/v6/slideshow/bg-sheets.webp',
  paper: '/v6/slideshow/bg-paper.webp',
  canvas: '/v6/slideshow/bg-canvas.webp',
  datatable: '/v6/slideshow/bg-datatable.webp',
};
const N = PRODUCTS.length;

/** Live mockup + its spill-floats for one product, as in ProductSuiteV5D. */
function ProductStage({ product, active }: { product: Product; active: boolean }) {
  const wrapRef = useFloatScale<HTMLDivElement>();
  // Slides stages its floats once its deck finishes generating.
  const [slidesReady, setSlidesReady] = useState(false);
  const on = active ? 'true' : 'false';

  return (
    <div className="psuite-v5-screen-wrap v6-ss-screen" ref={wrapRef}>
      <div className="psuite-v5-screen">
        <div className="psuite-v5-screen-live">
          {product.key === 'slides' && (
            <SlidesMockup active={active} onReadyChange={setSlidesReady} />
          )}
          {product.key === 'sheets' && <SheetsMockup active={active} />}
          {product.key === 'paper' && <PaperMockup active={active} />}
          {product.key === 'canvas' && <CanvasMockup active={active} />}
          {product.key === 'datatable' && <DataTableMockup active={active} />}
        </div>
      </div>

      {product.key === 'slides' && <SlidesFloats active={active} ready={slidesReady} />}
      {product.key === 'sheets' && (
        <>
          <div className="shm-floats shm-floats--context" data-on={on} aria-hidden={!active}>
            <SheetsContextCard />
          </div>
          <div className="shm-floats" data-on={on} aria-hidden={!active}>
            <AiFormulaTooltip />
          </div>
        </>
      )}
      {product.key === 'paper' && (
        <div className="ppm-floats" data-on={on} aria-hidden={!active}>
          <PaperComments />
          <PaperSuggestions />
          <PaperHistory />
        </div>
      )}
      {product.key === 'canvas' && (
        <div className="cnv-floats" data-on={on} aria-hidden={!active}>
          <CanvasComments />
          <CanvasPolishedMenu />
          <CanvasReaction />
        </div>
      )}
      {product.key === 'datatable' && (
        <>
          <div className="dtm-floats dtm-floats--pie" data-on={on} aria-hidden={!active}>
            <DataTablePieCard />
          </div>
          <div className="dtm-floats dtm-floats--ai" data-on={on} aria-hidden={!active}>
            <DataTableAiPopover />
          </div>
        </>
      )}
    </div>
  );
}

function SlidesFloats({ active, ready }: { active: boolean; ready: boolean }) {
  const [noteIn, setNoteIn] = useState(false);
  const [voiceIn, setVoiceIn] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Staged reveal once the deck finishes: speaker note → voice-over → dropdown.
  useEffect(() => {
    if (!active || !ready) {
      setNoteIn(false);
      setVoiceIn(false);
      setVoiceOpen(false);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  }, [active, ready]);

  return (
    <div className="psuite-v5-floats" style={{ opacity: active ? 1 : 0 }} aria-hidden={!active}>
      <img className="psuite-v5-float psuite-v5-float--prompt" src="/slides-mockup/prompt.png" alt="" />
      <img
        className="psuite-v5-float psuite-v5-float--notes"
        src="/slides-mockup/speaker-note.png"
        alt=""
        data-in={noteIn ? 'true' : 'false'}
      />
      <div className="psuite-v5-float psuite-v5-float--voice">
        <VoiceOverPanel visible={voiceIn} open={voiceOpen} onToggle={() => setVoiceOpen((o) => !o)} />
      </div>
    </div>
  );
}

/**
 * V6 "For every task you need" (Figma 200:75500).
 * Annotations: each product has its own background and the section auto-plays
 * like a slideshow; the active chip's background fills as the slide counts down.
 * The fill's animationend drives the advance (same clock as ProductSuiteV5D),
 * so the countdown and the slide change never drift apart.
 */
export function ProductSlideshowV6() {
  const [active, setActive] = useState(0);
  const [runId, setRunId] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const advance = () => setActive((i) => (i + 1) % N);
  const select = (i: number) => {
    setActive(i);
    setRunId((n) => n + 1);
  };

  return (
    <section className="v6-panel v6-ss" aria-labelledby="v6-ss-title">
      <PanelDot />
      <h2 className="v6-title" id="v6-ss-title">
        For every task you need
      </h2>

      <div className="v6-ss-body">
        <div className="v6-ss-tabs" role="tablist" aria-label="Zoom productivity suite">
          {PRODUCTS.map((p, i) => {
            const isActive = i === active;
            return (
              <button
                key={p.key}
                type="button"
                role="tab"
                id={`v6-ss-tab-${p.key}`}
                aria-selected={isActive}
                aria-controls={`v6-ss-slide-${p.key}`}
                className="v6-ss-tab"
                data-active={isActive ? 'true' : undefined}
                style={{ '--pc': p.color } as CSSProperties}
                onClick={() => select(i)}
              >
                {isActive && (
                  <span
                    key={`${active}-${runId}`}
                    className="v6-ss-fill"
                    data-paused={paused ? 'true' : undefined}
                    onAnimationEnd={advance}
                    aria-hidden="true"
                  />
                )}
                {isActive ? (
                  <img className="v6-ss-tab-icon" src={`/v6/product-strip/${p.key}.svg`} alt="" />
                ) : (
                  <span
                    className="v6-ss-tab-icon v6-ss-tab-icon--mono"
                    style={{ '--icon': `url(${p.icon.replace('-fill', '-mono')})` } as CSSProperties}
                    aria-hidden="true"
                  />
                )}
                <span className="v6-ss-tab-label">{p.label}</span>
              </button>
            );
          })}
        </div>

        <div className="v6-ss-viewport">
          {PRODUCTS.map((p, i) => {
            // Offset from the active slide: 0 = current, 1 = peeking next,
            // -1 = the one that just left. Anything further sits off-stage and
            // jumps there without a transition so it never sweeps across.
            let offset = (i - active + N) % N;
            if (offset === N - 1) offset = -1;
            const near = offset >= -1 && offset <= 1;
            return (
              <div
                key={p.key}
                id={`v6-ss-slide-${p.key}`}
                role="tabpanel"
                aria-labelledby={`v6-ss-tab-${p.key}`}
                aria-hidden={offset !== 0}
                inert={offset !== 0}
                className="v6-ss-slide"
                data-near={near ? 'true' : undefined}
                style={{ '--offset': offset } as CSSProperties}
              >
                <img className="v6-ss-slide-bg" src={BACKGROUNDS[p.key]} alt="" />
                <div className="v6-ss-stage">
                  <ProductStage product={p} active={offset === 0} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
