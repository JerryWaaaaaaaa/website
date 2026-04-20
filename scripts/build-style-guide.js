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
  const cssHref  = activeHtmlPath.includes('/') ? '../styles.css' : 'styles.css';
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
  <link rel="stylesheet" href="${cssHref}">
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

  // Replace the full markdown heading with a short title + description paragraph
  const withDescription = rewritten.replace(
    /<h1>.*?<\/h1>/,
    '<h1>Design Rules</h1>\n<p class="sg-description">Design rules and component specifications for the Zoom Docs microsite.</p>'
  );

  return template('Design Rules', withDescription, '__index__');
}

// ---------------------------------------------------------------------------
// 5. Build individual pages
// ---------------------------------------------------------------------------

const pageDescriptions = {
  'colors.html':             'The two-tier color token system with primitive and semantic layers.',
  'typography.html':         'Type scale, responsive sizes, and usage guidelines for General Sans.',
  'components/chip.html':    'A small pill label used above section headings.',
  'components/button.html':  'Pill-shaped action triggers in primary and secondary variants.',
  'components/nav-bar.html': 'Fixed navigation with scroll-driven frosted-glass pill state.',
};

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

  const desc = pageDescriptions[page.htmlPath];
  if (desc) {
    bodyHtml = bodyHtml.replace(
      /(<\/h1>)/,
      `$1\n<p class="sg-description">${desc}</p>`
    );
  }

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
