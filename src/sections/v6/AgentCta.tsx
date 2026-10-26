/**
 * The V6 "Agent prompt" button (Figma "Agent prompt"): a circular media slot
 * followed by a Heading-4 label. Used by the hero + CTA tagline cards (black,
 * 32px orb — Figma 659:29154) and the template gallery (pink, arrow icon);
 * the 48px halftone avatar is the default media. On hover the dark buttons light a wavy gradient glow
 * along their inside bottom edge; the arrow variant slides its arrow out to
 * the right as a new one slides in from the left.
 */
export function AgentCta({
  children,
  tone = 'dark',
  media = 'avatar',
  href = '#',
}: {
  children: string;
  tone?: 'dark' | 'pink';
  media?: 'avatar' | 'orb' | 'arrow';
  href?: string;
}) {
  return (
    <a className={`v6-agent${tone === 'pink' ? ' v6-agent--pink' : ''}`} href={href}>
      {tone === 'dark' && (
        <span className="v6-agent-glow" aria-hidden="true">
          <span />
        </span>
      )}
      {media === 'avatar' ? (
        <img className="v6-agent-media" src="/v6/hero/cta-avatar.webp" alt="" aria-hidden="true" />
      ) : media === 'orb' ? (
        // Figma's two layers: a cropped base image under the orb render.
        <span className="v6-agent-orb" aria-hidden="true">
          <img className="v6-agent-orb-base" src="/v6/hero/cta-orb-base.webp" alt="" />
          <img className="v6-agent-orb-top" src="/v6/hero/cta-orb.png" alt="" />
        </span>
      ) : (
        <span className="v6-agent-icon" aria-hidden="true">
          <img src="/v6/templates/arrow.svg" alt="" width={24} height={24} />
          <img src="/v6/templates/arrow.svg" alt="" width={24} height={24} />
        </span>
      )}
      <span className="v6-agent-label">{children}</span>
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
