import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { markdown as rulesRaw } from '../../design-system/DESIGN_RULES.md';
import './styleguide.css';

type SidebarLink = { label: string; to: string };
type SidebarSection = { title: string; links: SidebarLink[] };

/**
 * Parse design-system/DESIGN_RULES.md into the sidebar tree.
 * Recognizes "## Section" headings and "- [Label](path/to/file.md)" links.
 * Routes are derived from the .md path: `colors.md` -> `/style-guide/colors`,
 * `components/button.md` -> `/style-guide/components/button`.
 */
function parseSidebar(md: string): SidebarSection[] {
  const sections: SidebarSection[] = [];
  let current: SidebarSection | null = null;

  for (const line of md.split('\n')) {
    const sectionMatch = line.match(/^## (.+)$/);
    if (sectionMatch) {
      current = { title: sectionMatch[1].trim(), links: [] };
      sections.push(current);
      continue;
    }
    const linkMatch = line.match(/^- \[(.+?)\]\((.+?)\.md(?:#.*)?\)/);
    if (linkMatch && current) {
      const [, label, mdPath] = linkMatch;
      current.links.push({ label, to: `/style-guide/${mdPath}` });
    }
  }
  return sections.filter((s) => s.links.length > 0);
}

export function StyleGuideLayout() {
  const sections = useMemo(() => parseSidebar(rulesRaw), []);
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
