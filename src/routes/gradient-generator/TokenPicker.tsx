import { useEffect, useRef, useState } from 'react';
import {
  DESIGN_TOKENS,
  TOKEN_GROUPS,
  getToken,
  type TokenGroup,
  type TokenId,
} from './tokens';

type Props = {
  value: TokenId;
  onChange: (next: TokenId) => void;
  label?: string;
  align?: 'left' | 'right';
};

export function TokenPicker({ value, onChange, label, align = 'left' }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = getToken(value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  const byGroup: Record<TokenGroup, typeof DESIGN_TOKENS> = {
    Gradient: [],
    Shades: [],
    Brand: [],
    Neutral: [],
  };
  for (const t of DESIGN_TOKENS) byGroup[t.group].push(t);

  return (
    <div className="gg-token-picker-root" ref={rootRef}>
      <button
        type="button"
        className="gg-token-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className="gg-token-trigger-swatch"
          style={{ background: current.hex }}
        />
        <span className="gg-token-trigger-label">
          {label ? <span className="gg-token-trigger-key">{label}</span> : null}
          <span className="gg-token-trigger-name">{current.label}</span>
        </span>
        <span className="gg-token-trigger-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div
          className={`gg-token-popover ${align === 'right' ? 'is-right' : ''}`}
          role="listbox"
        >
          {TOKEN_GROUPS.map((group) => (
            <div key={group} className="gg-token-group">
              <div className="gg-token-group-heading">{group}</div>
              <div className="gg-token-grid">
                {byGroup[group].map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    role="option"
                    aria-selected={token.id === value}
                    className={`gg-token-cell ${token.id === value ? 'is-active' : ''}`}
                    title={`${token.label} · ${token.hex}`}
                    onClick={() => {
                      onChange(token.id);
                      setOpen(false);
                    }}
                  >
                    <span
                      className="gg-token-cell-swatch"
                      style={{ background: token.hex }}
                    />
                    <span className="gg-token-cell-label">{token.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
