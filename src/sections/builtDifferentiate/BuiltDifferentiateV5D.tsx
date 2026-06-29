import { useEffect, useRef, useState } from 'react';
import { KEY_POINTS } from './keyPoints';
import { StepMedia } from './StepMedia';
import { useRevealOnce } from './useRevealOnce';
import './reveal.css';
import './BuiltDifferentiateV5D.css';

const N = KEY_POINTS.length;

// Vertical wheel: cards travel along a circular arc (the wheel turns) but each
// card stays flat/upright — no per-card rotation. `d` is the fractional
// distance from the centered card.
const R = 1000; // wheel radius — spacing = R*sin(30°) = 500px > 448px card height so cards clear
const STEP = 30; // degrees between adjacent cards (arc spacing only)
const SLOT = 300; // px between copy lines, mirrors --bd5d-slot

function wheelTransform(d: number): string {
  const rad = (d * STEP * Math.PI) / 180;
  const x = R * (1 - Math.cos(rad)); // cards bow toward the rim as they leave center
  const y = R * Math.sin(rad); // vertical travel along the wheel
  return `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
}

export function BuiltDifferentiateV5D() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const copyListRef = useRef<HTMLDivElement | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Scroll-linked position lives in a ref (not state) so the per-frame transform
  // writes never re-render React. Only the discrete active step is state.
  const posRef = useRef(0);
  const activeRef = useRef(0);
  const idleTimer = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  // Latches per copy line the first time it becomes active, so each title's
  // decorations draw on once.
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    KEY_POINTS.map((_, i) => i === 0)
  );
  // The pinned box fades + scales in the first time it scrolls into view.
  const { ref: boxRef, revealed: enteredBox } = useRevealOnce<HTMLDivElement>();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;

    const paint = (pos: number) => {
      // Left copy column translates up one slot per step.
      const list = copyListRef.current;
      if (list) list.style.transform = `translateY(${-pos * SLOT}px)`;

      for (let i = 0; i < N; i++) {
        const copy = copyRefs.current[i];
        if (copy) {
          const ad = Math.abs(i - pos);
          copy.style.opacity = String(Math.max(0, 1 - ad * 0.75));
        }

        const card = cardRefs.current[i];
        if (card) {
          const o = i - pos;
          const ao = Math.abs(o);
          const clamped = Math.min(ao, 2);
          const hidden = ao > 2.2;
          card.style.transform = wheelTransform(o);
          card.style.opacity = hidden ? '0' : String(Math.max(0, 1 - clamped * 0.42));
          card.style.zIndex = String(N - Math.round(ao));
          card.style.visibility = hidden ? 'hidden' : 'visible';
        }
      }
    };

    const update = () => {
      raf = 0;
      // Single page scroller: derive the step position from the track's offset
      // in the viewport. rect.top runs from 0 (pin engaged) to -scrollable.
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const pos =
        scrollable <= 0
          ? 0
          : Math.min(Math.max(-rect.top / scrollable, 0), 1) * (N - 1);

      posRef.current = pos;
      paint(pos);

      const active = Math.round(pos);
      if (active !== activeRef.current) {
        activeRef.current = active;
        setActiveIndex(active);
        setRevealed((prev) => {
          if (prev[active]) return prev;
          const next = [...prev];
          next[active] = true;
          return next;
        });
      }
    };

    const onScroll = () => {
      // Promote the cards to their own layers only while actively scrolling, and
      // drop the hint once motion settles so idle cards don't hold GPU memory.
      const wheel = wheelRef.current;
      if (wheel) wheel.classList.add('is-scrolling');
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        wheelRef.current?.classList.remove('is-scrolling');
      }, 200);

      if (raf === 0) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <section className="bd5d-section">
      {/* Tall track on the page scroller: the pin stays fixed while N full-height
          snap stops below it make the page rest on one step at a time. */}
      <div className="bd5d-track" ref={trackRef}>
        <div className="bd5d-pin">
          <div
            className="bd5d-box"
            ref={boxRef}
            data-enter={enteredBox ? 'true' : 'false'}
          >
            <div className="bd5d-inner">
            {/* Left: copy lines that step upward one-by-one. */}
            <div className="bd5d-copy-col">
              <div className="bd5d-copy-list" ref={copyListRef}>
                {KEY_POINTS.map((point, i) => (
                  <div
                    key={point.title}
                    ref={(el) => {
                      copyRefs.current[i] = el;
                    }}
                    className={`bd5d-copy${i === activeIndex ? ' is-active' : ''}`}
                    data-enter={revealed[i] ? 'true' : 'false'}
                    aria-hidden={i === activeIndex ? undefined : true}
                  >
                    <h3 className="bd5d-copy-title">{point.titleNode ?? point.title}</h3>
                    <p className="bd5d-copy-body">{point.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: vertical wheel carousel, masked to fade at top/bottom. */}
            <div className="bd5d-carousel" aria-hidden="true">
              <div className="bd5d-wheel" ref={wheelRef}>
                {KEY_POINTS.map((point, i) => (
                  <div
                    key={point.title}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className={`bd5d-card${i === activeIndex ? ' is-active' : ''}`}
                  >
                    <StepMedia media={point.media} isActive={i === activeIndex} />
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Full-height snap stops define one rest position per key point. */}
        <div className="bd5d-snaps" aria-hidden="true">
          {KEY_POINTS.map((point) => (
            <div key={point.title} className="bd5d-snap" />
          ))}
        </div>
      </div>

      {/* Mobile / reduced-motion fallback: a plain stacked list. */}
      <div className="bd5d-fallback">
        {KEY_POINTS.map((point) => (
          <div key={point.title} className="bd5d-fallback-row">
            <h3 className="bd5d-copy-title">{point.titleNode ?? point.title}</h3>
            <p className="bd5d-copy-body">{point.body}</p>
            <div className="bd5d-fallback-media" aria-hidden="true">
              <StepMedia media={point.media} isActive={false} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
