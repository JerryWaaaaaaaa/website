import { execFileSync } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const QUALITY = 90;
const CONCURRENCY = 8;

function pickFolder() {
  const script =
    'POSIX path of (choose folder with prompt "Select a folder to convert PNGs to WebP")';
  return execFileSync("osascript", ["-e", script], { encoding: "utf8" }).trim();
}

async function findPngs(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && /\.png$/i.test(e.name))
    .map((e) => path.join(e.parentPath ?? e.path, e.name));
}

async function shouldSkip(pngPath, webpPath) {
  try {
    const [pngStat, webpStat] = await Promise.all([
      stat(pngPath),
      stat(webpPath),
    ]);
    return webpStat.mtimeMs >= pngStat.mtimeMs;
  } catch {
    return false;
  }
}

async function convert(pngPath) {
  const webpPath = pngPath.replace(/\.png$/i, ".webp");

  if (await shouldSkip(pngPath, webpPath)) {
    return { pngPath, status: "skipped" };
  }

  try {
    const pngStat = await stat(pngPath);
    await sharp(pngPath).webp({ quality: QUALITY }).toFile(webpPath);
    const webpStat = await stat(webpPath);
    const saved = pngStat.size - webpStat.size;
    return { pngPath, status: "converted", pngSize: pngStat.size, webpSize: webpStat.size, saved };
  } catch (err) {
    return { pngPath, status: "failed", error: err.message };
  }
}

async function pool(tasks, concurrency) {
  const results = [];
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

function formatBytes(bytes) {
  const abs = Math.abs(bytes);
  if (abs < 1024) return `${bytes} B`;
  if (abs < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  let folder;
  try {
    folder = pickFolder();
  } catch {
    console.log("Cancelled.");
    process.exit(0);
  }

  console.log(`\nScanning: ${folder}\n`);
  const pngs = await findPngs(folder);

  if (pngs.length === 0) {
    console.log("No PNG files found.");
    process.exit(0);
  }

  console.log(`Found ${pngs.length} PNG file(s). Converting…\n`);

  const tasks = pngs.map((p) => () => convert(p));
  const results = await pool(tasks, CONCURRENCY);

  let converted = 0;
  let skipped = 0;
  let failed = 0;
  let totalSaved = 0;

  for (const r of results) {
    const rel = path.relative(folder, r.pngPath);
    if (r.status === "converted") {
      converted++;
      totalSaved += r.saved;
      console.log(
        `  ✓ ${rel}  ${formatBytes(r.pngSize)} → ${formatBytes(r.webpSize)}  (${r.saved > 0 ? "-" : "+"}${formatBytes(Math.abs(r.saved))})`
      );
    } else if (r.status === "skipped") {
      skipped++;
      console.log(`  – ${rel}  (skipped, webp is up to date)`);
    } else {
      failed++;
      console.log(`  ✗ ${rel}  ERROR: ${r.error}`);
    }
  }

  console.log(`\nDone.  Converted: ${converted}  Skipped: ${skipped}  Failed: ${failed}`);
  if (totalSaved !== 0) {
    console.log(`Total size saved: ${formatBytes(totalSaved)}`);
  }
}

main();
