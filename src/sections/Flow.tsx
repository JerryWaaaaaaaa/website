import { Chip } from '../components/Chip';
import { MediaPlaceholder } from '../components/MediaPlaceholder';

const STAGES = [
  {
    chip: 'In meeting',
    title: 'AI captures as you talk',
    body: 'AI captures insights in real time, suggests responses, and helps keep conversations aligned.',
  },
  {
    chip: 'After meeting',
    title: 'Your doc is already drafted',
    body: 'AI turns the meeting into a structured document in your format and style — ready to review and share.',
  },
  {
    chip: 'Next meeting',
    title: "Prepared for what's next",
    body: 'AI prepares the next meeting by reviewing past discussions, drafting agendas, and setting up the next document.',
  },
];

export function Flow() {
  return (
    <section className="section">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        {STAGES.map((stage) => (
          <article
            key={stage.chip}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: 24,
              background: 'var(--bg-accent-light)',
              border: '1px solid var(--stroke)',
              borderRadius: 20,
            }}
          >
            <div>
              <Chip>{stage.chip}</Chip>
            </div>
            <h3 style={{ margin: 0 }}>{stage.title}</h3>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.4,
                color: 'var(--text-secondary)',
              }}
            >
              {stage.body}
            </p>
            <MediaPlaceholder variant="card" tint="medium" label={stage.chip} />
          </article>
        ))}
      </div>
    </section>
  );
}
