#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

check_ports() {
  echo "--- listening ports (4000/5173/4173/1430) ---"
  if (ss -ltnp 2>/dev/null || ss -ltn 2>/dev/null) | grep -E ':(4000|5173|4173|1430)\b' >/dev/null; then
    (ss -ltnp 2>/dev/null || ss -ltn 2>/dev/null) | grep -E ':(4000|5173|4173|1430)\b' | cat
    return 1
  fi
  echo "OK: no dev ports"
}

check_processes() {
  echo "--- dev processes (vite/tauri dev) ---"

  # NOTE: "vitest.explorer" contains "vite"; avoid false positives.
  # Match only actual Vite CLI entrypoint + tauri dev.
  local matches filtered
  matches="$(pgrep -af 'vite/bin/vite\.js|\btauri dev\b|pnpm run dev:tauri|runtime/dev/tauri\.conf\.json|vite\.js --port' 2>/dev/null || true)"
  filtered=""

  while IFS= read -r line; do
    case "$line" in
      *"pgrep -af"*) continue ;;
      *"vitest.explorer"*|*"/dist/worker.js"*) continue ;;
    esac
    [ -n "$line" ] && filtered="${filtered}${line}\n"
  done <<< "$matches"

  if [ -n "${filtered//[[:space:]]/}" ]; then
    printf '%s' "$filtered" | head -n 50
    return 1
  fi

  echo "OK: no dev processes"
}

exit_code=0
check_ports || exit_code=1
check_processes || exit_code=1
exit "$exit_code"
