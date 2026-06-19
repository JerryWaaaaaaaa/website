import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PAGE_VERSIONS,
  DEFAULT_VERSION,
  type VersionId,
} from '../pageVersions';
import { SECTION_VARIANT_GROUPS } from '../sectionVariants';
import './SectionVariantDial.css';

const WIDTH_MIN = 900;
const WIDTH_MAX = 1400;
const WIDTH_DEFAULT = 1200;
const WIDTH_STEP = 10;

function clampWidth(value: number): number {
  if (Number.isNaN(value)) return WIDTH_DEFAULT;
  return Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, value));
}

export function SectionVariantDial() {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  const versionParam = params.get('version');
  const activeVersion: VersionId = PAGE_VERSIONS.some((v) => v.id === versionParam)
    ? (versionParam as VersionId)
    : DEFAULT_VERSION;

  // Only surface groups whose slot is mounted on the current page version.
  const groups = SECTION_VARIANT_GROUPS.filter(
    (g) => !g.appliesTo || g.appliesTo.includes(activeVersion),
  );

  const maxWidthParam = params.get('maxw');
  const maxWidth = clampWidth(
    maxWidthParam === null ? WIDTH_DEFAULT : Number(maxWidthParam),
  );

  // Drive the shared --page-max-width token consumed by every content container.
  useEffect(() => {
    document.documentElement.style.setProperty('--page-max-width', `${maxWidth}px`);
  }, [maxWidth]);

  const select = (groupId: string, variantId: string) => {
    const next = new URLSearchParams(params);
    next.set(groupId, variantId);
    setParams(next, { replace: true });
  };

  const setMaxWidth = (value: number) => {
    const next = new URLSearchParams(params);
    next.set('maxw', String(clampWidth(value)));
    setParams(next, { replace: true });
  };

  if (!open) {
    return (
      <button
        type="button"
        className="svd-fab"
        aria-label="Open section variants"
        onClick={() => setOpen(true)}
      >
        <span className="svd-fab-dot" aria-hidden="true" />
        Variants
      </button>
    );
  }

  return (
    <aside className="svd-panel" role="dialog" aria-label="Section variants">
      <header className="svd-panel-header">
        <div>
          <h2 className="svd-panel-title">Section Variants</h2>
          <p className="svd-panel-subtitle">Swap the live section variant</p>
        </div>
        <button
          type="button"
          className="svd-close"
          aria-label="Close section variants"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </header>

      <div className="svd-panel-body">
        <div className="svd-group">
          <div className="svd-group-head">
            <span className="svd-group-label">Page width</span>
            <span className="svd-group-value">{maxWidth}px</span>
          </div>
          <input
            className="svd-range"
            type="range"
            min={WIDTH_MIN}
            max={WIDTH_MAX}
            step={WIDTH_STEP}
            value={maxWidth}
            aria-label="Page max width"
            onChange={(e) => setMaxWidth(Number(e.target.value))}
          />
        </div>

        {groups.map((group) => {
          const selected = params.get(group.id) ?? group.defaultId;
          const active = group.variants.some((v) => v.id === selected)
            ? selected
            : group.defaultId;

          return (
            <div key={group.id} className="svd-group">
              <span className="svd-group-label">{group.label}</span>
              <div
                className="svd-options"
                role="group"
                aria-label={`${group.label} variant`}
              >
                {group.variants.map((variant) => {
                  const isActive = variant.id === active;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className="svd-option"
                      aria-pressed={isActive}
                      data-active={isActive}
                      onClick={() => select(group.id, variant.id)}
                    >
                      {variant.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
