import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DS_DIR = resolve(ROOT, 'design-system');
const OUT_DIR = resolve(ROOT, 'style-guide');

// ---------------------------------------------------------------------------
// 1. Parse DESIGN_RULES.md to discover pages & navigation structure
// ---------------------------------------------------------------------------

const rulesRaw = readFileSync(resolve(DS_DIR, 'DESIGN_RULES.md'), 'utf-8');

function parseNav(md) {
  const sections = [];
  let current = null;

  for (const line of md.split('\n')) {
    const sectionMatch = line.match(/^## (.+)/);
    if (sectionMatch) {
      current = { title: sectionMatch[1], links: [] };
      sections.push(current);
      continue;
    }

    const linkMatch = line.match(/^- \[(.+?)\]\(design\/(.+?)\)/);
    if (linkMatch && current) {
      const [, label, mdPath] = linkMatch;
      const htmlPath = mdPath.replace(/\.md$/, '.html');
      current.links.push({ label, mdPath, htmlPath });
    }
  }

  return sections;
}

const nav = parseNav(rulesRaw);
const allPages = nav.flatMap(s => s.links);

// ---------------------------------------------------------------------------
// 2. Markdown → HTML conversion
// ---------------------------------------------------------------------------

marked.setOptions({ gfm: true, breaks: false });

function renderMd(filePath) {
  const md = readFileSync(filePath, 'utf-8');
  return marked.parse(md);
}

// ---------------------------------------------------------------------------
// 3. Shared HTML template
// ---------------------------------------------------------------------------

function buildSidebar(activeHtmlPath) {
  let html = '';
  for (const section of nav) {
    html += `<div class="sg-nav-section">\n`;
    html += `  <div class="sg-nav-heading">${section.title}</div>\n`;
    for (const link of section.links) {
      const active = link.htmlPath === activeHtmlPath ? ' sg-nav-active' : '';
      const href = activeHtmlPath.includes('/')
        ? `../${link.htmlPath}`
        : link.htmlPath;
      html += `  <a class="sg-nav-link${active}" href="${href}">${link.label}</a>\n`;
    }
    html += `</div>\n`;
  }
  return html;
}

function template(title, bodyHtml, activeHtmlPath) {
  const homeHref = activeHtmlPath.includes('/') ? '../index.html' : 'index.html';
  const sidebar = buildSidebar(activeHtmlPath);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Style Guide</title>
  <link rel="preconnect" href="https://api.fontshare.com">
  <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500&display=swap">
  <style>
    /* ── Design tokens (from colors.md) ─────────────────────────── */
    :root {
      --color-white:        #FFFFFF;
      --color-shade-light:  #F3F8FF;
      --color-shade-medium: #E3EDFC;
      --color-shade-dark:   #D2DEF2;
      --color-blue:         #0C5CFF;
      --color-pink:         #E0D5FF;
      --color-black:        #000000;
      --color-gray:         #4C4C4C;
      --color-gray-light:   #999999;

      --bg-neutral:        var(--color-white);
      --bg-accent-light:   var(--color-shade-light);
      --bg-accent-medium:  var(--color-shade-medium);
      --bg-accent-dark:    var(--color-shade-dark);
      --bg-highlight-blue: var(--color-blue);
      --bg-contrast:       var(--color-black);
      --text-primary:      var(--color-black);
      --text-secondary:    var(--color-gray);
      --text-highlight:    var(--color-blue);
      --text-contrast:     var(--color-white);
      --stroke:            var(--color-shade-medium);
    }

    /* ── Reset ──────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }

    body {
      font-family: "General Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.6;
      color: var(--text-primary);
      background: var(--bg-neutral);
    }

    /* ── Layout ─────────────────────────────────────────────────── */
    .sg-shell {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
    }

    /* ── Sidebar ────────────────────────────────────────────────── */
    .sg-sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      padding: 32px 24px;
      background: var(--bg-accent-light);
      border-right: 1px solid var(--stroke);
    }

    .sg-sidebar-title {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--text-highlight);
      text-decoration: none;
      display: block;
      margin-bottom: 32px;
    }

    .sg-sidebar-title:hover { text-decoration: underline; }

    .sg-nav-section { margin-bottom: 24px; }

    .sg-nav-heading {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-secondary);
      margin-bottom: 8px;
      padding-left: 12px;
    }

    .sg-nav-link {
      display: block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 400;
      color: var(--text-secondary);
      text-decoration: none;
      transition: background 150ms ease, color 150ms ease;
    }

    .sg-nav-link:hover {
      background: var(--bg-accent-medium);
      color: var(--text-primary);
    }

    .sg-nav-link.sg-nav-active {
      background: var(--bg-accent-medium);
      color: var(--text-highlight);
      font-weight: 500;
    }

    /* ── Main content ───────────────────────────────────────────── */
    .sg-main {
      padding: 48px 64px 96px;
      max-width: 900px;
    }

    /* ── Typography for rendered markdown ────────────────────────── */
    .sg-main h1 {
      font-size: 36px;
      font-weight: 500;
      line-height: 1.1;
      letter-spacing: -0.01em;
      margin-bottom: 8px;
    }

    .sg-main h2 {
      font-size: 24px;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -0.01em;
      margin-top: 48px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--stroke);
    }

    .sg-main h3 {
      font-size: 18px;
      font-weight: 500;
      line-height: 1.3;
      margin-top: 32px;
      margin-bottom: 12px;
    }

    .sg-main h4 {
      font-size: 16px;
      font-weight: 500;
      margin-top: 24px;
      margin-bottom: 8px;
    }

    .sg-main p {
      margin-bottom: 16px;
      color: var(--text-secondary);
    }

    .sg-main strong { color: var(--text-primary); }

    .sg-main a {
      color: var(--text-highlight);
      text-decoration: none;
    }
    .sg-main a:hover { text-decoration: underline; }

    .sg-main ul, .sg-main ol {
      padding-left: 24px;
      margin-bottom: 16px;
    }
    .sg-main li {
      margin-bottom: 6px;
      color: var(--text-secondary);
    }
    .sg-main li strong { color: var(--text-primary); }

    .sg-main hr {
      border: none;
      border-top: 1px solid var(--stroke);
      margin: 40px 0;
    }

    .sg-main blockquote {
      margin: 16px 0;
      padding: 12px 20px;
      border-left: 3px solid var(--text-highlight);
      background: var(--bg-accent-light);
      border-radius: 0 8px 8px 0;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .sg-main blockquote p { margin-bottom: 8px; }
    .sg-main blockquote p:last-child { margin-bottom: 0; }

    /* ── Tables ──────────────────────────────────────────────────── */
    .sg-main table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 24px;
      font-size: 14px;
    }

    .sg-main th {
      text-align: left;
      padding: 10px 14px;
      font-weight: 500;
      font-size: 12px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--text-secondary);
      background: var(--bg-accent-light);
      border-bottom: 2px solid var(--stroke);
    }

    .sg-main td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--stroke);
      color: var(--text-secondary);
      vertical-align: top;
    }

    .sg-main tr:last-child td { border-bottom: none; }

    /* ── Code blocks ────────────────────────────────────────────── */
    .sg-main code {
      font-family: "SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace;
      font-size: 13px;
      background: var(--bg-accent-light);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--text-highlight);
    }

    .sg-main pre {
      margin: 16px 0 24px;
      padding: 20px 24px;
      background: #1a1a2e;
      border-radius: 10px;
      overflow-x: auto;
      line-height: 1.5;
    }

    .sg-main pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      color: #e0e0e0;
      font-size: 13px;
    }

    /* ── Responsive ─────────────────────────────────────────────── */
    .sg-menu-toggle {
      display: none;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 200;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: var(--bg-contrast);
      color: var(--text-contrast);
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    @media (max-width: 768px) {
      .sg-shell { grid-template-columns: 1fr; }

      .sg-sidebar {
        position: fixed;
        left: 0; top: 0; bottom: 0;
        z-index: 100;
        width: 280px;
        transform: translateX(-100%);
        transition: transform 250ms ease;
      }

      .sg-sidebar.is-open { transform: translateX(0); }

      .sg-menu-toggle { display: block; }

      .sg-main { padding: 32px 20px 96px; }
      .sg-main h1 { font-size: 28px; }
      .sg-main h2 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="sg-shell">
    <aside class="sg-sidebar" id="sg-sidebar">
      <a class="sg-sidebar-title" href="${homeHref}">Style Guide</a>
${sidebar}
    </aside>

    <main class="sg-main">
${bodyHtml}
    </main>
  </div>

  <button class="sg-menu-toggle" id="sg-menu-toggle" aria-label="Toggle navigation">&#9776;</button>

  <script>
    const toggle = document.getElementById('sg-menu-toggle');
    const sidebar = document.getElementById('sg-sidebar');
    toggle.addEventListener('click', () => sidebar.classList.toggle('is-open'));
    document.querySelector('.sg-main').addEventListener('click', () => sidebar.classList.remove('is-open'));
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 4. Build index page from DESIGN_RULES.md
// ---------------------------------------------------------------------------

function buildIndex() {
  const bodyHtml = renderMd(resolve(DS_DIR, 'DESIGN_RULES.md'));

  // Rewrite internal .md links to .html (preserving anchors)
  const rewritten = bodyHtml.replace(
    /href="design\/(.+?)\.md(#[^"]*)?"/g,
    (_, p, hash) => `href="${p}.html${hash || ''}"`
  );

  return template('Design Rules', rewritten, '__index__');
}

