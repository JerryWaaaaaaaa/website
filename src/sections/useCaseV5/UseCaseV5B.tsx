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
              className={`uc5b-fill${isFirstActive ? ' is-flush-left' : ''}`}
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

          <div className={`uc5-panel${isFirstActive ? ' is-active-first' : ''}`}>
            <PanelCopy persona={current} />
            <PanelMedia activeKey={active} />
          </div>
        </div>
      </div>
    </section>
  );
}
