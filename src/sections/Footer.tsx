const COLUMNS = [
  {
    heading: 'Products',
    links: ['AI Docs', 'AI Slides', 'AI Sheets', 'AI Data table', 'Hub'],
  },
  {
    heading: 'Resources',
    links: ['Use cases', 'Blog', 'Help center'],
  },
  {
    heading: 'Company',
    links: ['Company', 'About', 'Team', 'Careers', 'Platform'],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--stroke)',
        padding: '64px 40px 32px',
        background: 'var(--bg-neutral)',
      }}
    >
      <div
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr repeat(3, 1fr)',
          gap: 32,
          marginBottom: 48,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              textTransform: 'lowercase',
            }}
          >
            zoom
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            AI Create
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4
              style={{
                margin: '0 0 16px',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {col.heading}
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontSize: 14,
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 16,
          fontSize: 12,
          color: 'var(--text-secondary)',
          paddingTop: 24,
          borderTop: '1px solid var(--stroke)',
        }}
      >
        <span>©2026 Zoom Communications Inc. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Legal &amp; Compliance
          </a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Trust Center
          </a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Privacy
          </a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
