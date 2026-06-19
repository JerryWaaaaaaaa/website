import { useEffect, useRef, useState } from 'react';
import { KEY_POINTS } from './keyPoints';
import { StepMedia } from './StepMedia';
import './BuiltDifferentiateV5A.css';

export function BuiltDifferentiateV5A() {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

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
            setActiveIndex(index);
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
    <section className="bd5-section">
      <div className="bd5-inner">
        <div className="bd5-scroll">
          <div className="bd5-steps">
            {KEY_POINTS.map((point, i) => (
              <div
                key={point.title}
                ref={(el) => {
                  stepsRef.current[i] = el;
                }}
                data-index={i}
                className={`bd5-step${i === activeIndex ? ' is-active' : ''}`}
              >
                <h3 className="bd5-step-title">{point.title}</h3>
                <p className="bd5-step-body">{point.body}</p>
                {/* inline media: mobile only */}
                <div
                  className="bd5-step-media"
                  style={{ background: point.tint }}
                  aria-hidden="true"
                >
                  <StepMedia media={point.media} isActive={i === activeIndex} />
                </div>
              </div>
            ))}
          </div>

          {/* sticky media: desktop only */}
          <div className="bd5-media-col" aria-hidden="true">
            <div className="bd5-media-frame">
              {KEY_POINTS.map((point, i) => (
                <div
                  key={point.title}
                  className="bd5-media-slot"
                  style={{
                    background: point.tint,
                    opacity: i === activeIndex ? 1 : 0,
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
