import { useEffect, useRef, useState, type ReactNode } from 'react';
import { KEY_POINTS } from '../builtDifferentiate/keyPoints';
import { StepMedia } from '../builtDifferentiate/StepMedia';
import {
  Highlight,
  ScreenshareChip,
  TitleBadge,
  Underline,
} from '../builtDifferentiate/TitleDecorations';
import { PanelDot } from './AgentCta';
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

/**
 * V6 scroll story (Figma 200:75530).
 * Annotations: the whole section sticks on the view; as the user scrolls the
 * titles scroll and the image on the right changes with the active title.
 * A tall track hosts a 100vh sticky stage; an rAF loop maps the track's scroll
 * progress to a fractional step position that drives the title column.
 */
export function StoryV6() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const titleRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const activeRef = useRef(0);
  // Each title's decorations draw on the first time it becomes active.
  const [entered, setEntered] = useState<boolean[]>(() => STEPS.map((_, i) => i === 0));

  useEffect(() => {
    const track = trackRef.current;
    const list = listRef.current;
    if (!track || !list) return;
    let raf = 0;

    const paint = (pos: number) => {
      // Keep the active title at the column's anchor line: shift the list up
      // by the offset of the (fractional) active title.
      const lo = Math.floor(pos);
      const hi = Math.min(lo + 1, N - 1);
      const t = pos - lo;
      // Offsets are measured from the first title so the list's own top
      // padding (the anchor line) is preserved.
      const base = titleRefs.current[0]?.offsetTop ?? 0;
      const a = (titleRefs.current[lo]?.offsetTop ?? base) - base;
      const b = (titleRefs.current[hi]?.offsetTop ?? base) - base;
      list.style.transform = `translate3d(0, ${-(a + (b - a) * t)}px, 0)`;
      titleRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = Math.abs(i - pos);
        const f = Math.floor(d);
        const from = FADE[Math.min(f, 3)];
        const to = FADE[Math.min(f + 1, 3)];
        el.style.opacity = String(from + (to - from) * (d - f));
      });
    };

    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      const pos = progress * (N - 1);
      paint(pos);
      const next = Math.round(pos);
      if (next !== activeRef.current) {
        setPrev(activeRef.current);
        activeRef.current = next;
        setActive(next);
        setEntered((e) => (e[next] ? e : e.map((v, i) => v || i === next)));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="v6-story" ref={trackRef} aria-label="Key features">
      <div className="v6-story-stage">
        <PanelDot tone="blue" />
        <div className="v6-story-copy">
          <ol className="v6-story-list" ref={listRef}>
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                ref={(el) => {
                  titleRefs.current[i] = el;
                }}
                className="v6-story-title"
                data-active={i === active ? 'true' : undefined}
                data-enter={entered[i] ? 'true' : 'false'}
                aria-current={i === active ? 'step' : undefined}
              >
                <h3 aria-label={s.label}>{s.title}</h3>
              </li>
            ))}
          </ol>
        </div>

        <div className="v6-story-media" aria-hidden="true">
          {STEPS.map((s, i) => {
            const isActive = i === active;
            const isPrev = i === prev && prev !== active;
            return (
              <div
                key={s.label}
                className="v6-story-frame"
                data-active={isActive ? 'true' : undefined}
                style={{ opacity: isActive || isPrev ? 1 : 0, zIndex: isActive ? 2 : isPrev ? 1 : 0 }}
              >
                <StepMedia media={KEY_POINTS[i].media} isActive={isActive} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
