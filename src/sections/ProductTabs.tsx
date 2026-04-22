import { useState } from 'react';
import { Chip } from '../components/Chip';
import { MediaPlaceholder } from '../components/MediaPlaceholder';

const TABS = [
  {
    key: 'slides',
    label: 'AI Slides',
    icon: '/Icon/product-slides.svg',
    body: 'Business proposals, data analysis, investor pitch decks, QBRs. Your conversation becomes the exact doc your workflow demands.',
  },
  {
    key: 'sheets',
    label: 'AI Sheets',
    icon: '/Icon/product-sheet.svg',
    body: 'Turn meeting outcomes into tracked data — instantly. Pivot, filter, and share with one click.',
  },
  {
    key: 'docs',
    label: 'AI Docs',
    icon: '/Icon/product-docs.svg',
    body: 'Polished documents drafted from your conversations, in your team\'s formatting and tone.',
  },
  {
    key: 'datatable',
    label: 'AI Data table',
    icon: '/Icon/product-datatable.svg',
    body: 'Structured records of every meeting decision and action item, ready to query and automate.',
  },
];

const COMPATIBLE = ['Word', 'PowerPoint', 'Excel', 'Google Docs', 'Notion'];

export function ProductTabs() {
  const [active, setActive] = useState(TABS[0].key);
  const current = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <section className="section">
      <div className="section-eyebrow">
        <Chip>AI-powered creation</Chip>
      </div>
      <h2 style={{ marginBottom: 32 }}>
        One<span style={{ color: 'var(--text-highlight)' }}> meeting</span>
      </h2>

      <div
        role="tablist"
        aria-label="Product creations"
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 32,
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                fontFamily: '"General Sans", sans-serif',
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                color: isActive ? 'var(--text-contrast)' : 'var(--text-primary)',
                background: isActive ? 'var(--bg-contrast)' : 'var(--bg-accent-light)',
                border: 'none',
                borderRadius: 999,
                cursor: 'pointer',
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              <img src={tab.icon} width={18} height={18} alt="" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <MediaPlaceholder variant="hero" tint="light" label={`${current.label} canvas`} />

      <p
        style={{
          marginTop: 28,
          maxWidth: 720,
          fontSize: 18,
          lineHeight: 1.4,
          color: 'var(--text-secondary)',
        }}
      >
        {current.body}
      </p>

      <div style={{ marginTop: 56 }}>
        <p
          style={{
            margin: '0 0 16px',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}
        >
          Compatible with
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {COMPATIBLE.map((name) => (
            <span
              key={name}
              style={{
                padding: '10px 18px',
                background: 'var(--bg-accent-light)',
                border: '1px solid var(--stroke)',
                borderRadius: 999,
                fontSize: 14,
                color: 'var(--text-secondary)',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
