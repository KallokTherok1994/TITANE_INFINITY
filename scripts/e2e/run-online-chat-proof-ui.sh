#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${TITANE_E2E_ARTIFACTS_DIR:-reports/ui_research_e2e/$STAMP}"
mkdir -p "$OUT_DIR"
export TITANE_E2E_ARTIFACTS_DIR="$OUT_DIR"

SPEC_PATH="${TITANE_E2E_SPEC_PATH:-e2e/desktop/online-chat-proof-ui.wdio.test.js}"
DRIVER_LOG="$OUT_DIR/tauri-driver.log"
WDIO_LOG="$OUT_DIR/${TITANE_E2E_WDIO_LOG_BASENAME:-wdio-online-chat-proof-ui.log}"

if [[ -n "${TAURI_DEV_SERVER_URL:-}" ]]; then
  export TITANE_E2E_EXPECT_SOURCE="${TITANE_E2E_EXPECT_SOURCE:-dev-server}"
  export TITANE_E2E_USE_TAURI_DEV="${TITANE_E2E_USE_TAURI_DEV:-1}"
else
  export TITANE_E2E_EXPECT_SOURCE="${TITANE_E2E_EXPECT_SOURCE:-embedded}"
  export TITANE_E2E_USE_TAURI_DEV="${TITANE_E2E_USE_TAURI_DEV:-0}"
fi
export TITANE_E2E_ENFORCE_SOURCE="${TITANE_E2E_ENFORCE_SOURCE:-0}"

# E2E stability profile: prefer a lightweight local model and cap backend turn timeout
# to avoid long-running UI hangs that can invalidate the WRY WebDriver session.
export OLLAMA_DEFAULT_MODEL="${TITANE_E2E_OLLAMA_MODEL:-gemma2:2b}"
# OLLAMA_REQUEST_TIMEOUT_SECS: governs the Rust HTTP client timeout in ollama.rs.
# The online chat proof explicitly requests a long 6-section answer; 15s can flip a
# real local generation into a false `PROVIDER_UNAVAILABLE` on otherwise healthy runs.
# Align this harness default with the governed desktop suite profile unless the caller
# overrides it explicitly.
export OLLAMA_REQUEST_TIMEOUT_SECS="${OLLAMA_REQUEST_TIMEOUT_SECS:-90}"
# TITANE_CONVERSATION_TIMEOUT_SECS: [DEAD — no Rust runtime honors this env var.
# Kept as a labelled stub only; remove if confusing.]

echo "[E2E_CHAT_PROOF] OUT_DIR=$OUT_DIR"
echo "[E2E_CHAT_PROOF] EXPECT_SOURCE=$TITANE_E2E_EXPECT_SOURCE"
echo "[E2E_CHAT_PROOF] ENFORCE_SOURCE=$TITANE_E2E_ENFORCE_SOURCE"
echo "[E2E_CHAT_PROOF] USE_TAURI_DEV=$TITANE_E2E_USE_TAURI_DEV"
echo "[E2E_CHAT_PROOF] OLLAMA_DEFAULT_MODEL=$OLLAMA_DEFAULT_MODEL"
echo "[E2E_CHAT_PROOF] OLLAMA_REQUEST_TIMEOUT_SECS=$OLLAMA_REQUEST_TIMEOUT_SECS [effective Rust HTTP client cap]"

if [[ "${TITANE_E2E_EXPECT_SOURCE:-embedded}" == "embedded" ]] && [[ -z "${TAURI_DEV_SERVER_URL:-}" ]]; then
  if [[ "${TITANE_E2E_SKIP_NATIVE_FRESHNESS_GUARD:-0}" == "1" ]]; then
    echo "[E2E_NATIVE_POLICY] SKIP requested via TITANE_E2E_SKIP_NATIVE_FRESHNESS_GUARD=1"
  else
    if ! node <<'EOF'
const { resolveNativeBinaryPolicy } = require('./scripts/e2e/native-binary-policy.cjs');

const policy = resolveNativeBinaryPolicy({
  rootDir: process.cwd(),
  explicitBinaryPath: process.env.TAURI_BINARY_PATH || '',
  tauriDevServerUrl: process.env.TAURI_DEV_SERVER_URL || '',
  mode: process.env.TITANE_NATIVE_BINARY_MODE || 'release',
});

console.log(
  `[E2E_NATIVE_POLICY] selected=${policy.selectedBinaryPath || '<none>'} freshness=${policy.freshnessClass} buildRequired=${policy.buildRequired}`
);

