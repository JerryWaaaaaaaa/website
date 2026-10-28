import { useEffect, useState, type HTMLAttributes } from 'react';
import './MeetingSelfView.css';

// meeting-floating.mp4 (the V5 hero's meeting video) is three 16:9 speaker
// tiles stacked in one portrait frame; the self view crops to one tile at a
// time and cuts between them like Zoom's active-speaker view.
const SPEAKER_CROPS = ['0%', '50%', '100%'];
const SPEAKER_MS = 3200;

/**
 * The glass meeting self view (Figma 606:45488): a layout toolbar over the
 * meeting video, cutting between three speakers. Placement is up to the caller
 * (pass a className); extra props (drag handlers, data-*) go on the card.
 */
export function MeetingSelfView({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const [speaker, setSpeaker] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setSpeaker((s) => (s + 1) % SPEAKER_CROPS.length),
      SPEAKER_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`v6-selfview${className ? ` ${className}` : ''}`} aria-hidden="true" {...rest}>
      <div className="v6-selfview-bar">
        <span className="v6-selfview-layouts">
          <span className="v6-layout v6-layout--strip" />
          <span className="v6-layout v6-layout--wide" />
          <span className="v6-layout v6-layout--split" />
          <img className="v6-layout" src="/v6/hero/layout-grid.svg" alt="" draggable={false} />
        </span>
        <img className="v6-layout" src="/v6/hero/resize.svg" alt="" draggable={false} />
      </div>
      <div className="v6-selfview-video">
        <video
          src="/hero-may-images/meeting-floating.mp4"
          style={{ objectPosition: `50% ${SPEAKER_CROPS[speaker]}` }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </div>
  );
}
