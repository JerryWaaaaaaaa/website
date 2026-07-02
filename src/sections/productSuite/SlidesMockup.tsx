import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import './SlidesMockup.css';

/* Live, animated reconstruction of the Zoom Slides editor (Figma 3321:29416).
   The eight slide artworks (Figma 3326:20627) are exported images that fill the
   thumbnail rail and the main canvas. When the Slides tab becomes active the
   chrome staggers in, slides "generate" one by one, and three collaborator
   cursors appear (a blue one tracking the real pointer, two looping). */

// slide-06 intentionally omitted (removed from the deck).
const SLIDES = [
  '/slides-mockup/slide-01.jpg',
  '/slides-mockup/slide-02.jpg',
  '/slides-mockup/slide-03.jpg',
  '/slides-mockup/slide-04.jpg',
  '/slides-mockup/slide-05.jpg',
  '/slides-mockup/slide-07.jpg',
  '/slides-mockup/slide-08.jpg',
];
const SLIDE_COUNT = SLIDES.length; // 7

const GEN_START = 700; // ms before the first slide generates
const GEN_STEP = 380; // ms between generated slides

// Floating vertical AI toolbar icons (top → bottom), from public/slides-mockup/product-icons.
const AI_TOOLS = ['ai.svg', 'zap-fast.svg', 'format.svg', 'help.svg'];

const TB = '/slides-mockup/product-icons/top-bar';
// Center toolbar cluster (left → right).
const TOOLS = ['text', 'image', 'shape', 'chart', 'table'];
const SHARE_LOCK = `${TB}/Share%20btn/lock/Line.svg`;

