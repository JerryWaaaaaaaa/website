import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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

type Backdrop = 'gradient' | 'office' | 'desk' | 'photo';

type Step = {
  title: ReactNode;
  /** Plain-text title for assistive tech (the visual one carries decorations). */
  label: string;
  backdrop: Backdrop;
  /** 'canvas-*' = a slide canvas from the Figma frame; otherwise the key point media. */
  media: 'canvas-proposal' | 'canvas-collab' | number;
};

// Copy follows the Figma frame (200:75532); media for steps the frame doesn't
// draw reuses the key-point illustrations from /core-features.
const STEPS: Step[] = [
  {
    label: KEY_POINTS[0].title,
    title: KEY_POINTS[0].title,
    backdrop: 'office',
    media: 'canvas-proposal',
  },
  {
    label: 'Fully editable AI outputs',
    title: (
      <>
        <TitleBadge>missing from most AI slide tools</TitleBadge>
        <Underline>Fully editable</Underline> AI outputs
      </>
    ),
    backdrop: 'gradient',
    media: 1,
  },
  {
    label: KEY_POINTS[2].title,
    title: (
      <>
        <Highlight>Inline AI</Highlight>, right where you need it.
      </>
    ),
    backdrop: 'gradient',
    media: 'canvas-collab',
  },
  {
    label: KEY_POINTS[3].title,
    title: (
      <>
        Share live, <ScreenshareChip /> right in your meeting.
      </>
    ),
    backdrop: 'desk',
    media: 3,
  },
  { label: KEY_POINTS[4].title, title: KEY_POINTS[4].title, backdrop: 'gradient', media: 4 },
  { label: KEY_POINTS[5].title, title: KEY_POINTS[5].title, backdrop: 'photo', media: 5 },
];
const N = STEPS.length;

// Opacity of a title by its distance from the active one (Figma: 100/16/8/5%).
const FADE = [1, 0.16, 0.08, 0.05];

const CURSORS = [
  { name: 'Ashlee York', color: '#9053c2', svg: 'purple', x: 716.6, y: 545.4 },
  { name: 'Darrel Marquez', color: '#ffbf39', svg: 'gold', x: 929.4, y: 345.4 },
  { name: 'Maurice Lawson', color: '#f0607a', svg: 'red', x: 814.2, y: 127.8 },
  { name: 'Clara Arellano', color: '#ff5f0f', svg: 'orange', x: 604.6, y: 287.8 },
  { name: 'Sophia Mosley', color: '#007c7c', svg: 'teal', x: 87.8, y: 492.6 },
];

/** Slide canvas from the Figma frame: white card bleeding off the right edge. */
function SlideCanvas({ variant }: { variant: 'proposal' | 'collab' }) {
  return (
    <div className="v6-story-canvas">
      <img
        src={variant === 'collab' ? '/v6/story/slide-abc-corp.webp' : '/v6/story/slide-design-proposal.webp'}
        alt=""
      />
      {variant === 'collab' && (
        <>
          <div className="v6-story-editor">
            <span className="v6-story-editor-tag">
              <img src="/v6/story/avatar-john.png" alt="" />
              John Chen
            </span>
            <span className="v6-story-editor-box" />
          </div>
          {CURSORS.map((c) => (
            <span
              key={c.name}
              className="v6-story-cursor"
              style={
                {
                  '--x': `${(c.x / 1216) * 100}%`,
                  '--y': `${(c.y / 683.2) * 100}%`,
                  '--c': c.color,
                } as CSSProperties
              }
            >
              <span className="v6-story-cursor-arrow">
                <img src={`/v6/story/cursor-${c.svg}.svg`} alt="" />
              </span>
              <span className="v6-story-cursor-name">{c.name}</span>
            </span>
          ))}
        </>
      )}
    </div>
  );
}

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
                <img className="v6-story-backdrop" src={`/v6/story/bg-${s.backdrop}.webp`} alt="" />
                {typeof s.media === 'number' ? (
                  <div className="v6-story-illustration">
                    <StepMedia media={KEY_POINTS[s.media].media} isActive={isActive} />
                  </div>
                ) : (
                  <SlideCanvas variant={s.media === 'canvas-collab' ? 'collab' : 'proposal'} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
