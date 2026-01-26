#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

AUTOHEAL_DEV_HYGIENE="${TITANE_AUTOHEAL_DEV_HYGIENE:-0}"
SETTLE_SECONDS="${TITANE_DEV_HYGIENE_SETTLE_SECONDS:-2}"

settle_wait_until_empty() {
  # Poll until output becomes empty (or timeout).
  # Args: <seconds> <cmd...>
  local seconds="$1"
  shift

  # If seconds is invalid/zero, don't wait.
  if ! [[ "$seconds" =~ ^[0-9]+$ ]] || [ "$seconds" -le 0 ]; then
    return 1
  fi

  local deadline now out
  deadline=$(( $(date +%s) + seconds ))

  while :; do
    out="$("$@" || true)"
    if [ -z "${out//[[:space:]]/}" ]; then
      return 0
    fi

    now="$(date +%s)"
    if [ "$now" -ge "$deadline" ]; then
      return 1
    fi

    sleep 0.2
  done
}

is_safe_to_kill_pid() {
  local pid="$1"
  local args
  args="$(ps -p "$pid" -o args= 2>/dev/null || true)"

  case "$args" in
    *"vite/bin/vite.js"*|*"vite.js dev"*|*"/vite.js"*" dev "*|*" tauri dev"*|*"pnpm run dev:tauri"*)
      return 0
      ;;
  esac

  return 1
}

kill_pid_if_safe() {
  local pid="$1"
  if ! is_safe_to_kill_pid "$pid"; then
    echo "WARN: refusing to kill pid=$pid (not recognized as vite/tauri dev)"
    return 0
  fi

  echo "autoheal: killing pid=$pid"
  kill -TERM "$pid" 2>/dev/null || true
}

extract_pids_from_ss() {
  # Extract pid=1234 patterns from ss output.
  local lines="$1"
  printf '%s\n' "$lines" | sed -nE 's/.*pid=([0-9]+).*/\1/p' | sort -u
}

autoheal_from_ports_output() {
  local ports_output="$1"
  local pid
  while IFS= read -r pid; do
    [ -z "$pid" ] && continue
    kill_pid_if_safe "$pid"
  done < <(extract_pids_from_ss "$ports_output")
}

check_ports() {
  echo "--- listening ports (4000/5173/4173/1430) ---"
  local ss_out
  ss_out="$( (ss -ltnp 2>/dev/null || ss -ltn 2>/dev/null) | grep -E ':(4000|5173|4173|1430)\\b' || true )"

  if [ -n "${ss_out//[[:space:]]/}" ]; then
    # Les runners peuvent encore être en phase d'arrêt (ex: Vite juste après Playwright).
    # En mode strict, on laisse une courte fenêtre de stabilisation avant d'échouer.
    if [ "$AUTOHEAL_DEV_HYGIENE" != "1" ]; then
      if settle_wait_until_empty "$SETTLE_SECONDS" bash -lc "(ss -ltnp 2>/dev/null || ss -ltn 2>/dev/null) | grep -E ':(4000|5173|4173|1430)\\b' || true"; then
        echo "OK: no dev ports (settled)"
        return 0
      fi
    fi

    printf '%s\n' "$ss_out" | cat

    if [ "$AUTOHEAL_DEV_HYGIENE" = "1" ]; then
      autoheal_from_ports_output "$ss_out"
      sleep 1

      ss_out="$( (ss -ltnp 2>/dev/null || ss -ltn 2>/dev/null) | grep -E ':(4000|5173|4173|1430)\\b' || true )"
      if [ -z "${ss_out//[[:space:]]/}" ]; then
        echo "OK: no dev ports (autoheal)"
        return 0
      fi
    fi

    return 1
  fi

  echo "OK: no dev ports"
}

check_processes() {
  echo "--- dev processes (vite/tauri dev) ---"

  # NOTE: "vitest.explorer" contains "vite"; avoid false positives.
  # Match only actual Vite CLI entrypoint + tauri dev.
  local matches filtered
  matches="$(pgrep -af 'vite/bin/vite\.js|\btauri dev\b|pnpm run dev:tauri|runtime/dev/tauri\.(dev\.)?conf\.json|vite\.js --port' 2>/dev/null || true)"
  filtered=""

  while IFS= read -r line; do
    case "$line" in
      *"pgrep -af"*) continue ;;
      *"vitest.explorer"*|*"/dist/worker.js"*) continue ;;
    esac
    [ -n "$line" ] && filtered="${filtered}${line}\n"
  done <<< "$matches"

  if [ -n "${filtered//[[:space:]]/}" ]; then
    if [ "$AUTOHEAL_DEV_HYGIENE" != "1" ]; then
      if settle_wait_until_empty "$SETTLE_SECONDS" bash -lc "pgrep -af 'vite/bin/vite\\.js|\\btauri dev\\b|pnpm run dev:tauri|runtime/dev/tauri\\.(dev\\.)?conf\\.json|vite\\.js --port' 2>/dev/null || true"; then
        echo "OK: no dev processes (settled)"
        return 0
      fi
    fi

    printf '%s' "$filtered" | head -n 50

    if [ "$AUTOHEAL_DEV_HYGIENE" = "1" ]; then
      local pid
      while IFS= read -r pid; do
        [ -z "$pid" ] && continue
        kill_pid_if_safe "$pid"
      done < <(printf '%s' "$filtered" | awk '{print $1}' | sed -nE 's/^([0-9]+)$/\1/p' | sort -u)

      sleep 1

      matches="$(pgrep -af 'vite/bin/vite\.js|\btauri dev\b|pnpm run dev:tauri|runtime/dev/tauri\.(dev\.)?conf\.json|vite\.js --port' 2>/dev/null || true)"
      filtered=""

      while IFS= read -r line; do
        case "$line" in
          *"pgrep -af"*) continue ;;
          *"vitest.explorer"*|*"/dist/worker.js"*) continue ;;
        esac
        [ -n "$line" ] && filtered="${filtered}${line}\n"
      done <<< "$matches"

      if [ -z "${filtered//[[:space:]]/}" ]; then
        echo "OK: no dev processes (autoheal)"
        return 0
      fi
    fi

    return 1
  fi

  echo "OK: no dev processes"
}

exit_code=0
check_ports || exit_code=1
check_processes || exit_code=1
exit "$exit_code"
