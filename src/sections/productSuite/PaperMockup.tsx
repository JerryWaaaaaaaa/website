import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import './PaperMockup.css';

/* Live, animated reconstruction of the Zoom Paper document editor with its AI
   Companion side panel (Figma 3320-25918 — "paper"). Replaces the static Paper
   image in ProductSuiteV5's screen card.

   Per the design brief this mockup intentionally uses the Figma file's OWN type
   and colour system (Inter + the exact token hexes) rather than the site style
   guide — see PaperMockup.css.

   Intro sequence (plays once the section is in view AND Paper is active):
     1. the editor chrome staggers in (header / toolbar / footer),
     2. the right AI panel streams its blocks in one by one,
     3. the document body fills its two columns in parallel,
     4. after both finish: the floating comments / suggestions / history panels
        pop, the in-text underlines + highlight + selection wipe in, and the
        three collaborator cursor flags appear. */

const STAGE_W = 1280;

// Shared top-bar icon source (single set used across all product mockups).
const II = '/product-suite-assets/icons-interface';

// ---- Timing (everything is CSS-driven off the single data-enter gate; each
// animated element carries its own --d delay) -------------------------------
const PANEL_BASE = 360;
const PANEL_STEP = 240;
const panelDelay = (i: number) => PANEL_BASE + i * PANEL_STEP; // 360 … 2280
const PANEL_END = panelDelay(8);

const DOC_BASE = 420;
const DOC_STEP = 150;
const docDelay = (i: number) => DOC_BASE + i * DOC_STEP; // 420 … 2220
const DOC_END = docDelay(12);

// Floating panels + in-text decorations land strictly after BOTH streams finish.
const DECOR = Math.max(PANEL_END, DOC_END) + 300; // 2580

