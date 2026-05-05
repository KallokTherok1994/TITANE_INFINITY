#!/usr/bin/env bash
# auto-fix-tests.sh — Autonomous test failure classifier and fixer
# Rule 10 (AutoHeal) + Rule 16 (mandatory tests) enforcement
# Usage: bash scripts/tests/auto-fix-tests.sh [--dry-run|--fix] [--suite=vitest|cargo|playwright|all]
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_DIR="${REPO_ROOT}/reports/test-autofix"
REPORT_FILE="${REPORT_DIR}/autofix-${TIMESTAMP}.json"
LOG_DIR="/tmp/titane-autofix-${TIMESTAMP}"
AUTOHEAL_FILE="${REPO_ROOT}/scripts/autoheal/autoheal_rules.jsonl"

MODE="${1:-}"           # --dry-run | --fix
SUITE_FLAG="${2:-}"     # --suite=vitest|cargo|playwright|all

mkdir -p "${REPORT_DIR}" "${LOG_DIR}"

# ─── Helpers ──────────────────────────────────────────────────────────────────
log()   { echo "[$(date +%H:%M:%S)] $*"; }
warn()  { echo "[WARN] $*" >&2; }
fail()  { echo "[FAIL] $*" >&2; exit 1; }

is_dry_run() { [[ "${MODE}" == "--dry-run" ]]; }
is_fix()     { [[ "${MODE}" == "--fix" ]]; }

