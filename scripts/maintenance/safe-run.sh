#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/maintenance/safe-run.sh <command-id> [--force] [--] [args...]

Runs a whitelisted command with safety checks + logging.

Examples:
  scripts/maintenance/safe-run.sh install-deps
  scripts/maintenance/safe-run.sh run-tests
  scripts/maintenance/safe-run.sh validate
  scripts/maintenance/safe-run.sh check-dev-ports
  scripts/maintenance/safe-run.sh ports-check-explicit

Notes:
  - "--force" bypasses SOME checks (never production-gating).
  - For production operations, an explicit env var is required.
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
  if [[ -x scripts/verify/check-dev-ports-processes.sh ]]; then
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

case "$COMMAND_ID" in
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

  build-stable)
    require_prod_approval
    require_clean_git
    check_dev_ports
    run_cmd ./runtime/stable/build.sh
    check_dev_ports
    ;;

  *)
    usage
    fail "unknown command-id: $COMMAND_ID"
    ;;
esac

say "OK: completed $COMMAND_ID"
say "Log: $LOG_FILE"
