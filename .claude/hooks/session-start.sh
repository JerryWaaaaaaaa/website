#!/bin/bash
set -euo pipefail

# Re-activate this repo's versioned git hooks (.githooks/) on every session.
#
# Cloud sessions are fresh clones, and `git config core.hooksPath` does not
# persist between them — so without this, the .githooks/pre-push handoff-doc
# generator would silently never run. Running install-hooks.sh here re-points
# git at .githooks in each fresh container. core.hooksPath is repo-wide, so
# this covers every branch and every linked worktree of the clone.
#
# Idempotent and non-interactive; never blocks session start on failure.

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
[ -z "$ROOT" ] && exit 0
cd "$ROOT" || exit 0

[ -f scripts/install-hooks.sh ] || exit 0

if bash scripts/install-hooks.sh >/dev/null 2>&1; then
  echo "git hooks activated (core.hooksPath=$(git config core.hooksPath 2>/dev/null))"
fi

exit 0
