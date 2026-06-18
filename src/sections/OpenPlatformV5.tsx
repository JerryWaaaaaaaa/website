import './OpenPlatformV5.css';

type Card = {
  key: string;
  overline: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  logos?: { src: string; alt: string }[];
};

const CARDS: Card[] = [
  {
    key: 'api',
    overline: 'For engineers',
    title: 'Open API',
    body: 'Build custom integrations and automate document workflows programmatically.',
    cta: { label: 'View docs', href: '#' },
  },
  {
    key: 'mcp',
    overline: 'For AI natives',
    title: 'MCP',
    body: 'Let AI assistants like Claude and ChatGPT read, write, and act on your content.',
    logos: [
      { src: '/integration-logos/claude.png', alt: 'Claude by Anthropic' },
      { src: '/integration-logos/openai.png', alt: 'OpenAI ChatGPT' },
    ],
  },
  {
    key: 'zapier',
    overline: 'For everyone',
    title: 'Zapier',
    body: 'Connect to 1,500+ apps with no-code workflows — no engineering needed.',
    cta: { label: 'View integrations', href: '#' },
  },
];

export function OpenPlatformV5() {
  return (
    <section className="openplat5">
      <div className="openplat5-header">
        <h2 className="openplat5-title">Open platform by design</h2>
        <p className="openplat5-lede">
          Work with the tools and workflows your team already uses — whether
          you're a developer, a power user, or somewhere in between.
        </p>
      </div>

      <div className="openplat5-cards">
        {CARDS.map((card) => (
          <article key={card.key} className="openplat5-card">
            <div className="openplat5-card-copy">
              <div className="openplat5-card-head">
                <span className="openplat5-overline">{card.overline}</span>
                <h3 className="openplat5-card-title">{card.title}</h3>
              </div>
              <p className="openplat5-card-body">{card.body}</p>
            </div>

            {card.cta && (
              <a className="btn btn-primary openplat5-card-cta" href={card.cta.href}>
                {card.cta.label}
              </a>
            )}

            {card.logos && (
              <div className="openplat5-logos">
                {card.logos.map((logo) => (
                  <img
                    key={logo.src}
                    className="openplat5-logo"
                    src={logo.src}
                    alt={logo.alt}
                    width={48}
                    height={48}
                  />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
