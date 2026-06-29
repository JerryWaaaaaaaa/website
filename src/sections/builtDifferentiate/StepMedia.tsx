import { useEffect, useState } from 'react';
import type { Media } from './keyPoints';
import { MeetingDeliverableLoop } from './MeetingDeliverableLoop';
import './StepMedia.css';

function SequenceMedia({
  frames,
  isActive,
  intervalMs = 1800,
}: {
  frames: string[];
  isActive: boolean;
  intervalMs?: number;
}) {
  // `cur` is the frame fading in on top; `prev` stays fully opaque directly
  // beneath it so the stack is always 100% covered during the crossfade and the
  // dark backing never bleeds through (no luminance dip mid-swap).
  const [pair, setPair] = useState({ cur: 0, prev: 0 });

  // Cycle frames only while this step is the active/in-view one; reset to the
  // first frame whenever it goes inactive so it always re-enters from the top.
  useEffect(() => {
    if (!isActive) {
      setPair({ cur: 0, prev: 0 });
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setPair((p) => ({ cur: (p.cur + 1) % frames.length, prev: p.cur }));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [isActive, frames.length, intervalMs]);

  return (
    <>
      {frames.map((src, i) => {
        const isCur = i === pair.cur;
        const isPrev = i === pair.prev && pair.prev !== pair.cur;
        return (
          <img
            key={src}
            src={src}
            alt=""
            className={`bd5-media-asset bd5-seq-frame${isCur ? ' is-shown' : ''}`}
            style={{
              opacity: isCur || isPrev ? 1 : 0,
              zIndex: isCur ? 2 : isPrev ? 1 : 0,
            }}
            loading="lazy"
            draggable={false}
          />
        );
      })}
    </>
  );
}

/**
 * Renders a key point's media to fill its (positioned, 5:4, overflow-hidden)
 * parent. The cross-step crossfade between points stays in each variant; this
 * component owns only the intra-step frame crossfade for sequences.
 */
export function StepMedia({
  media,
  isActive,
}: {
  media: Media;
  isActive: boolean;
}) {
  switch (media.kind) {
    case 'image':
      // The "every meeting becomes a deliverable" still is replaced by an
      // animated illustration whose cards loop vertically. (Intercepted here by
      // src rather than via the `layers` kind because keyPoints.tsx is locked.)
      if (media.src === '/core-features/meeting-deliverable.png')
        return <MeetingDeliverableLoop />;
      return (
        <img
          src={media.src}
          alt=""
          className="bd5-media-asset"
          loading="lazy"
          draggable={false}
        />
      );
    case 'sequence':
      return (
        <SequenceMedia
          frames={media.frames}
          intervalMs={media.intervalMs}
          isActive={isActive}
        />
      );
    case 'layers':
      if (media.animation === 'meeting-deliverable') return <MeetingDeliverableLoop />;
      // No renderer for other layered animations yet.
      return null;
  }
}
