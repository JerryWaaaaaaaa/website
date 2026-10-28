import { useRef, type CSSProperties } from 'react';
import { AgentCta, PanelDot } from './AgentCta';
import { DotGrid } from './DotGrid';
import { useCardDrag } from './useCardDrag';
import './TemplatesV6.css';

// Figma 200:75712: card centres as offsets from the 1480 × 697 stage centre,
// with each card's resting tilt.
const TEMPLATES = [
  { key: 'write-tldr', title: 'Write tldr', icon: 'paper', x: -627.62, y: -138.36, r: -1.1 },
  { key: 'classic-resume', title: 'Classic Resume', icon: 'canvas', x: -472.81, y: 187.35, r: -1.31 },
  { key: 'hobby-community', title: 'Hobby Community Platform', icon: 'slides', x: -210.62, y: -201.36, r: 1.37 },
  { key: 'competitive-research', title: 'Competitive research', icon: 'sheets', x: -61.62, y: 148.64, r: 1.1 },
  { key: 'brainstorm-worksheet', title: 'Brainstorm Worksheet', icon: 'sheets', x: 210.38, y: -175.36, r: -1.47 },
  { key: 'business-proposal', title: 'Business Proposal', icon: 'slides', x: 350.38, y: 199.64, r: -1.94 },
  { key: 'content-tracker', title: 'Content Progress Tracker', icon: 'paper', x: 626.38, y: -156.36, r: 1.67 },
];

/**
 * V6 template gallery (Figma 200:75700).
 * Annotation: each card rotates and scales up slightly on hover. On the
 * desktop scatter (fine pointer, ≥1200px) the cards can be dragged around.
 */
export function TemplatesV6() {
  const stageRef = useRef<HTMLUListElement | null>(null);
  const drag = useCardDrag(stageRef, '(min-width: 1200px) and (pointer: fine)');

  return (
    <section id="templates" className="v6-panel v6-tpl" aria-labelledby="v6-tpl-title">
      <DotGrid />
      <div className="v6-header-wash" aria-hidden="true" />
      <PanelDot />

      <div className="v6-tpl-inner">
        <header className="v6-tpl-header">
          <div className="v6-tpl-heading">
            <h2 className="v6-title" id="v6-tpl-title">
              Find your role’s perfect AI template
            </h2>
            <p className="v6-lede">
              Work with the tools and workflows your team already uses — whether you&apos;re a
              developer, a power user, or somewhere in between.
            </p>
          </div>
          <AgentCta tone="pink" media="arrow">
            View Gallery
          </AgentCta>
        </header>

        <ul className="v6-tpl-stage" role="list" ref={stageRef}>
          {TEMPLATES.map((t) => (
            <li
              key={t.key}
              className="v6-tpl-slot"
              data-card={t.key}
              onPointerDown={drag.onPointerDown}
              onClickCapture={drag.onClickCapture}
              style={
                {
                  '--x': `${(t.x / 1480) * 100}cqw`,
                  '--y': `${(t.y / 697) * 100}%`,
                  '--r': `${t.r}deg`,
                  '--hr': `${t.r < 0 ? -2.5 : 2.5}deg`,
                  zIndex: drag.zIndex(t.key),
                } as CSSProperties
              }
            >
              <a className="v6-tpl-card" href="#" draggable={false}>
                <span className="v6-tpl-cover">
                  <img src={`/v6/templates/${t.key}.webp`} alt="" loading="lazy" draggable={false} />
                </span>
                <span className="v6-tpl-meta">
                  <img
                    src={`/v6/templates/icon-${t.icon}.svg`}
                    alt=""
                    width={24}
                    height={24}
                    draggable={false}
                  />
                  <span className="v6-tpl-name">{t.title}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
