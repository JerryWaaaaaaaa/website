#!/usr/bin/env node
// Generate a handoff entry for a range of commits (one push) and prepend it
// to HANDOFF.md.
//
// Usage:
//   node scripts/generate-handoff.mjs <range>   # e.g. origin/main..HEAD
//   node scripts/generate-handoff.mjs            # auto-derives origin/<default>..HEAD
//
// Behavior:
//   - Resolves the BASE..TIP range; lists all non-[handoff] commits in it.
//   - Skips if the range has no meaningful commits or only ignored-path changes.
//   - Calls `cursor-agent -p --output-format text --force --trust "<prompt>"`.
//   - Prepends the model's markdown section to HANDOFF.md (newest first).
//   - Commits HANDOFF.md as `[handoff] for push (N commits): <first> ... <last>`.
//   - Streams progress to stdout (pre-push hook forwards it to GitHub Desktop).

import { spawnSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const HANDOFF_PATH = resolve(REPO_ROOT, "HANDOFF.md");

const MAX_DIFF_CHARS = 60_000;
const MODEL = process.env.HANDOFF_MODEL || "";

const DIFF_EXCLUDES = [
  ":(exclude)HANDOFF.md",
  ":(exclude)package-lock.json",
  ":(exclude)dist/**",
  ":(exclude)node_modules/**",
  ":(exclude)**/*.png",
  ":(exclude)**/*.jpg",
  ":(exclude)**/*.jpeg",
  ":(exclude)**/*.webp",
  ":(exclude)**/*.gif",
  ":(exclude)**/*.mp4",
  ":(exclude)**/*.webm",
  ":(exclude)**/*.mov",
  ":(exclude)**/*.ico",
  ":(exclude)**/*.woff",
  ":(exclude)**/*.woff2",
  ":(exclude)**/*.ttf",
  ":(exclude)**/*.otf",
  ":(exclude)**/*.tsbuildinfo",
];

function log(...args) {
  const ts = new Date().toISOString();
  console.log(`[${ts}]`, ...args);
}

function git(args, opts = {}) {
  const result = spawnSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
    ...opts,
  });
  if (result.status !== 0 && !opts.allowFail) {
    throw new Error(
      `git ${args.join(" ")} failed (${result.status}): ${result.stderr || result.stdout}`
    );
  }
  return (result.stdout || "").trimEnd();
}

function resolveRange(arg) {
  if (arg && arg.includes("..")) return arg;
  // Fallback: derive origin/<default>..HEAD so manual `npm run handoff:run` works.
  let defaultBranch = "main";
  try {
    const headRef = git(["symbolic-ref", "refs/remotes/origin/HEAD"], { allowFail: true });
    if (headRef) {
      defaultBranch = headRef.replace(/^refs\/remotes\/origin\//, "");
    }
  } catch {
    // fall through to "main"
  }
  return `origin/${defaultBranch}..HEAD`;
}

function parseRange(range) {
  const [base, tip] = range.split("..");
  if (!base || !tip) {
    throw new Error(`Invalid range: ${range}. Expected BASE..TIP.`);
  }
  return { base, tip };
}

// Returns commits in chronological order (oldest first), excluding [handoff] commits.
function getCommitsInRange(range) {
  const SEP = "\x1e"; // record separator
  const FSEP = "\x1f"; // field separator
  const fmt = ["%H", "%h", "%s", "%b", "%an", "%ad"].join(FSEP);
  const out = git([
    "log",
    "--reverse",
    `--pretty=format:${fmt}${SEP}`,
    "--date=format:%Y-%m-%d %H:%M",
    "--invert-grep",
    "--grep=^\\[handoff\\]",
    range,
  ]);
  if (!out.trim()) return [];
  return out
    .split(SEP)
    .map((rec) => rec.replace(/^\n/, "").trimEnd())
    .filter(Boolean)
    .map((rec) => {
      const [fullSha, shortSha, subject, body, author, date] = rec.split(FSEP);
      return {
        fullSha,
        shortSha,
        subject: subject || "",
        body: (body || "").trim(),
        author: author || "",
        date: date || "",
      };
    });
}

function getChangedFilesInRange(range) {
  const { base, tip } = parseRange(range);
  const out = git(["diff", "--name-status", `${base}...${tip}`]);
  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      const status = parts[0];
      const path = parts.slice(1).join(" ");
      return { status, path };
    });
}