get_suite() {
  if [[ "${SUITE_FLAG}" =~ --suite=(.+) ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "all"
  fi
}

# ─── Failure taxonomy ─────────────────────────────────────────────────────────
# CAT-MOCK    : Cannot find module '@tauri-apps/api/*' or missing mock alias
# CAT-SETUP   : setupFile missing / import error at test initialisation
# CAT-TYPE    : TypeScript type errors causing compilation failure
# CAT-ESM     : require() not defined in ESM context
# CAT-LOGIC   : Test assertion failure (real logic bug — manual required)
# CAT-INFRA   : Missing binary / server / environment issue

classify_failure() {
  local log_file="$1"
  local category="UNKNOWN"

  if grep -qE "Cannot find module.*@tauri-apps|Cannot find module.*src/lib/ipc|Cannot resolve.*tauri" "${log_file}" 2>/dev/null; then
    category="CAT-MOCK"
  elif grep -qE "Error: Cannot find module.*setup|setupFile.*not found|ERR_MODULE_NOT_FOUND.*setup" "${log_file}" 2>/dev/null; then
    category="CAT-SETUP"
  elif grep -qE "TypeScript.*error|TS[0-9]+:|error TS" "${log_file}" 2>/dev/null; then
    category="CAT-TYPE"
  elif grep -qE "require is not defined|ERR_REQUIRE_ESM|ReferenceError.*require" "${log_file}" 2>/dev/null; then
    category="CAT-ESM"
  elif grep -qE "AssertionError|Expected.*Received|toBe\(|toEqual\(|FAILED" "${log_file}" 2>/dev/null; then
    category="CAT-LOGIC"
  elif grep -qE "ENOENT|spawn.*ENOENT|command not found|Cannot connect|ECONNREFUSED" "${log_file}" 2>/dev/null; then
    category="CAT-INFRA"
  fi

  echo "${category}"
}

# ─── Suite runners ────────────────────────────────────────────────────────────
run_vitest() {
  local log_file="${LOG_DIR}/vitest.log"
  log "Running Vitest main suite..."
  local exit_code=0
  cd "${REPO_ROOT}"
  cross-env TZ=UTC NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' \
    vitest run 2>&1 | tee "${log_file}" || exit_code=$?
  echo "${exit_code}" > "${LOG_DIR}/vitest.exit"
  echo "${log_file}"
}

run_vitest_architecture() {
  local log_file="${LOG_DIR}/vitest-architecture.log"
  log "Running Vitest architecture suite..."
  local exit_code=0
  cd "${REPO_ROOT}"
  cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' \
    vitest run src/__tests__/architecture 2>&1 | tee "${log_file}" || exit_code=$?
  echo "${exit_code}" > "${LOG_DIR}/vitest-architecture.exit"
  echo "${log_file}"
}

run_cargo() {
  local log_file="${LOG_DIR}/cargo.log"
  log "Running Cargo Rust tests..."
  local exit_code=0
  mkdir -p "${REPO_ROOT}/dist"
  cd "${REPO_ROOT}/src-tauri"
  cargo test --lib 2>&1 | tee "${log_file}" || exit_code=$?
  echo "${exit_code}" > "${LOG_DIR}/cargo.exit"
  echo "${log_file}"
}

run_playwright() {
  local log_file="${LOG_DIR}/playwright.log"
  log "Running Playwright E2E tests..."
  local exit_code=0
  cd "${REPO_ROOT}"
  # Check if dev server is running
  if ! curl -s http://localhost:1420 > /dev/null 2>&1; then
    warn "Vite dev server not running on :1420 — E2E tests will be SKIPPED"
    echo "SKIPPED: Vite dev server required on :1420" > "${log_file}"
    echo "0" > "${LOG_DIR}/playwright.exit"
    echo "${log_file}"
    return
  fi
  pnpm run test:e2e 2>&1 | tee "${log_file}" || exit_code=$?
  echo "${exit_code}" > "${LOG_DIR}/playwright.exit"
  echo "${log_file}"
}

# ─── Auto-fix strategies ──────────────────────────────────────────────────────
fix_cat_mock() {
  local log_file="$1"
  log "CAT-MOCK: Verifying vitest.config.ts alias for @tauri-apps/api..."
  cd "${REPO_ROOT}"

  local missing_aliases
  missing_aliases=$(grep -E "Cannot find module '(@tauri-apps/[^']+)'" "${log_file}" 2>/dev/null | \
    sed -E "s/.*Cannot find module '(@tauri-apps\/[^']+)'.*/\1/" | sort -u || true)

  if [[ -z "${missing_aliases}" ]]; then
    log "No missing @tauri-apps aliases detected — CAT-MOCK may be a path alias issue"
    return 1
  fi

  log "Missing modules: ${missing_aliases}"
  # Check if already mocked
  local config_file="${REPO_ROOT}/vitest.config.ts"
  if grep -q "@tauri-apps/api" "${config_file}" 2>/dev/null; then
    log "Mocks already present in vitest.config.ts — deeper investigation required"
    return 1
  fi

  log "CAT-MOCK: MANUAL_REQUIRED — add mock aliases to vitest.config.ts resolve.alias"
  return 1
}

fix_cat_esm() {
  local log_file="$1"
  log "CAT-ESM: Checking for CommonJS require() in ESM context..."
  cd "${REPO_ROOT}"

  local offending_files
  offending_files=$(grep -E "require is not defined" "${log_file}" 2>/dev/null | \
    grep -oE "[a-zA-Z0-9/_-]+\.(ts|js|tsx|jsx)" | sort -u || true)

  if [[ -z "${offending_files}" ]]; then
    log "No specific ESM offending files detected from log"
    return 1
  fi

  log "Offending files: ${offending_files}"
  # ESM fixes require careful case-by-case analysis
  log "CAT-ESM: MANUAL_REQUIRED — convert require() to import in: ${offending_files}"
  return 1
}

apply_fix() {
  local category="$1"
  local log_file="$2"

  log "Attempting auto-fix for category: ${category}"

  case "${category}" in
    CAT-MOCK)
      fix_cat_mock "${log_file}" || return 1
      ;;
    CAT-ESM)
      fix_cat_esm "${log_file}" || return 1
      ;;
    CAT-TYPE)
      log "CAT-TYPE: MANUAL_REQUIRED — run 'pnpm run check' to diagnose TypeScript errors"
      return 1
      ;;
    CAT-SETUP)
      log "CAT-SETUP: MANUAL_REQUIRED — check setupFile existence referenced in vitest.config.ts"
      return 1
      ;;
    CAT-LOGIC)
      log "CAT-LOGIC: MANUAL_REQUIRED — real logic assertion failure requires code review"
      return 1
      ;;
    CAT-INFRA)
      log "CAT-INFRA: MANUAL_REQUIRED — missing binary or environment, check PATH and dependencies"
      return 1
      ;;
    *)
      log "UNKNOWN category — MANUAL_REQUIRED"
      return 1
      ;;
  esac
}

# ─── Report generation ────────────────────────────────────────────────────────
generate_report() {
  local suite="$1"
  local log_file="$2"
  local exit_code_file="${LOG_DIR}/${suite}.exit"
  local exit_code=0
  local category="PASS"
  local auto_fixed="false"

  [[ -f "${exit_code_file}" ]] && exit_code="$(cat "${exit_code_file}")"

  if [[ "${exit_code}" != "0" ]]; then
    category="$(classify_failure "${log_file}")"
  fi

  if [[ "${exit_code}" != "0" ]] && is_fix && [[ "${category}" != "CAT-LOGIC" ]]; then
    if apply_fix "${category}" "${log_file}"; then
      auto_fixed="true"
    fi
  fi

  # Extract summary stats
  local passed=0 failed=0 total=0
  if [[ "${suite}" == "vitest"* ]]; then
    passed=$(grep -cE "✓|pass|PASS" "${log_file}" 2>/dev/null || echo 0)
    failed=$(grep -cE "✗|FAIL|×" "${log_file}" 2>/dev/null || echo 0)
    total=$((passed + failed))
  elif [[ "${suite}" == "cargo" ]]; then
    passed=$(grep -oE "([0-9]+) passed" "${log_file}" 2>/dev/null | awk '{sum+=$1} END{print sum+0}')
    failed=$(grep -oE "([0-9]+) failed" "${log_file}" 2>/dev/null | awk '{sum+=$1} END{print sum+0}')
    total=$((passed + failed))
  fi

  cat <<JSON
  {
    "suite": "${suite}",
    "exit_code": ${exit_code},
    "category": "${category}",
    "auto_fixed": ${auto_fixed},
    "stats": {"passed": ${passed}, "failed": ${failed}, "total": ${total}},
    "log": "${log_file}",
    "timestamp": "${TIMESTAMP}"
  }
JSON
}

