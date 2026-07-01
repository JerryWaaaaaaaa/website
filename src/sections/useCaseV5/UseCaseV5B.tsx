import { useLayoutEffect, useRef, useState } from 'react';
import { PERSONAS, PanelCopy, PanelMedia } from './shared';
import './useCaseV5.css';
import './UseCaseV5B.css';

const shoulder = (side: 'left' | 'right') => (
  <span className={`uc5b-shoulder ${side}`} aria-hidden="true">
    <svg viewBox="0 0 41 62" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d={
          side === 'left'
            ? 'M41 0 C 41 38 20 62 0 62 L 41 62 Z'
            : 'M0 0 C 0 38 21 62 41 62 L 0 62 Z'
        }
        fill="var(--bg-accent-light)"
      />
    </svg>
  </span>
);

/* Variant B — "Sliding".
   Tabs keep their natural width (the row never reflows), and a single fill
   element slides + resizes between tabs. Geometry is measured from the active
   tab before paint, so the only thing that moves is the fill itself — fully
   continuous motion with no snap. */
export function UseCaseV5B() {
  const [active, setActive] = useState(PERSONAS[0].key);
  const current = PERSONAS.find((p) => p.key === active) ?? PERSONAS[0];
  const activeIndex = PERSONAS.findIndex((p) => p.key === active);
  const isFirstActive = activeIndex === 0;
  const isLastActive = activeIndex === PERSONAS.length - 1;

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [fill, setFill] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const tabs = tabsRef.current;
      const btn = tabRefs.current[activeIndex];
      if (!tabs || !btn) return;
      setFill({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    measure();

    // Keep the active tab visible by scrolling the row HORIZONTALLY only (via
    // the container's scrollLeft) — never scrollIntoView, which would also pull
    // the page vertically. Runs on active change (this effect's dep), not on
    // resize. The +shoulder allowance keeps the active tab's right shoulder in
    // view when scrolling to the end.
    const tabs = tabsRef.current;
    const btn = tabRefs.current[activeIndex];
    if (tabs && btn) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';
      // Reserve the shoulder width so a tab's right shoulder stays visible when
      // scrolled to the right edge — except the last tab, whose right shoulder
      // is dropped (is-flush-right), so it should land exactly flush.
      const reserve = isLastActive ? 0 : 41; // --uc5-shoulder-w
      const left = btn.offsetLeft;
      const right = left + btn.offsetWidth + reserve;
      if (left < tabs.scrollLeft) {
        tabs.scrollTo({ left, behavior });
      } else if (right > tabs.scrollLeft + tabs.clientWidth) {
        tabs.scrollTo({ left: right - tabs.clientWidth, behavior });
      }
    }

    const ro = new ResizeObserver(measure);
    if (tabsRef.current) ro.observe(tabsRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [activeIndex]);

  return (
    <section className="uc5-section">
      <div className="uc5-inner">
        <div className="uc5-folder">
          <div
            className="uc5-tabs is-sliding"
            role="tablist"
            aria-label="Use cases by role"
            ref={tabsRef}
          >
            <span
              className={`uc5b-fill${isFirstActive ? ' is-flush-left' : ''}${isLastActive ? ' is-flush-right' : ''}`}
              aria-hidden="true"
              style={fill ? { left: `${fill.left}px`, width: `${fill.width}px` } : { opacity: 0 }}
            >
              {shoulder('left')}
              {shoulder('right')}
            </span>

            {PERSONAS.map((p, i) => {
              const isActive = p.key === active;
              return (
                <button
                  key={p.key}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  aria-selected={isActive}
                  className={`uc5-tab${isActive ? ' is-active' : ''}`}
                  onClick={() => setActive(p.key)}
                >
                  <span className="uc5-tab-label">{p.label}</span>
                </button>
              );
            })}
          </div>

          <div
            className={`uc5-panel${isFirstActive ? ' is-active-first' : ''}${isLastActive ? ' is-active-last' : ''}`}
          >
            <PanelCopy persona={current} />
            <PanelMedia activeKey={active} />
          </div>
        </div>
      </div>
    </section>
  );
}
