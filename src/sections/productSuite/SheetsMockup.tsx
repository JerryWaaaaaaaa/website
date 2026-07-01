import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import './SheetsMockup.css';

/* Live, animated reconstruction of the Zoom Sheets editor with its AI side
   panel (Figma 3374:89098 — "sheets"). Replaces the static Sheets video in
   ProductSuiteV5's screen card.

   Per the design brief this mockup intentionally uses the Figma file's OWN type
   and colour system (Inter / SF Pro + the exact token hexes) rather than the
   site style guide — see SheetsMockup.css.

   Intro sequence (plays once the section is in view AND Sheets is active):
     1. the editor chrome staggers in,
     2. the right AI panel streams its messages in one by one,
     3. the spreadsheet cells "generate" one by one (row-major),
     4. the chart draws and the collaborator selections / AI-formula tooltip pop. */

const STAGE_W = 1280;

// ---- Spreadsheet model -----------------------------------------------------
const GUTTER_W = 34;
type Col = { letter: string; label: string; w: number; align?: 'right' };
const COLS: Col[] = [
  { letter: 'A', label: 'Category', w: 112 },
  { letter: 'B', label: 'Item Name', w: 206 },
  { letter: 'C', label: 'Model / Specification', w: 232 },
  { letter: 'D', label: 'Unit Price', w: 104, align: 'right' },
  { letter: 'E', label: '', w: 116 },
  { letter: 'F', label: '', w: 116 },
  { letter: 'G', label: '', w: 116 },
  { letter: 'H', label: '', w: 116 },
];
const FILLED = 4; // columns A–D carry data; E–H are the empty cells the chart floats over
const SELECTED_COL = 3; // D — matches the "D4" reference in the formula bar
const ROW_H = 30;

// [Category, Item Name, Model/Specification, Unit Price]
const ROWS: string[][] = [
  ['Computers', 'Business Laptop – Entry Level', 'Core i5, 16GB RAM, 512GB SSD', '$950.00'],
  ['Computers', 'Business Laptop – Standard', 'Core i7, 16GB RAM, 1TB SSD', '$1,200.00'],
  ['Computers', 'Business Laptop – Premium', 'Core i7, 32GB RAM, 1TB SSD', '$1,730.00'],
  ['Computers', 'Desktop Workstation', 'Core i9, 64GB RAM, 2TB SSD', '$2,499.00'],
  ['Monitors', '27" QHD Monitor', '2560×1440, IPS Panel', '$329.00'],
  ['Monitors', '32" 4K Monitor', '3840×2160, IPS Panel', '$549.00'],
  ['Accessories', 'Wireless Keyboard & Mouse', '2.4GHz, Compact', '$79.00'],
  ['Accessories', 'Mechanical Keyboard', 'RGB, Hot-swappable', '$129.00'],
  ['Accessories', 'Wireless Mouse', 'Ergonomic, 4000 DPI', '$59.00'],
  ['Peripherals', 'Webcam HD 1080p', '60fps, Auto-focus', '$89.00'],
  ['Peripherals', 'Business Headset', 'Noise-cancelling, USB-C', '$149.00'],
  ['Network', 'Color Laser Printer', 'Duplex, 35 ppm', '$399.00'],
  ['Network', '24-Port Gigabit Switch', 'Managed, PoE+', '$219.00'],
];

// The green "header" row is grid row 0; data rows follow. Cells generate in
// row-major order, so the flat index for (gridRow, col) drives its stagger.
const GRID_ROWS = ROWS.length + 1;
const CELL_BASE = 880; // ms before the first cell generates
const CELL_STEP = 22; // ms between successive cells
const cellDelay = (gridRow: number, col: number) =>
  CELL_BASE + (gridRow * FILLED + col) * CELL_STEP;
const LAST_CELL_DELAY = cellDelay(GRID_ROWS - 1, FILLED - 1);

// ---- Right-panel messages (stream in one by one) ---------------------------
const PANEL_BASE = 360;
const PANEL_STEP = 280;
const panelDelay = (i: number) => PANEL_BASE + i * PANEL_STEP;

