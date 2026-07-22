import './OpenPlatform.css';

type Card = {
  key: string;
  overline: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
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
    cta: { label: 'View docs', href: '#' },
  },
  {
    key: 'zapier',
    overline: 'For everyone',
    title: 'Zapier',
    body: 'Connect to 1,500+ apps with no-code workflows — no engineering needed.',
    cta: { label: 'View integrations', href: '#' },
  },
];

export function OpenPlatform() {
  return (
    <section className="openplat">
      <div className="openplat-header">
        <h2 className="openplat-title">Open platform by design</h2>
        <p className="openplat-lede">
          Work with the tools and workflows your team already uses — whether
          you're a developer, a power user, or somewhere in between.
        </p>
      </div>

      <div className="openplat-cards">
        {CARDS.map((card) => (
          <article key={card.key} className="openplat-card">
            <div className="openplat-card-copy">
              <div className="openplat-card-head">
                <span className="openplat-overline">{card.overline}</span>
                <h3 className="openplat-card-title">{card.title}</h3>
              </div>
              <p className="openplat-card-body">{card.body}</p>
            </div>

            {card.cta && (
              <a className="btn btn-secondary openplat-card-cta" href={card.cta.href}>
                {card.cta.label}
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
