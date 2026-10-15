import { useState } from 'react';
import { PERSONAS } from '../useCaseV5/shared';
import { Button } from '../../components/Button';
import { PanelDot } from './AgentCta';
import './UseCaseV6.css';

// V6 copy per persona (Figma 200:75601 draws Sales; the rest follow its
// "<lead> with …" pattern). Images reuse the shared V5 persona art, except
// Sales which uses the Figma screenshot.
const COPY: Record<string, { label?: string; lead: string; rest: string; image?: string }> = {
  sales: {
    lead: 'Close deals faster',
    rest: 'with AI-powered documentation',
    image: '/v6/use-case/sales-conversation.png',
  },
  recruiters: { label: 'HR', lead: 'Hire faster', rest: 'with AI-powered interview notes' },
  consultants: { lead: 'Deliver faster', rest: 'with AI-powered client reports' },
  coaches: { lead: 'Stay present', rest: 'while AI captures every session' },
  agencies: { lead: 'Ship faster', rest: 'with AI-powered briefs and decks' },
  pm: { lead: 'Plan faster', rest: 'with AI-powered PRDs and roadmaps' },
};

const TABS = PERSONAS.map((p) => ({
  key: p.key,
  label: COPY[p.key]?.label ?? p.label,
  lead: COPY[p.key]?.lead ?? p.headlineLead,
  rest: COPY[p.key]?.rest ?? p.headlineRest,
  image: COPY[p.key]?.image ?? p.image,
}));

/** V6 use cases (Figma 200:75601): role tabs over a copy + media panel. */
export function UseCaseV6() {
  const [active, setActive] = useState(TABS[0].key);
  const current = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <section className="v6-panel v6-uc" aria-label="Use cases by role">
      <PanelDot />
      <div className="v6-uc-inner">
        <div className="v6-uc-tabs" role="tablist" aria-label="Roles">
          {TABS.map((t) => {
            const isActive = t.key === active;
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
                onClick={() => setActive(t.key)}
              >
                {t.label}
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
            <h2 className="v6-uc-headline" key={current.key}>
              <span className="v6-text-gradient">{current.lead}</span> {current.rest}
            </h2>
            <Button variant="primary">Learn more</Button>
          </div>

          <div className="v6-uc-media">
            <img className="v6-uc-media-bg" src="/v6/use-case/bg-halftone.webp" alt="" aria-hidden="true" />
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
