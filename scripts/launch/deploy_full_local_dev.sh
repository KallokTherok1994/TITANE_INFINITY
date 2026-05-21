#!/usr/bin/env bash
# TITANE∞ — Deploy local DEV ("server" complet)
# Scope: local-first, dev runtime only (Tauri backend + frontend + Ollama).
# IMPORTANT: No production build/bundling here.
# Usage:
#   ./scripts/launch/deploy_full_local_dev.sh [--polling] [--smoke SECONDS] [--model NAME] [--base-url URL] [--pull-model] [--no-ollama] [-- <tauri args>]

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

bootstrap_windows_dev_env() {
  case "$(uname -s 2>/dev/null || echo unknown)" in
    MINGW*|MSYS*|CYGWIN*) ;;
    *) return 0 ;;
  esac

  if [[ -z "${HOME:-}" && -n "${USERPROFILE:-}" ]]; then
    export HOME="$USERPROFILE"
  fi

  HOST_APPDATA="${APPDATA:-$HOME/AppData/Roaming}"
  export TITANE_HOST_APPDATA="$HOST_APPDATA"
  if command -v cygpath >/dev/null 2>&1; then
    HOST_APPDATA_UNIX="$(cygpath -u "$HOST_APPDATA")"
    DEV_APPDATA_UNIX="$HOST_APPDATA_UNIX/TITANE_INFINITY/dev/appdata"
    mkdir -p "$DEV_APPDATA_UNIX"
    export TITANE_DEV_APPDATA_ROOT="${TITANE_DEV_APPDATA_ROOT:-$(cygpath -w "$DEV_APPDATA_UNIX")}"
  else
    export TITANE_DEV_APPDATA_ROOT="${TITANE_DEV_APPDATA_ROOT:-$HOST_APPDATA/TITANE_INFINITY/dev/appdata}"
    mkdir -p "$TITANE_DEV_APPDATA_ROOT"
  fi
  export APPDATA="$TITANE_DEV_APPDATA_ROOT"
  if command -v cygpath >/dev/null 2>&1; then
    export TITANE_SECRETS_PATH="${TITANE_SECRETS_PATH:-$(cygpath -w "$(cygpath -u "$TITANE_DEV_APPDATA_ROOT")/titane_infinity/secrets.enc")}"
  else
    export TITANE_SECRETS_PATH="${TITANE_SECRETS_PATH:-$TITANE_DEV_APPDATA_ROOT/titane_infinity/secrets.enc}"
  fi

  export TITANE_DEV_AUTO_TOKEN="${TITANE_DEV_AUTO_TOKEN:-1}"
  export RUST_MIN_STACK="${RUST_MIN_STACK:-67108864}"
  export RUSTFLAGS="${RUSTFLAGS:--C panic=abort -C link-arg=/STACK:67108864}"

  if [[ -z "${TITANE_SECRETS_PASSPHRASE:-}" ]]; then
    TITANE_SECRETS_PASSPHRASE="$(
      node -e "
        const { randomBytes } = require('node:crypto');
        const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
        const path = require('node:path');
        const home = process.env.HOME || process.env.USERPROFILE;
        const appData = process.env.TITANE_HOST_APPDATA || process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
        const devDir = path.join(appData, 'TITANE_INFINITY', 'dev');
        const file = path.join(devDir, 'secrets-passphrase.txt');
        mkdirSync(devDir, { recursive: true });
        if (!existsSync(file)) writeFileSync(file, randomBytes(32).toString('hex'), { encoding: 'ascii', mode: 0o600 });
        process.stdout.write(readFileSync(file, 'utf8').trim());
      "
    )"
    export TITANE_SECRETS_PASSPHRASE
  fi
}

bootstrap_windows_dev_env

