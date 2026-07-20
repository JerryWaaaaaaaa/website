import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './styleguide.css';

type SidebarLink = { label: string; to: string };
type SidebarSection = { title: string; links: SidebarLink[] };

/**
 * Sidebar tree for the style guide. All content is rendered from the single
 * source of truth, `/DESIGN.md` (see src/lib/designDoc.ts); these routes each
 * surface one slice of it alongside live component previews.
 */
const SECTIONS: SidebarSection[] = [
  {
    title: 'Foundations',
    links: [
      { label: 'Color Tokens', to: '/style-guide/colors' },
      { label: 'Typography', to: '/style-guide/typography' },
    ],
  },
  {
    title: 'Components',
    links: [
      { label: 'Chip / Label Tag', to: '/style-guide/components/chip' },
      { label: 'Button', to: '/style-guide/components/button' },
      { label: 'Navigation Bar', to: '/style-guide/components/nav-bar' },
    ],
  },
];

export function StyleGuideLayout() {
  const sections = SECTIONS;
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="sg-shell">
      <aside className={`sg-sidebar ${open ? 'is-open' : ''}`}>
        <Link to="/style-guide" className="sg-sidebar-title">
          Style Guide
        </Link>

        {sections.map((section) => (
          <div key={section.title} className="sg-nav-section">
            <div className="sg-nav-heading">{section.title}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  `sg-nav-link ${isActive ? 'sg-nav-active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="sg-nav-section">
          <Link to="/" className="sg-nav-link">
            ← Back to site
          </Link>
        </div>
      </aside>

      <main className="sg-main">
        <Outlet />
      </main>

      <button
        className="sg-menu-toggle"
        aria-label="Toggle navigation"
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>
    </div>
  );
}
