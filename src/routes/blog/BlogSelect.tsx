import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export type BlogSelectOption = {
  value: string | null;
  label: string;
  icon?: string;
  color?: string;
};

type BlogSelectProps = {
  label: string;
  value: string | null;
  options: readonly BlogSelectOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string | null) => void;
};

/**
 * Shared Product / Topic filter control. One menu open at a time is enforced
 * by the parent via `open` / `onOpenChange`.
 */
export function BlogSelect({
  label,
  value,
  options,
  open,
  onOpenChange,
  onChange,
}: BlogSelectProps) {
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenChange(true);
    }
  };

  return (
    <div className={`blog-select${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="blog-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => onOpenChange(!open)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="blog-select-facet">{label}</span>
        <span className="blog-select-value">
          {selected?.icon ? (
            <img
              src={selected.icon}
              alt=""
              aria-hidden="true"
              className="blog-select-icon"
              width={16}
              height={16}
            />
          ) : null}
          {selected?.label ?? 'All'}
        </span>
        <Chevron className="blog-select-chevron" />
      </button>

      {open ? (
        <ul
          id={listboxId}
          className="blog-select-menu"
          role="listbox"
          aria-label={label}
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value ?? 'all'} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`blog-select-option${isActive ? ' is-active' : ''}`}
                  style={
                    option.color
                      ? ({ '--pc': option.color } as CSSProperties)
                      : undefined
                  }
                  onClick={() => {
                    onChange(option.value);
                    onOpenChange(false);
                  }}
                >
                  {option.icon ? (
                    <img
                      src={option.icon}
                      alt=""
                      aria-hidden="true"
                      className="blog-select-icon"
                      width={16}
                      height={16}
                    />
                  ) : null}
                  <span>{option.label}</span>
                  {isActive ? (
                    <Check className="blog-select-check" />
                  ) : (
                    <span className="blog-select-check" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 4.25 6 7.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check({ className }: { className?: string }): ReactNode {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 7.25 5.5 10.25 11.5 3.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
