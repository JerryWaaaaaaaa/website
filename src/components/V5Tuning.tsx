import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDialKit, type DialConfig } from 'dialkit';
import {
  applyDefaults,
  configDefaults,
  decodeTune,
  encodeTune,
  flattenValues,
  useDialUrlSync,
  type Scalar,
} from './dialUrlSync';

// Continuous v5 design-tuning controls, surfaced through the dialkit panel.
// This is a leaf component: it only writes the resulting values to CSS custom
// properties (in effects), so dragging a slider re-renders V5Tuning alone — the
// page reacts purely through the CSS cascade and never re-renders. That keeps
// the HeroV5B magnetic hover (which writes --mag straight to the DOM) smooth.
//
// The slider values are also mirrored into the URL `tune` param so a link
// reproduces them. To preserve the no-page-re-render invariant above, that write
// is DEBOUNCED to drag-settle (useDialUrlSync immediate:false) — the page only
// re-renders once the drag pauses, never mid-gesture.

const WIDTH_MIN = 900;
const WIDTH_MAX = 1400;
const WIDTH_STEP = 10;
const MONITOR_QUERY = '(min-width: 1440px)';

// Base panel shapes — [default, min, max, step]. Defaults are overridden from the
// URL at mount via applyDefaults; the `tune` param packs both panels' changed
// leaves keyed by `<Panel>.<path>` (e.g. "Layout.magnify", "Float.prompt.top").
const LAYOUT_BASE: DialConfig = {
  widthLaptop: [1020, WIDTH_MIN, WIDTH_MAX, WIDTH_STEP], // on the step-10 grid so dialkit doesn't re-snap (would falsely flag the default as changed)
  widthMonitor: [1200, WIDTH_MIN, WIDTH_MAX, WIDTH_STEP],
  magnify: [1.45, 1.0, 2.0, 0.05],
  suiteHeight: [190, 120, 400, 2], // .psuite-v5-stage height
};

// Floating Slides panels (ProductSuiteV5). Values are % of the card and may be
// negative so a panel can spill outside the card edges. Folders start collapsed.
const FLOAT_BASE: DialConfig = {
  prompt: {
    _collapsed: true,
    top: [-4, -30, 130, 0.5],
    left: [16.5, -30, 130, 0.5],
    width: [25.5, 5, 80, 0.5],
  },
  notes: {
    _collapsed: true,
    bottom: [-6.5, -30, 130, 0.5],
    left: [25, -30, 130, 0.5],
    width: [53, 5, 90, 0.5],
  },
  voice: {
    _collapsed: true,
    top: [50, -30, 130, 0.5],
    right: [-20.5, -30, 130, 0.5],
    width: [18.5, 5, 80, 0.5],
  },
};

interface LayoutValues {
  widthLaptop: number;
  widthMonitor: number;
  magnify: number;
  suiteHeight: number;
}

interface FloatValues {
  prompt: { top: number; left: number; width: number };
  notes: { bottom: number; left: number; width: number };
  voice: { top: number; right: number; width: number };
}

function prefixKeys(prefix: string, map: Record<string, Scalar>): Record<string, Scalar> {
  const out: Record<string, Scalar> = {};
  for (const [k, v] of Object.entries(map)) out[`${prefix}.${k}`] = v;
  return out;
}

function stripPrefix(prefix: string, map: Record<string, Scalar>): Record<string, Scalar> {
  const out: Record<string, Scalar> = {};
  const p = `${prefix}.`;
  for (const [k, v] of Object.entries(map)) if (k.startsWith(p)) out[k.slice(p.length)] = v;
  return out;
}

// Default values for the packed `tune` param, namespaced by panel (constant).
const TUNE_DEFAULTS: Record<string, Scalar> = {
  ...prefixKeys('Layout', configDefaults(LAYOUT_BASE)),
  ...prefixKeys('Float', configDefaults(FLOAT_BASE)),
};

// Active breakpoint tier, tracked live as the viewport crosses the 1440 threshold.
function useActiveTier(): 'laptop' | 'monitor' {
  const [id, setId] = useState<'laptop' | 'monitor'>(() =>
    window.matchMedia(MONITOR_QUERY).matches ? 'monitor' : 'laptop',
  );
  useEffect(() => {
    const mql = window.matchMedia(MONITOR_QUERY);
    const onChange = () => setId(mql.matches ? 'monitor' : 'laptop');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return id;
}

export function V5Tuning() {
  const tier = useActiveTier();

  // Mount-time URL snapshot, used to seed both panels from a shared link.
  const [searchParams] = useSearchParams();
  const overrides = useRef(decodeTune(searchParams.get('tune'))).current;

  const layout = useDialKit(
    'Layout',
    applyDefaults(LAYOUT_BASE, stripPrefix('Layout', overrides)),
  ) as unknown as LayoutValues;

  const floats = useDialKit(
    'Float',
    applyDefaults(FLOAT_BASE, stripPrefix('Float', overrides)),
  ) as unknown as FloatValues;

  // --page-max-width: the tier matching the current viewport drives the live token.
  const activeWidth = tier === 'monitor' ? layout.widthMonitor : layout.widthLaptop;
  useEffect(() => {
    document.documentElement.style.setProperty('--page-max-width', `${activeWidth}px`);
  }, [activeWidth]);

  // --suite-magnify-max: peak scale of the hovered HeroV5B suite icons.
  useEffect(() => {
    document.documentElement.style.setProperty('--suite-magnify-max', String(layout.magnify));
  }, [layout.magnify]);

  // --psuite-stage-height: live height of the ProductSuiteV5 arc stage.
  useEffect(() => {
    document.documentElement.style.setProperty('--psuite-stage-height', `${layout.suiteHeight}px`);
  }, [layout.suiteHeight]);

  // Per-panel float position/size tokens consumed by .psuite-v5-float--*.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--float-prompt-top', `${floats.prompt.top}%`);
    root.setProperty('--float-prompt-left', `${floats.prompt.left}%`);
    root.setProperty('--float-prompt-w', `${floats.prompt.width}%`);
    root.setProperty('--float-notes-bottom', `${floats.notes.bottom}%`);
    root.setProperty('--float-notes-left', `${floats.notes.left}%`);
    root.setProperty('--float-notes-w', `${floats.notes.width}%`);
    root.setProperty('--float-voice-top', `${floats.voice.top}%`);
    root.setProperty('--float-voice-right', `${floats.voice.right}%`);
    root.setProperty('--float-voice-w', `${floats.voice.width}%`);
  }, [floats]);

  // Mirror both panels' non-default leaves into a single packed `tune` param,
  // debounced so dragging a slider never re-renders the page mid-gesture.
  const combinedValues: Record<string, Scalar> = {
    ...prefixKeys('Layout', flattenValues(layout as unknown as Record<string, unknown>)),
    ...prefixKeys('Float', flattenValues(floats as unknown as Record<string, unknown>)),
  };
  const tune = encodeTune(combinedValues, TUNE_DEFAULTS);
  useDialUrlSync({ keys: ['tune'], target: tune ? { tune } : {}, immediate: false });

  return null;
}
