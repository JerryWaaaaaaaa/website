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
};

// Hero controls, grouped by the variant they drive. magnify is HeroV5B (Grouped)
// only — the magnetic-hover peak scale, consumed via --suite-magnify-max.
const HERO_BASE: DialConfig = {
  grouped: { _collapsed: true, magnify: [1.25, 1.0, 2.0, 0.05] },
  // Floating meeting window (.hero-v5-meeting, HeroV5 + HeroV5B). % of the hero
  // container; consumed via --hero-meeting-w / --hero-meeting-max-w.
  meeting: {
    _collapsed: true,
    width: [28, 15, 50, 0.5], // % of hero container — fluid proportional size
    maxWidth: [520, 200, 800, 10], // px — absolute ceiling, only clamps when the % width would exceed it
  },
};

// Built Different (Scroll variant): vertical space each title step occupies (vh).
// Each step is centered in its own min-height block, so this is the effective gap
// between titles. Drives .bd5-step min-height via --bd5-step-height.
const BUILTDIFF_BASE: DialConfig = {
  stepHeight: [70, 20, 120, 1],
};

// Variant-scoped Product Suite controls, grouped in the "Product Suite" panel so
// each control sits next to the variant it drives. stageHeight is Carousel-only;
// the autoplay cycle is shared by the Slider (V5C) and Tab bar (V5D) variants.
const CAROUSEL_BASE: DialConfig = {
  stageHeight: [188, 120, 400, 2], // .psuite-v5-stage height (ProductSuiteV5) via --psuite-stage-height
};
const AUTOPLAY_BASE: DialConfig = {
  cycle: [8000, 8000, 20000, 100], // --psuite-v5c-cycle: Slider (V5C) countdown + Tab bar (V5D) underline (ms)
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

// Canvas floats (ProductSuiteV5 Canvas tab): position (% of the card, may be
// negative to spill outside an edge) + size (px). Consumed by .cnv-floats via
// --canvas-* tokens. The reaction width also scales its emoji + sparkle stars.
const CANVAS_BASE: DialConfig = {
  polished: {
    _collapsed: true,
    right: [-1, -50, 60, 0.5],
    top: [6, -10, 100, 0.5],
    width: [236, 120, 480, 2],
  },
  comments: {
    _collapsed: true,
    right: [-7, -50, 60, 0.5],
    top: [42, -10, 100, 0.5],
    width: [322, 160, 560, 2],
  },
  reaction: {
    _collapsed: true,
    left: [-2, -50, 60, 0.5],
    bottom: [4, -50, 60, 0.5],
    width: [150, 60, 320, 2],
  },
};

// Unscaled (100%) card widths. The width dial scales the whole card by
// width / base via a CSS transform (see CanvasMockup.css), so the rendered card
// width tracks the dial value while text / padding / icons scale with it.
const CANVAS_BASE_W = { polished: 236, comments: 322, reaction: 150 } as const;

// Data table floats (ProductSuiteV5 / V5D Data table tab): the pie-chart dashboard
// card (bottom-left) + the "Fill column with AI" popover (right). Position is % of
// the card (may be negative to spill outside an edge); width is the BASE card px,
// scaled as a whole via --dt-*-scale (see DataTableMockup.css). Consumed via the
// --dt-pie-* / --dt-aipop-* tokens.
const DATATABLE_BASE: DialConfig = {
  pie: {
    _collapsed: true,
    left: [-9, -50, 60, 0.5],
    bottom: [-11.5, -50, 60, 0.5],
    width: [520, 280, 800, 2],
  },
  aiPopover: {
    _collapsed: true,
    right: [-4, -50, 60, 0.5],
    top: [26, -10, 100, 0.5],
    width: [300, 180, 520, 2],
  },
};
const DATATABLE_BASE_W = { pie: 520, aipop: 300 } as const;

interface LayoutValues {
  widthLaptop: number;
  widthMonitor: number;
}

interface HeroValues {
  grouped: { magnify: number };
  meeting: { width: number; maxWidth: number };
}

interface BuiltDiffValues {
  stepHeight: number;
}

interface CarouselValues {
  stageHeight: number;
}

interface AutoplayValues {
  cycle: number;
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

interface CanvasValues {
  polished: { right: number; top: number; width: number };
  comments: { right: number; top: number; width: number };
  reaction: { left: number; bottom: number; width: number };
}

interface DataTableValues {
  pie: { left: number; bottom: number; width: number };
  aiPopover: { right: number; top: number; width: number };
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
  ...prefixKeys('Hero', configDefaults(HERO_BASE)),
  ...prefixKeys('BuiltDifferent', configDefaults(BUILTDIFF_BASE)),
  ...prefixKeys('Carousel', configDefaults(CAROUSEL_BASE)),
  ...prefixKeys('Autoplay', configDefaults(AUTOPLAY_BASE)),
  ...prefixKeys('Slides', configDefaults(SLIDES_BASE)),
  ...prefixKeys('Paper', configDefaults(PAPER_BASE)),
  ...prefixKeys('Sheets', configDefaults(SHEETS_BASE)),
  ...prefixKeys('Canvas', configDefaults(CANVAS_BASE)),
  ...prefixKeys('DataTable', configDefaults(DATATABLE_BASE)),
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

  const hero = useDialKit(
    'Hero',
    applyDefaults(HERO_BASE, stripPrefix('Hero', overrides)),
  ) as unknown as HeroValues;

  const builtDiff = useDialKit(
    'Built Different',
    applyDefaults(BUILTDIFF_BASE, stripPrefix('BuiltDifferent', overrides)),
  ) as unknown as BuiltDiffValues;

  // Product Suite controls grouped under a single collapsible panel: the
  // variant-scoped controls (carousel stage height; the Slider/Tab bar autoplay
  // cycle) followed by the per-tab float folders. Each sub-folder is seeded from the
  // URL under its own prefix so the packed `tune` keys stay stable per control.
  const suite = useDialKit('Product Suite', {
    carousel: { _collapsed: true, ...applyDefaults(CAROUSEL_BASE, stripPrefix('Carousel', overrides)) },
    autoplay: { _collapsed: true, ...applyDefaults(AUTOPLAY_BASE, stripPrefix('Autoplay', overrides)) },
    slides: { _collapsed: true, ...applyDefaults(SLIDES_BASE, stripPrefix('Slides', overrides)) },
    paper: { _collapsed: true, ...applyDefaults(PAPER_BASE, stripPrefix('Paper', overrides)) },
    sheets: { _collapsed: true, ...applyDefaults(SHEETS_BASE, stripPrefix('Sheets', overrides)) },
    canvas: { _collapsed: true, ...applyDefaults(CANVAS_BASE, stripPrefix('Canvas', overrides)) },
    datatable: { _collapsed: true, ...applyDefaults(DATATABLE_BASE, stripPrefix('DataTable', overrides)) },
  }) as unknown as {
    carousel: CarouselValues;
    autoplay: AutoplayValues;
    slides: SlidesValues;
    paper: PaperValues;
    sheets: SheetsValues;
    canvas: CanvasValues;
    datatable: DataTableValues;
  };
  const { carousel, autoplay, slides, paper, sheets, canvas, datatable } = suite;

  // --page-max-width: the tier matching the current viewport drives the live token.
  const activeWidth = tier === 'monitor' ? layout.widthMonitor : layout.widthLaptop;
  useEffect(() => {
    document.documentElement.style.setProperty('--page-max-width', `${activeWidth}px`);
  }, [activeWidth]);

  // --suite-magnify-max: peak scale of the hovered HeroV5B (Grouped) suite icons.
  useEffect(() => {
    document.documentElement.style.setProperty('--suite-magnify-max', String(hero.grouped.magnify));
  }, [hero.grouped.magnify]);

  // --hero-meeting-w / --hero-meeting-max-w: size of the floating meeting window
  // on the V5 hero (.hero-v5-meeting), as % of the hero container.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--hero-meeting-w', `${hero.meeting.width}%`);
    root.setProperty('--hero-meeting-max-w', `${hero.meeting.maxWidth}px`);
  }, [hero.meeting.width, hero.meeting.maxWidth]);

  // --bd5-step-height: vertical space each Built Different (Scroll) title step
  // occupies, i.e. the effective gap between titles.
  useEffect(() => {
    document.documentElement.style.setProperty('--bd5-step-height', `${builtDiff.stepHeight}vh`);
  }, [builtDiff.stepHeight]);

  // --psuite-stage-height: live height of the Carousel (ProductSuiteV5) arc stage.
  useEffect(() => {
    document.documentElement.style.setProperty('--psuite-stage-height', `${carousel.stageHeight}px`);
  }, [carousel.stageHeight]);

  // --psuite-v5c-cycle: auto-advance countdown — drives the Slider (V5C) fill and
  // the Tab bar (V5D) underline.
  useEffect(() => {
    document.documentElement.style.setProperty('--psuite-v5c-cycle', `${autoplay.cycle}ms`);
  }, [autoplay.cycle]);

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

  // Canvas float position + proportional-scale tokens, consumed by .cnv-floats.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--canvas-pol-right', `${canvas.polished.right}%`);
    root.setProperty('--canvas-pol-top', `${canvas.polished.top}%`);
    root.setProperty('--canvas-cmt-right', `${canvas.comments.right}%`);
    root.setProperty('--canvas-cmt-top', `${canvas.comments.top}%`);
    root.setProperty('--canvas-rxn-left', `${canvas.reaction.left}%`);
    root.setProperty('--canvas-rxn-bottom', `${canvas.reaction.bottom}%`);
    // Size dials scale the whole card proportionally: width / base → a unitless
    // factor applied as a CSS transform (not just a container-width change).
    root.setProperty('--canvas-pol-scale', String(canvas.polished.width / CANVAS_BASE_W.polished));
    root.setProperty('--canvas-cmt-scale', String(canvas.comments.width / CANVAS_BASE_W.comments));
    root.setProperty('--canvas-rxn-scale', String(canvas.reaction.width / CANVAS_BASE_W.reaction));
  }, [canvas]);

  // Data table float position + whole-card scale tokens, consumed by
  // .dtm-floats--pie / .dtm-floats--ai. Offsets in %; width → unitless scale factor
  // (width / base) applied as a CSS transform so the whole card zooms.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--dt-pie-left', `${datatable.pie.left}%`);
    root.setProperty('--dt-pie-bottom', `${datatable.pie.bottom}%`);
    root.setProperty('--dt-pie-scale', String(datatable.pie.width / DATATABLE_BASE_W.pie));
    root.setProperty('--dt-aipop-right', `${datatable.aiPopover.right}%`);
    root.setProperty('--dt-aipop-top', `${datatable.aiPopover.top}%`);
    root.setProperty('--dt-aipop-scale', String(datatable.aiPopover.width / DATATABLE_BASE_W.aipop));
  }, [datatable]);

  // Mirror both panels' non-default leaves into a single packed `tune` param,
  // debounced so dragging a slider never re-renders the page mid-gesture.
  const combinedValues: Record<string, Scalar> = {
    ...prefixKeys('Layout', flattenValues(layout as unknown as Record<string, unknown>)),
    ...prefixKeys('Hero', flattenValues(hero as unknown as Record<string, unknown>)),
    ...prefixKeys('BuiltDifferent', flattenValues(builtDiff as unknown as Record<string, unknown>)),
    ...prefixKeys('Carousel', flattenValues(carousel as unknown as Record<string, unknown>)),
    ...prefixKeys('Autoplay', flattenValues(autoplay as unknown as Record<string, unknown>)),
    ...prefixKeys('Slides', flattenValues(slides as unknown as Record<string, unknown>)),
    ...prefixKeys('Paper', flattenValues(paper as unknown as Record<string, unknown>)),
    ...prefixKeys('Sheets', flattenValues(sheets as unknown as Record<string, unknown>)),
    ...prefixKeys('Canvas', flattenValues(canvas as unknown as Record<string, unknown>)),
    ...prefixKeys('DataTable', flattenValues(datatable as unknown as Record<string, unknown>)),
  };
  const tune = encodeTune(combinedValues, TUNE_DEFAULTS);
  useDialUrlSync({ keys: ['tune'], target: tune ? { tune } : {}, immediate: false });

  return null;
}
