import { html as typographyHtml } from '../../../design-system/typography.md';
import { Markdown } from '../../lib/Markdown';
import { ComponentPreview } from '../../lib/ComponentPreview';

const SCALE = [
  { role: 'Heading 1', size: 60, weight: 500, ls: '-0.01em', sample: 'Build anything, faster' },
  { role: 'Heading 2', size: 44, weight: 500, ls: '-0.02em', sample: 'Everything your team needs' },
  { role: 'Heading 3', size: 32, weight: 500, ls: '-0.01em', sample: 'AI Auto Writing' },
  { role: 'Heading 4', size: 22, weight: 500, ls: '-0.01em', sample: 'Section heading' },
  { role: 'Heading 5', size: 20, weight: 500, ls: '0', sample: 'Card title' },
  { role: 'Body', size: 18, weight: 400, ls: '0', sample: 'AI tools that work together so you can focus on the work that matters.' },
  { role: 'Caption', size: 14, weight: 400, ls: '0', sample: 'Caption text used sparingly' },
];

export function Typography() {
  return (
    <article className="sg-page">
      <h1>Typography</h1>
      <p className="sg-description">
        Type scale, responsive sizes, and usage guidelines for General Sans.
      </p>

      <ComponentPreview label="Type scale (desktop)" align="start" padded>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          {SCALE.map((s) => (
            <div key={s.role}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}
              >
                {s.role} · {s.size}px / {s.weight}
              </div>
              <div
                style={{
                  fontFamily: '"General Sans", sans-serif',
                  fontSize: s.size,
                  fontWeight: s.weight,
                  letterSpacing: s.ls,
                  lineHeight: s.size >= 32 ? 1 : 1.4,
                  color: 'var(--text-primary)',
                }}
              >
                {s.sample}
              </div>
            </div>
          ))}
        </div>
      </ComponentPreview>

      <Markdown html={typographyHtml} />
    </article>
  );
}
