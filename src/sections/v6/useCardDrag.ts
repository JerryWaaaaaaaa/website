import { useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, RefObject } from 'react';

// Past this many px a press counts as a drag, so the card's link/CTA doesn't fire.
const DRAG_THRESHOLD = 4;

/**
 * Pointer-drag for cards scattered on a stage (Open platform fan, template
 * gallery). Each card needs a `data-card` key. The offset is written straight
 * to --dx / --dy on the card (no re-render per move) for its CSS transform to
 * add on top of its resting position; the last card dropped stays on top.
 * Only active when `media` matches, and not while the stage is
 * `data-revealed="false"` (still running its intro).
 */
export function useCardDrag(stageRef: RefObject<HTMLElement | null>, media: string) {
  const [order, setOrder] = useState<string[]>([]);
  const moved = useRef(false);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    if (!window.matchMedia(media).matches) return;
    const card = e.currentTarget;
    const stage = stageRef.current;
    if (!stage || stage.dataset.revealed === 'false') return;

    const key = card.dataset.card!;
    const startX = e.clientX;
    const startY = e.clientY;
    const baseX = parseFloat(card.style.getPropertyValue('--dx')) || 0;
    const baseY = parseFloat(card.style.getPropertyValue('--dy')) || 0;
    // Keep the card's centre inside the stage.
    const s = stage.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    const cx = c.left + c.width / 2;
    const cy = c.top + c.height / 2;
    const minX = s.left - cx;
    const maxX = s.right - cx;
    const minY = s.top - cy;
    const maxY = s.bottom - cy;
    moved.current = false;

    const onMove = (ev: PointerEvent) => {
      const dx = Math.min(maxX, Math.max(minX, ev.clientX - startX));
      const dy = Math.min(maxY, Math.max(minY, ev.clientY - startY));
      if (!moved.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!moved.current) {
        moved.current = true;
        card.dataset.dragging = 'true';
        setOrder((o) => [...o.filter((k) => k !== key), key]);
      }
      card.style.setProperty('--dx', `${baseX + dx}px`);
      card.style.setProperty('--dy', `${baseY + dy}px`);
    };
    const onUp = () => {
      delete card.dataset.dragging;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  // Swallow the click that ends a drag so a drop on a link doesn't follow it.
  const onClickCapture = (e: ReactMouseEvent<HTMLElement>) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  };

  const zIndex = (key: string) => {
    const i = order.indexOf(key);
    return i === -1 ? undefined : 3 + i;
  };

  return { onPointerDown, onClickCapture, zIndex };
}
