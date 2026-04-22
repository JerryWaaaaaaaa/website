import type { CSSProperties, ReactNode } from 'react';

type ComponentPreviewProps = {
  label?: string;
  children: ReactNode;
  background?: 'light' | 'dark' | 'gradient' | 'none';
  align?: 'start' | 'center';
  padded?: boolean;
};

const BG: Record<NonNullable<ComponentPreviewProps['background']>, CSSProperties> = {
  light: { background: 'var(--bg-neutral)' },
  dark: { background: 'var(--bg-contrast)', color: 'var(--text-contrast)' },
  gradient: { background: 'var(--gradient-accent)' },
  none: { background: 'transparent' },
};

export function ComponentPreview({
  label,
  children,
  background = 'light',
  align = 'center',
  padded = true,
}: ComponentPreviewProps) {
  return (
    <figure
      style={{
        margin: '0 0 32px',
        border: '1px solid var(--stroke)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
          padding: padded ? '48px 24px' : 0,
          minHeight: 120,
          ...BG[background],
        }}
      >
        {children}
      </div>
      {label && (
        <figcaption
          style={{
            padding: '10px 16px',
            background: 'var(--bg-accent-light)',
            borderTop: '1px solid var(--stroke)',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </figcaption>
      )}
    </figure>
  );
}
