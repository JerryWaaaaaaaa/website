import { useEffect, useRef, useState } from 'react';
import { PositioningMatrixStage } from './PositioningMatrix';

const KEY_POINTS = [
  {
    title: 'From meetings to documents, automatically.',
    body: 'Turn every conversation into something you can use — docs, slides, sheets, and more.',
  },
  {
    title: 'Fully editable after generation.',
    body: "Every AI output is fully editable — refine, rewrite, or reshape until it's exactly what you need.",
  },
  {
    title: 'Inline AI, right where you need it.',
    body: 'Select any text to trigger AI suggestions right where you are — no switching, no extra steps.',
  },
  {
    title: 'Share live, right in your meeting.',
    body: 'Share and co-edit documents live, right inside your meeting.',
  },
  {
    title: 'Built for teams.',
    body: 'Collaborate securely across teams with flexible, granular permission controls — so the right people always have the right access.',
  },
  {
    title: 'Your prompt, saved as a template.',
    body: 'Build custom AI templates with your own prompts — save once, reuse every time.',
  },
];

export function BuiltUnique() {
  const sectionRef = useRef<HTMLElement>(null);
  const pointRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [floatVisible, setFloatVisible] = useState(false);

  // Track which key point is crossing the viewport center to drive the
  // active/dim state.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    for (const el of pointRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // Show the floating diagram only while the section is in view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFloatVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bu-section" ref={sectionRef}>
      <div className="bu-inner">
        <div className="bu-title">
          <h2>Intentionally built unique in the market</h2>
        </div>

        <div className="bu-content">
          {KEY_POINTS.map((point, i) => (
            <div
              key={point.title}
              data-index={i}
              ref={(el) => {
                pointRefs.current[i] = el;
              }}
              className={`bu-point${i === activeIndex ? ' is-active' : ''}`}
            >
              <div className="bu-point-header">
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </div>
              <div className="bu-point-img" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      <div className={`bu-float${floatVisible ? ' is-visible' : ''}`} aria-hidden={!floatVisible}>
        <div className="bu-float-card">
          <PositioningMatrixStage />
        </div>
      </div>
    </section>
  );
}
