import { useEffect, useRef, useState } from 'react';
import './BuiltDifferentiateV5.css';

const KEY_POINTS = [
  {
    title: 'From meetings to documents, automatically.',
    body: 'Turn every conversation into something you can use — docs, slides, sheets, and more.',
    tint: 'var(--bg-accent-medium)',
  },
  {
    title: 'Fully editable after generation.',
    body: "Every AI output is fully editable — refine, rewrite, or reshape until it's exactly what you need.",
    tint: 'var(--bg-highlight-blue)',
  },
  {
    title: 'Inline AI, right where you need it.',
    body: 'Select any text to trigger AI suggestions right where you are — no switching, no extra steps.',
    tint: 'var(--bg-highlight-pink)',
  },
  {
    title: 'Share live, right in your meeting.',
    body: 'Share and co-edit documents live, right inside your meeting.',
    tint: 'var(--gradient-accent)',
  },
  {
    title: 'Built for teams.',
    body: 'Collaborate securely across teams with flexible, granular permission controls — so the right people always have the right access.',
    tint: 'var(--bg-accent-dark)',
  },
  {
    title: 'Your prompt, saved as a template.',
    body: 'Build custom AI templates with your own prompts — save once, reuse every time.',
    tint: 'var(--color-blue)',
  },
];

export function BuiltDifferentiateV5() {
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
                />
              </div>
            ))}
          </div>

          {/* sticky media: desktop only */}
          <div className="bd5-media-col" aria-hidden="true">
            <div className="bd5-media-frame">
              {KEY_POINTS.map((point, i) => (
                <div
                  key={point.title}
                  className="bd5-media-img"
                  style={{
                    background: point.tint,
                    opacity: i === activeIndex ? 1 : 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
