#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
export TITANE_E2E_ARTIFACTS_DIR="${TITANE_E2E_ARTIFACTS_DIR:-reports/tauri_memory_e2e/$STAMP}"
export TITANE_MEMORY_PROOF=1
export TITANE_PROOF_SCENARIO="${TITANE_PROOF_SCENARIO:-MEMORY_MULTI_TURN}"
export TITANE_PROOF_RUN="${TITANE_PROOF_RUN:-run1}"
export TITANE_E2E_WDIO_LOG_BASENAME="${TITANE_E2E_WDIO_LOG_BASENAME:-wdio-memory-chat-proof-ui.log}"
export TITANE_E2E_ASSISTANT_TIMEOUT_MS="${TITANE_E2E_ASSISTANT_TIMEOUT_MS:-60000}"

exec bash scripts/e2e/run-online-chat-proof-ui.sh