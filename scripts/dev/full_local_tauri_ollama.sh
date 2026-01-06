#!/usr/bin/env bash
# TITANE∞ — Full local DEV launcher (Tauri + Ollama)
# Dev-only: no production build/bundling.
# Usage:
#   ./scripts/dev/full_local_tauri_ollama.sh [--base-url URL] [--model NAME] [--pull-model] [--no-ollama] [-- <tauri args>]

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

BASE_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
MODEL="${OLLAMA_DEFAULT_MODEL:-}"
NO_OLLAMA=0
PULL_MODEL="${TITANE_OLLAMA_PULL_MODEL:-0}"

EXTRA_ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --model)
      MODEL="$2"
      shift 2
      ;;
    --pull-model)
      PULL_MODEL=1
      shift
      ;;
    --no-ollama)
      NO_OLLAMA=1
      shift
      ;;
    --)
      shift
      EXTRA_ARGS+=("$@")
      break
      ;;
    *)
      EXTRA_ARGS+=("$1")
      shift
      ;;
  esac
done

export OLLAMA_BASE_URL="$BASE_URL"
if [[ -n "$MODEL" ]]; then
  export OLLAMA_DEFAULT_MODEL="$MODEL"
fi

mkdir -p runtime/dev/logs
OLLAMA_LOG="runtime/dev/logs/ollama.log"
STARTED_OLLAMA=0
OLLAMA_PID=""

ollama_ready() {
  if ! command -v curl >/dev/null 2>&1; then
    return 1
  fi
  curl -fsS "$OLLAMA_BASE_URL/api/tags" >/dev/null 2>&1
}

cleanup() {
  if [[ "$STARTED_OLLAMA" -eq 1 ]] && [[ -n "$OLLAMA_PID" ]]; then
    kill "$OLLAMA_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

if [[ "$NO_OLLAMA" -eq 0 ]]; then
  echo "🧠 Ollama base URL: $OLLAMA_BASE_URL"

  if ollama_ready; then
    echo "✅ Ollama est déjà actif."
  else
    if ! command -v ollama >/dev/null 2>&1; then
      echo "❌ ollama introuvable dans PATH."
      echo "   Installe Ollama, puis relance ce script."
      exit 1
    fi

    echo "🟢 Démarrage d'Ollama (logs: $OLLAMA_LOG) ..."
    (ollama serve >>"$OLLAMA_LOG" 2>&1) &
    OLLAMA_PID="$!"
    STARTED_OLLAMA=1

    for _ in $(seq 1 30); do
      if ollama_ready; then
        break
      fi
      sleep 1
    done

    if ! ollama_ready; then
      echo "❌ Ollama n'a pas répondu sous 30s: $OLLAMA_BASE_URL"
      echo "   Vérifie le log: $OLLAMA_LOG"
      exit 1
    fi

    echo "✅ Ollama prêt."
  fi

  if [[ -z "${OLLAMA_DEFAULT_MODEL:-}" ]]; then
    echo "ℹ️  Aucun modèle défini. Option: --model <nom> (ex: llama3.1:8b)"
  elif [[ "$PULL_MODEL" -eq 1 ]]; then
    echo "📦 Pull du modèle (peut prendre du temps): ${OLLAMA_DEFAULT_MODEL}"
    ollama pull "${OLLAMA_DEFAULT_MODEL}" || echo "⚠️  Pull modèle échoué (non bloquant)"
  else
    echo "ℹ️  Modèle configuré: ${OLLAMA_DEFAULT_MODEL} (pull auto désactivé)"
    echo "   Pour pull: --pull-model (ou TITANE_OLLAMA_PULL_MODEL=1)"
  fi
fi

echo "🚀 Lancement Titan-Dev (Tauri) ..."
./runtime/dev/run-dev.sh "${EXTRA_ARGS[@]}"
