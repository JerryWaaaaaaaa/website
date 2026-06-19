import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './ProductSuiteV5B.css';

type Product = {
  key: string;
  label: string;
  icon: string;
  screen: string;
  color: string;
};

// Order matters: products fan left-to-right across the arc, with the active
// one pulled to the centre slot.
const PRODUCTS: Product[] = [
  {
    key: 'canvas',
    label: 'Canvas',
    icon: '/Icon/product-docs.svg',
    screen: '/hero-browser/canvas-ui.png',
    color: '#3579fd',
  },
  {
    key: 'slides',
    label: 'Slides',
    icon: '/Icon/product-slides.svg',
    screen: '/hero-browser/slides-UI.png',
    color: '#fb327e',
  },
  {
    key: 'sheets',
    label: 'Sheets',
    icon: '/Icon/product-sheet.svg',
    screen: '/hero-browser/sheets-ui.png',
    color: '#019f5c',
  },
  {
    key: 'paper',
    label: 'Paper',
    icon: '/Icon/product-classic-doc.svg',
    screen: '/hero-browser/paper-ui.png',
    color: '#0d6bde',
  },
  {
    key: 'datatable',
    label: 'Data table',
    icon: '/Icon/product-datatable.svg',
    screen: '/hero-browser/datatable-ui.png',
    color: '#019f5c',
  },
];

// The Figma fan is a slice of a wheel: radius ~450, 15deg between adjacent
// items, with slot 0 (upright, highlighted) at the top. Any integer slot index
// maps to a position via polar math, so off-screen buffer slots (|d| >= 3) come
// for free and let wrapping items loop out one edge and back in the other.
const RING = PRODUCTS.length; // 5
const HALF = Math.floor(RING / 2); // 2 visible slots either side of centre
const R = 450;
const STEP = 15; // degrees between adjacent fan items
const BASE_Y = 385; // tuned so slot 0 sits at y ~= -65 like Figma
const DURATION = 540;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const AUTOPLAY_INTERVAL = 4000; // ms between automatic rotations

// Full transform for a slot, including the centring translate (the element is
// anchored at left:50% / top:50%).
function slotTransform(d: number): string {
  const rad = (d * STEP * Math.PI) / 180;
  const x = R * Math.sin(rad);
  const y = BASE_Y - R * Math.cos(rad);
  return `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${d * STEP}deg)`;
}

