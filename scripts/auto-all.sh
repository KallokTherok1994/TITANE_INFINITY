#!/usr/bin/env bash

###############################################################################
# 🧪 TITANE∞ AUTO-ALL (DEV-ONLY)
#
# Objectif: une passe "auto all" sûre en MODE DÉVELOPPEMENT.
# - ✅ Validate (COPILOT-XS)
# - ✅ Tests (gate)
# - ✅ Security scan
# - ✅ Conformité ports/process dev
# - ✅ Snapshot git (propre + sync)
#
# ⚠️ IMPORTANT: ce script NE DOIT PAS builder/bundler/déployer (interdit).
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

AUTO_ALL_REPORTS_DIR_DEFAULT='reports/auto-all'

RUN_DIR=""
CURRENT_STEP_TITLE=""
CURRENT_STEP_LOGFILE=""
CURRENT_STEP_PID=""
SIGINT_COUNT=0

on_interrupt() {
  local sig="$1"
  local code=130
  if [ "$sig" = "TERM" ]; then
    code=143
  fi

  echo -e "${RED}⛔ Interruption (${sig})${NC} pendant: ${CURRENT_STEP_TITLE:-<inconnu>}"

  if [ -n "${CURRENT_STEP_LOGFILE:-}" ] && [ -f "${CURRENT_STEP_LOGFILE}" ]; then
    echo -e "${YELLOW}--- tail (120) ${CURRENT_STEP_LOGFILE} ---${NC}"
    tail -n 120 "${CURRENT_STEP_LOGFILE}" | cat
  fi

  if [ -n "${RUN_DIR:-}" ]; then
    echo -e "${YELLOW}Logs:${NC} ${RUN_DIR}"
  fi

  exit "$code"
}

on_sigint_detached_step() {
  SIGINT_COUNT=$((SIGINT_COUNT + 1))

  echo -e "\n${YELLOW}⚠️ SIGINT reçu:${NC} ${CURRENT_STEP_TITLE:-<inconnu>} (count=${SIGINT_COUNT})"

  if [ -n "${CURRENT_STEP_LOGFILE:-}" ] && [ -f "${CURRENT_STEP_LOGFILE}" ]; then
    echo -e "${YELLOW}--- tail (80) ${CURRENT_STEP_LOGFILE} ---${NC}"
    tail -n 80 "${CURRENT_STEP_LOGFILE}" | cat
  fi

  if [ "$SIGINT_COUNT" -ge 2 ]; then
    echo -e "${RED}⛔ Second SIGINT: arrêt demandé${NC}"
    if [ -n "${CURRENT_STEP_PID:-}" ]; then
      kill -TERM "${CURRENT_STEP_PID}" 2>/dev/null || true
    fi
    exit 130
  fi
}

on_term_detached_step() {
  if [ -n "${CURRENT_STEP_PID:-}" ]; then
    kill -TERM "${CURRENT_STEP_PID}" 2>/dev/null || true
  fi
  on_interrupt TERM
}

run_step_resilient_to_sigint() {
  local title="$1"
  shift
  local logfile="$1"
  shift

  CURRENT_STEP_TITLE="$title"
  CURRENT_STEP_LOGFILE="$logfile"

  echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}▶ ${title}${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

  echo -e "${CYAN}log: ${logfile}${NC}"
  {
    echo ""
    echo "===== [${title}] $(date -Is) ====="
    echo -n "cmd:"
    printf ' %q' "$@"
    echo
  } >>"$logfile"

  local prev_trap_int prev_trap_term
  prev_trap_int="$(trap -p INT || true)"
  prev_trap_term="$(trap -p TERM || true)"

  SIGINT_COUNT=0
  CURRENT_STEP_PID=""

  if command -v setsid >/dev/null 2>&1; then
    # Start in a new session so SIGINT from the controlling terminal does not kill the test runner.
    setsid "$@" >>"$logfile" 2>&1 &
    CURRENT_STEP_PID=$!
    echo "pid: ${CURRENT_STEP_PID}" >>"$logfile"

    trap 'on_sigint_detached_step' INT
    trap 'on_term_detached_step' TERM

    # `wait` peut être interrompu par SIGINT même si le process détaché continue.
    # On boucle tant que le PID est vivant et que l'arrêt n'a pas été explicitement demandé.
    local ec=0
    set +e
    while true; do
      wait "$CURRENT_STEP_PID"
      ec=$?
      if [ "$ec" -eq 130 ] && kill -0 "$CURRENT_STEP_PID" >/dev/null 2>&1 && [ "$SIGINT_COUNT" -lt 2 ]; then
        continue
      fi
      break
    done
    set -e

    # Restore traps.
    if [ -n "$prev_trap_int" ]; then eval "$prev_trap_int"; else trap - INT; fi
    if [ -n "$prev_trap_term" ]; then eval "$prev_trap_term"; else trap - TERM; fi

    if [ "$ec" -ne 0 ]; then
      echo -e "${RED}❌ Step failed:${NC} ${title} (exit=${ec})"
      echo -e "${YELLOW}--- tail (120) ${logfile} ---${NC}"
      tail -n 120 "$logfile" | cat
      echo -e "${YELLOW}Logs:${NC} ${RUN_DIR}"
      exit "$ec"
    fi
  else
    # Fallback: no setsid available.
    set +e
    "$@" >>"$logfile" 2>&1
    local ec=$?
    set -e

    if [ "$ec" -ne 0 ]; then
      echo -e "${RED}❌ Step failed:${NC} ${title} (exit=${ec})"
      echo -e "${YELLOW}--- tail (120) ${logfile} ---${NC}"
      tail -n 120 "$logfile" | cat
      echo -e "${YELLOW}Logs:${NC} ${RUN_DIR}"
      exit "$ec"
    fi
  fi

  CURRENT_STEP_TITLE=""
  CURRENT_STEP_LOGFILE=""
  CURRENT_STEP_PID=""
  SIGINT_COUNT=0
}