// ---------------------------------------------------------------------------
// 5. Build individual pages
// ---------------------------------------------------------------------------

function buildPage(page) {
  const mdFile = resolve(DS_DIR, page.mdPath);
  if (!existsSync(mdFile)) {
    console.warn(`  ⚠ skipped (file not found): ${page.mdPath}`);
    return null;
  }

  let bodyHtml = renderMd(mdFile);

  // Rewrite relative .md links to .html (preserving anchors)
  bodyHtml = bodyHtml.replace(/href="([^"]*?)\.md(#[^"]*)?"/g, (_, p, hash) => {
    return `href="${p}.html${hash || ''}"`;
  });

  return template(page.label, bodyHtml, page.htmlPath);
}

// ---------------------------------------------------------------------------
// 6. Write everything
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

console.log('Building style guide…\n');

ensureDir(OUT_DIR);

// Index
writeFileSync(resolve(OUT_DIR, 'index.html'), buildIndex(), 'utf-8');
console.log('  ✓ index.html');

// Individual pages
for (const page of allPages) {
  const outPath = resolve(OUT_DIR, page.htmlPath);
  ensureDir(dirname(outPath));

  const html = buildPage(page);
  if (html) {
    writeFileSync(outPath, html, 'utf-8');
    console.log(`  ✓ ${page.htmlPath}`);
  }
}

console.log(`\nDone — ${allPages.length + 1} pages written to style-guide/\n`);
