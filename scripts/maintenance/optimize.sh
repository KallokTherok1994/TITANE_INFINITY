#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/maintenance/optimize.sh [--deep] [--dry-run]

Options:
  --deep     Also removes local build artefacts (dist/, build/)
  --dry-run  Print targets without deleting anything
  -h, --help Show this help

Notes:
  - Safe by default: does not touch git files, settings, or auth tokens.
  - Rebuildable caches are recreated automatically by VS Code and toolchains.
EOF
}

DEEP=0
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --deep)
      DEEP=1
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "FAIL: unknown option: $arg" >&2
      usage
      exit 2
      ;;
  esac
done

WORKSPACE_ROOT=""
if command -v git >/dev/null 2>&1; then
  WORKSPACE_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
fi
if [[ -z "$WORKSPACE_ROOT" ]]; then
  WORKSPACE_ROOT="$PWD"
fi

HOME_CODE="$HOME/.config/Code"

TARGETS=(
  "$WORKSPACE_ROOT/.vite"
  "$WORKSPACE_ROOT/.vite-cache"
  "$WORKSPACE_ROOT/node_modules/.cache"
  "$WORKSPACE_ROOT/coverage"
  "$WORKSPACE_ROOT/playwright-report"
  "$WORKSPACE_ROOT/test-results"
  "$WORKSPACE_ROOT/src-tauri/target"
  "$HOME_CODE/Cache"
  "$HOME_CODE/CachedData"
  "$HOME_CODE/Code Cache"
  "$HOME_CODE/CachedExtensionVSIXs"
  "$HOME_CODE/GPUCache"
  "$HOME_CODE/Service Worker/CacheStorage"
  "$HOME_CODE/User/workspaceStorage"
  "$HOME_CODE/logs"
  "$HOME/.cache/Code"
  "$HOME/.cache/github-copilot"
  "$HOME_CODE/User/globalStorage/github.copilot-chat"
  "$HOME_CODE/User/globalStorage/emptyWindowChatSessions"
)

if [[ "$DEEP" == "1" ]]; then
  TARGETS+=(
    "$WORKSPACE_ROOT/dist"
    "$WORKSPACE_ROOT/build"
  )
fi

echo "[optimize] workspace: $WORKSPACE_ROOT"
echo "[optimize] mode: $([[ "$DEEP" == "1" ]] && echo deep || echo standard)"
echo "[optimize] dry_run: $DRY_RUN"

removed=0
skipped=0

for target in "${TARGETS[@]}"; do
  if [[ -e "$target" ]]; then
    if [[ "$DRY_RUN" == "1" ]]; then
      echo "DRY-RUN: would remove $target"
      ((skipped+=1))
    else
      rm -rf -- "$target"
      if [[ -e "$target" ]]; then
        echo "FAIL: remove failed for $target" >&2
        exit 1
      fi
      echo "REMOVED: $target"
      ((removed+=1))
    fi
  fi
done

if [[ "$DRY_RUN" == "1" ]]; then
  echo "PASS: optimize dry-run complete (targets_found=$skipped)"
else
  mkdir -p "$HOME_CODE/logs"
  echo "PASS: optimize complete (removed=$removed)"
fi
