import type { CSSProperties, ReactNode } from 'react';

type Variant = 'hero' | 'card' | 'thumb' | 'wide';

type MediaPlaceholderProps = {
  label?: ReactNode;
  variant?: Variant;
  tint?: 'light' | 'medium' | 'gradient' | 'blue';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const ASPECT: Record<Variant, string> = {
  hero: '16 / 10',
  card: '4 / 3',
  thumb: '3 / 2',
  wide: '21 / 9',
};

const TINT: Record<NonNullable<MediaPlaceholderProps['tint']>, CSSProperties> = {
  light: { background: 'var(--bg-accent-light)', color: 'var(--text-secondary)' },
  medium: { background: 'var(--bg-accent-medium)', color: 'var(--text-secondary)' },
  gradient: { background: 'var(--gradient-accent)', color: 'var(--text-secondary)' },
  blue: { background: 'var(--bg-highlight-blue)', color: 'var(--text-contrast)' },
};

export function MediaPlaceholder({
  label,
  variant = 'card',
  tint = 'light',
  className = '',
  style,
  children,
}: MediaPlaceholderProps) {
  const merged: CSSProperties = {
    aspectRatio: ASPECT[variant],
    border: '1px solid var(--stroke)',
    borderRadius: variant === 'thumb' ? 12 : 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    ...TINT[tint],
    ...style,
  };
  return (
    <div className={className} style={merged}>
      {children ?? label}
    </div>
  );
}
