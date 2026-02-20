#!/usr/bin/env bash
set -euo pipefail

pass=true

check_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "[FAIL] Missing $name"
    pass=false
  else
    echo "[OK] $name present"
  fi
}

check_http() {
  local label="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "[OK] $label reachable"
  else
    echo "[FAIL] $label unreachable"
    pass=false
  fi
}

check_env GEMINI_API_KEY
check_env OPENAI_API_KEY
check_env ANTHROPIC_API_KEY

if [[ -n "${GEMINI_API_KEY:-}" ]]; then
  check_http "Gemini API" "curl -fsS -m 5 -H 'x-goog-api-key: ${GEMINI_API_KEY}' https://generativelanguage.googleapis.com/v1beta/models"
fi

if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  check_http "OpenAI API" "curl -fsS -m 5 -H 'Authorization: Bearer ${OPENAI_API_KEY}' https://api.openai.com/v1/models"
fi

if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  check_http "Anthropic API" "curl -fsS -m 5 -H 'x-api-key: ${ANTHROPIC_API_KEY}' -H 'anthropic-version: 2023-06-01' https://api.anthropic.com/v1/models"
fi

if [[ "${TITANE_OLLAMA_AUTO_ENABLED:-}" == "1" || "${TITANE_LOCALHOST_PROBES_ENABLED:-}" == "1" ]]; then
  check_http "Ollama local" "curl -fsS -m 3 http://localhost:11434/api/tags"
else
  echo "[INFO] Ollama probe disabled (set TITANE_OLLAMA_AUTO_ENABLED=1 or TITANE_LOCALHOST_PROBES_ENABLED=1)"
fi

if [[ "$pass" == true ]]; then
  echo "[PASS] Online providers check OK"
  exit 0
fi

echo "[FAIL] Online providers check failed"
exit 1
