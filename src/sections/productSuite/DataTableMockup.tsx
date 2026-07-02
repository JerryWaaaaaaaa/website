import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import './DataTableMockup.css';

/* Live, animated reconstruction of the Zoom Table (data table) editor
   (Figma 3320:25919 — "datatable-ui"). Replaces the static datatable-ui.png in
   ProductSuiteV5's screen card.

   Per the design brief this mockup intentionally uses the Figma file's OWN type
   and colour system (Inter + the exact token hexes) rather than the site style
   guide — see DataTableMockup.css.

   Intro sequence (plays once the section is in view AND Data table is active):
     1. the editor chrome (nav, title, view bar, table header) staggers in,
     2. the main table generates row by row — the Notes (AI) column stays EMPTY,
     3. the Notes (AI) column then "loads" with the gradient shimmer effect
        (Figma 3403:39597) while a progress ring fills 0→100%,
     4. the shimmer resolves to note text row by row,
     5. the floating pie-chart card + "Fill column with AI" popover pop in one by
        one (rendered outside the card by ProductSuiteV5 — see the exports below). */

const STAGE_W = 1280;

// Shared top-bar icon source (single set used across all product mockups).
const II = '/product-suite-assets/icons-interface';

// ---- Table model -----------------------------------------------------------
const ADD_W = 40;

type ColKey = 'task' | 'time' | 'by' | 'request' | 'detail' | 'status' | 'note';
type Col = { key: ColKey; label: string; icon: string; w: number; ai?: boolean };
const COLS: Col[] = [
  { key: 'task', label: 'Task', icon: 'textA', w: 128 },
  { key: 'time', label: 'Created Time', icon: 'clock', w: 140 },
  { key: 'by', label: 'Created By', icon: 'person', w: 128 },
  { key: 'request', label: 'Request', icon: 'textA', w: 150 },
  { key: 'detail', label: 'Request Detail', icon: 'textA', w: 238 },
  { key: 'status', label: 'Request', icon: 'target', w: 120 },
  { key: 'note', label: 'Notes', icon: 'textA', w: 244, ai: true },
];

type Tone =
  | 'bug'
  | 'application'
  | 'inquery'
  | 'support'
  | 'others'
  | 'hardware'
  | 'network';

type RowData = {
  task: string;
  time: string;
  by: string;
  tint: string; // avatar colour
  request: string;
  detail: string;
  status: { label: string; tone: Tone };
  note: string;
};

// Top-right presence stack: three distinct row collaborators (ring = their row
// tint) followed by the current user ("You", neutral ring). Photos are
// gender-matched to the names.
const AVATAR_STACK = [
  { src: '/avatars/marcus.png', ring: '#60a5fa' }, // Ravi Puri
  { src: '/avatars/mei.png', ring: '#818cf8' }, // Nicole Lin
  { src: '/avatars/priya.png', ring: '#f97316' }, // Tara Malik
  { src: '/avatars/diego.png', ring: '#94a3b8' }, // You
];

