import { Button } from '../../components/Button';

export type Persona = {
  key: string;
  label: string;
  headlineLead: string;
  headlineRest: string;
  image: string;
};

export const PERSONAS: Persona[] = [
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

/* Two-tone headline; keyed by the caller so the fade replays on persona change. */
export function PanelCopy({ persona }: { persona: Persona }) {
  return (
    <div className="uc5-panel-copy">
      <span className="chip uc5-chip">use cases</span>
      <h2 className="uc5-headline" key={persona.key}>
        <span className="uc5-headline-lead">{persona.headlineLead}</span>
        <span className="uc5-headline-rest">{persona.headlineRest}</span>
      </h2>
      <Button variant="primary">Learn more</Button>
    </div>
  );
}

/* Crossfade media: every persona image stays mounted and stacked, so swapping
   the active one is a pure opacity crossfade with no empty frame or decode
   flicker. The outgoing layer briefly blurs to bridge the two states. */
export function PanelMedia({ activeKey }: { activeKey: string }) {
  return (
    <div className="uc5-panel-media">
      {PERSONAS.map((p) => {
        const isActive = p.key === activeKey;
        return (
          <img
            key={p.key}
            className={`uc5-panel-img${isActive ? ' is-active' : ''}`}
            src={p.image}
            alt={`${p.label} use case`}
            loading="eager"
            decoding="async"
            aria-hidden={isActive ? undefined : true}
          />
        );
      })}
    </div>
  );
}
