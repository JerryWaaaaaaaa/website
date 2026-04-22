import { Button } from '../components/Button';

export function FinalCTA() {
  return (
    <section
      className="section-full"
      style={{
        background: 'var(--bg-highlight-blue)',
        color: 'var(--text-contrast)',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ color: 'var(--text-contrast)', marginBottom: 32 }}>
          Reclaim 16 hours per week
        </h2>
        <Button
          variant="primary"
          style={{
            background: 'var(--bg-neutral)',
            color: 'var(--text-primary)',
          }}
        >
          Get started for free
        </Button>
      </div>
    </section>
  );
}