const ROWS: RowData[] = [
  {
    task: '202501170001',
    time: '2025-06-01 09:30',
    by: 'Rowan Vega',
    tint: '#f472b6',
    request: 'Database connection lost',
    detail:
      'The application suddenly lost connection to the MySQL database. Error messages…',
    status: { label: 'Bug', tone: 'bug' },
    note: 'Network team is checking for outages in the database server area.',
  },
  {
    task: '202501170002',
    time: '2025-07-08 14:20',
    by: 'Ravi Puri',
    tint: '#60a5fa',
    request: 'Slow internet speed',
    detail:
      'Internet speed on the office floor has been extremely slow since this morning…',
    status: { label: 'Application', tone: 'application' },
    note: 'Currently running speed tests on different access points.',
  },
  {
    task: '202501170003',
    time: '2025-07-10 14:00',
    by: 'Ellis Mercer',
    tint: '#f59e0b',
    request: 'Mobile device authentication failure',
    detail:
      "Unable to authenticate the corporate-issued mobile device on the company's…",
    status: { label: 'Inquery', tone: 'inquery' },
    note: "Reset the device's VPN configuration and re-authenticated successfully.",
  },
  {
    task: '202501170004',
    time: '2025-07-11 10:35',
    by: 'Sean Nunez',
    tint: '#34d399',
    request: 'Software license activation problem',
    detail:
      'Trying to activate the new project management software license, but the a…',
    status: { label: 'IT support', tone: 'support' },
    note: 'Contacting the software vendor for key verification.',
  },
  {
    task: '202501170005',
    time: '2025-07-12 16:10',
    by: 'Adrian Sorg',
    tint: '#a78bfa',
    request: 'External hard drive not recognized',
    detail:
      'Plugged in an external hard drive to the work computer, but the computer does…',
    status: { label: 'Others', tone: 'others' },
    note: 'Checking for driver updates and connection integrity.',
  },
  {
    task: '202501170006',
    time: '2025-07-14 09:05',
    by: 'Owen Hale',
    tint: '#fb7185',
    request: 'Email delivery delays',
    detail:
      'Outbound emails to external recipients take 20–40 minutes; internal mail is nor…',
    status: { label: 'IT support', tone: 'support' },
    note: 'Reviewing SMTP queue and outbound relay throttling.',
  },
  {
    task: '202501170007',
    time: '2025-07-15 11:45',
    by: 'Dean Haas',
    tint: '#22d3ee',
    request: 'Shared drive permission denied',
    detail:
      "Cannot access finance/shared-drive reports; “Access is denied”…",
    status: { label: 'Application', tone: 'application' },
    note: 'Auditing AD group membership; rolling back recent policy change.',
  },
  {
    task: '202501170008',
    time: '2025-07-16 13:20',
    by: 'Nicole Lin',
    tint: '#818cf8',
    request: 'Video conferencing audio echo',
    detail:
      'Strong echo when two conference rooms join the same Zoom meeting simultaneo…',
    status: { label: 'Hardware', tone: 'hardware' },
    note: 'Adjusting mic gain and enabling echo cancellation per room.',
  },
  {
    task: '202501170009',
    time: '2025-07-17 15:30',
    by: 'Tara Malik',
    tint: '#f97316',
    request: 'VPN disconnects every 10 minutes',
    detail:
      'VPN drops repeatedly on home Wi-Fi; blocks access to Jira and internal tools.',
    status: { label: 'Network', tone: 'network' },
    note: 'Rotating the VPN gateway and re-issuing client certificates.',
  },
  {
    task: '202501170010',
    time: '2025-07-18 08:50',
    by: 'Cody Reed',
    tint: '#2dd4bf',
    request: 'Laptop overheating and shutdown',
    detail:
      'Laptop overheats and shuts down during video calls; fan at max speed.',
    status: { label: 'Hardware', tone: 'hardware' },
    note: 'Waiting for room DSP/mic placement confirmation.',
  },
];

// ---- Intro timing (ms) -----------------------------------------------------
const ROW_BASE = 560; // first data row generates
const ROW_STEP = 85; // between rows
const LAST_ROW_DELAY = ROW_BASE + (ROWS.length - 1) * ROW_STEP;

// The Notes (AI) column stays empty until the table has generated, then loads.
const NOTES_LOADING_AT = LAST_ROW_DELAY + 560; // shimmer + progress ring appear
const NOTES_DONE_AT = NOTES_LOADING_AT + 1500; // shimmer resolves to text
const NOTE_TEXT_STEP = 70; // note text fades in row by row

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

type Phase = 'idle' | 'loading' | 'done';

