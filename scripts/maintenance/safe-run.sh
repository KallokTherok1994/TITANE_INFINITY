#!/usr/bin/env bash
#
# TITANE∞ — Safe-Run (PHASE_5 BLOC C aligned)
#
# Exécute UNIQUEMENT les actions listées dans actions.yml.
# Toute action non déclarée est REFUSÉE.
#
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/maintenance/safe-run.sh <command-id> [--force] [--] [args...]

Runs a whitelisted command with safety checks + logging.
All actions MUST be declared in scripts/maintenance/actions.yml.

Examples:
  scripts/maintenance/safe-run.sh install-deps
  scripts/maintenance/safe-run.sh run-tests
  scripts/maintenance/safe-run.sh validate
  scripts/maintenance/safe-run.sh health-check
  scripts/maintenance/safe-run.sh constitution-audit
  scripts/maintenance/safe-run.sh build-stable      # Requires TITANE_PROD_OK=1

Available actions (see actions.yml):
  - install-deps, validate, run-tests, test-gate
  - check-dev-ports, ports-check-explicit
  - health-check, constitution-audit
  - launch-dev, stop-dev, clean-caches
  - build-stable, reset-staging-stable
  - test-contract, test-gate-p3, test-gate-p4

Notes:
  - "--force" bypasses SOME checks (never production-gating).
  - Production operations require TITANE_PROD_OK=1.
  - Actions not in actions.yml are DENIED.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" || -z "${1:-}" ]]; then
  usage
  exit 0
fi

COMMAND_ID="$1"
shift

FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
  shift
fi

if [[ "${1:-}" == "--" ]]; then
  shift
fi

REPO_ROOT=""
if command -v git >/dev/null 2>&1; then
  REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
fi

if [[ -z "$REPO_ROOT" ]]; then
  echo "ERROR: must run inside a git repo" >&2
  exit 2
fi

cd "$REPO_ROOT"

export PATH="$REPO_ROOT/.tools/node/current/bin:${PATH}"

LOG_DIR="$REPO_ROOT/reports/safe-run"
mkdir -p "$LOG_DIR"
TS="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/${TS}-${COMMAND_ID}.log"

{
  echo "Timestamp: $(date -Is)"
  echo "Repo: $REPO_ROOT"
  echo "CommandId: $COMMAND_ID"
  echo "Args: $*"
  echo "Force: $FORCE"
  echo "----------------------------------------"
} | tee "$LOG_FILE" >/dev/null

say() {
  echo "$*" | tee -a "$LOG_FILE" >/dev/null
}

fail() {
  say "ERROR: $*"
  exit 1
}

require_clean_git() {
  local porcelain
  porcelain="$(git status --porcelain=v1 2>/dev/null || true)"
  if [[ -n "$porcelain" ]]; then
    if [[ "$FORCE" == "1" ]]; then
      say "WARN: git working tree is dirty, continuing due to --force"
      return 0
    fi
    fail "git working tree is dirty; commit/stash or re-run with --force"
  fi
}

check_dev_ports() {
  if [[ -f scripts/verify/check-dev-ports-processes.sh ]]; then
    say "[check] dev ports/processes"
    bash scripts/verify/check-dev-ports-processes.sh 2>&1 | tee -a "$LOG_FILE" >/dev/null
  else
    say "WARN: scripts/verify/check-dev-ports-processes.sh not found"
  fi
}

require_prod_approval() {
  if [[ "${TITANE_PROD_OK:-}" != "1" ]]; then
    fail "production operation requires TITANE_PROD_OK=1"
  fi
}

run_cmd() {
  local cmd="$1"
  shift
  say "[run] $cmd $*"

  set +e
  "$cmd" "$@" 2>&1 | tee -a "$LOG_FILE"
  local ec=${PIPESTATUS[0]}
  set -e

  if [[ "$ec" != "0" ]]; then
    say "[run] exit_code=$ec"
    exit "$ec"
  fi
  say "[run] exit_code=0"
}

# ========================================
# ACTION DISPATCH (aligned with actions.yml)
# ========================================

case "$COMMAND_ID" in
  # MAINTENANCE (DEV)
  install-deps)
    require_clean_git
    run_cmd ./.tools/node/current/bin/pnpm install --no-lockfile
    ;;

  validate)
    require_clean_git
    check_dev_ports
    run_cmd ./.tools/node/current/bin/pnpm run copilot-xs:validate
    check_dev_ports
    ;;

  run-tests)
    require_clean_git
    check_dev_ports
    run_cmd ./.tools/node/current/bin/pnpm test -- --run
    run_cmd ./.tools/node/current/bin/pnpm run test:tauri
    check_dev_ports
    ;;

  test-gate)
    require_clean_git
    check_dev_ports
    run_cmd ./.tools/node/current/bin/pnpm run copilot-xs:test
    check_dev_ports
    ;;

  check-dev-ports)
    check_dev_ports
    ;;

  ports-check-explicit)
    run_cmd bash -lc "set -euo pipefail; cd '$REPO_ROOT'; (ss -ltnp 2>/dev/null || ss -ltn 2>/dev/null) | grep -E ':(4000|5173|4173|1430)\\b' | cat || echo 'OK: no dev ports'"
    ;;

  health-check)
    run_cmd bash scripts/health/health_check.sh --format both
    ;;

  constitution-audit)
    run_cmd bash scripts/audit/constitution-audit.sh --format both
    ;;

  # RUNTIME DEV
  launch-dev)
    run_cmd ./runtime/dev/run-dev.sh
    ;;

  stop-dev)
    if [[ -x ./runtime/dev/cleanup.sh ]]; then
      run_cmd ./runtime/dev/cleanup.sh
    else
      fail "runtime/dev/cleanup.sh not found"
    fi
    ;;

  clean-caches)
    check_dev_ports  # Ports doivent être fermés
    run_cmd rm -rf node_modules/.cache .vite-cache playwright-report test-results coverage
    ;;

  # BUILD STABLE (PRODUCTION)
  build-stable)
    require_prod_approval
    require_clean_git
    check_dev_ports
    run_cmd ./runtime/stable/build.sh
    check_dev_ports
    ;;

  reset-staging-stable)
    require_prod_approval
    require_clean_git
    check_dev_ports
    say "Cleaning stable staging: target/release/bundle + logs >30 days"
    rm -rf src-tauri/target/release/bundle
    find runtime/stable/logs -name 'stable-build-*.log' -mtime +30 -delete || true
    say "Staging cleaned"
    ;;

  # TESTS CONTRACTUELS
  test-contract)
    run_cmd ./.tools/node/current/bin/pnpm test -- --run tests/contract/tauri.contract.test.ts
    ;;

  test-gate-p3)
    run_cmd ./.tools/node/current/bin/pnpm test -- --run tests/phase3/gate-p3.test.ts
    ;;

  test-gate-p4)
    run_cmd ./.tools/node/current/bin/pnpm test -- --run tests/phase4/gate-p4.test.ts
    ;;

  *)
    say "ERROR: action '$COMMAND_ID' not in whitelist"
    say "See scripts/maintenance/actions.yml for available actions"
    usage
    fail "DENIED: unknown command-id: $COMMAND_ID"
    ;;
esac

say "OK: completed $COMMAND_ID"
say "Log: $LOG_FILE"
