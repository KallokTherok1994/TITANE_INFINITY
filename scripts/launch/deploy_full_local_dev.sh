#!/usr/bin/env bash
# TITANE∞ — Deploy local DEV ("server" complet)
# Scope: local-first, dev runtime only (Tauri backend + frontend + Ollama).
# IMPORTANT: No production build/bundling here.
# Usage:
#   ./scripts/launch/deploy_full_local_dev.sh [--polling] [--smoke SECONDS] [--model NAME] [--base-url URL] [--pull-model] [--no-ollama] [-- <tauri args>]

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

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
SMOKE_SECONDS=""
PASSTHRU=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --polling)
      POLLING=1
      shift
      ;;
    --smoke)
      SMOKE_SECONDS="$2"
      shift 2
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

  PID=""
  smoke_cleanup() {
    set +e
    if [[ -n "${PID:-}" ]]; then
      kill -INT "$PID" >/dev/null 2>&1 || true
      wait "$PID" >/dev/null 2>&1 || true
    fi
    ./runtime/dev/cleanup.sh >/dev/null 2>&1 || true

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

  sleep "$SMOKE_SECONDS"
  exit 0
fi

exec ./scripts/dev/full_local_tauri_ollama.sh "${PASSTHRU[@]}"