function getStat(range) {
  const { base, tip } = parseRange(range);
  return git(["diff", "--stat", `${base}...${tip}`]).trim();
}

function getDiff(range) {
  const { base, tip } = parseRange(range);
  let diff = git(["diff", `${base}...${tip}`, "--", ...DIFF_EXCLUDES], { allowFail: true });
  if (diff.length > MAX_DIFF_CHARS) {
    diff = diff.slice(0, MAX_DIFF_CHARS) +
      `\n\n[... diff truncated at ${MAX_DIFF_CHARS} chars ...]`;
  }
  return diff;
}

function isMeaningful(files) {
  const ignored = (p) =>
    p === "HANDOFF.md" ||
    p === "package-lock.json" ||
    p.startsWith("dist/") ||
    p.startsWith("node_modules/") ||
    /\.(png|jpe?g|webp|gif|mp4|webm|mov|ico|woff2?|ttf|otf|tsbuildinfo)$/i.test(p);
  return files.some((f) => !ignored(f.path));
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildPrompt({ commits, stat, diff, range, baseShort, tipShort }) {
  const commitList = commits
    .map((c) => {
      const body = c.body
        ? "\n" + c.body.split("\n").map((l) => "      " + l).join("\n")
        : "";
      return `  - ${c.shortSha} (${c.date}, ${c.author}): ${c.subject}${body}`;
    })
    .join("\n");

  const headerTitle = `## ${nowStamp()} — push ${baseShort}..${tipShort} (${commits.length} commit${commits.length === 1 ? "" : "s"})`;

  return `You are writing a handoff note for engineer Curry, who will rebuild this UI in production. Be concrete and skimmable. Do NOT include any preamble, explanation, or trailing chatter — output only the markdown section in the exact format below.

Repo context: a Vite + React + TypeScript prototype for Zoom's AI productivity microsite. The design source-of-truth is DESIGN.md (color tokens, type scale, component specs). Component patterns live in design-system/. Section components live in src/sections/. Reusable UI primitives live in src/components/.

This is a handoff for a SINGLE PUSH containing ${commits.length} commit${commits.length === 1 ? "" : "s"} (range ${range}). Aggregate the work into one cohesive spec — describe the end-state of the changes, not a per-commit log. If multiple commits touched the same area, summarize the final result.

Commits in this push (oldest -> newest):
${commitList}

Combined file stat:
${stat}

Combined unified diff:
\`\`\`diff
${diff}
\`\`\`

Output a single markdown section in this EXACT shape (no preamble, no trailing prose):

${headerTitle}

### Design changes
- <bullets describing visual / token / spec changes. Cite DESIGN.md tokens by name when relevant. Omit this section entirely if no visual or design-spec change.>

### Code changes
- <bullets describing component logic, new files, refactors, prop or state changes. Be specific about file paths.>

### Files touched
- \`<path>\` (new | modified | deleted) — <one-line note about what changed>

### Integration notes for Curry
- <2-4 bullets: dependencies Curry needs to install, gotchas, what is prototype-only vs production-ready, anything Curry would otherwise have to ask Jerry about>
`;
}

function runCursorAgent(prompt) {
  return new Promise((resolveP, rejectP) => {
    const args = ["-p", "--output-format", "text", "--force", "--trust"];
    if (MODEL) args.push("--model", MODEL);
    args.push(prompt);

    log(`Invoking cursor-agent (prompt ${prompt.length} chars)...`);
    const child = spawn("cursor-agent", args, {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        PATH: `${process.env.HOME}/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ""}`,
      },
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });
    child.on("error", (err) => rejectP(err));
    child.on("close", (code) => {
      if (code !== 0) {
        return rejectP(new Error(`cursor-agent exited ${code}\nstderr:\n${stderr}\nstdout:\n${stdout}`));
      }
      resolveP(stdout.trim());
    });
  });
}