// Top-right presence stack: the three cursor-flag collaborators (ring = their
// flag colour) followed by the current user ("You", neutral ring). Photos are
// gender-matched to the names.
const AVATAR_STACK = [
  { src: '/avatars/diego.png', ring: 'var(--ppm-lavender)' }, // Dan
  { src: '/avatars/claire.png', ring: 'var(--ppm-pink)' }, // Erika Simmons
  { src: '/avatars/mei.png', ring: 'var(--ppm-yellow)' }, // Sonia Long
  { src: '/avatars/marcus.png', ring: '#94a3b8' }, // You
];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function PaperMockup({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [entered, setEntered] = useState(false);

  // Scale the fixed 2000x1084 stage to fill the (matching-aspect) screen card.
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

  // Flipping `entered` off when Paper isn't the active tab lets the sequence
  // replay on return; reduced motion just snaps to the end.
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
    <div className="ppm" ref={rootRef} data-enter={entered ? 'true' : 'false'}>
      <div className="ppm-stage" style={{ '--ppm-scale': scale } as CSSProperties}>
        {/* ===== main-ui: editor + AI panel ===== */}
        <div className="ppm-main">
          {/* ----- Left: the Paper editor ----- */}
          <div className="ppm-editor">
            {/* Title bar */}
            <div className="ppm-titlebar ppm-reveal" style={rd(0)}>
              <div className="ppm-tb-left">
                <span className="ppm-ic ppm-ic--btn"><img src={`${II}/left.svg`} alt="" /></span>
                <span className="ppm-doc-title">AI writing tools business proposal</span>
                <span className="ppm-ic ppm-tb-caret"><img src={`${II}/chevron-down.svg`} alt="" /></span>
                <span className="ppm-ic ppm-tb-dim ppm-tb-soft"><img src={`${II}/star.svg`} alt="" /></span>
                <span className="ppm-ic ppm-tb-dim ppm-tb-soft"><img src={`${II}/Saved.svg`} alt="" /></span>
              </div>
              <div className="ppm-tb-right">
                <span className="ppm-avatars">
                  {AVATAR_STACK.map((a) => (
                    <span key={a.src} className="ppm-avatar" style={{ background: a.ring }}>
                      <img src={a.src} alt="" />
                    </span>
                  ))}
                </span>
                <span className="ppm-share"><img src={`${II}/lock.svg`} alt="" />Share</span>
                <span className="ppm-ic ppm-tb-dim"><img src={`${II}/video-on.svg`} alt="" /></span>
                <span className="ppm-ic ppm-tb-dim"><img src={`${II}/Comment.svg`} alt="" /></span>
                <span className="ppm-ic ppm-tb-dim"><img src={`${II}/ellipsis.svg`} alt="" /></span>
              </div>
            </div>

            {/* Toolbar card: menu row + formatting row */}
            <div className="ppm-toolcard ppm-reveal" style={rd(120)}>
              <div className="ppm-menubar">
                {['File', 'Edit', 'View', 'Insert', 'Format', 'Design'].map((m) => (
                  <span key={m} className="ppm-menu-item">{m}</span>
                ))}
                <span className="ppm-menu-ai"><img src="/Icon/ai-tag.svg" alt="AI" />AI</span>
              </div>
              <div className="ppm-toolbar">
                <ToolGroup>
                  <Tb><Ico n="undo" /></Tb>
                  <Tb><Ico n="redo" /></Tb>
                </ToolGroup>
                <ToolGroup>
                  <Tb><Ico n="paint" /></Tb>
                  <Tb><Ico n="eraser" /></Tb>
                </ToolGroup>
                <ToolGroup>
                  <span className="ppm-tb-select">100% <Ico n="chevronDown" /></span>
                </ToolGroup>
                <ToolGroup>
                  <span className="ppm-tb-select">Body <Ico n="chevronDown" /></span>
                </ToolGroup>
                <ToolGroup>
                  <span className="ppm-tb-select ppm-tb-select--w">Arial <Ico n="chevronDown" /></span>
                  <span className="ppm-tb-select">12 <Ico n="chevronDown" /></span>
                </ToolGroup>
                <ToolGroup>
                  <Tb><span className="ppm-tb-glyph">A+</span></Tb>
                  <Tb><span className="ppm-tb-glyph">A−</span></Tb>
                </ToolGroup>
                <ToolGroup>
                  <Tb><span className="ppm-tb-glyph ppm-tb-b">B</span></Tb>
                  <Tb><span className="ppm-tb-glyph ppm-tb-i">I</span></Tb>
                  <Tb><span className="ppm-tb-glyph ppm-tb-u">U</span></Tb>
                  <Tb><span className="ppm-tb-glyph ppm-tb-s">S</span></Tb>
                </ToolGroup>
                <ToolGroup>
                  <Tb><Ico n="textColor" /></Tb>
                  <Tb><Ico n="highlighter" /></Tb>
                </ToolGroup>
                <ToolGroup>
                  <Tb><span className="ppm-tb-sup">x<sup>2</sup></span></Tb>
                  <Tb><span className="ppm-tb-sup">x<sub>2</sub></span></Tb>
                </ToolGroup>
                <ToolGroup>
                  <Tb><Ico n="more" /></Tb>
                </ToolGroup>
              </div>
            </div>

            {/* Document canvas + page */}
            <div className="ppm-canvas">
              <div className="ppm-page">
                <span className="ppm-corner ppm-corner--tl" />
                <span className="ppm-corner ppm-corner--tr" />

                {/* Title block */}
                <div className="ppm-pblock" style={dd(0)}>
                  <h1 className="ppm-doc-h1">Zoom Paper</h1>
                </div>

                <div className="ppm-pbody">
                  {/* Left column */}
                  <div className="ppm-pcol">
                    <div className="ppm-pblock" style={dd(2)}>
                      <h2 className="ppm-doc-h2">Introduction</h2>
                    </div>
                    <div className="ppm-pblock" style={dd(3)}>
                      <p className="ppm-doc-p ppm-underlined" style={rd(DECOR)}>
                        Zoom Paper is an AI-native, structured document editor designed
                        for professional writing and high-fidelity formatting. It bridges
                        the gap between fluid AI brainstorming and formal, print-ready
                        documentation.
                      </p>
                    </div>

                    <div className="ppm-pblock" style={dd(4)}>
                      <h2 className="ppm-doc-h2">Core Value Propositions</h2>
                    </div>
                    <ul className="ppm-doc-list">
                      <li className="ppm-doc-li ppm-pblock" style={dd(5)}>
                        <b><span className="ppm-hl" style={rd(DECOR)}>AI-Native Authoring:</span></b>{' '}
                        Move from thinking to professional document. AI Companion helps
                        draft structured outlines, refine language for specific audiences,
                        and summarize complex content while maintaining organizational
                        standards.
                      </li>
                      <li className="ppm-doc-li ppm-li--sel ppm-pblock" style={dd(6)}>
                        <span className="ppm-sel-bg" style={rd(DECOR + 60)} />
                        <span className="ppm-li-text">
                          <b>High-Fidelity Formatting:</b> Unlike basic text editors, it
                          offers true document pagination, consistent headers/footers, and
                          advanced structures like automatic tables of contents and
                          multi-level headings.
                        </span>
                      </li>
                      <li className="ppm-doc-li ppm-pblock" style={dd(7)}>
                        <b>Seamless Compatibility:</b> You can import existing documents
                        and export to industry-standard formats without losing structure.
                      </li>
                    </ul>
                  </div>

                  {/* Right column */}
                  <div className="ppm-pcol">
                    <div className="ppm-pblock" style={dd(8)}>
                      <p className="ppm-doc-p">
                        When you request an outline for a business proposal, it
                        automatically creates hierarchical headings, placeholder sections
                        for executive summaries, financial projections, and appendices.
                        Each section comes pre-formatted with appropriate styling, saving
                        hours of manual formatting work.
                      </p>
                    </div>
                    <div className="ppm-pblock" style={dd(9)}>
                      <h2 className="ppm-doc-h2">Advanced Capabilities and Use Cases</h2>
                    </div>
                    <div className="ppm-pblock" style={dd(10)}>
                      <p className="ppm-doc-p">
                        Beyond the basics, Zoom Paper excels in scenarios where traditional
                        document editors fall short. Its intelligent architecture
                        anticipates the needs of modern knowledge workers who operate in
                        fast-paced, collaborative environments.
                      </p>
                    </div>
                    <div className="ppm-pblock" style={dd(11)}>
                      <p className="ppm-doc-p">
                        The AI Companion doesn't just generate text—it understands document
                        structure and context. When you request an outline, it builds
                        hierarchical headings and placeholder sections for executive
                        summaries and financial projections.
                      </p>
                    </div>
                    <div className="ppm-pblock" style={dd(12)}>
                      <p className="ppm-doc-p">
                        Unlike generic AI writing tools, Zoom Paper understands your
                        document's purpose and audience. When refining content, you can
                        rely on consistent, print-ready output.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collaborator cursor flags (placed over the text) */}
                <Collab name="Dan" color="var(--ppm-lavender)" left={176} top={184} delay={DECOR + 120} />
                <Collab name="Erika Simmons" color="var(--ppm-pink)" left={150} top={400} delay={DECOR + 240} />
                <Collab name="Sonia Long" color="var(--ppm-yellow)" left={430} top={396} delay={DECOR + 180} />
              </div>
            </div>

            {/* Footer toolbar */}
            <div className="ppm-footer ppm-reveal" style={rd(240)}>
              <div className="ppm-foot-left">
                <span className="ppm-foot-words">
                  <Ico n="list" />Words: 324 <Ico n="chevronDown" />
                </span>
              </div>
              <div className="ppm-foot-right">
                <span className="ppm-foot-ic"><Ico n="help" /></span>
                <span className="ppm-foot-ic"><Ico n="splitView" /></span>
                <span className="ppm-foot-ic"><Ico n="fullscreen" /></span>
                <span className="ppm-foot-zoom">
                  <Ico n="minus" /><span>100%</span><Ico n="plus" />
                </span>
              </div>
            </div>
          </div>

          {/* ----- Right: the AI Companion panel ----- */}
          <div className="ppm-panel">
            <div className="ppm-panel-head ppm-reveal" style={rd(40)}>
              <span className="ppm-ic ppm-panel-edit"><Ico n="edit" /></span>
              <span className="ppm-panel-title">AI Companion</span>
              <span className="ppm-ic ppm-panel-close"><Ico n="close" /></span>
            </div>

            <div className="ppm-panel-body">
              <div className="ppm-usermsg ppm-pblock" style={pd(0)}>
                Create a one-page business proposal for adopting AI writing tools within a
                mid-sized company. Cover background, expected benefits, potential risks,
                and a simple rollout plan.
              </div>

              <p className="ppm-aimsg ppm-pblock" style={pd(1)}>
                I'll create a one-page business proposal on adopting AI writing tools for a
                mid-sized company. I'll first outline the key topics, then generate a
                concise draft.
              </p>

              <div className="ppm-task ppm-pblock" style={pd(2)}>
                <span className="ppm-task-check"><Ico n="check" /></span>
                <span className="ppm-task-text">
                  Research key considerations for adopting AI writing tools
                </span>
                <span className="ppm-task-caret"><Ico n="chevronDown" /></span>
              </div>

              <div className="ppm-tools">
                <div className="ppm-tool ppm-pblock" style={pd(3)}>
                  <Ico n="telescope" />
                  <span className="ppm-tool-kind">Research</span>
                  <span className="ppm-tool-desc">Create a structured outline for t…</span>
                </div>
                <div className="ppm-tool ppm-pblock" style={pd(4)}>
                  <Ico n="search" />
                  <span className="ppm-tool-kind">Parallel Search</span>
                  <span className="ppm-tool-desc">Define background and cu…</span>
                </div>
                <div className="ppm-tool ppm-pblock" style={pd(5)}>
                  <Ico n="search" />
                  <span className="ppm-tool-kind">Parallel Search</span>
                  <span className="ppm-tool-desc">Identify expected benefits…</span>
                </div>
                <div className="ppm-tool ppm-pblock" style={pd(6)}>
                  <Ico n="search" />
                  <span className="ppm-tool-kind">Parallel Search</span>
                  <span className="ppm-tool-desc">Assess potential risks and…</span>
                </div>
                <div className="ppm-tool ppm-pblock" style={pd(7)}>
                  <Ico n="search" />
                  <span className="ppm-tool-kind">Parallel Search</span>
                  <span className="ppm-tool-desc">Propose a simple rollout pl…</span>
                </div>
              </div>

              <div className="ppm-status ppm-pblock" style={pd(8)}>
                <span className="ppm-spinner" />
                <span className="ppm-status-text">
                  Generate a concise one-page business proposal draft based on the
                  research…
                </span>
              </div>
            </div>

            <div className="ppm-composer ppm-reveal" style={rd(160)}>
              <div className="ppm-composer-input">
                Describe your idea, or type / for more…
              </div>
              <div className="ppm-composer-row">
                <span className="ppm-ic ppm-composer-ic"><Ico n="globe" /></span>
                <span className="ppm-sources">
                  Sources<span className="ppm-sources-n">(2)</span>
                </span>
                <span className="ppm-send"><img src="/Icon/ai-tag.svg" alt="AI" /></span>
              </div>
            </div>
          </div>
        </div>
        {/* The three callout widgets (comments / suggestions / history) are
            rendered by ProductSuiteV5 in a float layer (.ppm-floats) that sits
            OUTSIDE the clipped card, so they spill past the editor edges — see
            PaperComments / PaperSuggestions / PaperHistory below. */}
      </div>
    </div>
  );
}

