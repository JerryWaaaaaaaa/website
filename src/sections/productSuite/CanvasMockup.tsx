import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import './CanvasMockup.css';

/* Live, animated reconstruction of the Zoom Docs (Canvas) editor
   (Figma Microsite-V2 node 3387-39788 — frame "canvas", 2000x1050; the editor
   "main-ui" is 1600x900). Replaces the flat canvas-website.mp4 in ProductSuiteV5's
   screen card.

   Per the design brief this mockup intentionally uses the Figma file's OWN type
   and colour system (Inter + the exact token hexes) rather than the site style
   guide — same exception SheetsMockup / PaperMockup take. See CanvasMockup.css.

   Intro sequence (plays once the section is in view AND Canvas is active):
     1. the editor is already THERE (top bar + empty doc surface appear with the
        card cross-fade — no per-chrome stagger),
     2. the document text fades in line by line (title → headings → list → callout
        → paragraph → database table), with the pink/yellow highlights and the
        "Maurice Lawson" collaborator flag wiping in just after their lines,
     3. after the text finishes, the three floating widgets pop in one by one —
        comments panel, then the polished-view menu, then the reaction — each
        floating OUTSIDE the editor card (rendered by ProductSuiteV5 in .cnv-floats). */

const STAGE_W = 1600;

