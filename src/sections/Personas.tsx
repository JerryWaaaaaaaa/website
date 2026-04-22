import { useState } from 'react';
import { Button } from '../components/Button';
import { MediaPlaceholder } from '../components/MediaPlaceholder';

const PERSONAS = [
  { key: 'sales', label: 'Sales', headline: 'Keep deals moving', sub: 'with AI-powered docs' },
  { key: 'recruiters', label: 'Recruiters', headline: 'Hire faster', sub: 'with structured interview notes' },
  { key: 'consultants', label: 'Consultants', headline: 'Bill more hours', sub: 'with auto-generated client docs' },
  { key: 'coaches', label: 'Coaches', headline: 'Coach more clients', sub: 'with session summaries on autopilot' },
  { key: 'agencies', label: 'Agencies', headline: 'Ship more campaigns', sub: 'with briefs that write themselves' },
  { key: 'pm', label: 'PM', headline: 'Stay aligned', sub: 'with sync notes and roadmaps in one place' },
];

export function Personas() {
  const [active, setActive] = useState(PERSONAS[0].key);
  const current = PERSONAS.find((p) => p.key === active) ?? PERSONAS[0];

  return (
    <section className="section">
      <p
        style={{
          margin: '0 0 16px',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}
      >
        Use cases
      </p>

      <div
        role="tablist"
        aria-label="Personas"
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 32,
        }}
      >
        {PERSONAS.map((p) => {
          const isActive = p.key === active;
          return (
            <button
              key={p.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(p.key)}
              style={{
                padding: '10px 16px',
                fontFamily: '"General Sans", sans-serif',
                fontSize: 15,
                fontWeight: 500,
                color: isActive ? 'var(--text-contrast)' : 'var(--text-primary)',
                background: isActive ? 'var(--bg-contrast)' : 'var(--bg-accent-light)',
                border: 'none',
                borderRadius: 999,
                cursor: 'pointer',
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            {current.headline}
            <br />
            <span style={{ color: 'var(--text-secondary)' }}>{current.sub}</span>
          </h2>
          <div style={{ marginTop: 32 }}>
            <Button variant="secondary">Learn more</Button>
          </div>
        </div>
        <MediaPlaceholder variant="card" tint="light" label={`${current.label} preview`} />
      </div>
    </section>
  );
}