/* ===== Floating callout widgets — rendered by ProductSuiteV5 inside the
   .ppm-floats layer (outside the clipped card). Entrance + position are owned by
   that layer; these are markup only. ===== */

export function PaperComments() {
  return (
    <div className="ppm-comments">
      <div className="ppm-cmt-head">
        <div className="ppm-cmt-nav">
          <span className="ppm-cmt-navbtn"><Ico n="chevronUp" /></span>
          <span className="ppm-cmt-navbtn"><Ico n="chevronDown" /></span>
        </div>
        <div className="ppm-cmt-headr">
          <span className="ppm-ic"><Ico n="check" /></span>
          <span className="ppm-ic"><Ico n="more" /></span>
        </div>
      </div>
      <CommentThread
        avatar="/avatars/priya.png"
        name="Erika Simmons"
        quote="Zoom Paper is an AI-native, structured document editor…"
        text="Wow"
      />
      <CommentThread
        avatar="/avatars/claire.png"
        name="Claire Bennett"
        quote="AI-Native Authoring"
        text="Sounds good"
      />
      <div className="ppm-cmt-reply">
        <img className="ppm-cmt-reply-avatar" src="/avatars/mei.png" alt="" />
        <span className="ppm-cmt-reply-input">Reply…</span>
      </div>
    </div>
  );
}

