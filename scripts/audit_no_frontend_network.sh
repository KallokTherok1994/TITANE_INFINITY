#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#   TITANE∞ — P1.E No-Frontend-Network Audit (EXPERIMENTAL)
#   Scans src/ (frontend) for forbidden network patterns.
#   Exits 1 if any forbidden pattern is found outside mocks/tests.
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC_DIR="${REPO_ROOT}/src"
REPORT_DIR="${REPO_ROOT}/data/research/evidence"
REPORT_FILE="${REPORT_DIR}/no_frontend_network_report.txt"

mkdir -p "${REPORT_DIR}"

FORBIDDEN_REGEX='\bfetch\s*\(|\baxios\b|node-fetch|undici'

# Directories to exclude (tests/mocks/storybook/assets/docs)
EXCLUDE_GLOBS=(
  '!src/__tests__/**'
  '!src/mocks/**'
  '!src/test/**'
  '!src/tests/**'
  '!src/test-utils/**'
  '!src/stories/**'
  '!src/assets/**'
)

echo "# TITANE∞ P1.E — No-Frontend-Network Audit" > "${REPORT_FILE}"
echo "# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "${REPORT_FILE}"
echo "# Scan root: ${SRC_DIR}" >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"

VIOLATIONS=0
echo "## FORBIDDEN: executable network calls (fetch/axios/node-fetch/undici)" >> "${REPORT_FILE}"

RG_ARGS=(
  -n
  --pcre2
  --glob "*.ts"
  --glob "*.tsx"
  --glob "*.js"
  --glob "*.jsx"
)
for glob in "${EXCLUDE_GLOBS[@]}"; do
  RG_ARGS+=(--glob "$glob")
done

RAW_RESULTS=$(rg "${FORBIDDEN_REGEX}" "${SRC_DIR}" "${RG_ARGS[@]}" 2>/dev/null || true)
FILTERED_RESULTS=""

if [[ -n "${RAW_RESULTS}" ]]; then
  while IFS= read -r line; do
    code_part="${line#*:}"
    code_part="${code_part#*:}"

    if [[ "${code_part}" =~ ^[[:space:]]*(//|/\*|\*|#) ]]; then
      continue
    fi

    if [[ "${code_part}" == *"@network-allowed"* ]]; then
      continue
    fi

    FILTERED_RESULTS+="${line}"$'\n'
  done <<< "${RAW_RESULTS}"
fi

if [[ -n "${FILTERED_RESULTS}" ]]; then
  COUNT=$(printf "%s" "${FILTERED_RESULTS}" | sed '/^$/d' | wc -l)
  echo "${FILTERED_RESULTS}" >> "${REPORT_FILE}"
  echo "" >> "${REPORT_FILE}"
  VIOLATIONS=$((VIOLATIONS + COUNT))
else
  echo "none" >> "${REPORT_FILE}"
  echo "" >> "${REPORT_FILE}"
fi

echo "---" >> "${REPORT_FILE}"
echo "TOTAL VIOLATIONS: ${VIOLATIONS}" >> "${REPORT_FILE}"

if [[ "${VIOLATIONS}" -gt 0 ]]; then
  echo "VERDICT: FAIL — ${VIOLATIONS} forbidden network pattern(s) found in frontend." >> "${REPORT_FILE}"
  echo ""
  echo "❌ FAIL: ${VIOLATIONS} forbidden network pattern(s) found in src/."
  echo "   See report: ${REPORT_FILE}"
  exit 1
else
  echo "VERDICT: PASS — No forbidden network patterns found in frontend." >> "${REPORT_FILE}"
  echo ""
  echo "✅ PASS: No forbidden network patterns found in src/."
  echo "   Report: ${REPORT_FILE}"
  exit 0
fi
