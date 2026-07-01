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
// leaves keyed by `<Panel>.<path>` (e.g. "Layout.magnify", "Slides.prompt.top").
const LAYOUT_BASE: DialConfig = {
  widthLaptop: [1020, WIDTH_MIN, WIDTH_MAX, WIDTH_STEP], // on the step-10 grid so dialkit doesn't re-snap (would falsely flag the default as changed)
  widthMonitor: [1200, WIDTH_MIN, WIDTH_MAX, WIDTH_STEP],
  magnify: [1.25, 1.0, 2.0, 0.05],
  suiteHeight: [188, 120, 400, 2], // .psuite-v5-stage height
  suiteCycle: [6000, 500, 8000, 100], // --psuite-v5c-cycle: ProductSuiteV5C slider countdown (ms)
};

// Floating Slides panels (ProductSuiteV5). Values are % of the card and may be
// negative so a panel can spill outside the card edges. Folders start collapsed.
const SLIDES_BASE: DialConfig = {
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
    top: [45.5, -30, 130, 0.5],
    right: [-7.5, -30, 130, 0.5],
    width: [18.5, 5, 80, 0.5],
  },
};

// Paper callout floats (ProductSuiteV5 Paper tab): position (% of the card, may be
// negative to spill outside an edge) + the one-by-one entrance timing. Consumed by
// .ppm-floats / .ppm-underlined via the --paper-* tokens below.
const PAPER_BASE: DialConfig = {
  comments: {
    _collapsed: true,
    left: [-17.5, -50, 60, 0.5],
    top: [37, -10, 100, 0.5],
  },
  suggestions: {
    _collapsed: true,
    left: [30, -20, 100, 0.5],
    bottom: [-18, -50, 60, 0.5],
  },
  history: {
    _collapsed: true,
    right: [-17, -50, 60, 0.5],
    top: [50, -10, 100, 0.5],
  },
  timing: {
    _collapsed: true,
    start: [2560, 0, 5000, 20], // when comments + the underline begin (ms)
    step: [240, 0, 1500, 10], // gap between each float (ms)
    duration: [420, 100, 1200, 10], // fade duration (ms)
  },
};

// Sheets floats (ProductSuiteV5 Sheets tab). Offsets are % of the card (may be
// negative to spill outside an edge); widths are px (fixed-size cards). Consumed
// by .shm-floats / .shm-floats--context via the --sheet-* tokens below.
const SHEETS_BASE: DialConfig = {
  aiFormula: {
    _collapsed: true,
    left: [45.5, -30, 130, 0.5],
    bottom: [-4, -50, 60, 0.5],
    width: [230, 120, 480, 2],
  },
  context: {
    _collapsed: true,
    top: [27, -30, 130, 0.5],
    left: [-18, -50, 100, 0.5],
    width: [332, 120, 480, 2],
  },
};

interface LayoutValues {
  widthLaptop: number;
  widthMonitor: number;
  magnify: number;
  suiteHeight: number;
  suiteCycle: number;
}

interface SlidesValues {
  prompt: { top: number; left: number; width: number };
  notes: { bottom: number; left: number; width: number };
  voice: { top: number; right: number; width: number };
}

interface PaperValues {
  comments: { left: number; top: number };
  suggestions: { left: number; bottom: number };
  history: { right: number; top: number };
  timing: { start: number; step: number; duration: number };
}

interface SheetsValues {
  aiFormula: { left: number; bottom: number; width: number };
  context: { top: number; left: number; width: number };
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
  ...prefixKeys('Slides', configDefaults(SLIDES_BASE)),
  ...prefixKeys('Paper', configDefaults(PAPER_BASE)),
  ...prefixKeys('Sheets', configDefaults(SHEETS_BASE)),
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

  const slides = useDialKit(
    'Slides',
    applyDefaults(SLIDES_BASE, stripPrefix('Slides', overrides)),
  ) as unknown as SlidesValues;

  const paper = useDialKit(
    'Paper',
    applyDefaults(PAPER_BASE, stripPrefix('Paper', overrides)),
  ) as unknown as PaperValues;

  const sheets = useDialKit(
    'Sheets',
    applyDefaults(SHEETS_BASE, stripPrefix('Sheets', overrides)),
  ) as unknown as SheetsValues;

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

  // --psuite-v5c-cycle: ProductSuiteV5C slider countdown (fill + auto-advance) duration.
  useEffect(() => {
    document.documentElement.style.setProperty('--psuite-v5c-cycle', `${layout.suiteCycle}ms`);
  }, [layout.suiteCycle]);

  // Per-panel float position/size tokens consumed by .psuite-v5-float--*.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--float-prompt-top', `${slides.prompt.top}%`);
    root.setProperty('--float-prompt-left', `${slides.prompt.left}%`);
    root.setProperty('--float-prompt-w', `${slides.prompt.width}%`);
    root.setProperty('--float-notes-bottom', `${slides.notes.bottom}%`);
    root.setProperty('--float-notes-left', `${slides.notes.left}%`);
    root.setProperty('--float-notes-w', `${slides.notes.width}%`);
    root.setProperty('--float-voice-top', `${slides.voice.top}%`);
    root.setProperty('--float-voice-right', `${slides.voice.right}%`);
    root.setProperty('--float-voice-w', `${slides.voice.width}%`);
  }, [slides]);

  // Paper callout-float position + entrance-timing tokens, consumed by
  // .ppm-floats (positions + stagger) and .ppm-underlined (synced to comments).
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--paper-cmt-left', `${paper.comments.left}%`);
    root.setProperty('--paper-cmt-top', `${paper.comments.top}%`);
    root.setProperty('--paper-sug-left', `${paper.suggestions.left}%`);
    root.setProperty('--paper-sug-bottom', `${paper.suggestions.bottom}%`);
    root.setProperty('--paper-hist-right', `${paper.history.right}%`);
    root.setProperty('--paper-hist-top', `${paper.history.top}%`);
    root.setProperty('--paper-start', `${paper.timing.start}ms`);
    root.setProperty('--paper-step', `${paper.timing.step}ms`);
    root.setProperty('--paper-dur', `${paper.timing.duration}ms`);
  }, [paper]);

  // Sheets float position/size tokens, consumed by .shm-floats (AI-formula
  // tooltip) and .shm-floats--context (context card). Offsets in %, widths in px.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--sheet-aif-left', `${sheets.aiFormula.left}%`);
    root.setProperty('--sheet-aif-bottom', `${sheets.aiFormula.bottom}%`);
    root.setProperty('--sheet-aif-w', `${sheets.aiFormula.width}px`);
    root.setProperty('--sheet-ctx-top', `${sheets.context.top}%`);
    root.setProperty('--sheet-ctx-left', `${sheets.context.left}%`);
    root.setProperty('--sheet-ctx-w', `${sheets.context.width}px`);
  }, [sheets]);

  // Mirror both panels' non-default leaves into a single packed `tune` param,
  // debounced so dragging a slider never re-renders the page mid-gesture.
  const combinedValues: Record<string, Scalar> = {
    ...prefixKeys('Layout', flattenValues(layout as unknown as Record<string, unknown>)),
    ...prefixKeys('Slides', flattenValues(slides as unknown as Record<string, unknown>)),
    ...prefixKeys('Paper', flattenValues(paper as unknown as Record<string, unknown>)),
    ...prefixKeys('Sheets', flattenValues(sheets as unknown as Record<string, unknown>)),
  };
  const tune = encodeTune(combinedValues, TUNE_DEFAULTS);
  useDialUrlSync({ keys: ['tune'], target: tune ? { tune } : {}, immediate: false });

  return null;
}
