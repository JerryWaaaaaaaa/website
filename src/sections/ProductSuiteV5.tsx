import { useLayoutEffect, useRef, useState } from 'react';
import './ProductSuiteV5.css';

type Product = {
  key: string;
  label: string;
  icon: string;
  screen: string;
};

// Order matters: products fan left-to-right across the arc, with the active
// one pulled to the centre slot.
const PRODUCTS: Product[] = [
  {
    key: 'paper',
    label: 'Paper',
    icon: '/Icon/product-classic-doc.svg',
    screen: '/hero-browser/paper-ui.png',
  },
  {
    key: 'canvas',
    label: 'Canvas',
    icon: '/Icon/product-docs.svg',
    screen: '/hero-browser/canvas-ui.png',
  },
  {
    key: 'slides',
    label: 'Slides',
    icon: '/Icon/product-slides.svg',
    screen: '/hero-browser/slides-UI.png',
  },
  {
    key: 'sheets',
    label: 'Sheets',
    icon: '/Icon/product-sheet.svg',
    screen: '/hero-browser/sheets-ui.png',
  },
  {
    key: 'datatable',
    label: 'Data table',
    icon: '/Icon/product-datatable.svg',
    screen: '/hero-browser/datatable-ui.png',
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

export function ProductSuiteV5() {
  const [active, setActive] = useState('slides');
  const activeIndex = PRODUCTS.findIndex((p) => p.key === active);

  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({});
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
      PRODUCTS.forEach((product) => {
        const el = iconRefs.current[product.key];
        if (!el) return;

        // Clean restart if the user clicks again mid-spin.
        el.getAnimations().forEach((a) => a.cancel());

        const prev = prevSlots.current[product.key];
        const final = finalSlots[product.key];
        const rawNext = prev + shift; // un-normalized landing slot

        const wraps = rawNext > HALF || rawNext < -HALF;

        if (!wraps) {
          el.animate(
            [
              { transform: slotTransform(prev) },
              { transform: slotTransform(final) },
            ],
            { duration: DURATION, easing: EASING },
          );
          return;
        }

        // Exited one edge -> teleport (invisibly) to just past the opposite
        // edge, then slide into the final slot. Exit right (rawNext > HALF)
        // re-enters from the left, and vice versa.
        const entryBuffer = rawNext > HALF ? -(HALF + 1) : HALF + 1;

        el.animate(
          [
            { transform: slotTransform(prev), opacity: 1, offset: 0 },
            { transform: slotTransform(rawNext), opacity: 0, offset: 0.46 },
            { transform: slotTransform(entryBuffer), opacity: 0, offset: 0.54 },
            { transform: slotTransform(final), opacity: 1, offset: 1 },
          ],
          { duration: DURATION, easing: EASING },
        );
      });
    }

    prevSlots.current = finalSlots;
  }, [activeIndex]);

  return (
    <section className="psuite-v5">
      <h2 className="psuite-v5-heading">
        The only productivity tool for every task you need
      </h2>

      <div className="psuite-v5-body">
        <div className="psuite-v5-stage" role="tablist" aria-label="Zoom productivity suite">
          <span className="psuite-v5-pill" aria-hidden="true" />
          <span className="psuite-v5-glow" aria-hidden="true" />

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
                onClick={() => setActive(product.key)}
                className="psuite-v5-icon"
                style={{ transform: slotTransform(slot) }}
              >
                <img
                  src={product.icon}
                  alt=""
                  className="psuite-v5-icon-img"
                  width={36}
                  height={36}
                />
                <span className="psuite-v5-icon-label">{product.label}</span>
              </button>
            );
          })}
        </div>

        <div className="psuite-v5-screen">
          {PRODUCTS.map((product) => (
            <img
              key={product.key}
              src={product.screen}
              alt={`${product.label} preview`}
              className="psuite-v5-screen-img"
              style={{ opacity: product.key === active ? 1 : 0 }}
              aria-hidden={product.key !== active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