export function PaperSuggestions() {
  return (
    <div className="ppm-suggestions">
      <div className="ppm-sug-label">Suggested</div>
      <div className="ppm-sug-item"><img src="/Icon/ai-tag.svg" alt="AI" />Improve writing</div>
      <div className="ppm-sug-item"><Ico n="edit" />Continue writing</div>
      <div className="ppm-sug-item"><Ico n="alignLong" />Make longer</div>
      <div className="ppm-sug-item"><Ico n="alignShort" />Make shorter</div>
      <div className="ppm-sug-item ppm-sug-item--active">
        <Ico n="tone" />Change tone to
        <span className="ppm-sug-chev"><Ico n="chevronRight" /></span>
      </div>
    </div>
  );
}

export function PaperHistory() {
  return (
    <div className="ppm-history">
      <div className="ppm-hist-pad">
        <div className="ppm-hist-tabs">
          <span className="ppm-hist-tab ppm-hist-tab--active">History</span>
          <span className="ppm-hist-tab">Named (2)</span>
        </div>
        <div className="ppm-hist-link">Compare any two histories</div>

        <div className="ppm-hist-group">
          <div className="ppm-hist-date"><Ico n="chevronDown" />Oct 28</div>
          <div className="ppm-hist-item ppm-hist-item--active">
            <div className="ppm-hist-line"><b>Zane</b> edited the document</div>
            <div className="ppm-hist-sub">15:27</div>
          </div>
        </div>
        <div className="ppm-hist-group">
          <div className="ppm-hist-date"><Ico n="chevronDown" />Oct 27</div>
          <div className="ppm-hist-item">
            <div className="ppm-hist-line"><b>Noah</b> edited the document</div>
            <div className="ppm-hist-sub">16:54</div>
          </div>
          <div className="ppm-hist-item">
            <div className="ppm-hist-line"><b>Liam</b> edited the document</div>
            <div className="ppm-hist-sub">11:45</div>
          </div>
        </div>
      </div>
      <div className="ppm-hist-foot">
        <span className="ppm-hist-foot-dot" />
        <span className="ppm-hist-foot-dot" />
        <span className="ppm-hist-foot-dot" />
      </div>
    </div>
  );
}

