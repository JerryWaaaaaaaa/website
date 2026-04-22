import { html as colorsHtml } from '../../../design-system/colors.md';
import { Markdown } from '../../lib/Markdown';
import { ComponentPreview } from '../../lib/ComponentPreview';

const SWATCHES = [
  { name: '--color-white', value: '#FFFFFF' },
  { name: '--color-shade-light', value: '#F3F8FF' },
  { name: '--color-shade-medium', value: '#E3EDFC' },
  { name: '--color-shade-dark', value: '#D2DEF2' },
  { name: '--color-blue', value: '#0C5CFF' },
  { name: '--color-pink', value: '#E0D5FF' },
  { name: '--color-black', value: '#000000' },
  { name: '--color-gray', value: '#4C4C4C' },
  { name: '--color-gray-light', value: '#999999' },
];

export function Colors() {
  return (
    <article className="sg-page">
      <h1>Color Tokens</h1>
      <p className="sg-description">
        The two-tier color token system with primitive and semantic layers.
      </p>

      <ComponentPreview label="Primitive palette" align="start" padded>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            width: '100%',
          }}
        >
          {SWATCHES.map((s) => (
            <div
              key={s.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  height: 64,
                  borderRadius: 12,
                  background: s.value,
                  border: '1px solid var(--stroke)',
                }}
              />
              <code style={{ fontSize: 12 }}>{s.name}</code>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </ComponentPreview>

      <Markdown html={colorsHtml} />
    </article>
  );
}