// ---- Collaborator cell selections (name tag + coloured outline) ------------
const COLLABS = [
  { name: 'Novak', color: '#AB81FC', row: 2, col: 2 }, // C, "Business Laptop – Standard" spec
  { name: 'Zihao', color: '#16b378', row: 5, col: 1 }, // B, "27" QHD Monitor"
  { name: 'Owen Hale', color: '#f59e0b', row: 8, col: 1 }, // B, "Mechanical Keyboard" (amber — keeps "You" blue distinct)
];
// Delay after which the collaborator + "You" selections fade in — strictly past
// the last cell's generation transition (start + 240ms) so they land on a
// finished table.
const SELECTION_DELAY = LAST_CELL_DELAY + 320;
function colLeft(col: number): number {
  let x = GUTTER_W;
  for (let i = 0; i < col; i++) x += COLS[i].w;
  return x;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function SheetsMockup({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [entered, setEntered] = useState(false);
  // The user's own ("You") cell selection — seeded on D4 to match the formula
  // bar; clicking any cell moves it.
  const [sel, setSel] = useState<{ row: number; col: number }>({
    row: 3,
    col: SELECTED_COL,
  });

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

  // Latch `revealed` the first time the section scrolls into view, so the intro
  // doesn't fire on load while it's still below the fold.
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

  // The whole intro is CSS-driven off the `data-enter` gate (every animated part
  // carries its own --d delay). Flipping it off when Sheets isn't the active tab
  // lets the sequence replay on return; reduced motion just snaps to the end.
  useEffect(() => {
    if (!active || !revealed) {
      setEntered(false);
      return;
    }
    if (prefersReducedMotion()) {
      setEntered(true);
      return;
    }
    // Next frame so the reset → animate transition actually re-triggers.
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [active, revealed]);

  return (
    <div className="shm" ref={rootRef} data-enter={entered ? 'true' : 'false'}>
      <div
        className="shm-stage"
        style={{ '--shm-scale': scale } as CSSProperties}
      >
        {/* ===== Left: the Sheets editor ===== */}
        <div className="shm-editor">
          {/* Title bar */}
          <div className="shm-titlebar shm-reveal" style={rd(0)}>
            <div className="shm-tb-left">
              <span className="shm-ic shm-ic--btn"><Ico n="back" /></span>
              <span className="shm-doc-title">
                Office IT Equipment Inventory &amp; Pricing 2026
              </span>
              <span className="shm-ic shm-tb-caret"><Ico n="chevronDown" /></span>
              <span className="shm-ic shm-tb-dim"><Ico n="star" /></span>
              <span className="shm-ic shm-tb-dim"><Ico n="cloud" /></span>
            </div>
            <div className="shm-tb-right">
              <img className="shm-tb-avatar" src="/avatars/marcus.png" alt="" />
              <span className="shm-share">
                <Ico n="lock" />
                Share
              </span>
              <span className="shm-ic shm-tb-dim"><Ico n="video" /></span>
              <span className="shm-ic shm-tb-dim"><Ico n="comment" /></span>
              <span className="shm-ic shm-tb-dim"><Ico n="branch" /></span>
              <span className="shm-ic shm-tb-dim"><Ico n="more" /></span>
              <span className="shm-ic shm-ai-spark"><Ico n="sparkle" /></span>
            </div>
          </div>

          {/* Menu bar */}
          <div className="shm-menubar shm-reveal" style={rd(60)}>
            {['File', 'Edit', 'Insert', 'Format', 'Data', 'View', 'Formula', 'Tools', 'Help'].map(
              (m) => (
                <span key={m} className="shm-menu-item">{m}</span>
              ),
            )}
            <span className="shm-menu-ai">
              <Ico n="sparkle" />
              AI
            </span>
          </div>

          {/* Formatting toolbar */}
          <div className="shm-toolbar shm-reveal" style={rd(120)}>
            <ToolGroup>
              <Tb><Ico n="undo" /></Tb>
              <Tb><Ico n="redo" /></Tb>
            </ToolGroup>
            <ToolGroup>
              <Tb><Ico n="print" /></Tb>
              <Tb><Ico n="paint" /></Tb>
            </ToolGroup>
            <ToolGroup>
              <span className="shm-tb-select">General <Ico n="chevronDown" /></span>
              <Tb><span className="shm-tb-glyph">%</span></Tb>
              <Tb><span className="shm-tb-glyph">.0</span></Tb>
              <Tb><span className="shm-tb-glyph">.00</span></Tb>
            </ToolGroup>
            <ToolGroup>
              <span className="shm-tb-select shm-tb-select--w">Arial <Ico n="chevronDown" /></span>
              <span className="shm-tb-select">12 <Ico n="chevronDown" /></span>
            </ToolGroup>
            <ToolGroup>
              <Tb><span className="shm-tb-glyph shm-tb-b">B</span></Tb>
              <Tb><span className="shm-tb-glyph shm-tb-i">I</span></Tb>
              <Tb><span className="shm-tb-glyph shm-tb-u">U</span></Tb>
              <Tb><span className="shm-tb-glyph shm-tb-s">S</span></Tb>
            </ToolGroup>
            <ToolGroup>
              <Tb><Ico n="textColor" /></Tb>
              <Tb><Ico n="fill" /></Tb>
              <Tb><Ico n="grid" /></Tb>
            </ToolGroup>
            <ToolGroup>
              <Tb><Ico n="alignLeft" /></Tb>
              <Tb><Ico n="alignMiddle" /></Tb>
              <Tb><Ico n="merge" /></Tb>
            </ToolGroup>
          </div>

          {/* Formula bar */}
          <div className="shm-formulabar shm-reveal" style={rd(170)}>
            <span className="shm-cellref">D4</span>
            <span className="shm-fx">fx</span>
            <span className="shm-formula-val">1730</span>
          </div>

          {/* Grid */}
          <div className="shm-gridwrap">
            <div className="shm-grid">
              {/* Column-letter strip */}
              <div className="shm-colletters shm-reveal" style={rd(220)}>
                <span className="shm-corner" />
                {COLS.map((c, ci) => (
                  <span
                    key={c.letter}
                    className="shm-colletter"
                    data-sel={ci === SELECTED_COL ? 'true' : 'false'}
                    style={{ width: c.w }}
                  >
                    {c.letter}
                  </span>
                ))}
              </div>

              {/* Rows (green header row + data rows) */}
              <div className="shm-rows">
                {/* Green formatted header row */}
                <Row index={0}>
                  {COLS.map((c, ci) => (
                    <Cell
                      key={c.letter}
                      col={c}
                      gridRow={0}
                      colIndex={ci}
                      header
                      onSelect={() => setSel({ row: 0, col: ci })}
                    >
                      {c.label}
                    </Cell>
                  ))}
                </Row>

                {ROWS.map((row, ri) => (
                  <Row key={ri} index={ri + 1}>
                    {COLS.map((c, ci) => (
                      <Cell
                        key={c.letter}
                        col={c}
                        gridRow={ri + 1}
                        colIndex={ci}
                        onSelect={() => setSel({ row: ri + 1, col: ci })}
                      >
                        {ci < FILLED ? row[ci] : ''}
                      </Cell>
                    ))}
                  </Row>
                ))}

                {/* Collaborator cell selections */}
                {COLLABS.map((cb) => (
                  <span
                    key={cb.name}
                    className="shm-collab"
                    style={
                      {
                        '--d': `${SELECTION_DELAY}ms`,
                        left: colLeft(cb.col),
                        top: cb.row * ROW_H,
                        width: COLS[cb.col].w,
                        height: ROW_H,
                        '--cc': cb.color,
                      } as CSSProperties
                    }
                  >
                    <span className="shm-collab-tag">{cb.name}</span>
                  </span>
                ))}

                {/* The user's own ("You") selection — moves on cell click. Fades
                    in with the collaborators; once visible, clicks just
                    reposition it (opacity already 1, so no re-fade). */}
                <span
                  className="shm-collab shm-collab--you"
                  style={
                    {
                      '--d': `${SELECTION_DELAY}ms`,
                      left: colLeft(sel.col),
                      top: sel.row * ROW_H,
                      width: COLS[sel.col].w,
                      height: ROW_H,
                      '--cc': 'var(--shm-blue)',
                    } as CSSProperties
                  }
                >
                  <span className="shm-collab-tag">You</span>
                </span>
              </div>

              {/* Floating chart object */}
              <div
                className="shm-chart shm-pop"
                style={{ '--d': `${LAST_CELL_DELAY + 120}ms` } as CSSProperties}
              >
                <div className="shm-chart-title">
                  Equipment Inventory - Equipment Type
                </div>
                <Chart entered={entered} />
              </div>
              {/* The "AI formula" tooltip is rendered by ProductSuiteV5 in a
                  float layer (.shm-floats) so it can spill outside the card —
                  see AiFormulaTooltip below. */}
            </div>
          </div>

          {/* Sheet tabs */}
          <div className="shm-sheettabs shm-reveal" style={rd(260)}>
            <span className="shm-ic shm-tab-ic"><Ico n="listTabs" /></span>
            <span className="shm-ic shm-tab-ic"><Ico n="plus" /></span>
            <span className="shm-sheettab shm-sheettab--active">
              Equipment Inventory <Ico n="chevronDown" />
            </span>
            <span className="shm-sheettab">Pricing Summary</span>
            <span className="shm-sheettab">Asset Notes</span>
          </div>
        </div>

        {/* ===== Right: the AI panel ===== */}
        <div className="shm-panel">
          <div className="shm-panel-head shm-reveal" style={rd(40)}>
            <span className="shm-ic shm-panel-menu"><Ico n="listTabs" /></span>
            <span className="shm-panel-title">Review Office Equipment Costs</span>
            <span className="shm-ic shm-panel-dim"><Ico n="edit" /></span>
            <span className="shm-ic shm-panel-dim"><Ico n="close" /></span>
          </div>

          <div className="shm-panel-body">
            <p className="shm-pblock shm-msg" style={pd(0)}>
              I'll create a comprehensive office IT equipment sheet with real-world
              market pricing from reliable sources. Let me research current market
              prices first, then generate the spreadsheet.
            </p>

            <div className="shm-pblock shm-step" style={pd(1)}>
              <span className="shm-step-check"><Ico n="check" /></span>
              <span className="shm-step-text">
                Read and analyze all uploaded documents to e…
              </span>
              <span className="shm-step-caret"><Ico n="chevronDown" /></span>
            </div>

            <div className="shm-pblock shm-substep" style={pd(2)}>
              <p className="shm-substep-text">
                Now let me read through your documents to extract the key
                information and core messages.
              </p>
              <div className="shm-srcchip">
                <Ico n="doc" />
                <span className="shm-srcchip-strong">Summary Document</span>
                <span className="shm-srcchip-div" />
                <span className="shm-srcchip-dim">Local Search: Office…</span>
              </div>
            </div>

            <div className="shm-pblock shm-step" style={pd(3)}>
              <span className="shm-step-check"><Ico n="check" /></span>
              <span className="shm-step-text">
                Generate price comparison spreadsheet with researched data
              </span>
            </div>

            <p className="shm-pblock shm-msg" style={pd(4)}>
              Perfect! I've created a comprehensive office IT equipment inventory
              sheet with real-world 2026 market pricing from reliable sources.
            </p>

            <p className="shm-pblock shm-msg" style={pd(5)}>
              All pricing is based on current 2026 market data from major vendors
              including Dell, HP, Lenovo, Logitech, Cisco, and others. The sheet
              includes automatic cost calculations and is formatted for easy
              reading and budget planning.
            </p>

            <div className="shm-pblock shm-filecard" style={pd(6)}>
              <span className="shm-filecard-ic">
                <img src="/Icon/product-sheet.svg" alt="" />
              </span>
              <span className="shm-filecard-name">Office IT Equipment Inventory…</span>
              <span className="shm-filecard-open">Opened <Ico n="chevronRight" /></span>
            </div>
          </div>

          {/* Composer */}
          <div className="shm-composer shm-reveal" style={rd(120)}>
            <div className="shm-composer-input">
              Describe idea, use @ for resources or / for skills…
            </div>
            <div className="shm-composer-row">
              <span className="shm-ic shm-composer-ic"><Ico n="plus" /></span>
              <span className="shm-sources">
                <Ico n="filter" />
                Sources<span className="shm-sources-n">(2)</span>
              </span>
              <span className="shm-send"><Ico n="arrowUp" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* The "AI formula" suggestion tooltip. Rendered by ProductSuiteV5 inside a
   float layer (.shm-floats) that sits OUTSIDE the clipped card, so it can
   overhang the sheet's bottom edge as in the Figma. Entrance + position are
   owned by that layer. */
export function AiFormulaTooltip() {
  return (
    <div className="shm-aiformula">
      <div className="shm-aiformula-head">
        <Ico n="sparkle" />
        AI formula
      </div>
      <div className="shm-aiformula-body">
        <span className="shm-caret" />Calculate the Total Cost for each equipment
        based on <span className="shm-token">Unit Price</span> and{' '}
        <span className="shm-token">Quantity</span>
      </div>
    </div>
  );
}

/* The AI "context" prompt card that floats over the top-left of the sheet — the
   procurement plans + file references that drove the generation (Figma 3374:85152).
   Rendered by ProductSuiteV5 in a .shm-floats layer. Inline flow (not flex) so the
   text + chips wrap naturally. */
export function SheetsContextCard() {
  return (
    <div className="shm-ctxcard">
      Based on procurement plans from{' '}
      <CtxChip icon="fileDoc" kind="doc">Procurement Sync</CtxChip>{' '}
      <CtxChip icon="fileSheet" kind="sheet">Weekly Review</CtxChip> and related{' '}
      <CtxChip icon="fileSheet" kind="sheet" trunc>
        IT procurement details from 2023 to 2025
      </CtxChip>{' '}
      to generate a structured sheet for core office IT equipment.
    </div>
  );
}

function CtxChip({
  icon,
  kind,
  trunc,
  children,
}: {
  icon: string;
  kind: 'doc' | 'sheet';
  trunc?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`shm-ctxchip${trunc ? ' shm-ctxchip--trunc' : ''}`}>
      <span className={`shm-ctxchip-ic shm-ctxchip-ic--${kind}`}>
        <Ico n={icon} />
      </span>
      <span className="shm-ctxchip-label">{children}</span>
    </span>
  );
}

// --- small helpers ----------------------------------------------------------
function rd(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties;
}
function pd(i: number): CSSProperties {
  return { '--d': `${panelDelay(i)}ms` } as CSSProperties;
}

function Row({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div className="shm-row" data-header={index === 0 ? 'true' : 'false'}>
      <span className="shm-rownum">{index + 1}</span>
      {children}
    </div>
  );
}

function Cell({
  col,
  gridRow,
  colIndex,
  header,
  onSelect,
  children,
}: {
  col: Col;
  gridRow: number;
  colIndex: number;
  header?: boolean;
  onSelect?: () => void;
  children: ReactNode;
}) {
  const empty = colIndex >= FILLED;
  // Only the filled A–D cells "generate"; the empty E–H cells just hold space.
  const style: CSSProperties = empty
    ? { width: col.w }
    : ({ width: col.w, '--d': `${cellDelay(gridRow, colIndex)}ms` } as CSSProperties);
  return (
    <span
      className={`shm-cell${empty ? ' shm-cell--empty' : ' shm-cell-anim shm-cell--click'}${
        header ? ' shm-cell--header' : ''
      }`}
      data-align={col.align === 'right' ? 'right' : 'left'}
      onClick={empty ? undefined : onSelect}
      style={style}
    >
      <span className="shm-cell-txt">{children}</span>
    </span>
  );
}

function ToolGroup({ children }: { children: ReactNode }) {
  return <span className="shm-tg">{children}</span>;
}
function Tb({ children }: { children: ReactNode }) {
  return <span className="shm-tb">{children}</span>;
}

// --- Animated line chart (blue spiky series + green flat series) ------------
const CHART_W = 408;
const CHART_H = 188;
const CHART_PAD = { l: 40, r: 12, t: 10, b: 18 };
const Y_MAX = 2500;
const BLUE = [950, 1750, 650, 2500, 950, 180, 420, 540, 180, 120, 90, 260, 320, 380, 520, 1900, 480];
const GREEN = [20, 30, 25, 40, 20, 15, 18, 22, 16, 12, 9, 14, 16, 18, 20, 30, 18];

function linePath(series: number[]): string {
  const n = series.length;
  const iw = CHART_W - CHART_PAD.l - CHART_PAD.r;
  const ih = CHART_H - CHART_PAD.t - CHART_PAD.b;
  return series
    .map((v, i) => {
      const x = CHART_PAD.l + (i / (n - 1)) * iw;
      const y = CHART_PAD.t + (1 - v / Y_MAX) * ih;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function Chart({ entered }: { entered: boolean }) {
  const ticks = [0, 500, 1000, 1500, 2000, 2500];
  const ih = CHART_H - CHART_PAD.t - CHART_PAD.b;
  return (
    <svg
      className="shm-chart-svg"
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      data-draw={entered ? 'true' : 'false'}
    >
      {ticks.map((t) => {
        const y = CHART_PAD.t + (1 - t / Y_MAX) * ih;
        return (
          <g key={t}>
            <line
              x1={CHART_PAD.l}
              x2={CHART_W - CHART_PAD.r}
              y1={y}
              y2={y}
              className="shm-chart-grid"
            />
            <text x={CHART_PAD.l - 6} y={y + 3} className="shm-chart-ylabel">
              {t}
            </text>
          </g>
        );
      })}
      <path d={linePath(GREEN)} className="shm-chart-line shm-chart-line--green" />
      <path d={linePath(BLUE)} className="shm-chart-line shm-chart-line--blue" />
    </svg>
  );
}

// --- Inline icons (Inter-weight stroke glyphs, 18px viewbox) ----------------
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
    case 'star':
      return <svg {...p}><path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16.8 7.4 18.1l.9-5.1L4.5 9.5l5.2-.8z" /></svg>;
    case 'cloud':
      return <svg {...p}><path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.3A3.5 3.5 0 0117 18z" /></svg>;
    case 'video':
      return <svg {...p}><rect x="3" y="6" width="13" height="12" rx="2.5" /><path d="M16 10l5-3v10l-5-3z" /></svg>;
    case 'comment':
      return <svg {...p}><path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3V6a1 1 0 011-1z" /></svg>;
    case 'branch':
      return <svg {...p}><circle cx="6" cy="6" r="2.2" /><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="8" r="2.2" /><path d="M6 8.2v7.6M8.2 7.2C12 7.5 15.8 7 15.8 10.2" /></svg>;
    case 'more':
      return <svg {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>;
    case 'sparkle':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M12 3l1.7 4.6L18.3 9.3 13.7 11 12 15.6 10.3 11 5.7 9.3 10.3 7.6z" />
          <path d="M18.4 14.2l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" />
        </svg>
      );
    case 'lock':
      return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>;
    case 'undo':
      return <svg {...p}><path d="M9 7L5 11l4 4" /><path d="M5 11h9a5 5 0 010 10h-3" /></svg>;
    case 'redo':
      return <svg {...p}><path d="M15 7l4 4-4 4" /><path d="M19 11h-9a5 5 0 000 10h3" /></svg>;
    case 'print':
      return <svg {...p}><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="7" rx="1.5" /><path d="M7 14h10v6H7z" /></svg>;
    case 'paint':
      return <svg {...p}><path d="M5 11l8-8 5 5-8 8z" /><path d="M5 11l-1 6 6-1" /></svg>;
    case 'textColor':
      return <svg {...p}><path d="M7 16L11 6l4 10M8.4 13h5.2" /><rect x="5" y="19" width="14" height="2.2" rx="1" fill="currentColor" stroke="none" /></svg>;
    case 'fill':
      return <svg {...p}><path d="M4 12l7-7 6 6-7 7a2 2 0 01-3 0l-3-3a2 2 0 010-3z" /><path d="M19 15c1.5 2 1.5 4-0 4s-1.5-2 0-4z" fill="currentColor" stroke="none" /></svg>;
    case 'grid':
      return <svg {...p}><rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M4 10h16M4 14h16M9 5v14M15 5v14" /></svg>;
    case 'alignLeft':
      return <svg {...p}><path d="M4 6h16M4 10h10M4 14h16M4 18h10" /></svg>;
    case 'alignMiddle':
      return <svg {...p}><path d="M12 4v16M6 9h12M8 15h8" /></svg>;
    case 'merge':
      return <svg {...p}><rect x="4" y="6" width="16" height="12" rx="1.5" /><path d="M12 6v12" /><path d="M8.5 12h7M13 9.5l2.5 2.5L13 14.5M11 9.5L8.5 12 11 14.5" /></svg>;
    case 'listTabs':
      return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case 'plus':
      return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'edit':
      return <svg {...p}><path d="M5 19h3l9-9-3-3-9 9z" /><path d="M13.5 6.5l3 3" /></svg>;
    case 'close':
      return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'check':
      return <svg {...p}><path d="M6 12.5l3.8 3.8L18 8" /></svg>;
    case 'doc':
      return <svg {...p}><path d="M5 7h14M5 12h14M5 17h9" /></svg>;
    case 'filter':
      return <svg {...p}><path d="M4 6h16l-6 7v5l-4 2v-7z" /></svg>;
    case 'arrowUp':
      return <svg {...p}><path d="M12 19V6M6 12l6-6 6 6" /></svg>;
    case 'fileDoc':
      return (
        <svg {...p}>
          <path d="M6 3h7l5 5v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M13 3v5h5" />
          <path d="M8.5 12.5h6M8.5 15.5h4" />
        </svg>
      );
    case 'fileSheet':
      return (
        <svg {...p}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 10h16M4 15h16M10 4v16" />
        </svg>
      );
    default:
      return null;
  }
}