# ─── AutoHeal entry ───────────────────────────────────────────────────────────
append_autoheal_entry() {
  local verdict="$1"
  local suites_run="$2"

  # Generate unique ID
  local ah_id="AH-${TIMESTAMP}-TEST-AUTOFIX-RUN"

  local entry
  entry=$(cat <<AHEOF
{"id":"${ah_id}","date":"$(date -u +%Y-%m-%dT%H:%M:%SZ)","scope":"tests","symptom":"test-autofix-agent run: ${suites_run}","root_cause":"auto-fix scan triggered by test-autofix agent","fix":"classified failures, applied safe auto-fixes where possible, flagged MANUAL_REQUIRED for logic errors","prevention_test":"bash scripts/tests/auto-fix-tests.sh --dry-run && bash scripts/autoheal/detect_recurrence.sh","commands":["pnpm run test","pnpm run test:rust","pnpm run test:architecture","pnpm run test:compliance"],"files_changed":["reports/test-autofix/autofix-${TIMESTAMP}.json"],"rollback":"git restore <fixed-files> if auto-fix introduced regression"}
AHEOF
)

  if ! is_dry_run; then
    echo "${entry}" >> "${AUTOHEAL_FILE}"
    log "AutoHeal entry appended: ${ah_id}"
  else
    log "[DRY-RUN] Would append AutoHeal entry: ${ah_id}"
  fi
}

# ─── Main orchestration ───────────────────────────────────────────────────────
main() {
  local suite
  suite="$(get_suite)"

  log "═══ TITANE Test Auto-Fix — mode=${MODE:-check} suite=${suite} ═══"
  log "Report will be written to: ${REPORT_FILE}"

  cd "${REPO_ROOT}"

  local results=()
  local overall_verdict="PASS"

  # Run suites
  local vitest_log cargo_log playwright_log

  if [[ "${suite}" == "all" || "${suite}" == "vitest" ]]; then
    vitest_log="$(run_vitest)"
    results+=("$(generate_report vitest "${vitest_log}")")
    vitest_exit="$(cat "${LOG_DIR}/vitest.exit" 2>/dev/null || echo 1)"
    [[ "${vitest_exit}" != "0" ]] && overall_verdict="FAIL"
  fi

  if [[ "${suite}" == "all" || "${suite}" == "cargo" ]]; then
    cargo_log="$(run_cargo)"
    results+=("$(generate_report cargo "${cargo_log}")")
    cargo_exit="$(cat "${LOG_DIR}/cargo.exit" 2>/dev/null || echo 1)"
    [[ "${cargo_exit}" != "0" ]] && overall_verdict="FAIL"
  fi

  if [[ "${suite}" == "all" || "${suite}" == "playwright" ]]; then
    playwright_log="$(run_playwright)"
    results+=("$(generate_report playwright "${playwright_log}")")
    playwright_exit="$(cat "${LOG_DIR}/playwright.exit" 2>/dev/null || echo 0)"
    [[ "${playwright_exit}" != "0" ]] && overall_verdict="FAIL"
  fi

  # Write JSON report
  local results_json
  results_json="$(IFS=','; echo "${results[*]}")"
  cat > "${REPORT_FILE}" <<REPORT
{
  "report": "test-autofix",
  "timestamp": "${TIMESTAMP}",
  "mode": "${MODE:-check}",
  "suite": "${suite}",
  "overall_verdict": "${overall_verdict}",
  "results": [
${results_json}
  ]
}
REPORT

  log "Report written: ${REPORT_FILE}"

  # AutoHeal gate
  if ! is_dry_run; then
    append_autoheal_entry "${overall_verdict}" "${suite}"

    log "Running AutoHeal gate..."
    bash "${REPO_ROOT}/scripts/autoheal/detect_recurrence.sh" && \
      log "detect_recurrence.sh: PASS" || \
      warn "detect_recurrence.sh: WARN (non-blocking for autofix run)"
  fi

  # Final verdict
  log "═══ VERDICT: ${overall_verdict} ═══"
  [[ "${overall_verdict}" == "PASS" ]] || exit 1
}

main "$@"
