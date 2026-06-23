import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { KEY_POINTS } from './keyPoints';
import { StepMedia } from './StepMedia';
import './reveal.css';
import './BuiltDifferentiateV5C.css';

export function BuiltDifferentiateV5C() {
  const [inView, setInView] = useState<boolean[]>(() =>
    KEY_POINTS.map(() => false)
  );
  // Latches true per row on first view so the entrance plays once even though
  // `inView` toggles back off when the row scrolls away.
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    KEY_POINTS.map(() => false)
  );
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  // No sticky scroll-spy here, so each row tracks its own visibility and only
  // animates its media (sequences) while it is on screen.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setInView((prev) => {
          const next = [...prev];
          entries.forEach((entry) => {
            const index = Number(
              (entry.target as HTMLElement).dataset.index ?? 0
            );
            next[index] = entry.isIntersecting;
          });
          return next;
        });
        setRevealed((prev) => {
          let changed = false;
          const next = [...prev];
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = Number(
              (entry.target as HTMLElement).dataset.index ?? 0
            );
            if (!next[index]) {
              next[index] = true;
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      },
      { rootMargin: '-15% 0px -15% 0px', threshold: 0 }
    );

    const els = rowsRef.current.filter(
      (el): el is HTMLDivElement => el != null
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bd5z-section">
      <div className="bd5z-inner">
        <div className="bd5z-rows">
          {KEY_POINTS.map((point, i) => (
            <div
              key={point.title}
              ref={(el) => {
                rowsRef.current[i] = el;
              }}
              data-index={i}
              data-enter={revealed[i] ? 'true' : 'false'}
              className={`bd5z-row${i % 2 === 1 ? ' is-reversed' : ''}`}
            >
              <div className="bd5z-copy">
                <h3 className="bd5z-title bd5-reveal">
                  {point.titleNode ?? point.title}
                </h3>
                <p
                  className="bd5z-body bd5-reveal"
                  style={{ '--reveal-delay': '70ms' } as CSSProperties}
                >
                  {point.body}
                </p>
              </div>
              <div
                className="bd5z-media bd5-reveal-media"
                style={{ '--reveal-delay': '140ms' } as CSSProperties}
                aria-hidden="true"
              >
                <StepMedia media={point.media} isActive={inView[i]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
