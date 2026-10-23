import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { HERO_PRODUCTS } from '../../data/products';

/** One rotation clock for the word chip, browser URL and product UI (as V5). */
const ROTATION_INTERVAL = 2200;
/** Start on Slides so the first paint matches the Figma frame. */
const START = HERO_PRODUCTS.findIndex((p) => p.name === 'Slides');

export function useProductRotation() {
  const [index, setIndex] = useState(START);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % HERO_PRODUCTS.length),
      ROTATION_INTERVAL,
    );
    return () => window.clearInterval(id);
  }, []);
  return index;
}

/**
 * Headline chip whose product name loops vertically: the old name rolls up and
 * out while the next rolls up from below. The chip tints to a light shade of
 * the product's colour (crossfading between products) and eases its width to
 * fit each name.
 */
export function ProductChip({ index }: { index: number }) {
  const product = HERO_PRODUCTS[index];
  // Track the outgoing name during render so both words swap in the same frame.
  const [shown, setShown] = useState<{ cur: number; prev: number | null }>({
    cur: index,
    prev: null,
  });
  if (shown.cur !== index) setShown({ cur: index, prev: shown.cur });
  const prev = shown.prev;
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [widths, setWidths] = useState<number[]>([]);

  // Measure every name once (and on resize / font load) so the window can
  // animate between exact widths.
  useLayoutEffect(() => {
    const measure = () =>
      setWidths(measureRefs.current.map((el) => el?.getBoundingClientRect().width ?? 0));
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <span
      className="v6-chip-line v6-hero-product"
      style={{ '--product': product.color } as CSSProperties}
    >
      <span className="sr-only">{product.name}</span>
      <span
        className="v6-hero-product-window"
        style={widths[index] ? { width: widths[index] } : undefined}
        aria-hidden="true"
      >
        {prev !== null && (
          <span key={`out-${prev}-${index}`} className="v6-hero-product-word" data-dir="out">
            {HERO_PRODUCTS[prev].name}
          </span>
        )}
        <span
          key={`in-${index}`}
          className="v6-hero-product-word"
          data-dir={prev === null ? undefined : 'in'}
        >
          {product.name}
        </span>
      </span>
      <span className="v6-hero-product-measure" aria-hidden="true">
        {HERO_PRODUCTS.map((p, i) => (
          <span
            key={p.name}
            ref={(el) => {
              measureRefs.current[i] = el;
            }}
          >
            {p.name}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Browser frame from the Figma project-tracker render (traffic lights + URL
 * pill), rebuilt in CSS so the URL and product UI can follow the rotation. The
 * product shots are V5's (same 2352 × 1514 content box as the Figma frame); the
 * URL and shot crossfade together on the same blurred swap.
 */
export function ProductBrowser({ index }: { index: number }) {
  return (
    <div className="v6-hero-browser">
      <div className="v6-hero-browser-bar" aria-hidden="true">
        <span className="v6-hero-browser-lights">
          <i />
          <i />
          <i />
        </span>
        <span className="v6-hero-browser-url">
          {HERO_PRODUCTS.map((p, i) => (
            <span
              key={p.name}
              className="v6-hero-browser-url-text"
              data-active={i === index ? 'true' : undefined}
            >
              {p.url}
            </span>
          ))}
          <img src="/hero-browser/refresh.svg" alt="" />
        </span>
      </div>
      <div className="v6-hero-browser-content">
        {HERO_PRODUCTS.map((p, i) => (
          <img
            key={p.name}
            src={p.image}
            alt={`Zoom ${p.name} generated from a meeting`}
            className="v6-hero-browser-img"
            data-active={i === index ? 'true' : undefined}
            aria-hidden={i !== index}
            width={2352}
            height={1514}
          />
        ))}
      </div>
    </div>
  );
}