// Wrap a (possibly out-of-range) slot index into the visible range [-HALF, HALF].
function normalizeSlot(d: number): number {
  let v = ((d % RING) + RING) % RING; // 0..RING-1
  if (v > HALF) v -= RING;
  return v;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const SLIDES_INDEX = PRODUCTS.findIndex((p) => p.key === 'slides');

export function ProductSuiteV5B() {
  const [active, setActive] = useState('slides');
  const [paused, setPaused] = useState(false);
  // Bumped on manual interaction so the autoplay interval restarts from zero
  // and a near-due tick doesn't immediately override the user's choice.
  const [autoplayTick, setAutoplayTick] = useState(0);
  const activeIndex = PRODUCTS.findIndex((p) => p.key === active);
  const activeColor = PRODUCTS[activeIndex].color;

  // Auto-advance through the suite while idle. Skipped when paused (hover /
  // focus / hidden tab) or when the user prefers reduced motion.
  useEffect(() => {
    if (paused || prefersReducedMotion()) return;

    const id = window.setInterval(() => {
      setActive((cur) => {
        const i = PRODUCTS.findIndex((p) => p.key === cur);
        return PRODUCTS[(i + 1) % PRODUCTS.length].key;
      });
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(id);
  }, [paused, autoplayTick]);

  // Pause autoplay while the tab is hidden so it doesn't burst-catch-up on return.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const handleSelect = (key: string) => {
    setActive(key);
    setAutoplayTick((t) => t + 1);
  };

  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pillRef = useRef<HTMLSpanElement>(null);
  // Slot each product currently rests in; seeded so Slides starts centred.
  const prevSlots = useRef<Record<string, number>>(
    Object.fromEntries(
      PRODUCTS.map((p, i) => [p.key, normalizeSlot(i - SLIDES_INDEX)]),
    ),
  );

  useLayoutEffect(() => {
    const finalSlots: Record<string, number> = {};
    PRODUCTS.forEach((p, i) => {
      finalSlots[p.key] = normalizeSlot(i - activeIndex);
    });

    // Global rotation applied this change, in [-HALF, HALF]. Recoverable from
    // any product: final = prev + shift (mod RING).
    const sample = PRODUCTS[0].key;
    const shift = normalizeSlot(finalSlots[sample] - prevSlots.current[sample]);

    const reduce = prefersReducedMotion();

    if (shift !== 0 && !reduce) {
      // Bob the highlight card up and settle, signalling the carousel turned.
      const pill = pillRef.current;
      if (pill) {
        pill.getAnimations().forEach((a) => a.cancel());
        pill.style.willChange = 'transform';
        const clearPill = () => {
          pill.style.willChange = '';
        };
        const bob = pill.animate(
          [
            { transform: 'translate(-50%, 0)', easing: EASING },
            { transform: 'translate(-50%, -9px)', offset: 0.5, easing: EASING },
            { transform: 'translate(-50%, 0)' },
          ],
          { duration: DURATION },
        );
        bob.onfinish = clearPill;
        bob.oncancel = clearPill;
      }

      PRODUCTS.forEach((product) => {
        const el = iconRefs.current[product.key];
        if (!el) return;

        // Clean restart if the user clicks again mid-spin.
        el.getAnimations().forEach((a) => a.cancel());

        const prev = prevSlots.current[product.key];
        const final = finalSlots[product.key];
        const rawNext = prev + shift; // un-normalized landing slot

        const wraps = rawNext > HALF || rawNext < -HALF;

        // Promote to its own GPU layer only for the duration of the spin so
        // idle icons don't permanently hold a layer.
        el.style.willChange = 'transform, opacity';
        const clearWillChange = () => {
          el.style.willChange = '';
        };

        const anim = !wraps
          ? el.animate(
              [
                { transform: slotTransform(prev) },
                { transform: slotTransform(final) },
              ],
              { duration: DURATION, easing: EASING },
            )
          : // Exited one edge -> teleport (invisibly) to just past the
            // opposite edge, then slide into the final slot. Exit right
            // (rawNext > HALF) re-enters from the left, and vice versa.
            el.animate(
              [
                { transform: slotTransform(prev), opacity: 1, offset: 0 },
                { transform: slotTransform(rawNext), opacity: 0, offset: 0.46 },
                {
                  transform: slotTransform(
                    rawNext > HALF ? -(HALF + 1) : HALF + 1,
                  ),
                  opacity: 0,
                  offset: 0.54,
                },
                { transform: slotTransform(final), opacity: 1, offset: 1 },
              ],
              { duration: DURATION, easing: EASING },
            );

        anim.onfinish = clearWillChange;
        anim.oncancel = clearWillChange;
      });
    }

    prevSlots.current = finalSlots;
  }, [activeIndex]);

  return (
    <section className="psuite-v5b">
      <h2 className="psuite-v5b-heading">
        The only productivity tool for every task you need
      </h2>

      <div className="psuite-v5b-body">
        <div
          className="psuite-v5b-stage"
          role="tablist"
          aria-label="Zoom productivity suite"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <span
            className="psuite-v5b-pill"
            aria-hidden="true"
            ref={pillRef}
            style={{ background: `color-mix(in srgb, ${activeColor} 15%, transparent)` }}
          />
          <span className="psuite-v5b-glow" aria-hidden="true" />

          {PRODUCTS.map((product, i) => {
            const slot = normalizeSlot(i - activeIndex);
            const isActive = product.key === active;

            return (
              <button
                key={product.key}
                ref={(el) => {
                  iconRefs.current[product.key] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelect(product.key)}
                className="psuite-v5b-icon"
                style={{ transform: slotTransform(slot) }}
              >
                <img
                  src={product.icon}
                  alt=""
                  className="psuite-v5b-icon-img"
                  width={36}
                  height={36}
                />
                <span className="psuite-v5b-icon-label">{product.label}</span>
              </button>
            );
          })}
        </div>

        <div className="psuite-v5b-screen">
          {PRODUCTS.map((product) => (
            <img
              key={product.key}
              src={product.screen}
              alt={`${product.label} preview`}
              className="psuite-v5b-screen-img"
              style={{ opacity: product.key === active ? 1 : 0 }}
              aria-hidden={product.key !== active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