export function DataTableMockup({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [entered, setEntered] = useState(false);
  // Notes (AI) column state machine: idle (empty) → loading (shimmer) → done (text).
  const [notes, setNotes] = useState<Phase>('idle');
  const [pct, setPct] = useState(0);

  // Scale the fixed 1280x694 stage to fill the (matching) screen card by width.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const apply = () => setScale(el.clientWidth / STAGE_W);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Latch `revealed` the first time the section scrolls into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { rootMargin: '-12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Chrome + rows are CSS-driven off the `data-enter` gate; the Notes column is
  // sequenced with timers so the shimmer can swap to text. Resets when the tab
  // isn't active so the whole intro replays on return; reduced motion snaps to
  // the finished scene.
  useEffect(() => {
    if (!active || !revealed) {
      setEntered(false);
      setNotes('idle');
      return;
    }
    if (prefersReducedMotion()) {
      setEntered(true);
      setNotes('done');
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    const t1 = window.setTimeout(() => setNotes('loading'), NOTES_LOADING_AT);
    const t2 = window.setTimeout(() => setNotes('done'), NOTES_DONE_AT);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, revealed]);

  // Count the progress ring 0→100% across the loading window.
  useEffect(() => {
    if (notes !== 'loading') {
      setPct(notes === 'done' ? 100 : 0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = NOTES_DONE_AT - NOTES_LOADING_AT;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setPct(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [notes]);

  return (
    <div className="dtm" ref={rootRef} data-enter={entered ? 'true' : 'false'}>
      <div
        className="dtm-stage"
        style={{ '--dtm-scale': scale } as CSSProperties}
      >
        {/* ===== Doc navigation ===== */}
        <div className="dtm-nav dtm-reveal" style={rd(0)}>
          <div className="dtm-nav-left">
            <span className="dtm-ic dtm-ic-btn"><img src={`${II}/left.svg`} alt="" /></span>
            <span className="dtm-nav-div" />
            <span className="dtm-ic"><Ico n="docAdd" /></span>
            <span className="dtm-nav-title">IT Ticket Management</span>
            <span className="dtm-ic dtm-nav-caret"><img src={`${II}/chevron-down.svg`} alt="" /></span>
            <span className="dtm-ic dtm-dim dtm-tb-soft"><img src={`${II}/star.svg`} alt="" /></span>
            <span className="dtm-ic dtm-dim dtm-tb-soft"><img src={`${II}/Saved.svg`} alt="" /></span>
          </div>
          <div className="dtm-nav-right">
            <span className="dtm-avatars">
              {AVATAR_STACK.map((a) => (
                <span key={a.src} className="dtm-nav-avatar" style={{ background: a.ring }}>
                  <img src={a.src} alt="" />
                </span>
              ))}
            </span>
            <span className="dtm-share">
              <img src={`${II}/lock.svg`} alt="" />
              Share
            </span>
            <span className="dtm-ic dtm-dim"><img src={`${II}/link-angled.svg`} alt="" /></span>
            <span className="dtm-tableai">
              <img src={`${II}/table-ai.svg`} alt="AI" />
              Table AI
            </span>
            <span className="dtm-ic dtm-dim"><img src={`${II}/video-on.svg`} alt="" /></span>
            <span className="dtm-ic dtm-dim"><img src={`${II}/Comment.svg`} alt="" /></span>
            <span className="dtm-ic dtm-dim"><img src={`${II}/ellipsis.svg`} alt="" /></span>
            <span className="dtm-ic dtm-dim"><img src={`${II}/search.svg`} alt="" /></span>
            <span className="dtm-ic dtm-dim"><img src={`${II}/add.svg`} alt="" /></span>
          </div>
        </div>

        {/* ===== Title ===== */}
        <h3 className="dtm-title dtm-reveal" style={rd(90)}>
          IT Ticket Management
        </h3>

        {/* ===== View bar (view tabs + toolbar icons) ===== */}
        <div className="dtm-viewbar dtm-reveal" style={rd(160)}>
          <div className="dtm-views">
            <span className="dtm-view">
              <Ico n="grid" />
              Ticket Submission Form
            </span>
            <span className="dtm-view dtm-view-active">
              <Ico n="grid" />
              All Tickets
            </span>
            <span className="dtm-ic dtm-dim"><Ico n="plus" /></span>
          </div>
          <div className="dtm-tools">
            <span className="dtm-ic dtm-tool dtm-tool-active"><Ico n="rows" /></span>
            <span className="dtm-ic dtm-tool"><Ico n="filter" /></span>
            <span className="dtm-ic dtm-tool"><Ico n="sort" /></span>
            <span className="dtm-ic dtm-tool"><Ico n="group" /></span>
            <span className="dtm-ic dtm-tool"><Ico n="rowHeight" /></span>
            <span className="dtm-ic dtm-tool"><Ico n="palette" /></span>
            <span className="dtm-ic dtm-tool"><Ico n="settings" /></span>
            <span className="dtm-ic dtm-tool"><Ico n="search" /></span>
            <span className="dtm-addcol"><Ico n="plus" /></span>
          </div>
        </div>

        {/* ===== Table ===== */}
        <div className="dtm-table">
          {/* Header */}
          <div className="dtm-thead dtm-reveal" style={rd(240)}>
            <span className="dtm-gutter dtm-thcell">
              <span className="dtm-check" />
            </span>
            {COLS.map((c) => (
              <span
                key={c.key}
                className="dtm-thcell"
                style={{ width: c.w }}
              >
                <span className="dtm-th-ic"><Ico n={c.icon} /></span>
                <span className="dtm-th-label">{c.label}</span>
                {c.ai && (
                  <span className="dtm-th-ai">
                    {notes === 'loading' ? (
                      <ProgressRing pct={pct} />
                    ) : (
                      <span className="dtm-ai-badge"><img src="/Icon/ai-tag.svg" alt="AI" /></span>
                    )}
                  </span>
                )}
              </span>
            ))}
            <span className="dtm-addcell" style={{ width: ADD_W }}>
              <Ico n="plus" />
            </span>
          </div>

          {/* Rows — generate one by one; Notes column stays empty until it loads. */}
          <div className="dtm-tbody">
            {ROWS.map((r, ri) => (
              <div
                key={r.task}
                className="dtm-row dtm-row-anim"
                style={{ '--d': `${ROW_BASE + ri * ROW_STEP}ms` } as CSSProperties}
              >
                <span className="dtm-gutter dtm-cell">
                  <span className="dtm-rownum">{ri + 1}</span>
                  <span className="dtm-check" />
                </span>
                {COLS.map((c) => (
                  <span
                    key={c.key}
                    className={`dtm-cell dtm-cell-${c.key}`}
                    style={{ width: c.w }}
                  >
                    <CellBody
                      col={c}
                      row={r}
                      rowIndex={ri}
                      notes={notes}
                    />
                  </span>
                ))}
                <span className="dtm-addcell" style={{ width: ADD_W }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Cell renderer ----------------------------------------------------------
function CellBody({
  col,
  row,
  rowIndex,
  notes,
}: {
  col: Col;
  row: RowData;
  rowIndex: number;
  notes: Phase;
}) {
  switch (col.key) {
    case 'task':
      return <span className="dtm-txt dtm-mono">{row.task}</span>;
    case 'time':
      return <span className="dtm-txt dtm-dimtxt">{row.time}</span>;
    case 'by':
      return (
        <span className="dtm-person">
          <span className="dtm-avatar" style={{ background: row.tint }}>
            {row.by.charAt(0)}
          </span>
          <span className="dtm-txt">{row.by}</span>
        </span>
      );
    case 'request':
      return <span className="dtm-txt dtm-clamp2">{row.request}</span>;
    case 'detail':
      return <span className="dtm-txt dtm-clamp2 dtm-dimtxt">{row.detail}</span>;
    case 'status':
      return (
        <span className={`dtm-chip dtm-chip-${row.status.tone}`}>
          {row.status.label}
        </span>
      );
    case 'note':
      // Empty until loading; shimmer bars while loading; text (staggered) when done.
      if (notes === 'idle') return null;
      if (notes === 'loading') {
        return (
          <span className="dtm-note-shimmer" aria-hidden>
            <span className="dtm-shbar" />
            <span className="dtm-shbar dtm-shbar-short" />
          </span>
        );
      }
      return (
        <span
          className="dtm-txt dtm-clamp2 dtm-note-text"
          style={{ '--d': `${rowIndex * NOTE_TEXT_STEP}ms` } as CSSProperties}
        >
          {row.note}
        </span>
      );
    default:
      return null;
  }
}

// --- Notes-column progress ring (Figma 3403:39597 "20%") --------------------
function ProgressRing({ pct }: { pct: number }) {
  const R = 7;
  const C = 2 * Math.PI * R;
  return (
    <span className="dtm-progress">
      <svg viewBox="0 0 18 18" className="dtm-progress-ring">
        <circle cx="9" cy="9" r={R} className="dtm-progress-track" />
        <circle
          cx="9"
          cy="9"
          r={R}
          className="dtm-progress-fill"
          style={{
            strokeDasharray: C,
            strokeDashoffset: C * (1 - pct / 100),
          }}
        />
      </svg>
      <span className="dtm-progress-pct">{pct}%</span>
    </span>
  );
}

/* =============================================================================
   Floating elements — rendered by ProductSuiteV5 in .dtm-floats layers so they
   spill OUTSIDE the clipped card (same main-UI + floats structure as Paper /
   Sheets / Slides). They pop in one by one once the Notes column has loaded.
   ========================================================================== */

// Pie-chart dashboard summary card (bottom-left).
const PIE_SEGMENTS = [
  { label: 'Inquery', pct: 8, color: '#2057b1' },
  { label: 'Bug', pct: 17, color: '#17b26a' },
  { label: 'Application', pct: 17, color: '#9053c2' },
  { label: 'IT support', pct: 17, color: '#599ef2' },
  { label: 'Others', pct: 17, color: '#eaaa08' },
  { label: 'Hardware', pct: 16, color: '#f2661e' },
  { label: 'Network', pct: 8, color: '#0ca678' },
];

export function DataTablePieCard() {
  return (
    <div className="dtm-piecard">
      <div className="dtm-piecard-title">IT Ticket Management</div>
      <div className="dtm-piecard-views">
        <span className="dtm-view"><Ico n="grid" />Ticket Submission Form</span>
        <span className="dtm-view"><Ico n="grid" />All Tickets</span>
        <span className="dtm-view dtm-view-active"><Ico n="chart" />Dashboard</span>
        <span className="dtm-piecard-spark"><img src="/Icon/ai-tag.svg" alt="AI" />Dashboard analysis</span>
        <span className="dtm-piecard-add"><Ico n="plus" />Add chart</span>
      </div>
      <div className="dtm-chartcard">
        <div className="dtm-chartcard-head">
          <span className="dtm-chartcard-title">IT ticket management chart</span>
          <span className="dtm-chartcard-tools">
            <img src="/Icon/ai-tag.svg" alt="AI" />
            <Ico n="filter" />
            <Ico n="settings" />
            <Ico n="more" />
          </span>
        </div>
        <Pie />
        <div className="dtm-legend">
          {PIE_SEGMENTS.map((s) => (
            <span key={s.label} className="dtm-legend-item">
              <span className="dtm-legend-dot" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Pie with leader-line labels arranged in a left / right column (Figma
// 3403:45188). The circle is deliberately ~36% of the card width, leaving a wide
// gutter each side so the labels sit fully inside the SVG (no clipping). The
// first four segments label to the right, the last three to the left — matching
// the design's fixed label layout rather than raw geometry.
const PIE_W = 440;
const PIE_H = 250;
const PIE_CX = 220;
const PIE_CY = 118;
const PIE_R = 80;
const LABEL_COL_R = PIE_W - 112; // right-column text x
const LABEL_COL_L = 112; // left-column text x
const LEADER_R = PIE_W - 116; // right-column elbow x
const LEADER_L = 116; // left-column elbow x

function Pie() {
  let acc = -90; // start at top, sweep clockwise
  const slices = PIE_SEGMENTS.map((s, i) => {
    const start = acc;
    const sweep = (s.pct / 100) * 360;
    acc += sweep;
    return { ...s, start, end: acc, mid: start + sweep / 2, right: i < 4 };
  });
  const pol = (ang: number, rad: number): [number, number] => {
    const a = (ang * Math.PI) / 180;
    return [PIE_CX + rad * Math.cos(a), PIE_CY + rad * Math.sin(a)];
  };
  return (
    <svg className="dtm-pie" viewBox={`0 0 ${PIE_W} ${PIE_H}`}>
      {slices.map((s) => {
        const [x1, y1] = pol(s.start, PIE_R);
        const [x2, y2] = pol(s.end, PIE_R);
        const large = s.end - s.start > 180 ? 1 : 0;
        const d = `M${PIE_CX} ${PIE_CY} L${x1.toFixed(1)} ${y1.toFixed(
          1,
        )} A${PIE_R} ${PIE_R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
        // Leader: circle edge → radial elbow → horizontal to the label column.
        const [px0, py0] = pol(s.mid, PIE_R);
        const [px1, py1] = pol(s.mid, PIE_R + 12);
        const elbowX = s.right ? LEADER_R : LEADER_L;
        const textX = s.right ? LABEL_COL_R : LABEL_COL_L;
        return (
          <g key={s.label}>
            <path d={d} fill={s.color} className="dtm-pie-slice" />
            <polyline
              points={`${px0.toFixed(1)},${py0.toFixed(1)} ${px1.toFixed(1)},${py1.toFixed(1)} ${elbowX},${py1.toFixed(1)}`}
              className="dtm-pie-leader"
              style={{ stroke: s.color }}
            />
            <text
              x={textX}
              y={py1 + 3}
              className="dtm-pie-label"
              textAnchor={s.right ? 'start' : 'end'}
            >
              {s.label} ({s.pct}%)
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// "Fill column with AI" field-configuration popover (right).
export function DataTableAiPopover() {
  return (
    <div className="dtm-aipop">
      <div className="dtm-aipop-field">
        <span className="dtm-aipop-label">Name</span>
        <span className="dtm-aipop-input">Summary</span>
      </div>
      <div className="dtm-aipop-field">
        <span className="dtm-aipop-label">Type</span>
        <span className="dtm-aipop-select">
          <span className="dtm-aipop-select-ic"><Ico n="textA" /></span>
          Text
          <span className="dtm-aipop-select-caret"><Ico n="chevronDown" /></span>
        </span>
      </div>
      <div className="dtm-aipop-fill">
        <div className="dtm-aipop-fill-head">
          <span className="dtm-aipop-fill-title">
            <img src="/Icon/ai-tag.svg" alt="AI" />
            Fill column with AI
          </span>
          <span className="dtm-toggle" data-on="true">
            <span className="dtm-toggle-knob" />
          </span>
        </div>
        <div className="dtm-aipop-prompt">
          Summarize{' '}
          <span className="dtm-aipop-token">
            Task, Request Detail, +1 <Ico n="chevronDown" />
          </span>
          , less than 50 words
        </div>
      </div>
      <div className="dtm-aipop-foot">
        <span className="dtm-ic dtm-dim"><Ico n="plus" /></span>
        <span className="dtm-ic dtm-dim"><Ico n="eye" /></span>
      </div>
    </div>
  );
}

// --- helpers ----------------------------------------------------------------
function rd(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties;
}

// --- Inline icons (Inter-weight stroke glyphs, 24 viewbox) ------------------
function Ico({ n }: { n: string }) {
  const p = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (n) {
    case 'back':
      return <svg {...p}><path d="M15 6l-6 6 6 6" /></svg>;
    case 'chevronDown':
      return <svg {...p}><path d="M6 9l6 6 6-6" /></svg>;
    case 'chevronRight':
      return <svg {...p}><path d="M9 6l6 6-6 6" /></svg>;
    case 'docAdd':
      return <svg {...p}><path d="M6 3h8l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" /><path d="M14 3v4h4M12 12v5M9.5 14.5h5" /></svg>;
    case 'star':
      return <svg {...p}><path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16.8 7.4 18.1l.9-5.1L4.5 9.5l5.2-.8z" /></svg>;
    case 'cloud':
      return <svg {...p}><path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.3A3.5 3.5 0 0117 18z" /></svg>;
    case 'lock':
      return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>;
    case 'link':
      return <svg {...p}><path d="M10 14a4 4 0 006 .5l2-2a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-6-.5l-2 2A4 4 0 0011.7 17l1-1" /></svg>;
    case 'sparkle':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M12 3l1.7 4.6L18.3 9.3 13.7 11 12 15.6 10.3 11 5.7 9.3 10.3 7.6z" />
          <path d="M18.4 14.2l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" />
        </svg>
      );
    case 'video':
      return <svg {...p}><rect x="3" y="6" width="13" height="12" rx="2.5" /><path d="M16 10l5-3v10l-5-3z" /></svg>;
    case 'comment':
      return <svg {...p}><path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3V6a1 1 0 011-1z" /></svg>;
    case 'more':
      return <svg {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>;
    case 'search':
      return <svg {...p}><circle cx="11" cy="11" r="6" /><path d="M20 20l-3.5-3.5" /></svg>;
    case 'plus':
      return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'grid':
      return <svg {...p}><rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M4 10h16M4 15h16M10 5v14" /></svg>;
    case 'chart':
      return <svg {...p}><path d="M12 3a9 9 0 109 9h-9z" /><path d="M12 3v9h9A9 9 0 0012 3z" /></svg>;
    case 'filter':
      return <svg {...p}><path d="M4 6h16l-6 7v5l-4 2v-7z" /></svg>;
    case 'sort':
      return <svg {...p}><path d="M7 5v14M7 19l-3-3M7 5l3 3M17 19V5M17 5l-3 3M17 19l3-3" /></svg>;
    case 'group':
      return <svg {...p}><rect x="4" y="4" width="16" height="6" rx="1.5" /><rect x="4" y="14" width="16" height="6" rx="1.5" /></svg>;
    case 'rows':
      return <svg {...p}><rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M4 10h16M4 14.5h16" /></svg>;
    case 'rowHeight':
      return <svg {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
    case 'palette':
      return <svg {...p}><path d="M12 3a9 9 0 000 18c1.4 0 2-1 2-2 0-1.5 1-2 2-2h1a3 3 0 003-3 8 8 0 00-8-9z" /><circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" /></svg>;
    case 'settings':
      return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5L19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5L19 5" /></svg>;
    case 'textA':
      return <svg {...p}><path d="M6 18L11 6l5 12M7.6 14h6.8" /></svg>;
    case 'clock':
      return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>;
    case 'person':
      return <svg {...p}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19a6.5 6.5 0 0113 0" /></svg>;
    case 'target':
      return <svg {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'eye':
      return <svg {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.5" /></svg>;
    default:
      return null;
  }
}

export type { RowData };
