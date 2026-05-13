import { useSearchParams } from 'react-router-dom';

const VARIANTS = [
  { id: 'v1', label: 'V1' },
  { id: 'v2', label: 'V2' },
] as const;

export function HeroVariantToggle() {
  const [params, setParams] = useSearchParams();
  const active = params.get('hero') === 'v2' ? 'v2' : 'v1';

  const select = (id: 'v1' | 'v2') => {
    const next = new URLSearchParams(params);
    next.set('hero', id);
    setParams(next, { replace: true });
  };

  return (
    <div
      role="group"
      aria-label="Hero variant"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: 'var(--glass-border)',
        borderRadius: 999,
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
        fontFamily: "'General Sans', sans-serif",
      }}
    >
      <span
        style={{
          padding: '0 10px 0 12px',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}
      >
        Hero
      </span>
      {VARIANTS.map((v) => {
        const isActive = active === v.id;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => select(v.id)}
            aria-pressed={isActive}
            style={{
              minWidth: 40,
              height: 32,
              padding: '0 12px',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1,
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: isActive ? 'var(--bg-contrast)' : 'transparent',
              color: isActive ? 'var(--text-contrast)' : 'var(--text-secondary)',
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
