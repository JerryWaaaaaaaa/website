/**
 * Local dev server for the style guide.
 *
 * - Serves all static files from the project root
 * - Redirects directory URLs without trailing slash → with trailing slash
 *   (matches Vercel's trailingSlash: true behaviour so local and prod behave identically)
 * - Watches design-system/ for .md changes and rebuilds automatically
 * - Run with: npm run dev
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
};

// ── Static file server ───────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Root → index.html
  if (urlPath === '/') {
    return serveFile(res, path.join(ROOT, 'index.html'));
  }

  const ext = path.extname(urlPath);

  if (!ext) {
    // No extension — check if there's a matching directory with an index.html
    const indexPath = path.join(ROOT, urlPath, 'index.html');

    if (fs.existsSync(indexPath)) {
      // Redirect to trailing-slash version (mirrors Vercel's trailingSlash: true)
      if (!urlPath.endsWith('/')) {
        res.writeHead(301, { Location: urlPath + '/' });
        res.end();
        return;
      }
      return serveFile(res, indexPath);
    }

    // Try as a .html file
    return serveFile(res, path.join(ROOT, urlPath + '.html'));
  }

  // Has an extension — serve directly
  serveFile(res, path.join(ROOT, urlPath));
});

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 — Not found: ${filePath.replace(ROOT, '')}`);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
    res.end(data);
  });
}

// ── Markdown watcher ─────────────────────────────────────────────────────────

function rebuild() {
  try {
    execSync('node scripts/build-style-guide.js', { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.error('  ✗ Build failed — check output above');
  }
}

const DS_DIR = path.join(ROOT, 'design-system');
let rebuildTimer = null;

try {
  const watcher = fs.watch(DS_DIR, { recursive: true }, (event, filename) => {
    if (!filename?.endsWith('.md')) return;
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
      console.log(`\n  ↺  ${filename} changed — rebuilding…`);
      rebuild();
      console.log(`  ✓  Rebuild complete. Refresh your browser.\n`);
    }, 150);
  });
  watcher.on('error', () => {
    console.warn('  ⚠  File watcher unavailable — run npm run build manually after editing markdown.\n');
  });
} catch {
  console.warn('  ⚠  File watcher unavailable — run npm run build manually after editing markdown.\n');
}

// ── Start ────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log('\n  Style Guide dev server running');
  console.log(`  ➜  http://localhost:${PORT}/style-guide/\n`);
  console.log('  Watching design-system/ for markdown changes…');
  console.log('  Press Ctrl+C to stop.\n');
});