cleanup_windows_dev_processes() {
  if ! command -v powershell.exe >/dev/null 2>&1; then
    return 0
  fi

  local win_root="$ROOT_DIR"
  if command -v cygpath >/dev/null 2>&1; then
    win_root="$(cygpath -w "$ROOT_DIR")"
  fi

  TITANE_CLEANUP_ROOT="$win_root" powershell.exe -NoProfile -ExecutionPolicy Bypass -Command '
    $root = $env:TITANE_CLEANUP_ROOT
    Get-CimInstance Win32_Process |
      Where-Object {
        $_.Name -eq "titane-infinity.exe" -or
        ($_.CommandLine -and $_.CommandLine.Contains($root) -and (
          $_.Name -eq "cargo.exe" -or
          (($_.Name -eq "node.exe" -or $_.Name -eq "pnpm.exe" -or $_.Name -eq "cmd.exe") -and $_.CommandLine -match "vite|run-vite-dev|tauri")
        ))
      } |
      ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
      }
  ' >/dev/null 2>&1 || true
}

# Basic sanity: must be run from repo
if [[ ! -f package.json ]]; then
  echo "❌ Erreur: exécute ce script depuis le repo TITANE_INFINITY."
  exit 1
fi

# inotify guard (common ENOSPC source)
if [[ -r /proc/sys/fs/inotify/max_user_watches ]]; then
  CURRENT_LIMIT=$(cat /proc/sys/fs/inotify/max_user_watches)
  REQUIRED_LIMIT=524288
  if [[ "${CURRENT_LIMIT:-0}" -lt "$REQUIRED_LIMIT" ]]; then
    echo "❌ Limite inotify insuffisante: $CURRENT_LIMIT (requise: $REQUIRED_LIMIT)"
    echo "   Fix temporaire: sudo sysctl fs.inotify.max_user_watches=$REQUIRED_LIMIT"
    exit 1
  fi
fi

POLLING=0
SMOKE_SECONDS="${SMOKE_SECONDS:-}"
PASSTHRU=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --polling)
      POLLING=1
      shift
      ;;
    --smoke)
      if [[ $# -ge 2 && ! "$2" =~ ^-- ]]; then
        SMOKE_SECONDS="$2"
        shift 2
      else
        SMOKE_SECONDS="${SMOKE_SECONDS:-30}"
        shift
      fi
      ;;
    --)
      shift
      PASSTHRU+=("$@")
      break
      ;;
    *)
      PASSTHRU+=("$1")
      shift
      ;;
  esac
done

if [[ "$POLLING" -eq 1 ]]; then
  export CHOKIDAR_USEPOLLING=true
  export CHOKIDAR_INTERVAL=300
  echo "ℹ️  Polling activé: CHOKIDAR_USEPOLLING=true (300ms)"
fi

echo "🖥️  Mode TAURI-ONLY: backend via IPC (pas de serveur HTTP public)"

