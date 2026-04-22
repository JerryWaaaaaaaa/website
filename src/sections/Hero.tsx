import { Button } from '../components/Button';

export function Hero() {
  return (
    <section
      style={{
        minHeight: '100vh',
        background: 'var(--gradient-accent)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '160px 24px 100px',
      }}
    >
      <div style={{ maxWidth: 780 }}>
        <h1 className="h1">
          You just talk.
          <br />
          AI handles the rest.
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.4,
            color: 'var(--text-secondary)',
            margin: '0 auto 40px',
            maxWidth: 560,
          }}
        >
          AI meeting flow handles meeting grunt work, so you can focus on what really matters.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Button variant="primary">Get started for free</Button>
        </div>
      </div>
    </section>
  );
}
