import { useEffect, useRef, useState } from 'react';
import { KEY_POINTS } from './keyPoints';
import { StepMedia } from './StepMedia';
import './BuiltDifferentiateV5D.css';

const N = KEY_POINTS.length;

// Vertical wheel: cards travel along a circular arc (the wheel turns) but each
// card stays flat/upright — no per-card rotation. `d` is the fractional
// distance from the centered card.
const R = 1000; // wheel radius — spacing = R*sin(30°) = 500px > 448px card height so cards clear
const STEP = 30; // degrees between adjacent cards (arc spacing only)

function wheelTransform(d: number): string {
  const rad = (d * STEP * Math.PI) / 180;
  const x = R * (1 - Math.cos(rad)); // cards bow toward the rim as they leave center
  const y = R * Math.sin(rad); // vertical travel along the wheel
  return `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
}

export function BuiltDifferentiateV5D() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  // Fractional scroll position across the key points (0 .. N-1). Drives both
  // the left copy translate and the right wheel rotation so they stay synced.
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Single page scroller: derive the step position from the track's offset
      // in the viewport. rect.top runs from 0 (pin engaged) to -scrollable.
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        setPos(0);
        return;
      }
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      setPos(progress * (N - 1));
    };

    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
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

  const activeIndex = Math.round(pos);

  return (
    <section className="bd5d-section">
      {/* Tall track on the page scroller: the pin stays fixed while N full-height
          snap stops below it make the page rest on one step at a time. */}
      <div className="bd5d-track" ref={trackRef}>
        <div className="bd5d-pin">
          <div className="bd5d-box">
            <div className="bd5d-inner">
            {/* Left: copy lines that step upward one-by-one. */}
            <div className="bd5d-copy-col">
              <div
                className="bd5d-copy-list"
                style={{ transform: `translateY(calc(-1 * ${pos} * var(--bd5d-slot)))` }}
              >
                {KEY_POINTS.map((point, i) => {
                  const d = i - pos;
                  const ad = Math.abs(d);
                  const opacity = Math.max(0, 1 - ad * 0.75);
                  return (
                    <div
                      key={point.title}
                      className={`bd5d-copy${i === activeIndex ? ' is-active' : ''}`}
                      style={{ opacity }}
                      aria-hidden={i === activeIndex ? undefined : true}
                    >
                      <h3 className="bd5d-copy-title">{point.title}</h3>
                      <p className="bd5d-copy-body">{point.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: rounded vertical wheel carousel. */}
            <div className="bd5d-carousel" aria-hidden="true">
              <div className="bd5d-wheel">
                {KEY_POINTS.map((point, i) => {
                  const o = i - pos;
                  const ao = Math.abs(o);
                  const clamped = Math.min(ao, 2);
                  const hidden = ao > 2.2;
                  const opacity = hidden ? 0 : Math.max(0, 1 - clamped * 0.42);
                  return (
                    <div
                      key={point.title}
                      className={`bd5d-card${i === activeIndex ? ' is-active' : ''}`}
                      style={{
                        transform: wheelTransform(o),
                        opacity,
                        zIndex: N - Math.round(ao),
                        visibility: hidden ? 'hidden' : 'visible',
                      }}
                    >
                      <StepMedia
                        media={point.media}
                        isActive={i === activeIndex}
                      />
                    </div>
                  );
                })}
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
            <h3 className="bd5d-copy-title">{point.title}</h3>
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