if (policy.buildRequired) {
  console.error(
    `[E2E_NATIVE_POLICY] BLOCKED workspaceAhead=${policy.workspaceAhead} paths=${JSON.stringify(policy.workspaceAheadPaths || [])}`
  );
  console.error(
    '[E2E_NATIVE_POLICY] next_step=Run pnpm run build:tauri:e2e before retrying the embedded desktop proof.'
  );
  process.exit(1);
}
EOF
    then
      exit 1
    fi
  fi

  if [[ "${TITANE_E2E_SKIP_EMBEDDED_MARKER_GUARD:-0}" == "1" ]]; then
    echo "[E2E_EMBEDDED_FRESHNESS] SKIP requested via TITANE_E2E_SKIP_EMBEDDED_MARKER_GUARD=1"
  else
    node scripts/e2e/verify_online_chat_proof_markers.mjs "${TITANE_E2E_DIST_DIR:-dist}"
  fi
fi

# ── Ollama Pre-warm Preflight ─────────────────────────────────────────────────
# Purpose: load the target model into memory BEFORE starting Tauri/WDIO to avoid
# cold-start HTTP timeout (Rust Ollama client has a hard 60s cap in the binary).
# This is INFRASTRUCTURE preparation only — NOT a product chat proof step.
# Logs are clearly prefixed [E2E_PREWARM] and never counted as product success.
OLLAMA_PREWARM_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
PREWARM_MODEL="${OLLAMA_DEFAULT_MODEL:-gemma2:2b}"
PREWARM_TIMEOUT_SECS="${TITANE_E2E_PREWARM_TIMEOUT_SECS:-120}"

echo "[E2E_PREWARM] Starting model pre-warm | model=$PREWARM_MODEL | timeout=${PREWARM_TIMEOUT_SECS}s | url=$OLLAMA_PREWARM_URL"
if ! curl -sf --max-time 5 "${OLLAMA_PREWARM_URL}/api/tags" > /dev/null 2>&1; then
  echo "[E2E_PREWARM] WARN: Ollama not reachable — skipping pre-warm (test will run anyway)"
else
  PREWARM_START=$(date +%s)
  PREWARM_RESPONSE=$(curl -sf --max-time "$PREWARM_TIMEOUT_SECS" \
    -X POST "${OLLAMA_PREWARM_URL}/api/generate" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"${PREWARM_MODEL}\",\"prompt\":\"ping\",\"stream\":false}" \
    2>/dev/null || echo "PREWARM_FAILED")
  PREWARM_ELAPSED=$(( $(date +%s) - PREWARM_START ))
  if echo "$PREWARM_RESPONSE" | grep -q '"response"'; then
    echo "[E2E_PREWARM] PASS: model loaded and warm | elapsed=${PREWARM_ELAPSED}s"
    echo "[E2E_PREWARM] INFRA_READY: cold-start window cleared before WDIO launch"
  else
    echo "[E2E_PREWARM] WARN: pre-warm response unclear after ${PREWARM_ELAPSED}s — test will run anyway"
  fi
fi
echo "[E2E_PREWARM] END"
# ── End Pre-warm ─────────────────────────────────────────────────────────────

pkill -f 'tauri-driver|WebKitWebDriver' >/dev/null 2>&1 || true
sleep 1

tauri-driver --port 4444 > "$DRIVER_LOG" 2>&1 &
DRIVER_PID=$!

cleanup() {
  kill "$DRIVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 20); do
  if ss -ltn | grep -q ':4444'; then
    break
  fi
  sleep 1
done

if [[ -n "${TAURI_DEV_SERVER_URL:-}" ]]; then
  TITANE_E2E_URL_DEFAULT="${TAURI_DEV_SERVER_URL%/}/titane?tab=conversation"
else
  TITANE_E2E_URL_DEFAULT="tauri://localhost/#/titane?tab=conversation"
fi

TITANE_E2E_URL="${TITANE_E2E_URL:-$TITANE_E2E_URL_DEFAULT}" \
pnpm exec wdio run wdio.desktop.conf.cjs --spec "$SPEC_PATH" 2>&1 | tee "$WDIO_LOG"
STATUS=${PIPESTATUS[0]}

echo "[E2E_CHAT_PROOF] STATUS=$STATUS"
echo "[E2E_CHAT_PROOF] DRIVER_LOG=$DRIVER_LOG"
echo "[E2E_CHAT_PROOF] WDIO_LOG=$WDIO_LOG"

exit "$STATUS"
