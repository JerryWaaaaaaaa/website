#!/usr/bin/env bash
# One-time setup: point Git at the versioned .githooks directory so the
# handoff pre-push hook fires when GitHub Desktop pushes commits.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

git config core.hooksPath .githooks
chmod +x .githooks/pre-push

# Clean up the older post-commit hook if it was previously installed.
rm -f .githooks/post-commit

echo "[handoff] hooks installed."
echo "[handoff] core.hooksPath = $(git config core.hooksPath)"
echo "[handoff] Pushing will now block briefly (~30-60s) to generate a handoff doc,"
echo "[handoff] then ask you to click Push a second time to ship code + doc together."
echo "[handoff] Next: run 'cursor-agent login' if you haven't already."
