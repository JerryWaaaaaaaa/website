import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { KEY_POINTS } from './keyPoints';
import { StepMedia } from './StepMedia';
import { useRevealOnce } from './useRevealOnce';
import './reveal.css';
import './BuiltDifferentiateV5A.css';

export function BuiltDifferentiateV5A() {
  // Track the active step plus the one it's leaving, so the outgoing media slot
  // can stay fully opaque beneath the incoming one during the crossfade.
  const [{ active: activeIndex, prev: prevIndex }, setActive] = useState({
    active: 0,
    prev: 0,
  });
  // Latches true per step the first time it crosses center, so the title's
  // decorations draw on once (and never replay on later scroll passes).
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    KEY_POINTS.map(() => false)
  );
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  // Section-level reveal drives the very first intro: step 0's copy + the
  // sticky media frame settle in when the section scrolls into view.
  const { ref: sectionRef, revealed: enteredSection } =
    useRevealOnce<HTMLElement>();

  // Track which copy step is crossing the vertical center of the viewport and
  // surface it as the active index so the sticky media can swap to match.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.index ?? 0
            );
            setActive((s) =>
              s.active === index ? s : { active: index, prev: s.active }
            );
            setRevealed((prev) => {
              if (prev[index]) return prev;
              const next = [...prev];
              next[index] = true;
              return next;
            });
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    const els = stepsRef.current.filter((el): el is HTMLDivElement => el != null);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bd5-section" ref={sectionRef}>
      <div className="bd5-inner">
        <div className="bd5-scroll">
          <div className="bd5-steps">
            {KEY_POINTS.map((point, i) => {
              // Step 0 leans on the section-level intro; later steps light up
              // (decorations only) as they reach center via scroll-spy.
              const entered = i === 0 ? enteredSection : revealed[i];
              return (
                <div
                  key={point.title}
                  ref={(el) => {
                    stepsRef.current[i] = el;
                  }}
                  data-index={i}
                  data-enter={entered ? 'true' : 'false'}
                  className={`bd5-step${i === activeIndex ? ' is-active' : ''}`}
                >
                  <h3
                    className={`bd5-step-title${i === 0 ? ' bd5-reveal' : ''}`}
                  >
                    {point.titleNode ?? point.title}
                  </h3>
                  <p
                    className={`bd5-step-body${i === 0 ? ' bd5-reveal' : ''}`}
                    style={
                      i === 0
                        ? ({ '--reveal-delay': '70ms' } as CSSProperties)
                        : undefined
                    }
                  >
                    {point.body}
                  </p>
                  {/* inline media: mobile only */}
                  <div
                    className="bd5-step-media bd5-reveal-media"
                    style={
                      {
                        background: point.tint,
                        '--reveal-delay': '140ms',
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  >
                    <StepMedia media={point.media} isActive={i === activeIndex} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* sticky media: desktop only */}
          <div className="bd5-media-col" aria-hidden="true">
            <div
              className="bd5-media-frame bd5-reveal-media"
              data-enter={enteredSection ? 'true' : 'false'}
              style={{ '--reveal-delay': '120ms' } as CSSProperties}
            >
              {KEY_POINTS.map((point, i) => (
                <div
                  key={point.title}
                  className={`bd5-media-slot${i === activeIndex ? ' is-shown' : ''}`}
                  style={{
                    background: point.tint,
                    opacity: i === activeIndex || i === prevIndex ? 1 : 0,
                    zIndex: i === activeIndex ? 2 : i === prevIndex ? 1 : 0,
                  }}
                >
                  <StepMedia media={point.media} isActive={i === activeIndex} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