init_run_dir() {
  local reports_dir="${AUTO_ALL_REPORTS_DIR:-$AUTO_ALL_REPORTS_DIR_DEFAULT}"
  local run_id
  run_id="$(date +%Y%m%d-%H%M%S)"

  if [[ "$reports_dir" = /* ]]; then
    RUN_DIR="${reports_dir}/${run_id}"
  else
    RUN_DIR="${PROJECT_ROOT}/${reports_dir}/${run_id}"
  fi

  mkdir -p "$RUN_DIR"
}

resolve_pnpm() {
  # Prefer repo-bundled pnpm to avoid engine mismatches.
  if [ -x "${PROJECT_ROOT}/.tools/node/current/bin/pnpm" ]; then
    PNPM_CMD=("${PROJECT_ROOT}/.tools/node/current/bin/pnpm")
    export PATH="${PROJECT_ROOT}/.tools/node/current/bin:${PATH}"
    return 0
  fi
  if command -v corepack >/dev/null 2>&1; then
    PNPM_CMD=(corepack pnpm)
    return 0
  fi
  if command -v pnpm >/dev/null 2>&1; then
    PNPM_CMD=(pnpm)
    return 0
  fi
  return 1
}

run_step() {
  local title="$1"
  shift
  local logfile="$1"
  shift

  CURRENT_STEP_TITLE="$title"
  CURRENT_STEP_LOGFILE="$logfile"

  echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}▶ ${title}${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"

  echo -e "${CYAN}log: ${logfile}${NC}"
  {
    echo ""
    echo "===== [${title}] $(date -Is) ====="
    echo -n "cmd:"
    printf ' %q' "$@"
    echo
  } >>"$logfile"

  set +e
  "$@" >>"$logfile" 2>&1
  local ec=$?
  set -e

  if [ "$ec" -ne 0 ]; then
    echo -e "${RED}❌ Step failed:${NC} ${title} (exit=${ec})"
    echo -e "${YELLOW}--- tail (120) ${logfile} ---${NC}"
    tail -n 120 "$logfile" | cat
    echo -e "${YELLOW}Logs:${NC} ${RUN_DIR}"
    exit "$ec"
  fi

  CURRENT_STEP_TITLE=""
  CURRENT_STEP_LOGFILE=""
}

main() {
  if ! resolve_pnpm; then
    echo -e "${RED}❌ pnpm requis (${PROJECT_ROOT}/.tools/node/current/bin/pnpm | corepack | pnpm introuvable)${NC}"
    exit 1
  fi

  init_run_dir

  trap 'on_interrupt INT' INT
  trap 'on_interrupt TERM' TERM

  run_step "COPILOT-XS validate" "${RUN_DIR}/01_validate.log" "${PNPM_CMD[@]}" run copilot-xs:validate
  run_step_resilient_to_sigint "Test gate (copilot-xs:test)" "${RUN_DIR}/02_test_gate.log" "${PNPM_CMD[@]}" run copilot-xs:test --silent
  run_step "Security scan" "${RUN_DIR}/03_security_scan.log" "${PNPM_CMD[@]}" run copilot-xs:security-scan
  run_step "No dev ports/processes" "${RUN_DIR}/04_dev_ports_processes.log" bash scripts/verify/check-dev-ports-processes.sh

  run_step "Git snapshot" "${RUN_DIR}/05_git_snapshot.log" bash -c "git status --porcelain=v1 -b | cat; git rev-list --left-right --count origin/MAIN...HEAD 2>/dev/null | cat || true"

  echo -e "\n${GREEN}✅ AUTO-ALL (DEV-ONLY) OK${NC}"
  echo -e "${CYAN}Logs:${NC} ${RUN_DIR}"
  echo -e "${YELLOW}Note:${NC} Les logs E2E peuvent contenir des détections d'injection attendues tant que l'exit code reste 0."
}

main "$@"
