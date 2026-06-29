import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { DialConfig } from 'dialkit';

// Helpers for mirroring dialkit panel state into the URL query string so a link
// reproduces the author's configuration. All writes go through react-router's
// setSearchParams (see useDialUrlSync) because `version` is owned by react-router
// and a side-channel write (history.replaceState) would be clobbered on the next
// version toggle.

export type Scalar = string | number | boolean;

// A dialkit config leaf is one of: a [default, min, max, step?] slider tuple, a
// control object with a `type` (select/color/text/...), a nested folder (plain
// object of more leaves), or a bare scalar default.
function isTuple(v: unknown): v is [number, number, number, number?] {
  return Array.isArray(v);
}

function isControl(v: unknown): v is { type: string; default?: Scalar } {
  return typeof v === 'object' && v !== null && 'type' in v;
}

function isFolder(v: unknown): v is DialConfig {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && !('type' in v);
}

/** Flatten nested dialkit `values` to `{ "prompt.top": -4 }`, skipping `_collapsed`. */
export function flattenValues(
  values: Record<string, unknown>,
  prefix = '',
): Record<string, Scalar> {
  const out: Record<string, Scalar> = {};
  for (const [key, value] of Object.entries(values)) {
    if (key === '_collapsed') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flattenValues(value as Record<string, unknown>, path));
    } else if (
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean'
    ) {
      out[path] = value;
    }
  }
  return out;
}

/** Default scalar per leaf path: tuple[0], control.default, or a bare scalar. */
export function configDefaults(config: DialConfig, prefix = ''): Record<string, Scalar> {
  const out: Record<string, Scalar> = {};
  for (const [key, value] of Object.entries(config)) {
    if (key === '_collapsed') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (isTuple(value)) {
      out[path] = value[0];
    } else if (isControl(value)) {
      if (value.default !== undefined) out[path] = value.default;
    } else if (isFolder(value)) {
      Object.assign(out, configDefaults(value, path));
    } else if (
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean'
    ) {
      out[path] = value;
    }
  }
  return out;
}

/**
 * Deep-clone `config` with each leaf's default replaced by `overrides[path]` when
 * present. Numeric tuple overrides are clamped to the tuple's [min, max] so a
 * malformed link can't push a control out of range. Used to seed a panel from the
 * URL at registration (no flash of defaults).
 */
export function applyDefaults(
  config: DialConfig,
  overrides: Record<string, Scalar>,
  prefix = '',
): DialConfig {
  const out: DialConfig = {};
  for (const [key, value] of Object.entries(config)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (key === '_collapsed') {
      out[key] = value;
    } else if (isTuple(value)) {
      const override = overrides[path];
      if (typeof override === 'number') {
        const [, min, max, step] = value;
        const clamped = Math.min(Math.max(override, min), max);
        out[key] = step === undefined ? [clamped, min, max] : [clamped, min, max, step];
      } else {
        out[key] = value;
      }
    } else if (isControl(value)) {
      const override = overrides[path];
      out[key] = override !== undefined ? { ...value, default: override } : value;
    } else if (isFolder(value)) {
      out[key] = applyDefaults(value, overrides, path);
    } else {
      const override = overrides[path];
      out[key] = override !== undefined ? override : value;
    }
  }
  return out;
}

/** JSON of only the leaves that differ from their default; null when none differ. */
export function encodeTune(
  values: Record<string, unknown>,
  defaults: Record<string, Scalar>,
): string | null {
  const flat = flattenValues(values);
  const diff: Record<string, Scalar> = {};
  for (const [path, value] of Object.entries(flat)) {
    if (value !== defaults[path]) diff[path] = value;
  }
  return Object.keys(diff).length ? JSON.stringify(diff) : null;
}

/** Parse a `tune` param back into an override map; tolerate junk → {}. */
export function decodeTune(param: string | null): Record<string, Scalar> {
  if (!param) return {};
  try {
    const parsed: unknown = JSON.parse(param);
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, Scalar>;
    }
  } catch {
    /* malformed link — fall back to defaults */
  }
  return {};
}

interface DialUrlSyncOptions {
  /** All param keys this writer owns; deleted then re-set so stale keys are pruned. */
  keys: string[];
  /** Params that should be PRESENT (non-default values only). */
  target: Record<string, string>;
  /** Write synchronously (discrete selects) or debounced to drag-settle (sliders). */
  immediate: boolean;
}

const DEBOUNCE_MS = 300;

/**
 * Mirror a panel's `target` params into the URL. Each instance only touches its
 * own `keys` and merges onto the latest react-router params, so multiple writers
 * (variants, tuning, version) compose without clobbering each other.
 */
export function useDialUrlSync({ keys, target, immediate }: DialUrlSyncOptions): void {
  const [params, setSearchParams] = useSearchParams();
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // Stable signature of the desired params; the effect re-runs only when it changes
  // (never on our own URL writes), so there is no feedback loop.
  const targetSig = JSON.stringify(
    Object.keys(target)
      .sort()
      .map((k) => [k, target[k]]),
  );

  useEffect(() => {
    const apply = () => {
      const current = paramsRef.current;
      const next = new URLSearchParams(current);
      keys.forEach((k) => next.delete(k));
      for (const [k, v] of Object.entries(target)) next.set(k, v);
      if (next.toString() !== current.toString()) {
        setSearchParams(next, { replace: true });
      }
    };
    if (immediate) {
      apply();
      return;
    }
    const id = setTimeout(apply, DEBOUNCE_MS);
    return () => clearTimeout(id);
    // target is captured via targetSig; keys/immediate are stable per call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSig, immediate]);
}
