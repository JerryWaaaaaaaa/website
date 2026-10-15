import type { ReactNode } from 'react';

/**
 * The V6 "Agent prompt" button (Figma "Agent prompt"): a 48px circular media
 * slot followed by a Heading-4 label. Used by the hero + CTA (black, halftone
 * avatar) and the template gallery (pink, arrow icon).
 */
export function AgentCta({
  children,
  tone = 'dark',
  media = 'avatar',
  href = '#',
}: {
  children: ReactNode;
  tone?: 'dark' | 'pink';
  media?: 'avatar' | 'arrow';
  href?: string;
}) {
  return (
    <a className={`v6-agent${tone === 'pink' ? ' v6-agent--pink' : ''}`} href={href}>
      {media === 'avatar' ? (
        <img className="v6-agent-media" src="/v6/hero/cta-avatar.webp" alt="" aria-hidden="true" />
      ) : (
        <span className="v6-agent-icon" aria-hidden="true">
          <img src="/v6/templates/arrow.svg" alt="" width={24} height={24} />
        </span>
      )}
      {children}
    </a>
  );
}

/** Corner dot shown at the top-left of every V6 panel. */
export function PanelDot({ tone = 'gradient' }: { tone?: 'gradient' | 'blue' }) {
  return (
    <img
      className="v6-dot"
      src={tone === 'blue' ? '/v6/shared/dot-blue.svg' : '/v6/shared/dot-gradient.svg'}
      alt=""
      aria-hidden="true"
      width={12}
      height={12}
    />
  );
}
