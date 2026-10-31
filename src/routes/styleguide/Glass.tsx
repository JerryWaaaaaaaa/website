import type { CSSProperties } from 'react';
import { sectionHtml } from '../../lib/designDoc';
import { Markdown } from '../../lib/Markdown';
import { ComponentPreview } from '../../lib/ComponentPreview';

/** Saturated blobs + small text behind the glass, so the blur has something to read. */
const BUSY: CSSProperties = {
  background:
    'radial-gradient(circle at 20% 30%, #0c5cff 0 18%, transparent 34%),' +
    'radial-gradient(circle at 75% 65%, #fb327e 0 14%, transparent 30%),' +
    'radial-gradient(circle at 60% 20%, #c5b0ff 0 16%, transparent 32%),' +
    'var(--gradient-accent)',
};
/** Flat white with copy — the hero product screen case. */
const WHITE: CSSProperties = { background: '#fff' };

const LINES = Array.from({ length: 9 }, (_, i) => (
  <p key={i} style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
    Meeting notes, decisions and next steps, drafted while you talk.
  </p>
));

function Sample({ backdrop }: { backdrop: CSSProperties }) {
  return (
    <div style={{ position: 'relative', width: '100%', padding: 32, borderRadius: 16, ...backdrop }}>
      <div aria-hidden="true" style={{ display: 'grid', gap: 4 }}>
        {LINES}
      </div>
      <div
        className="glass-dark"
        style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          display: 'grid',
          gap: 4,
          width: 280,
          padding: 12,
          borderRadius: 'var(--rounded-2xl)',
          color: 'var(--text-contrast)',
          transform: 'translateX(-50%)',
        }}
      >
        <span style={{ padding: '10px 12px', fontSize: 14 }}>Dark glass</span>
        <span
          className="glass-dark-overlay"
          style={{ padding: '10px 12px', fontSize: 14, borderRadius: 'var(--rounded-xl)' }}
        >
          Dark glass overlay
        </span>
      </div>
    </div>
  );
}

export function Glass() {
  return (
    <article className="sg-page">
      <h1>Glass</h1>
      <p className="sg-description">
        Frosted and dark glass surfaces. Tint and backdrop blur always travel together, on
        both the surface and the overlay.
      </p>

      <ComponentPreview label="Dark glass over a busy backdrop" padded>
        <Sample backdrop={BUSY} />
      </ComponentPreview>
      <ComponentPreview label="Dark glass over flat white (hero product screen)" padded>
        <Sample backdrop={WHITE} />
      </ComponentPreview>

      <Markdown html={sectionHtml('Frosted glass surface')} />
      <Markdown html={sectionHtml('Dark glass')} />
    </article>
  );
}
