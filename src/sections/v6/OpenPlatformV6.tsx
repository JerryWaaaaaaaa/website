import type { CSSProperties } from 'react';
import { useRevealOnce } from '../builtDifferentiate/useRevealOnce';
import { DotGrid } from './DotGrid';
import { PanelDot } from './AgentCta';
import { useCardDrag } from './useCardDrag';
import { useCardTilt } from './useCardTilt';
import { useSheenDials, type Sheen } from './useSheenDials';
import './OpenPlatformV6.css';

// Figma 200:75578: card centres as offsets from the 1480 × 481 stage centre,
// plus each card's resting rotation.
const CARDS = [
  {
    key: 'api',
    overline: 'For engineers',
    title: 'Open API',
    body: 'Build custom integrations and automate document workflows programmatically.',
    cta: 'View docs',
    x: -311.78,
    y: 10.43,
    rotate: -5.27,
  },
  {
    key: 'mcp',
    overline: 'For AI natives',
    title: 'MCP',
    body: 'Let AI assistants like Claude and ChatGPT read, write, and act on your content.',
    cta: 'View docs',
    x: -8.67,
    y: -59.51,
    rotate: 0,
  },
  {
    key: 'zapier',
    overline: 'For everyone',
    title: 'Zapier',
    body: 'Connect to 1,500+ apps with no-code workflows — no engineering needed.',
    cta: 'View integrations',
    x: 293.51,
    y: 24.74,
    rotate: 8.62,
  },
];

// Metallic sheen per card (tunable in the "Open platform sheen" DialKit panel):
// one broad soft highlight and a faint tinted shadow per band, each card in its
// own tint and angle so the three don't read as copies.
const SHEENS: Record<string, Sheen> = {
  api: {
    angle: 108,
    stops: [
      { color: '#ffffff', opacity: 0, position: 0 },
      { color: '#f4f8ff', opacity: 0.75, position: 0.2 },
      { color: '#ffffff', opacity: 0, position: 0.42 },
      { color: '#2f56b8', opacity: 0.26, position: 0.66 },
      { color: '#c9f1ff', opacity: 0.4, position: 0.86 },
    ],
  },
  mcp: {
    angle: 122,
    stops: [
      { color: '#ffffff', opacity: 0, position: 0 },
      { color: '#fbf4ff', opacity: 0.7, position: 0.24 },
      { color: '#ffffff', opacity: 0, position: 0.46 },
      { color: '#5b3fb0', opacity: 0.24, position: 0.7 },
      { color: '#ffd9f3', opacity: 0.36, position: 0.88 },
    ],
  },
  zapier: {
    angle: 136,
    stops: [
      { color: '#ffffff', opacity: 0, position: 0 },
      { color: '#fff7ee', opacity: 0.72, position: 0.22 },
      { color: '#ffffff', opacity: 0, position: 0.44 },
      { color: '#3b419e', opacity: 0.25, position: 0.68 },
      { color: '#ffe2cc', opacity: 0.4, position: 0.87 },
    ],
  },
};

const DESKTOP_FAN = '(min-width: 900px) and (pointer: fine)';

/**
 * V6 "Open platform by design" (Figma 200:75571).
 * Annotations: the three cards start stacked in the middle and fan out into the
 * stacked view on entry; each card moves up and rotates when hovered. On the
 * desktop fan (fine pointer, ≥900px) the cards can be dragged around the stage,
 * and tilt toward the cursor with a moving glare; their sheen shifts with both
 * stage position and tilt (tunable in the "Open platform sheen" panel).
 */
export function OpenPlatformV6() {
  const { ref, revealed } = useRevealOnce<HTMLDivElement>('-20% 0px');
  const drag = useCardDrag(ref, DESKTOP_FAN);
  const sheen = useSheenDials('Open platform sheen', SHEENS);
  useCardTilt(ref, DESKTOP_FAN, sheen.tilt);

  return (
    <section className="v6-panel v6-op" aria-labelledby="v6-op-title">
      <DotGrid />
      <div className="v6-header-wash" aria-hidden="true" />
      <PanelDot />

      <header className="v6-op-header">
        <h2 className="v6-title" id="v6-op-title">
          Open platform by design
        </h2>
        <p className="v6-lede">
          Work with the tools and workflows your team already uses — whether you&apos;re a
          developer, a power user, or somewhere in between.
        </p>
      </header>

      <div className="v6-op-stage" ref={ref} data-revealed={revealed ? 'true' : 'false'}>
        {CARDS.map((c, i) => (
          <article
            key={c.key}
            className="v6-op-card"
            data-card={c.key}
            onPointerDown={drag.onPointerDown}
            onClickCapture={drag.onClickCapture}
            style={
              {
                '--x': `${(c.x / 1480) * 100}cqw`,
                '--y': `${c.y}px`,
                '--r': `${c.rotate}deg`,
                // Hover tips each card further in the direction it already leans.
                '--hr': `${c.rotate < 0 ? -3 : 3}deg`,
                '--i': i,
                zIndex: drag.zIndex(c.key),
                ...sheen.style(c.key),
              } as CSSProperties
            }
          >
            <div className="v6-op-card-face">
              <img
                className="v6-op-card-bg"
                src={`/v6/open-platform/card-${c.key}.webp`}
                alt=""
                draggable={false}
              />
              <div className="v6-op-card-copy">
                <p className="v6-op-overline">{c.overline}</p>
                <h3 className="v6-op-card-title">{c.title}</h3>
                <p className="v6-op-card-body">{c.body}</p>
              </div>
              <a className="btn btn-secondary v6-op-card-cta" href="#">
                {c.cta}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