// Collaborator avatar stack — each with a colored presence ring.
const STACK = [
  { src: '/avatars/mei.png', ring: '#f97316' },
  { src: '/avatars/claire.png', ring: '#f59e0b' },
  { src: '/avatars/priya.png', ring: '#eab308' },
  { src: '/avatars/diego.png', ring: '#ec4899' },
  { src: '/avatars/marcus.png', ring: '#8b5cf6' },
];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function SlidesMockup({
  active,
  onReadyChange,
}: {
  active: boolean;
  onReadyChange?: (ready: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mouseCursorRef = useRef<HTMLDivElement | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [revealed, setRevealed] = useState(false); // section has scrolled into view
  const [entered, setEntered] = useState(false);
  const [genCount, setGenCount] = useState(0); // slides "created" so far (0..8)
  const [selected, setSelected] = useState(0); // slide shown large in the canvas

  // Scale the fixed 1280x720 stage to fill the (16:9) screen card.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const apply = () => setScale(el.clientWidth / 1280);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Latch `revealed` the first time the section scrolls into view, so the intro
  // doesn't fire on page load when it's still below the fold. (Opacity-0 of an
  // inactive tab doesn't affect IntersectionObserver, which is geometry-based.)
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

  // Entrance + "generate one by one" sequence. Plays only once the section is
  // in view AND Slides is the active tab; resetting otherwise lets it replay.
  useEffect(() => {
    if (!active || !revealed) {
      setEntered(false);
      setGenCount(0);
      setSelected(0);
      onReadyChange?.(false);
      return;
    }
    if (prefersReducedMotion()) {
      setEntered(true);
      setGenCount(SLIDE_COUNT);
      setSelected(SLIDE_COUNT - 1);
      onReadyChange?.(true);
      return;
    }

    const timers: number[] = [];
    setEntered(true);
    setGenCount(0);
    setSelected(0);
    onReadyChange?.(false);

    for (let i = 1; i <= SLIDE_COUNT; i++) {
      timers.push(
        window.setTimeout(() => {
          setGenCount(i);
          setSelected(i - 1); // canvas follows the newest slide
        }, GEN_START + (i - 1) * GEN_STEP),
      );
    }
    // The deck rests on the last generated slide once complete; signal ready so
    // the parent can stagger in the speaker-note / voice-over floats.
    timers.push(
      window.setTimeout(
        () => onReadyChange?.(true),
        GEN_START + (SLIDE_COUNT - 1) * GEN_STEP,
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, [active, revealed, onReadyChange]);

  // "You" cursor tracks the real pointer, but only shows while it's over the
  // slide image area. Written straight to the node (no React re-render),
  // rAF-throttled. ARROW_HOTSPOT nudges the PNG so its tip sits on the pointer.
  useEffect(() => {
    const root = rootRef.current;
    const cursor = mouseCursorRef.current;
    if (!root || !cursor) return;

    const ARROW_HOTSPOT = { x: 8, y: 6 };
    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    const flush = () => {
      raf = 0;
      if (!pending) return;
      cursor.style.transform = `translate(${pending.x - ARROW_HOTSPOT.x}px, ${pending.y - ARROW_HOTSPOT.y}px)`;
    };
    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pending = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const slide = slideRef.current?.getBoundingClientRect();
      const inside =
        !!slide &&
        e.clientX >= slide.left &&
        e.clientX <= slide.right &&
        e.clientY >= slide.top &&
        e.clientY <= slide.bottom;
      cursor.setAttribute('data-on', inside ? 'true' : 'false');
      if (!raf) raf = requestAnimationFrame(flush);
    };
    // Listen on window so the move always registers (the .slm root can be
    // shadowed by the scaled stage / pointer-events stacking). The inside-slide
    // check both positions and hides the cursor when off the product area.
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const pageLabel = `${String(selected + 1).padStart(2, '0')} / ${String(SLIDE_COUNT).padStart(2, '0')}`;

  return (
    <div className="slm" ref={rootRef} data-enter={entered ? 'true' : 'false'}>
      <div className="slm-stage" style={{ '--slm-scale': scale } as CSSProperties}>
        {/* Toolbar */}
        <div className="slm-bar slm-reveal" style={revealDelay(0)}>
          <div className="slm-bar-left">
            <span className="slm-back">
              <Icon name="chevron" />
            </span>
            Creative Design Portfolio
          </div>
          <div className="slm-tools">
            {TOOLS.map((t) => (
              <span key={t} className="slm-tool">
                <img src={`${TB}/${t}.svg`} alt="" />
              </span>
            ))}
          </div>
          <div className="slm-bar-right">
            <span className="slm-avatars">
              {STACK.map((a) => (
                <span key={a.src} className="slm-avatar" style={{ background: a.ring }}>
                  <img src={a.src} alt="" />
                </span>
              ))}
            </span>
            <span className="slm-share">
              <img src={SHARE_LOCK} alt="" />
              Share
            </span>
            <span className="slm-iconbtn">
              <img src={`${TB}/play.svg`} alt="" />
            </span>
            <span className="slm-iconbtn">
              <img src={`${TB}/Video.svg`} alt="" />
            </span>
            <span className="slm-iconbtn">
              <img src={`${TB}/more.svg`} alt="" />
            </span>
          </div>
        </div>

        <div className="slm-body">
          {/* Thumbnail rail */}
          <div className="slm-rail slm-reveal" style={revealDelay(120)}>
            {SLIDES.map((src, i) => (
              <div
                key={src}
                className="slm-thumb"
                data-on={i < genCount ? 'true' : 'false'}
                data-active={i === selected ? 'true' : 'false'}
              >
                <span className="slm-thumb-num">{i + 1}</span>
                <button
                  type="button"
                  className="slm-thumb-frame"
                  onClick={() => i < genCount && setSelected(i)}
                  tabIndex={-1}
                  aria-label={`Slide ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              </div>
            ))}
          </div>

          {/* Main canvas — the slide fills the panel with margin + rounded corners */}
          <div className="slm-canvas slm-reveal" style={revealDelay(220)}>
            {genCount === 0 && <div className="slm-canvas-empty" />}
            <div
              className="slm-slide"
              ref={slideRef}
              style={{ opacity: genCount === 0 ? 0 : 1 }}
            >
              {SLIDES.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  data-show={i === selected && genCount > 0 ? 'true' : 'false'}
                />
              ))}
              <div className="slm-page">{pageLabel}</div>
            </div>
            {/* Floating vertical AI toolbar */}
            <div className="slm-aibar slm-reveal" style={revealDelay(300)}>
              {AI_TOOLS.map((icon) => (
                <span key={icon} className="slm-aibar-btn">
                  <img
                    src={icon === 'ai.svg' ? '/Icon/ai-tag.svg' : `/slides-mockup/product-icons/${icon}`}
                    alt=""
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cursor overlay (screen-space px, above the scaled stage) */}
      <div className="slm-cursors">
        {/* "You" — follows the real pointer, but only over the slide image area. */}
        <div className="slm-cursor slm-cursor--mouse" ref={mouseCursorRef} data-on="false">
          <img src="/slides-mockup/cursors/user-cursor.png" alt="" />
        </div>
        {/* Two collaborator cursors roaming as if editing. */}
        <div className="slm-cursor slm-cursor--a">
          <img src="/slides-mockup/cursors/floating-cursor.png" alt="" />
        </div>
        <div className="slm-cursor slm-cursor--b">
          <img src="/slides-mockup/cursors/floating-cursor-1.png" alt="" />
        </div>
      </div>
    </div>
  );
}

function revealDelay(ms: number): CSSProperties {
  return { '--reveal-delay': `${ms}ms` } as CSSProperties;
}

/* --- Minimal inline toolbar icons (20px, stroke-based) ------------------ */
function Icon({ name }: { name: string }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'chevron':
      return (
        <svg {...p}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M12 3l1.8 4.9L18.7 9.7 13.8 11.5 12 16.4 10.2 11.5 5.3 9.7 10.2 7.9z" />
          <path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
        </svg>
      );
    case 'text':
      return (
        <svg {...p}>
          <path d="M5 6h14M12 6v12M9 18h6" />
        </svg>
      );
    case 'image':
      return (
        <svg {...p}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M5 17l4.5-4 3 2.5L16 11l3 3" />
        </svg>
      );
    case 'shapes':
      return (
        <svg {...p}>
          <rect x="4" y="11" width="9" height="9" rx="1.5" />
          <circle cx="16" cy="8" r="4" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...p}>
          <path d="M5 20V10M12 20V4M19 20v-7" />
        </svg>
      );
    case 'table':
      return (
        <svg {...p}>
          <rect x="4" y="5" width="16" height="14" rx="1.5" />
          <path d="M4 10h16M4 15h16M10 5v14" />
        </svg>
      );
    case 'share':
      return (
        <svg {...p} stroke="#fff" strokeWidth={1.8}>
          <path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
        </svg>
      );
    case 'play':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    case 'more':
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      );
    default:
      return null;
  }
}
