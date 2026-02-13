#!/usr/bin/env bash

# Runtime dev Tauri + Ollama (local-first)
# Usage:
#   ./scripts/dev/full_local_tauri_ollama.sh [--base-url URL] [--model NAME] [--pull-model] [--no-ollama] [--] <command...>
# Examples:
#   ./scripts/dev/full_local_tauri_ollama.sh --no-ollama -- tauri dev --config runtime/dev/tauri.conf.json --no-watch
#   ./scripts/dev/full_local_tauri_ollama.sh --model llama3.2:latest --pull-model -- tauri dev --config runtime/dev/tauri.conf.json --no-watch

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# Fiabilise l'exécution de pnpm/corepack (leurs shebang utilisent /usr/bin/env node).
# En préfixant PATH avec le Node repo-bundlé, on évite de tomber sur un Node système trop ancien.
if [[ -d "$ROOT_DIR/.tools/node/current/bin" ]]; then
  export PATH="$ROOT_DIR/.tools/node/current/bin:$PATH"
fi

BASE_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
MODEL_NAME="gemma2:2b"
PULL_MODEL=false
NO_OLLAMA=false

CMD=()

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --model)
      MODEL_NAME="$2"
      shift 2
      ;;
    --pull-model)
      PULL_MODEL=true
      shift
      ;;
    --no-ollama)
      NO_OLLAMA=true
      shift
      ;;
    --)
      shift
      CMD=("$@")
      break
      ;;
    -*)
      echo "❌ Option inconnue : $1" >&2
      exit 2
      ;;
    *)
      # Tolère une invocation sans '--' : tout ce qui reste est la commande.
      CMD=("$@")
      break
      ;;
  esac
done

if [[ "${#CMD[@]}" -eq 0 ]]; then
  CMD=(tauri dev --config runtime/dev/tauri.conf.json --no-watch)
fi

PNPM_BIN=""
if command -v pnpm >/dev/null 2>&1; then
  PNPM_BIN="pnpm"
elif [[ -x "$ROOT_DIR/.tools/node/current/bin/pnpm" ]]; then
  PNPM_BIN="$ROOT_DIR/.tools/node/current/bin/pnpm"
fi

# Tauri CLI est une dépendance npm (@tauri-apps/cli). En shell direct, `tauri` n'est pas
# forcément dans PATH; on force donc la résolution via pnpm.
if [[ "${CMD[0]}" == "tauri" ]]; then
  if [[ -z "${PNPM_BIN:-}" ]]; then
    echo "❌ 'tauri' demandé, mais pnpm est introuvable (impossible d'utiliser pnpm exec)." >&2
    exit 2
  fi
  CMD=("$PNPM_BIN" exec -- "${CMD[@]}")
fi

if ! command -v "${CMD[0]}" >/dev/null 2>&1; then
  if [[ -n "${PNPM_BIN:-}" ]]; then
    echo "ℹ️  Commande '${CMD[0]}' non trouvée dans PATH; fallback via 'pnpm exec'."
    CMD=("$PNPM_BIN" exec -- "${CMD[@]}")
  else
    echo "❌ Commande '${CMD[0]}' introuvable (et pnpm indisponible pour pnpm exec)." >&2
    exit 2
  fi
fi

ollama_is_running() {
  curl -fsS "$BASE_URL/api/tags" >/dev/null 2>&1
}

OLLAMA_PID=""
cleanup() {
  if [[ -n "${OLLAMA_PID:-}" ]]; then
    kill -INT "$OLLAMA_PID" >/dev/null 2>&1 || true
    wait "$OLLAMA_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if [[ "$NO_OLLAMA" == "false" ]]; then
  if ! ollama_is_running; then
    if ! command -v ollama >/dev/null 2>&1; then
      echo "❌ Ollama non trouvé dans PATH (et --no-ollama non spécifié)." >&2
      exit 2
    fi

    echo "🤖 Démarrage d'Ollama (serve)"
    ollama serve >/dev/null 2>&1 &
    OLLAMA_PID=$!

    for _ in {1..40}; do
      if ollama_is_running; then
        break
      fi
      sleep 0.25
    done

    if ! ollama_is_running; then
      echo "❌ Ollama n'a pas répondu sur $BASE_URL" >&2
      exit 2
    fi
  fi

  if [[ "$PULL_MODEL" == "true" ]]; then
    echo "📥 Pull modèle Ollama: $MODEL_NAME"
    ollama pull "$MODEL_NAME"
  fi
else
  echo "ℹ️  Ollama désactivé (--no-ollama)"
fi

echo "🚀 Lancement: ${CMD[*]}"
exec "${CMD[@]}"
