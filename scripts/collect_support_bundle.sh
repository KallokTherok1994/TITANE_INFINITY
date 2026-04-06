#!/usr/bin/env bash
# scripts/collect_support_bundle.sh — Collect support bundle (redacted) for export
# Ring: 4 — Status: STABLE
# Rollback: git restore -- scripts/collect_support_bundle.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
BUNDLE_DIR="${TMPDIR:-/tmp}/titane_support_bundle_${TIMESTAMP}"
PROOF_PACKS_DIR="${PROOF_PACKS_DIR:-${ROOT}/proof_packs}"

echo "======================================================================"
echo " collect_support_bundle.sh — $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo " Bundle dir: ${BUNDLE_DIR}"
echo "======================================================================"

mkdir -p "${BUNDLE_DIR}"

# Collect package versions
echo "--- Versions ---" > "${BUNDLE_DIR}/versions.txt"
node --version >> "${BUNDLE_DIR}/versions.txt" 2>/dev/null || echo "node: N/A" >> "${BUNDLE_DIR}/versions.txt"
pnpm --version >> "${BUNDLE_DIR}/versions.txt" 2>/dev/null || echo "pnpm: N/A" >> "${BUNDLE_DIR}/versions.txt"
rustc --version >> "${BUNDLE_DIR}/versions.txt" 2>/dev/null || echo "rustc: N/A" >> "${BUNDLE_DIR}/versions.txt"
python3 -c "import json; d=json.load(open('${ROOT}/package.json')); print('app:', d['version'])" \
  >> "${BUNDLE_DIR}/versions.txt" 2>/dev/null || echo "app: N/A" >> "${BUNDLE_DIR}/versions.txt"

# Collect proof pack summaries
if [[ -d "$PROOF_PACKS_DIR" ]]; then
  cp -r "$PROOF_PACKS_DIR" "${BUNDLE_DIR}/proof_packs" 2>/dev/null || true
fi

# Collect last 200 lines of any recent logs
LOGS_DIR="${ROOT}/logs"
if [[ -d "$LOGS_DIR" ]]; then
  mkdir -p "${BUNDLE_DIR}/logs"
  find "$LOGS_DIR" -name "*.log" -newer "${ROOT}/package.json" 2>/dev/null | head -5 | while IFS= read -r log; do
    tail -200 "$log" > "${BUNDLE_DIR}/logs/$(basename "$log")" 2>/dev/null || true
  done
fi

# Redact secrets
bash "${SCRIPT_DIR}/redact_secrets.sh" "${BUNDLE_DIR}" 2>/dev/null || true

# Create archive
ARCHIVE="${ROOT}/titane_support_bundle_${TIMESTAMP}.tar.gz"
tar -czf "$ARCHIVE" -C "$(dirname "$BUNDLE_DIR")" "$(basename "$BUNDLE_DIR")" 2>/dev/null || true

echo ""
echo "Support bundle created: ${ARCHIVE}"
echo "Bundle dir (pre-archive): ${BUNDLE_DIR}"

printf '{"ts":"%s","event":"support_bundle","archive":"%s"}\n' \
  "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$ARCHIVE" \
  >> "${PROOF_PACKS_DIR}/support_bundle.jsonl" 2>/dev/null || true

exit 0