function prependToHandoff(entry) {
  const header = `# Handoff Log

> Auto-generated by \`scripts/generate-handoff.mjs\` via the \`.githooks/pre-push\` hook.
> Newest entries appear at the top. Each entry corresponds to one push.

`;
  let existing = "";
  if (existsSync(HANDOFF_PATH)) {
    existing = readFileSync(HANDOFF_PATH, "utf8");
    if (existing.startsWith("# Handoff Log")) {
      existing = existing.replace(/^# Handoff Log[\s\S]*?\n---\n*/, "");
    }
  }
  const body = `${header}${entry.trim()}\n\n---\n\n${existing}`;
  writeFileSync(HANDOFF_PATH, body);
}

function buildCommitMessage(commits) {
  if (commits.length === 1) {
    const c = commits[0];
    return `[handoff] for ${c.shortSha} — ${c.subject}`;
  }
  const first = commits[0].subject;
  const last = commits[commits.length - 1].subject;
  let msg = `[handoff] for push (${commits.length} commits): ${first} … ${last}`;
  // Keep first line under ~120 chars
  if (msg.length > 120) msg = msg.slice(0, 117) + "...";
  return msg;
}

function commitHandoff(commits) {
  git(["add", "HANDOFF.md"]);
  const staged = git(["diff", "--cached", "--name-only"]);
  if (!staged.includes("HANDOFF.md")) {
    log("HANDOFF.md had no staged changes; skipping commit.");
    return;
  }
  const msg = buildCommitMessage(commits);
  git(["commit", "-m", msg, "--no-verify"]);
  log(`Committed: ${msg}`);
}

async function main() {
  const range = resolveRange(process.argv[2]);
  log(`Starting handoff generation for range ${range}`);

  const { base, tip } = parseRange(range);

  // Sanity-check that both endpoints resolve to commits.
  let baseSha, tipSha;
  try {
    baseSha = git(["rev-parse", "--verify", base]);
    tipSha = git(["rev-parse", "--verify", tip]);
  } catch (err) {
    log(`Could not resolve range endpoints: ${err.message}`);
    log("Skipping handoff (likely a first push or detached state).");
    return;
  }

  const baseShort = git(["rev-parse", "--short", baseSha]);
  const tipShort = git(["rev-parse", "--short", tipSha]);

  const commits = getCommitsInRange(range);
  if (commits.length === 0) {
    log("No non-[handoff] commits in range. Skipping.");
    return;
  }
  log(`Range contains ${commits.length} non-[handoff] commit(s).`);

  const files = getChangedFilesInRange(range);
  if (!isMeaningful(files)) {
    log("Range only touches ignored paths. Skipping.");
    return;
  }

  const stat = getStat(range);
  const diff = getDiff(range);
  if (!diff.trim()) {
    log("Empty diff after exclusions. Skipping.");
    return;
  }

  const prompt = buildPrompt({ commits, stat, diff, range, baseShort, tipShort });
  const entry = await runCursorAgent(prompt);

  if (!entry || entry.length < 40) {
    throw new Error(`cursor-agent returned an unexpectedly short response: ${JSON.stringify(entry)}`);
  }

  prependToHandoff(entry);
  log(`Wrote entry (${entry.length} chars) to HANDOFF.md`);

  commitHandoff(commits);
  log("Done.");
}

main().catch((err) => {
  log("ERROR:", err.message);
  process.exit(1);
});
