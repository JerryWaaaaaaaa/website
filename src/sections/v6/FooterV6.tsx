import { Link } from 'react-router-dom';
import './v6.css';
import './FooterV6.css';

type FooterLink = { label: string; to?: string };

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'Products',
    links: [{ label: 'Docs' }, { label: 'Data table' }, { label: 'Present' }, { label: 'Sheets' }, { label: 'Papers' }, { label: 'Hub' }],
  },
  {
    heading: 'Features',
    links: [
      { label: 'Meeting Doc' },
      { label: 'Auto Writing' },
      { label: 'Automation' },
      { label: 'Knowledge Base' },
      { label: 'Topics' },
      { label: 'Sites' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Use cases' },
      { label: 'Templates' },
      { label: 'Blog', to: '/blog' },
      { label: 'Help center' },
      { label: 'Comparisons' },
      { label: 'Migrations' },
      { label: 'Community' },
    ],
  },
  {
    heading: 'Company',
    links: [{ label: 'Company' }, { label: 'About' }, { label: 'Team' }, { label: 'Careers' }, { label: 'Platform' }],
  },
];

const SOCIAL = [
  { label: 'LinkedIn', icon: 'linkedin' },
  { label: 'Instagram', icon: 'instagram' },
  { label: 'X/Twitter', icon: 'x' },
];

const LEGAL = ['Legal & Compliance', 'Trust Center', 'Privacy', 'Terms'];

/** V6 footer (Figma 200:75733) — a bg-accent-dark panel closing the body column. */
export function FooterV6() {
  return (
    <footer className="v6-page v6-footer">
      <div className="v6-body v6-footer-panel">
        <nav className="v6-footer-cols" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="v6-footer-col">
              <h2 className="v6-footer-heading">{col.heading}</h2>
              <ul role="list">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? <Link to={l.to}>{l.label}</Link> : <a href="#">{l.label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="v6-footer-base">
          <div className="v6-footer-row">
            <Link to="/" aria-label="Zoom AI Productivity Suite — home">
              <img src="/zm-prod-suite-stacked-color01.svg" alt="Zoom AI Productivity Suite" height={36} />
            </Link>
            <ul className="v6-footer-social" role="list">
              <li>
                <a href="#">
                  Contact sales
                  <img src="/v6/footer/go-to.svg" alt="" width={10} height={10} />
                </a>
              </li>
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a href="#">
                    <img src={`/v6/footer/${s.icon}.svg`} alt="" width={20} height={20} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="v6-footer-row v6-footer-legal">
            <p>©2025 Zoom Communications Inc. All rights reserved.</p>
            <ul role="list">
              {LEGAL.map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
