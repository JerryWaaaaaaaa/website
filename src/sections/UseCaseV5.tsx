import { useState } from 'react';
import { Button } from '../components/Button';
import './UseCaseV5.css';

type Persona = {
  key: string;
  label: string;
  headlineLead: string;
  headlineRest: string;
  image: string;
};

const PERSONAS: Persona[] = [
  {
    key: 'sales',
    label: 'Sales',
    headlineLead: 'Turn every client call',
    headlineRest: ' into proposals, sheets, and follow-ups — automatically.',
    image: '/use-case/Sales.webp',
  },
  {
    key: 'recruiters',
    label: 'Recruiters',
    headlineLead: 'From interview to offer',
    headlineRest: ' — candidate summaries and hiring docs, generated instantly.',
    image: '/use-case/HR.webp',
  },
  {
    key: 'consultants',
    label: 'Consultants',
    headlineLead: 'Walk out of every client meeting',
    headlineRest: ' with polished decks and reports, ready to share.',
    image: '/use-case/Consultants.webp',
  },
  {
    key: 'coaches',
    label: 'Coaches',
    headlineLead: 'Stay present with your clients',
    headlineRest: ' — AI handles the notes and summaries for you.',
    image: '/use-case/Coach.webp',
  },
  {
    key: 'agencies',
    label: 'Agencies',
    headlineLead: 'From brief to execution',
    headlineRest: ' — docs, slides, and sheets generated in minutes.',
    image: '/use-case/Agency.webp',
  },
  {
    key: 'pm',
    label: 'Product managers',
    headlineLead: 'Turn product discussions',
    headlineRest: ' into PRDs, roadmaps, and tracking sheets automatically.',
    image: '/use-case/PM.webp',
  },
];

type FileType = 'doc' | 'slide' | 'table';

type TemplateCard = {
  cover: string;
  title: string;
  type: FileType;
};

const TEMPLATE_CARDS: TemplateCard[] = [
  { cover: '/use-case/templates/cover-doc.png', title: 'Write tldr', type: 'doc' },
  { cover: '/use-case/templates/cover-slide.png', title: 'Competitive research', type: 'slide' },
  { cover: '/use-case/templates/cover-table.png', title: 'Competitive research', type: 'table' },
  { cover: '/use-case/templates/cover-doc.png', title: 'Meeting agenda', type: 'doc' },
  { cover: '/use-case/templates/cover-slide.png', title: 'Creative solutions', type: 'slide' },
  { cover: '/use-case/templates/cover-table.png', title: 'Project tracker', type: 'table' },
];

const COVER_TINT: Record<FileType, string> = {
  doc: 'rgba(14, 114, 237, 0.06)',
  slide: 'rgba(240, 68, 56, 0.06)',
  table: 'rgba(36, 127, 64, 0.06)',
};

function FileTypeIcon({ type }: { type: FileType }) {
  if (type === 'slide') {
    return (
      <svg className="uc5-card-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="12" height="9" rx="1.5" stroke="#f04438" strokeWidth="1.3" />
        <path d="M5 14h6" stroke="#f04438" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'table') {
    return (
      <svg className="uc5-card-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="#247f40" strokeWidth="1.3" />
        <path d="M2.5 6.5h11M6.5 6.5v7" stroke="#247f40" strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg className="uc5-card-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 2.5h5L13 6v7.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z"
        stroke="#0e72ed"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8.5 2.5V6H13" stroke="#0e72ed" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function UseCaseV5() {
  const [active, setActive] = useState(PERSONAS[0].key);
  const current = PERSONAS.find((p) => p.key === active) ?? PERSONAS[0];

  return (
    <section className="uc5-section">
      <div className="uc5-inner">
        <div className="uc5-folder">
          <div className="uc5-tabs" role="tablist" aria-label="Use cases by role">
            {PERSONAS.map((p) => {
              const isActive = p.key === active;
              return (
                <button
                  key={p.key}
                  role="tab"
                  aria-selected={isActive}
                  className={`uc5-tab${isActive ? ' is-active' : ''}`}
                  onClick={() => setActive(p.key)}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="uc5-panel">
            <div className="uc5-panel-copy">
              <span className="chip uc5-chip">use cases</span>
              <h2 className="uc5-headline" key={current.key}>
                <span className="uc5-headline-lead">{current.headlineLead}</span>
                <span className="uc5-headline-rest">{current.headlineRest}</span>
              </h2>
              <Button variant="primary">Learn more</Button>
            </div>
            <div className="uc5-panel-media">
              <img
                src={current.image}
                alt={`${current.label} use case`}
                key={current.key}
              />
            </div>
          </div>
        </div>

        <div className="uc5-templates">
          <div className="uc5-prompt">
            <p className="uc5-prompt-text">Find your role's perfect AI template</p>
            <button className="uc5-prompt-arrow" aria-label="Browse AI templates">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="uc5-strip">
            {TEMPLATE_CARDS.map((card, i) => (
              <article key={i} className="uc5-card">
                <div className="uc5-card-cover" style={{ background: COVER_TINT[card.type] }}>
                  <img src={card.cover} alt="" />
                  <img className="uc5-card-badge" src="/use-case/templates/ai-badge.png" alt="" />
                </div>
                <div className="uc5-card-foot">
                  <FileTypeIcon type={card.type} />
                  <span className="uc5-card-title">{card.title}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
