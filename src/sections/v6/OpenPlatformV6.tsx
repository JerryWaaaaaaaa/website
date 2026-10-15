import type { CSSProperties } from 'react';
import { useRevealOnce } from '../builtDifferentiate/useRevealOnce';
import { PanelDot } from './AgentCta';
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

/**
 * V6 "Open platform by design" (Figma 200:75571).
 * Annotations: the three cards start stacked in the middle and fan out into the
 * stacked view on entry; each card moves up and rotates when hovered.
 */
export function OpenPlatformV6() {
  const { ref, revealed } = useRevealOnce<HTMLDivElement>('-20% 0px');

  return (
    <section className="v6-panel v6-op" aria-labelledby="v6-op-title">
      <div className="v6-dot-grid" aria-hidden="true" />
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
            style={
              {
                '--x': `${(c.x / 1480) * 100}cqw`,
                '--y': `${c.y}px`,
                '--r': `${c.rotate}deg`,
                // Hover tips each card further in the direction it already leans.
                '--hr': `${c.rotate < 0 ? -3 : 3}deg`,
                '--i': i,
              } as CSSProperties
            }
          >
            <img className="v6-op-card-bg" src={`/v6/open-platform/card-${c.key}.webp`} alt="" />
            <div className="v6-op-card-copy">
              <p className="v6-op-overline">{c.overline}</p>
              <h3 className="v6-op-card-title">{c.title}</h3>
              <p className="v6-op-card-body">{c.body}</p>
            </div>
            <a className="btn btn-secondary v6-op-card-cta" href="#">
              {c.cta}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