// --- small helpers ----------------------------------------------------------
function rd(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties;
}
function dd(i: number): CSSProperties {
  return { '--d': `${docDelay(i)}ms` } as CSSProperties;
}
function pd(i: number): CSSProperties {
  return { '--d': `${panelDelay(i)}ms` } as CSSProperties;
}

function ToolGroup({ children }: { children: ReactNode }) {
  return <span className="ppm-tg">{children}</span>;
}
function Tb({ children }: { children: ReactNode }) {
  return <span className="ppm-tb">{children}</span>;
}

function Collab({
  name,
  color,
  left,
  top,
  delay,
}: {
  name: string;
  color: string;
  left: number;
  top: number;
  delay: number;
}) {
  return (
    <span
      className="ppm-collab ppm-pop"
      style={{ left, top, '--cc': color, '--d': `${delay}ms` } as CSSProperties}
    >
      <span className="ppm-collab-caret" />
      <span className="ppm-collab-tag">{name}</span>
    </span>
  );
}

function CommentThread({
  avatar,
  name,
  quote,
  text,
}: {
  avatar: string;
  name: string;
  quote: string;
  text: string;
}) {
  return (
    <div className="ppm-cmt-thread">
      <div className="ppm-cmt-row">
        <img className="ppm-cmt-avatar" src={avatar} alt="" />
        <span className="ppm-cmt-name">{name}</span>
        <span className="ppm-cmt-time">Just now</span>
      </div>
      <div className="ppm-cmt-body">
        {/* Quotes the text actually marked (yellow) in the document. */}
        <div className="ppm-cmt-quote">
          <span className="ppm-cmt-quote-txt">{quote}</span>
        </div>
        <div className="ppm-cmt-text">{text}</div>
      </div>
    </div>
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
    case 'more':
      return <svg {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>;
    case 'sparkle':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M12 3l1.7 4.6L18.3 9.3 13.7 11 12 15.6 10.3 11 5.7 9.3 10.3 7.6z" />
          <path d="M18.4 14.2l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" />
        </svg>
      );
    case 'sparklePen':
      return (
        <svg {...p}>
          <path d="M5 19l9-9 1.8 1.8-9 9H5z" />
          <path d="M18 3l.8 2.2L21 6l-2.2.8L18 9l-.8-2.2L15 6l2.2-.8z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'lock':
      return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>;
    case 'undo':
      return <svg {...p}><path d="M9 7L5 11l4 4" /><path d="M5 11h9a5 5 0 010 10h-3" /></svg>;
    case 'redo':
      return <svg {...p}><path d="M15 7l4 4-4 4" /><path d="M19 11h-9a5 5 0 000 10h3" /></svg>;
    case 'paint':
      return <svg {...p}><path d="M5 11l8-8 5 5-8 8z" /><path d="M5 11l-1 6 6-1" /></svg>;
    case 'eraser':
      return <svg {...p}><path d="M8 18l-3-3a2 2 0 010-2.8l7-7a2 2 0 012.8 0l3 3a2 2 0 010 2.8L13 18z" /><path d="M8 18h11" /></svg>;
    case 'highlighter':
      return <svg {...p}><path d="M9 14l6-6 3 3-6 6H9z" /><path d="M6 20h5l-2-2H8z" fill="currentColor" stroke="none" /><path d="M14 7l3 3" /></svg>;
    case 'textColor':
      return <svg {...p}><path d="M7 16L11 6l4 10M8.4 13h5.2" /><rect x="5" y="19" width="14" height="2.4" rx="1" fill="currentColor" stroke="none" /></svg>;
    case 'edit':
      return <svg {...p}><path d="M5 19h3l9-9-3-3-9 9z" /><path d="M13.5 6.5l3 3" /></svg>;
    case 'close':
      return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'check':
      return <svg {...p}><path d="M6 12.5l3.8 3.8L18 8" /></svg>;
    case 'plus':
      return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'minus':
      return <svg {...p}><path d="M5 12h14" /></svg>;
    case 'list':
      return <svg {...p}><path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" /></svg>;
    case 'help':
      return <svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.4a2.4 2.4 0 014.4 1.3c0 1.6-2 1.8-2 3.2" /><path d="M12 17h.01" /></svg>;
    case 'splitView':
      return <svg {...p}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M12 5v14" /></svg>;
    case 'fullscreen':
      return <svg {...p}><path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" /></svg>;
    case 'globe':
      return <svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" /></svg>;
    case 'telescope':
      return <svg {...p}><path d="M4 13l11-5 2.5 5.5L6.5 18.5z" /><path d="M9 16l1.5 4M14 14.5l2.5 3.5" /><circle cx="18.5" cy="7.5" r="2" /></svg>;
    case 'search':
      return <svg {...p}><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5L20 20" /></svg>;
    case 'alignLong':
      return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case 'alignShort':
      return <svg {...p}><path d="M4 7h16M4 12h10M4 17h16" /></svg>;
    case 'tone':
      return <svg {...p}><path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="3.5" y="13" width="3.5" height="6" rx="1.4" /><rect x="17" y="13" width="3.5" height="6" rx="1.4" /></svg>;
    default:
      return null;
  }
}
