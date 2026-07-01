import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import './VoiceOverPanel.css';

/* Interactive "Select Voice-over" dropdown (Figma node 3321:29415). The voice
   list is a pixel-faithful exported image; the button below it is a real DOM
   control that toggles the panel open/collapsed. Built on a fixed 280x492
   design box and scaled to fill its float slot. */

const DESIGN_WIDTH = 280;

export function VoiceOverPanel() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [open, setOpen] = useState(true);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setScale(el.clientWidth / DESIGN_WIDTH);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="vo-wrap" ref={wrapRef}>
      <div className="vo" data-open={open} style={{ '--vo-scale': scale } as CSSProperties}>
        <div className="vo-panel">
          <img src="/slides-mockup/voiceover/panel.png" alt="Voice-over options" />
        </div>
        <button
          type="button"
          className="vo-btn"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="vo-btn-label">Select Voice-over</span>
        </button>
      </div>
    </div>
  );
}
