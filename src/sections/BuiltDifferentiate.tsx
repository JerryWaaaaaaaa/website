import { useEffect, useState } from 'react';
import { MediaPlaceholder } from '../components/MediaPlaceholder';
import { SliderTuner, SLIDER_DEFAULTS } from '../components/SliderTuner';
import './BuiltDifferentiate.css';

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

export function BuiltDifferentiate() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [config, setConfig] = useState(SLIDER_DEFAULTS);

  // Auto-advance through the cards, looping back to the start. Paused on hover
  // and disabled when the user prefers reduced motion.
  useEffect(() => {
    if (paused) return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % KEY_POINTS.length);
    }, config.intervalMs);
    return () => window.clearInterval(id);
  }, [paused, activeIndex, config.intervalMs]);

  // Picking a card manually also resets the autoplay timer, since the effect
  // above re-runs whenever activeIndex changes.
  const goTo = (index: number) => setActiveIndex(index);

  return (
    <section
      className="bd-section"
      onMouseEnter={() => config.pauseOnHover && setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={
        {
          '--bd-slide-ms': `${config.slideMs}ms`,
          '--bd-ease': config.easing,
          '--bd-inactive-opacity': config.inactiveOpacity,
          '--bd-inactive-blur': `${config.inactiveBlur}px`,
        } as React.CSSProperties
      }
    >
      <div className="bd-inner">
        <h2 className="bd-title">Built to differentiate</h2>

        <div className="bd-slider">
          <div className="bd-controls" role="tablist" aria-label="Built to differentiate highlights">
            {KEY_POINTS.map((point, i) => (
              <button
                key={point.title}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={point.title}
                onClick={() => goTo(i)}
                className={`bd-pill${i === activeIndex ? ' is-active' : ''}`}
              />
            ))}
          </div>

          <div className="bd-viewport">
            <div
              className="bd-track"
              style={{ '--active-index': activeIndex } as React.CSSProperties}
            >
              {KEY_POINTS.map((point, i) => {
                const isActive = i === activeIndex;
                return (
                  <div
                    key={point.title}
                    className={`bd-card${isActive ? ' is-active' : ''}`}
                    aria-hidden={!isActive}
                  >
                    <div className="bd-card-header">
                      <h3>{point.title}</h3>
                      <p>{point.body}</p>
                    </div>
                    {isActive && (
                      <MediaPlaceholder
                        variant="wide"
                        tint="gradient"
                        className="bd-card-media"
                        label={point.title}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <SliderTuner config={config} onChange={setConfig} defaults={SLIDER_DEFAULTS} />
    </section>
  );
}
