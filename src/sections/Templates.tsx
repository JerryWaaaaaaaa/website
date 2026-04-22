import { MediaPlaceholder } from '../components/MediaPlaceholder';

const TEMPLATES = [
  'Sales discovery call',
  'Sales call notes',
  'Sales CRM',
  'ICP',
  'Networking planner',
];

export function Templates() {
  return (
    <section
      className="section-full"
      style={{ background: 'var(--bg-accent-light)' }}
    >
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>
        <h3 style={{ marginBottom: 8 }}>Find your role's perfect AI template</h3>
        <p
          style={{
            margin: '0 0 32px',
            color: 'var(--text-secondary)',
          }}
        >
          View gallery
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {TEMPLATES.map((t, i) => (
            <span
              key={t}
              style={{
                padding: '8px 14px',
                background:
                  i === 0 ? 'var(--bg-contrast)' : 'var(--bg-neutral)',
                color:
                  i === 0 ? 'var(--text-contrast)' : 'var(--text-primary)',
                border: i === 0 ? 'none' : '1px solid var(--stroke)',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
          }}
        >
          {TEMPLATES.map((t) => (
            <MediaPlaceholder key={t} variant="thumb" tint="medium" label={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
