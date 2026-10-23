import { useEffect, useState } from 'react';
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';
import './DialSidePanel.css';

const STORAGE_KEY = 'dial-side-panel-open';

/**
 * DialKit docked as a full-height side panel on the right (inline mode) rather
 * than a floating popover. While open it sets --dial-panel-w on <html>, which
 * the page uses to make room (body margin, fixed nav inset) so nothing hides
 * under the panel. Open/closed state persists across reloads.
 */
export function DialSidePanel() {
  const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) !== 'false');

  useEffect(() => {
    if (!import.meta.env.DEV) return; // DialKit itself is dev-only
    localStorage.setItem(STORAGE_KEY, String(open));
    const root = document.documentElement;
    root.classList.toggle('dial-panel-open', open);
    return () => root.classList.remove('dial-panel-open');
  }, [open]);

  if (!import.meta.env.DEV) return null;

  return (
    <>
      <aside className="dial-side-panel" data-open={open} aria-label="Design tuning" aria-hidden={!open}>
        <DialRoot mode="inline" />
      </aside>
      <button
        type="button"
        className="dial-side-toggle"
        data-open={open}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Hide tuning panel' : 'Show tuning panel'}
        aria-expanded={open}
      >
        {open ? '›' : '‹'}
      </button>
    </>
  );
}
