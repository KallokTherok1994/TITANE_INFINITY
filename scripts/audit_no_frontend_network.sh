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

FORBIDDEN_PATTERNS=(
  'fetch('
  'axios'
  'node-fetch'
  'undici'
  'http://'
  'https://'
)

# Directories to exclude (mocks, tests, storybook, already-approved)
EXCLUDE_DIRS=(
  'src/__tests__'
  'src/mocks'
  'src/test'
  'src/tests'
  'src/test-utils'
  'src/stories'
)

echo "# TITANE∞ P1.E — No-Frontend-Network Audit" > "${REPORT_FILE}"
echo "# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "${REPORT_FILE}"
echo "# Scan root: ${SRC_DIR}" >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"

VIOLATIONS=0

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  # Build exclude args for grep
  EXCLUDE_ARGS=""
  for dir in "${EXCLUDE_DIRS[@]}"; do
    EXCLUDE_ARGS="${EXCLUDE_ARGS} --exclude-dir=${dir##*/}"
  done

  # Run search (ignore grep exit code 1 = no matches)
  RESULTS=$(grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    ${EXCLUDE_ARGS} \
    --exclude-dir="__tests__" \
    --exclude-dir="mocks" \
    --exclude-dir="test" \
    --exclude-dir="tests" \
    --exclude-dir="test-utils" \
    --exclude-dir="stories" \
    "${pattern}" "${SRC_DIR}" 2>/dev/null || true)

  if [[ -n "${RESULTS}" ]]; then
    COUNT=$(echo "${RESULTS}" | wc -l)
    echo "## FORBIDDEN: '${pattern}' — ${COUNT} occurrence(s)" >> "${REPORT_FILE}"
    echo "${RESULTS}" >> "${REPORT_FILE}"
    echo "" >> "${REPORT_FILE}"
    VIOLATIONS=$((VIOLATIONS + COUNT))
  fi
done

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
