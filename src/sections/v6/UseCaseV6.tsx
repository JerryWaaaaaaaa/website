import { useEffect, useState } from 'react';
import { PERSONAS } from '../useCaseV5/shared';
import { Button } from '../../components/Button';
import { PanelDot } from './AgentCta';
import './UseCaseV6.css';

// Copy and images are the V5 personas (useCaseV5/shared.tsx).
const TABS = PERSONAS.map((p) => ({
  key: p.key,
  label: p.label,
  lead: p.headlineLead,
  rest: p.headlineRest.trim(),
  image: p.image,
}));

/**
 * V6 use cases (Figma 200:75601): role tabs over a copy + media panel.
 * Auto-plays like the product slideshow: the active tab's background fills as
 * it counts down and the fill's animationend moves to the next role (looping).
 */
export function UseCaseV6() {
  const [index, setIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = TABS[index];
  const active = current.key;

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const advance = () => setIndex((i) => (i + 1) % TABS.length);
  const select = (i: number) => {
    setIndex(i);
    setRunId((n) => n + 1);
  };

  return (
    <section className="v6-panel v6-uc" aria-label="Use cases by role">
      <PanelDot />
      <div className="v6-uc-inner">
        <div className="v6-uc-tabs" role="tablist" aria-label="Roles">
          {TABS.map((t, i) => {
            const isActive = i === index;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                id={`v6-uc-tab-${t.key}`}
                aria-selected={isActive}
                aria-controls="v6-uc-panel"
                className="v6-uc-tab"
                data-active={isActive ? 'true' : undefined}
                onClick={() => select(i)}
              >
                {isActive && (
                  <span
                    key={`${index}-${runId}`}
                    className="v6-uc-fill"
                    data-paused={paused ? 'true' : undefined}
                    onAnimationEnd={advance}
                    aria-hidden="true"
                  />
                )}
                <span className="v6-uc-tab-label">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div
          className="v6-uc-panel"
          id="v6-uc-panel"
          role="tabpanel"
          aria-labelledby={`v6-uc-tab-${active}`}
        >
          <div className="v6-uc-copy">
            <span className="chip v6-uc-chip">use cases</span>
            <h3 className="v6-uc-headline" key={current.key}>
              <span className="v6-text-gradient">{current.lead}</span> {current.rest}
            </h3>
            <Button variant="primary">Learn more</Button>
          </div>

          <div className="v6-uc-media">
            {TABS.map((t) => (
              <img
                key={t.key}
                className="v6-uc-shot"
                data-active={t.key === active ? 'true' : undefined}
                src={t.image}
                alt={t.key === active ? `${t.label} workspace example` : ''}
                aria-hidden={t.key === active ? undefined : true}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
