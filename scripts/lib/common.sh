#!/usr/bin/env bash
# scripts/lib/common.sh — Librairie commune TITANE∞
# Usage: source scripts/lib/common.sh
set -euo pipefail

TITANE_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TITANE_LOGS_DIR="${TITANE_REPO_ROOT}/proof_packs"
TITANE_TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

log_info()  { echo "[$(date -u +%H:%M:%SZ)] [INFO]  $*"; }
log_warn()  { echo "[$(date -u +%H:%M:%SZ)] [WARN]  $*" >&2; }
log_error() { echo "[$(date -u +%H:%M:%SZ)] [ERROR] $*" >&2; }
log_pass()  { echo "[$(date -u +%H:%M:%SZ)] [PASS]  $*"; }
log_fail()  { echo "[$(date -u +%H:%M:%SZ)] [FAIL]  $*" >&2; exit 1; }

# Redact secrets from output
redact_secrets() {
  sed -E \
    -e 's/(sk-[A-Za-z0-9_-]{20,})/[REDACTED_SK]/g' \
    -e 's/(api[_-]?key\s*[=:]\s*)["\x27]?[A-Za-z0-9_-]{8,}/\1[REDACTED]/gi' \
    -e 's/(bearer\s+)[A-Za-z0-9_.-]{20,}/\1[REDACTED]/gi' \
    -e 's/(OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY)=[^\s]*/\1=[REDACTED]/g'
}

# Check required tool
require_tool() {
  local tool="$1"
  if ! command -v "$tool" &>/dev/null && ! test -f "${TITANE_REPO_ROOT}/node_modules/.bin/${tool}"; then
    log_error "Required tool not found: $tool"
    return 1
  fi
}

# Run command with timeout
run_with_timeout() {
  local timeout_sec="$1"; shift
  timeout "${timeout_sec}" "$@"
}

export TITANE_REPO_ROOT TITANE_LOGS_DIR TITANE_TIMESTAMP
