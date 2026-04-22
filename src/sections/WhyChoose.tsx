const REASONS = [
  {
    title: 'Millions of meetings daily',
    body: 'We understand the real work and solve real business problems.',
  },
  {
    title: 'Connected meeting context',
    body: 'People, content, and decisions stay connected across meetings — so work keeps moving.',
  },
  {
    title: 'Native in-meeting experience',
    body: 'Work where meetings happen — no app switching, no data loss.',
  },
];

export function WhyChoose() {
  return (
    <section
      className="section-full"
      style={{ background: 'var(--bg-accent-light)' }}
    >
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 40 }}>Why choose Zoom Meeting Flow</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {REASONS.map((r) => (
            <div
              key={r.title}
              style={{
                padding: 28,
                background: 'var(--bg-neutral)',
                border: '1px solid var(--stroke)',
                borderRadius: 20,
              }}
            >
              <h3 style={{ margin: '0 0 12px' }}>{r.title}</h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.4,
                  color: 'var(--text-secondary)',
                }}
              >
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