// ---- Timing (everything CSS-driven off the single data-enter gate; each
// animated block carries its own --d delay) ---------------------------------
const LINE_BASE = 200;
const LINE_STEP = 150;
const lineDelay = (i: number) => LINE_BASE + i * LINE_STEP; // 0..11 → 200 … 1850

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function CanvasMockup({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [entered, setEntered] = useState(false);

  // Scale the fixed 1600x900 stage to fill the screen card by width.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const apply = () => setScale(el.clientWidth / STAGE_W);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Latch `revealed` the first time the section scrolls into view so the intro
  // doesn't fire while below the fold.
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

  // Flipping `entered` off when Canvas isn't active lets the sequence replay on
  // return; reduced motion snaps straight to the end.
  useEffect(() => {
    if (!active || !revealed) {
      setEntered(false);
      return;
    }
    if (prefersReducedMotion()) {
      setEntered(true);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [active, revealed]);

  return (
    <div className="cnv" ref={rootRef} data-enter={entered ? 'true' : 'false'}>
      <div className="cnv-stage" style={{ '--cnv-scale': scale } as CSSProperties}>
        {/* ===== Top bar (present at t=0) ===== */}
        <div className="cnv-topbar">
          <div className="cnv-tb-left">
            <span className="cnv-ic cnv-ic--btn"><Ico n="back" /></span>
            <span className="cnv-ic cnv-tb-dim"><Ico n="sidebar" /></span>
            <span className="cnv-doc-title">Mention improvement</span>
            <span className="cnv-ic cnv-tb-caret"><Ico n="chevronDown" /></span>
            <span className="cnv-ic cnv-tb-dim"><Ico n="star" /></span>
          </div>

          <div className="cnv-tb-tools">
            <span className="cnv-tg">
              <Tb><Ico n="undo" /></Tb>
              <Tb><Ico n="redo" /></Tb>
            </span>
            <span className="cnv-tg">
              <span className="cnv-tb-sel">Aa<Ico n="chevronDown" /></span>
            </span>
            <span className="cnv-tg">
              <Tb><span className="cnv-tb-glyph cnv-tb-b">B</span></Tb>
              <Tb><span className="cnv-tb-glyph cnv-tb-i">I</span></Tb>
              <Tb><span className="cnv-tb-glyph cnv-tb-u">U</span></Tb>
              <Tb><span className="cnv-tb-glyph cnv-tb-s">S</span></Tb>
            </span>
            <span className="cnv-tg">
              <Tb><span className="cnv-tb-a"><span className="cnv-tb-glyph">A</span><i /></span></Tb>
              <Tb><Ico n="chevronDown" /></Tb>
            </span>
            <span className="cnv-tg">
              <Tb><Ico n="link" /></Tb>
              <Tb><Ico n="code" /></Tb>
              <Tb><span className="cnv-tb-glyph cnv-tb-sigma">&Sigma;</span></Tb>
            </span>
            <span className="cnv-tg">
              <span className="cnv-tb-sel"><Ico n="align" /><Ico n="chevronDown" /></span>
            </span>
            <span className="cnv-tg cnv-tg--last">
              <Tb><Ico n="commentPlus" /></Tb>
              <span className="cnv-tb-add"><Ico n="plus" /></span>
              <Tb><Ico n="chevronUp" /></Tb>
            </span>
          </div>

          <div className="cnv-tb-right">
            <div className="cnv-tb-avatars">
              {['marcus', 'priya', 'claire', 'mei'].map((a) => (
                <img key={a} className="cnv-tb-avatar" src={`/avatars/${a}.png`} alt="" />
              ))}
              <img className="cnv-tb-avatar" src="/avatars/Avatar-1.png" alt="" />
            </div>
            <span className="cnv-share"><Ico n="lock" />Share</span>
            <span className="cnv-ic cnv-tb-dim"><Ico n="video" /></span>
            <span className="cnv-ic cnv-tb-dim"><Ico n="comment" /></span>
            <span className="cnv-ic cnv-tb-dim"><Ico n="export" /></span>
            <span className="cnv-ic cnv-tb-dim"><Ico n="more" /></span>
          </div>
        </div>

        {/* ===== Document ===== */}
        <div className="cnv-doc">
          <div className="cnv-doc-inner">
            <h1 className="cnv-h1 cnv-reveal" style={d(0)}>Mention improvement</h1>

            <h2 className="cnv-h2 cnv-reveal" style={d(1)}>Problem</h2>

            <ol className="cnv-ol">
              <li className="cnv-li cnv-reveal" style={d(2)}>
                <img className="cnv-li-avatar cnv-pop" src="/avatars/Avatar-2.png" alt="" style={dv(lineDelay(2))} />
                After&nbsp;
                <span className="cnv-hl cnv-hl--pink" style={dv(lineDelay(2) + 260)}>the mention featu</span>re went
                live, we discovered several shortcomings in its online performance. We plan to address these issues
                with unified optimizations.
                <Flag name="Maurice Lawson" delay={lineDelay(2) + 180} />
              </li>
              <li className="cnv-li cnv-reveal" style={d(3)}>
                <img className="cnv-li-avatar cnv-pop" src="/avatars/Avatar-3.png" alt="" style={dv(lineDelay(3))} />
                After integrating with Chat and Meeting, we can referen
                <span className="cnv-hl cnv-hl--yellow" style={dv(lineDelay(3) + 260)}>ce Meeting and Chann</span>el
                information within the document, enabling users to have a complete overview of all information within
                the Zoom workspace.
              </li>
            </ol>

            <h2 className="cnv-h2 cnv-reveal" style={d(4)}>Market Analysis</h2>

            <div className="cnv-callout cnv-reveal" style={d(5)}>
              <span className="cnv-callout-emoji">🦢</span>
              <p className="cnv-callout-text">
                The global smart gym equipment market is projected to grow at a CAGR of 7.2% from 2022-2027 to reach
                $14.74 billion.
              </p>
            </div>

            <p className="cnv-p cnv-reveal" style={d(6)}>
              Rising demand for effective home workouts and technology integration in fitness drives market growth.
              Target customers include home users, gyms, hotels and fitness studios. North America represents the
              largest regional opportunity, followed by EMEA and APAC.
            </p>

            <h2 className="cnv-h2 cnv-reveal" style={d(7)}>Market segments</h2>

            {/* Database view */}
            <div className="cnv-db-tabs cnv-reveal" style={d(8)}>
              <div className="cnv-db-views">
                <span className="cnv-db-view cnv-db-view--active"><Ico n="table" />Table</span>
                <span className="cnv-db-view"><Ico n="board" />Board</span>
                <span className="cnv-db-view"><Ico n="timeline" />Timeline</span>
                <span className="cnv-db-add"><Ico n="plus" /></span>
              </div>
              <div className="cnv-db-controls">
                <span className="cnv-ic"><Ico n="source" /></span>
                <span className="cnv-db-divider" />
                <span className="cnv-ic"><Ico n="filter" /></span>
                <span className="cnv-ic"><Ico n="sort" /></span>
                <span className="cnv-ic"><Ico n="group" /></span>
                <span className="cnv-ic"><Ico n="columns" /></span>
                <span className="cnv-ic"><Ico n="search" /></span>
                <span className="cnv-db-plus"><Ico n="plus" /></span>
              </div>
            </div>

            <div className="cnv-table">
              <div className="cnv-tr cnv-tr--head cnv-reveal" style={d(9)}>
                <span className="cnv-th cnv-cell--check"><span className="cnv-check" /></span>
                <span className="cnv-th"><Ico n="typeText" />Market</span>
                <span className="cnv-th"><Ico n="typeText" />Market Size</span>
                <span className="cnv-th"><Ico n="typeSelect" />Growth Rate</span>
                <span className="cnv-th"><Ico n="typeText" />Customer Persona</span>
                <span className="cnv-th cnv-cell--add"><Ico n="plus" /></span>
              </div>

              <div className="cnv-tr cnv-reveal" style={d(10)}>
                <span className="cnv-td cnv-cell--check"><span className="cnv-row-n">1</span></span>
                <span className="cnv-td cnv-td--strong">United States</span>
                <span className="cnv-td">$3.5B annual market. Steady 5% growth.</span>
                <span className="cnv-td"><span className="cnv-pill cnv-pill--blue">5% year-over-year growth</span></span>
                <span className="cnv-td">Middle to high income fitness enthusiasts. Drawn to innovative technology.</span>
                <span className="cnv-td cnv-cell--add" />
              </div>

              <div className="cnv-tr cnv-reveal" style={d(11)}>
                <span className="cnv-td cnv-cell--check"><span className="cnv-row-n">2</span></span>
                <span className="cnv-td cnv-td--strong">Europe</span>
                <span className="cnv-td">$2.2B annual market across EU. Faster adoption in Nordic countries.</span>
                <span className="cnv-td"><span className="cnv-pill cnv-pill--orange">8% projected annual growth</span></span>
                <span className="cnv-td">Urban millennials looking for both in-gym and home options.</span>
                <span className="cnv-td cnv-cell--add" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Floating widgets — rendered by ProductSuiteV5 inside the .cnv-floats
   layer (outside the clipped card). Entrance + position are owned by that layer;
   these are markup only. ===== */

export function CanvasPolishedMenu() {
  return (
    <div className="cnv-polished">
      <div className="cnv-pol-item">
        <span className="cnv-pol-ic"><Ico n="file" /></span>
        <div className="cnv-pol-text">
          <div className="cnv-pol-title">Original</div>
          <div className="cnv-pol-sub">Original page</div>
        </div>
      </div>
      <div className="cnv-pol-item cnv-pol-item--active">
        <span className="cnv-pol-ic cnv-pol-ic--magic"><Ico n="magic" /></span>
        <div className="cnv-pol-text">
          <div className="cnv-pol-title">Polished</div>
          <div className="cnv-pol-sub">Easy to read, view-only</div>
        </div>
      </div>
      <div className="cnv-pol-item">
        <span className="cnv-pol-ic"><Ico n="editSquare" /></span>
        <div className="cnv-pol-text">
          <div className="cnv-pol-title">Edit polished view</div>
        </div>
      </div>
    </div>
  );
}

export function CanvasComments() {
  return (
    <div className="cnv-comments">
      <div className="cnv-cm-tabs">
        <span className="cnv-cm-tab cnv-cm-tab--active">Discussion</span>
        <span className="cnv-cm-tab">For me</span>
      </div>

      <div className="cnv-cm-item">
        <div className="cnv-cm-row">
          <img className="cnv-cm-avatar" src="/avatars/marcus.png" alt="" />
          <span className="cnv-cm-name">Carlos Washington</span>
          <span className="cnv-cm-time">Today, 10:02 AM</span>
        </div>
        <div className="cnv-cm-block">
          <div className="cnv-cm-quote">Docs notification type settings</div>
          <div className="cnv-cm-text">This leads to Docs growth</div>
        </div>
        <div className="cnv-cm-reacts">
          <span className="cnv-cm-react">👏 13</span>
          <span className="cnv-cm-react">👍 28</span>
          <span className="cnv-cm-react">🎉 8</span>
        </div>
      </div>

      <div className="cnv-cm-item">
        <div className="cnv-cm-row">
          <img className="cnv-cm-avatar" src="/avatars/priya.png" alt="" />
          <span className="cnv-cm-name">Hester Wilson</span>
          <span className="cnv-cm-time">Yesterday, 02:45 PM</span>
        </div>
        <div className="cnv-cm-block">
          <div className="cnv-cm-text">
            Add new AC entry point <span className="cnv-cm-mention">@Sophia</span>
          </div>
        </div>
      </div>

      <div className="cnv-cm-item cnv-cm-item--active">
        <div className="cnv-cm-actionbar">
          <div className="cnv-cm-navs">
            <span className="cnv-cm-navbtn"><Ico n="chevronUp" /></span>
            <span className="cnv-cm-navbtn"><Ico n="chevronDown" /></span>
          </div>
          <div className="cnv-cm-actions">
            <span className="cnv-cm-actbtn cnv-cm-actbtn--on"><Ico n="check" /></span>
            <span className="cnv-cm-actbtn"><Ico n="close" /></span>
            <span className="cnv-cm-actbtn"><Ico n="more" /></span>
          </div>
        </div>
        <div className="cnv-cm-row">
          <img className="cnv-cm-avatar" src="/avatars/claire.png" alt="" />
          <span className="cnv-cm-name">Erika Simmons</span>
          <span className="cnv-cm-time">Yesterday, 04:29</span>
        </div>
        <div className="cnv-cm-block">
          <div className="cnv-cm-sugg"><span className="cnv-cm-add-tag">Add</span> “line breaks”</div>
          <div className="cnv-cm-sugg"><span className="cnv-cm-add-tag">Add</span> “Notification CTR improvement”</div>
        </div>
        <div className="cnv-cm-reply">
          <img className="cnv-cm-reply-avatar" src="/avatars/mei.png" alt="" />
          <span className="cnv-cm-reply-input">Reply...</span>
        </div>
      </div>
    </div>
  );
}

export function CanvasReaction() {
  return (
    <div className="cnv-reaction">
      <span className="cnv-reaction-emoji">👍</span>
      <Star className="cnv-star cnv-star--a" />
      <Star className="cnv-star cnv-star--b" />
      <Star className="cnv-star cnv-star--c" />
    </div>
  );
}

// --- small helpers ----------------------------------------------------------
function d(i: number): CSSProperties {
  return { '--d': `${lineDelay(i)}ms` } as CSSProperties;
}
function dv(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties;
}

function Tb({ children }: { children: ReactNode }) {
  return <span className="cnv-tb">{children}</span>;
}

function Flag({ name, delay }: { name: string; delay: number }) {
  return (
    <span className="cnv-flag cnv-pop" style={dv(delay)}>
      <span className="cnv-flag-caret" />
      <span className="cnv-flag-tag">{name}</span>
    </span>
  );
}

function Star({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 1c.6 5.8 4.2 9.4 10 10-5.8.6-9.4 4.2-10 10-.6-5.8-4.2-9.4-10-10 5.8-.6 9.4-4.2 10-10z"
        fill="url(#cnv-star-grad)"
      />
      <defs>
        <linearGradient id="cnv-star-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0" stopColor="#9a86ff" />
          <stop offset="1" stopColor="#5b8cff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// --- Inline icons (Inter-weight stroke glyphs, 24px viewbox) ----------------
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
    case 'chevronUp':
      return <svg {...p}><path d="M6 15l6-6 6 6" /></svg>;
    case 'sidebar':
      return <svg {...p}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M10 5v14" /></svg>;
    case 'star':
      return <svg {...p}><path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16.8 7.4 18.1l.9-5.1L4.5 9.5l5.2-.8z" /></svg>;
    case 'video':
      return <svg {...p}><rect x="3" y="6" width="13" height="12" rx="2.5" /><path d="M16 10l5-3v10l-5-3z" /></svg>;
    case 'comment':
      return <svg {...p}><path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3V6a1 1 0 011-1z" /></svg>;
    case 'commentPlus':
      return <svg {...p}><path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3V6a1 1 0 011-1z" /><path d="M12 8.5v5M9.5 11h5" /></svg>;
    case 'more':
      return <svg {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>;
    case 'lock':
      return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>;
    case 'undo':
      return <svg {...p}><path d="M9 7L5 11l4 4" /><path d="M5 11h9a5 5 0 010 10h-3" /></svg>;
    case 'redo':
      return <svg {...p}><path d="M15 7l4 4-4 4" /><path d="M19 11h-9a5 5 0 000 10h3" /></svg>;
    case 'link':
      return <svg {...p}><path d="M10 14a4 4 0 015.7 0l1.6-1.6a4 4 0 00-5.7-5.7L10 8.3" /><path d="M14 10a4 4 0 01-5.7 0L6.7 11.6a4 4 0 005.7 5.7L14 15.7" /></svg>;
    case 'code':
      return <svg {...p}><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" /></svg>;
    case 'align':
      return <svg {...p}><path d="M4 6h16M4 10h11M4 14h16M4 18h11" /></svg>;
    case 'plus':
      return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'export':
      return <svg {...p}><path d="M12 15V4M8.5 7.5L12 4l3.5 3.5" /><path d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" /></svg>;
    case 'check':
      return <svg {...p}><path d="M6 12.5l3.8 3.8L18 8" /></svg>;
    case 'close':
      return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'search':
      return <svg {...p}><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5L20 20" /></svg>;
    case 'table':
      return <svg {...p}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 10h16M10 10v9" /></svg>;
    case 'board':
      return <svg {...p}><rect x="4" y="5" width="6" height="14" rx="1.5" /><rect x="14" y="5" width="6" height="9" rx="1.5" /></svg>;
    case 'timeline':
      return <svg {...p}><path d="M4 8h9M4 12h14M4 16h6" /></svg>;
    case 'filter':
      return <svg {...p}><path d="M4 6h16l-6 7v5l-4 2v-7z" /></svg>;
    case 'sort':
      return <svg {...p}><path d="M7 5v14M7 19l-3-3M7 5l3 3M17 19V5M17 5l3 3M17 19l-3-3" /></svg>;
    case 'group':
      return <svg {...p}><rect x="4" y="5" width="16" height="5" rx="1.5" /><rect x="4" y="14" width="16" height="5" rx="1.5" /></svg>;
    case 'columns':
      return <svg {...p}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M9 5v14M15 5v14" /></svg>;
    case 'source':
      return <svg {...p}><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
    case 'typeText':
      return <svg {...p}><path d="M6 7h12M12 7v10M9.5 17h5" /></svg>;
    case 'typeSelect':
      return <svg {...p}><circle cx="12" cy="12" r="7.5" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></svg>;
    case 'file':
      return <svg {...p}><path d="M7 4h7l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z" /><path d="M14 4v4h4" /></svg>;
    case 'magic':
      return (
        <svg {...p}>
          <path d="M5 19l9-9" />
          <path d="M13 5l.8 2.2L16 8l-2.2.8L13 11l-.8-2.2L10 8l2.2-.8z" fill="currentColor" stroke="none" />
          <path d="M18.5 12l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'editSquare':
      return <svg {...p}><path d="M5 19h3l9-9-3-3-9 9z" /><path d="M13.5 6.5l3 3" /></svg>;
    default:
      return null;
  }
}