if [[ -n "${SMOKE_SECONDS:-}" ]]; then
  echo "🧪 Smoke mode: run ${SMOKE_SECONDS}s puis arrêt propre"

  mkdir -p runtime/dev/logs
  : > runtime/dev/logs/tauri.log
  ./runtime/dev/cleanup.sh >/dev/null 2>&1 || true
  cleanup_windows_dev_processes

  PID=""
  smoke_cleanup() {
    set +e
    if [[ -n "${PID:-}" ]]; then
      kill -INT "$PID" >/dev/null 2>&1 || true
      for _ in {1..10}; do
        if ! kill -0 "$PID" >/dev/null 2>&1; then
          break
        fi
        sleep 0.5
      done
      if kill -0 "$PID" >/dev/null 2>&1; then
        kill -TERM "$PID" >/dev/null 2>&1 || true
      fi
      for _ in {1..10}; do
        if ! kill -0 "$PID" >/dev/null 2>&1; then
          break
        fi
        sleep 0.5
      done
      if kill -0 "$PID" >/dev/null 2>&1; then
        kill -KILL "$PID" >/dev/null 2>&1 || true
      fi
      wait "$PID" >/dev/null 2>&1 || true
    fi
    ./runtime/dev/cleanup.sh >/dev/null 2>&1 || true
    cleanup_windows_dev_processes

    # Le runtime peut écrire dans ce fichier (tracké) pendant un dev/smoke.
    # On le restaure pour garder un workspace propre et éviter des échecs Prettier.
    if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      if [[ -f src-tauri/memory/memory_core_state.json ]]; then
        if ! git diff --quiet -- src-tauri/memory/memory_core_state.json >/dev/null 2>&1; then
          git restore src-tauri/memory/memory_core_state.json >/dev/null 2>&1 || true
        fi
      fi
    fi
  }

  on_signal() {
    echo "⚠️  Interruption détectée — cleanup dev (ports/process)" >&2
    smoke_cleanup
    exit 130
  }

  trap smoke_cleanup EXIT
  trap on_signal INT TERM

  # Si aucune commande n'est fournie, on lance un Tauri dev minimal (sans Ollama par défaut).
  if [[ "${#PASSTHRU[@]}" -eq 0 ]]; then
    PASSTHRU=(--no-ollama -- tauri dev --config runtime/dev/tauri.conf.json --no-watch)
  fi

  set +e
  ./scripts/dev/full_local_tauri_ollama.sh "${PASSTHRU[@]}" >> runtime/dev/logs/tauri.log 2>&1 &
  PID=$!
  set -e

  # Vérifie que le process ne meurt pas immédiatement (erreur de config / CLI).
  sleep 2
  if ! kill -0 "$PID" >/dev/null 2>&1; then
    echo "❌ Smoke: Tauri n'a pas démarré (process terminé trop vite)." >&2
    echo "--- tail runtime/dev/logs/tauri.log ---" >&2
    tail -n 120 runtime/dev/logs/tauri.log | cat >&2
    exit 2
  fi

  BOOT_READY=0
  BOOT_TIMEOUT_SECONDS="${TAURI_BOOT_TIMEOUT_SECONDS:-300}"
  BOOT_DEADLINE=$((SECONDS + BOOT_TIMEOUT_SECONDS))
  while [[ "$SECONDS" -lt "$BOOT_DEADLINE" ]]; do
    if ! kill -0 "$PID" >/dev/null 2>&1; then
      echo "❌ Smoke: Tauri s'est arrêté avant BOOT:READY." >&2
      echo "--- tail runtime/dev/logs/tauri.log ---" >&2
      tail -n 120 runtime/dev/logs/tauri.log | cat >&2
      exit 2
    fi

    if grep -Eiq 'finished.*`dev` profile|running.*target.*titane|tauri app started|ui_boot_marker' runtime/dev/logs/tauri.log 2>/dev/null; then
      echo "✅ BOOT:READY Tauri dev runtime ready"
      BOOT_READY=1
      break
    fi

    sleep 1
  done

  if [[ "$BOOT_READY" -ne 1 ]]; then
    echo "❌ Smoke: BOOT:READY non observé en ${BOOT_TIMEOUT_SECONDS}s." >&2
    echo "--- tail runtime/dev/logs/tauri.log ---" >&2
    tail -n 160 runtime/dev/logs/tauri.log | cat >&2
    exit 2
  fi

  DEADLINE=$((SECONDS + SMOKE_SECONDS))
  while [[ "$SECONDS" -lt "$DEADLINE" ]]; do
    if ! kill -0 "$PID" >/dev/null 2>&1; then
      echo "❌ Smoke: Tauri s'est arrêté après BOOT:READY." >&2
      echo "--- tail runtime/dev/logs/tauri.log ---" >&2
      tail -n 120 runtime/dev/logs/tauri.log | cat >&2
      exit 2
    fi
    sleep 1
  done

  exit 0
fi

exec ./scripts/dev/full_local_tauri_ollama.sh "${PASSTHRU[@]}"
