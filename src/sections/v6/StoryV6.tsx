import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { KEY_POINTS } from '../builtDifferentiate/keyPoints';
import { StepMedia } from '../builtDifferentiate/StepMedia';
import {
  Highlight,
  ScreenshareChip,
  TitleBadge,
  Underline,
} from '../builtDifferentiate/TitleDecorations';
import { PanelDot } from './AgentCta';
import { MeetingSelfView } from './MeetingSelfView';
import './StoryV6.css';

type Step = {
  title: ReactNode;
  /** Plain-text title for assistive tech (the visual one carries decorations). */
  label: string;
};

// Titles follow the Figma frame (200:75532); each step's image is the matching
// V5 "Built Different" key-point media (KEY_POINTS[i].media).
const STEPS: Step[] = [
  { label: KEY_POINTS[0].title, title: KEY_POINTS[0].title },
  {
    label: 'Fully editable AI outputs',
    title: (
      <>
        <TitleBadge>missing from most AI slide tools</TitleBadge>
        <Underline>Fully editable</Underline> AI outputs
      </>
    ),
  },
  {
    label: KEY_POINTS[2].title,
    title: (
      <>
        <Highlight>Inline AI</Highlight>, right where you need it.
      </>
    ),
  },
  {
    label: KEY_POINTS[3].title,
    title: (
      <>
        Share live, <ScreenshareChip /> right in your meeting.
      </>
    ),
  },
  { label: KEY_POINTS[4].title, title: KEY_POINTS[4].title },
  { label: KEY_POINTS[5].title, title: KEY_POINTS[5].title },
];
const N = STEPS.length;

// Opacity of a title by its distance from the active one (Figma: 100/16/8/5%).
const FADE = [1, 0.16, 0.08, 0.05];

// Titles kept above the active one; the other N - 1 - ABOVE trail below it.
const ABOVE = 2;
/** Slot of title i relative to the active one on the looping title ring. */
const ringPos = (i: number, active: number) => {
  const d = (i - active + N) % N;
  return d < N - ABOVE ? d : d - N;
};

/**
 * V6 key-features story (Figma 200:75530).
 * The titles are a vertical tab list: clicking one (or ↑/↓/Home/End) makes it
 * active, the titles slide so it sits on the anchor line (looping, like an
 * endless carousel), and the image on the
 * right crossfades to match. A vertical stack of dots on the left tracks the
 * active step like a slider and is clickable too.
 * The steps auto-advance (looping): the active bar fills over one dwell and its
 * animationend moves to the next step, so the fill and the advance share one
 * clock. It pauses while the section is off screen or the tab is hidden, and
 * doesn't run with reduced motion.
 */
export function StoryV6() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const titleRefs = useRef<(HTMLLIElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);

  const select = (next: number, focus = false) => {
    const i = (next + N) % N;
    if (focus) tabRefs.current[i]?.focus({ preventScroll: true });
    if (i === active) return;
    setPrev(active);
    setActive(i);
  };

  // Pause the auto-advance while the section is off screen or the tab is hidden.
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: '-20% 0px',
    });
    io.observe(el);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  const paused = !inView || hidden;

  const onFillEnd = (e: AnimationEvent) => {
    if (e.animationName === 'v6-story-fill') select((active + 1) % N);
  };

  // Lay the titles out as a ring around the active one (ABOVE before it, the
  // rest after), so the stack never runs out: as the story advances, the title
  // leaving the top repopulates at the bottom. Re-measured on resize, since
  // titles reflow with the column width.
  const lastRing = useRef<number[] | null>(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const place = () => {
      const els = titleRefs.current;
      const cs = getComputedStyle(list);
      const anchor = parseFloat(cs.paddingTop) || 0;
      const gap = parseFloat(cs.rowGap) || 0;
      const ring = STEPS.map((_, i) => ringPos(i, active));
      const at = (r: number) => ring.indexOf(r);
      const y: number[] = [];
      for (let r = 0, acc = 0; r < N - ABOVE; r++) {
        y[at(r)] = acc;
        acc += (els[at(r)]?.offsetHeight ?? 0) + gap;
      }
      for (let r = -1, acc = 0; r >= -ABOVE; r--) {
        acc -= (els[at(r)]?.offsetHeight ?? 0) + gap;
        y[at(r)] = acc;
      }
      // Titles slide by the same number of slots the active one moved; any
      // that would have to cross the ring's seam jump there instead of flying
      // across the column (they're at the faded edges, so it reads as a wrap).
      const prev = lastRing.current;
      const shift = prev ? prev[active] : 0;
      els.forEach((el, i) => {
        if (!el) return;
        const jump = !prev || prev[i] - shift !== ring[i];
        if (jump) el.style.transition = 'none';
        el.style.transform = `translate3d(0, ${anchor + y[i]}px, 0)`;
        if (jump) {
          void el.offsetHeight;
          el.style.transition = '';
        }
      });
      lastRing.current = ring;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(list);
    titleRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [active]);

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowUp: active - 1,
      Home: 0,
      End: N - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select(keys[e.key], true);
  };

  return (
    <section className="v6-story" aria-label="Key features" ref={sectionRef}>
      <div className="v6-story-stage">
        <PanelDot tone="blue" />
        <div
          className="v6-story-dots"
          aria-hidden="true"
          data-paused={paused ? 'true' : undefined}
        >
          {STEPS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              tabIndex={-1}
              className="v6-story-dot"
              data-active={i === active ? 'true' : undefined}
              onClick={() => select(i)}
              onAnimationEnd={i === active ? onFillEnd : undefined}
            />
          ))}
        </div>
        <div className="v6-story-copy">
          <ol
            className="v6-story-list"
            ref={listRef}
            role="tablist"
            aria-orientation="vertical"
            aria-label="Key features"
            onKeyDown={onKeyDown}
          >
            {STEPS.map((s, i) => {
              const isActive = i === active;
              return (
                <li
                  key={s.label}
                  ref={(el) => {
                    titleRefs.current[i] = el;
                  }}
                  role="presentation"
                  className="v6-story-title"
                  data-active={isActive ? 'true' : undefined}
                  // Decorations play their intro each time the title becomes
                  // active; inactive titles read as plain greyed-out text.
                  data-enter={isActive ? 'true' : 'false'}
                  style={{ opacity: FADE[Math.min(Math.abs(ringPos(i, active)), 3)] }}
                >
                  <h3>
                    <button
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`v6-story-tab-${i}`}
                      aria-selected={isActive}
                      aria-controls="v6-story-panel"
                      aria-label={s.label}
                      tabIndex={isActive ? 0 : -1}
                      className="v6-story-tab"
                      onClick={() => select(i)}
                    >
                      {s.title}
                    </button>
                  </h3>
                </li>
              );
            })}
          </ol>
        </div>

        <div
          className="v6-story-media"
          id="v6-story-panel"
          role="tabpanel"
          aria-labelledby={`v6-story-tab-${active}`}
        >
          {STEPS.map((s, i) => {
            const isActive = i === active;
            const isPrev = i === prev && prev !== active;
            return (
              <div
                key={s.label}
                className="v6-story-frame"
                data-active={isActive ? 'true' : undefined}
                aria-hidden="true"
                style={{ opacity: isActive || isPrev ? 1 : 0, zIndex: isActive ? 2 : isPrev ? 1 : 0 }}
              >
                <StepMedia
                  media={KEY_POINTS[i].media}
                  isActive={isActive}
                  meetingVideo={<MeetingSelfView className="v6-story-selfview" />}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
