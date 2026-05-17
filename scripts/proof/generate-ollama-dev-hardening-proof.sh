#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +%F_%H%M%S)"
ROOT="reports/proof-packs/OLLAMA_DEV_HARDENING_CERTIFICATION/$STAMP"
OUT_DIR="$ROOT/outputs"

mkdir -p "$OUT_DIR"

declare -A STATUS
declare -A OUTPUT

run_capture() {
  local key="$1"
  local cmd="$2"
  local out="$OUT_DIR/${key}.txt"

  echo "\$ $cmd" >"$out"
  if bash -lc "$cmd" >>"$out" 2>&1; then
    STATUS["$key"]="PASS"
  else
    STATUS["$key"]="FAIL"
  fi
  OUTPUT["$key"]="$out"
}

run_capture "verify_mcp_security" "pnpm run verify:mcp:security"
run_capture "verify_ollama_boundary" "pnpm run verify:ollama:boundary"
run_capture "verify_ollama_dev_live" "pnpm run verify:ollama:dev:live"
run_capture "verify_ollama_dev_performance" "pnpm run verify:ollama:dev:performance"
run_capture "verify_ollama_dev_stack" "pnpm run verify:ollama:dev:stack"
run_capture "verify_ollama_dev_global_awareness" "pnpm run verify:ollama:dev:global-awareness || true"
run_capture "verify_ollama_dev_provenance" "pnpm run verify:ollama:dev:provenance"
run_capture "verify_ollama_dev_tuning" "pnpm run verify:ollama:dev:tuning"
run_capture "test_ollama_dev_hardening_suite" "pnpm vitest run tests/unit/scripts/ollamaDevConfig.test.ts tests/unit/scripts/ollamaDevLiveScript.test.ts tests/unit/scripts/ollamaDevFinalSeal.test.ts tests/unit/scripts/ollamaDevHardening.test.ts"
run_capture "detect_recurrence" "bash scripts/autoheal/detect_recurrence.sh"
run_capture "proof_ollama_dev_session" "pnpm run proof:ollama:dev:session"

SCOPED_VERDICT="SEALED"
HARDENING_VERDICT="OLLAMA_DEV_STACK_SEALED_WITH_PARTIAL_HARDENING"
PACKAGE_PROVENANCE="BLOCKED"
LOCAL_TUNING_PROFILE="BLOCKED"
VS_CODE_TRUST="MANUAL_CERTIFICATION_READY"
GLOBAL_REPO_AWARENESS="GLOBAL_REPO_GATES_SKIPPED"

if grep -q 'PACKAGE_PROVENANCE_RECORDED' "${OUTPUT[verify_ollama_dev_provenance]}"; then
  PACKAGE_PROVENANCE="RECORDED"
elif grep -q 'PACKAGE_PROVENANCE_PARTIAL' "${OUTPUT[verify_ollama_dev_provenance]}"; then
  PACKAGE_PROVENANCE="PARTIAL"
elif grep -q 'PACKAGE_PROVENANCE_BLOCKED' "${OUTPUT[verify_ollama_dev_provenance]}"; then
  PACKAGE_PROVENANCE="BLOCKED"
fi

if grep -q 'LOCAL_TUNING_PROFILE_RECORDED' "${OUTPUT[verify_ollama_dev_tuning]}"; then
  LOCAL_TUNING_PROFILE="RECORDED"
elif grep -q 'LOCAL_TUNING_PROFILE_PARTIAL' "${OUTPUT[verify_ollama_dev_tuning]}"; then
  LOCAL_TUNING_PROFILE="PARTIAL"
elif grep -q 'BLOCKED_OLLAMA_SERVER' "${OUTPUT[verify_ollama_dev_tuning]}" || grep -q 'BLOCKED_MODEL_MISSING' "${OUTPUT[verify_ollama_dev_tuning]}"; then
  LOCAL_TUNING_PROFILE="BLOCKED"
fi

if grep -q 'GLOBAL_REPO_GATES_PARTIAL' "${OUTPUT[verify_ollama_dev_global_awareness]}"; then
  GLOBAL_REPO_AWARENESS="GLOBAL_REPO_GATES_PARTIAL"
elif grep -q 'GLOBAL_REPO_GATES_PASS' "${OUTPUT[verify_ollama_dev_global_awareness]}"; then
  GLOBAL_REPO_AWARENESS="GLOBAL_REPO_GATES_PASS"
elif grep -q 'GLOBAL_REPO_GATES_FAIL_UNKNOWN' "${OUTPUT[verify_ollama_dev_global_awareness]}"; then
  GLOBAL_REPO_AWARENESS="GLOBAL_REPO_GATES_FAIL_UNKNOWN"
fi

if [[ ! -f docs/dev/OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md ]] || [[ ! -f docs/dev/OLLAMA_DEV_VSCODE_TRUST_RECORD_TEMPLATE.md ]]; then
  VS_CODE_TRUST="MANUAL_CERTIFICATION_BLOCKED"
fi

if [[ "${STATUS[verify_ollama_dev_stack]}" == "FAIL" || "${STATUS[verify_ollama_dev_live]}" == "FAIL" || "${STATUS[verify_ollama_dev_performance]}" == "FAIL" || "${STATUS[verify_mcp_security]}" == "FAIL" || "${STATUS[verify_ollama_boundary]}" == "FAIL" ]]; then
  SCOPED_VERDICT="FAIL"
  HARDENING_VERDICT="OLLAMA_DEV_STACK_REGRESSED"
elif [[ "${STATUS[test_ollama_dev_hardening_suite]}" == "FAIL" || "${STATUS[detect_recurrence]}" == "FAIL" ]]; then
  SCOPED_VERDICT="FAIL"
  HARDENING_VERDICT="OLLAMA_DEV_STACK_REGRESSED"
elif [[ "$PACKAGE_PROVENANCE" == "RECORDED" && "$LOCAL_TUNING_PROFILE" == "RECORDED" && "$VS_CODE_TRUST" == "MANUAL_CERTIFICATION_READY" ]]; then
  HARDENING_VERDICT="OLLAMA_DEV_STACK_HARDENED"
fi

{
  echo "# Ollama Dev Hardening Certification"
  echo
  echo "- timestamp: $STAMP"
  echo "- scoped_verdict: $SCOPED_VERDICT"
  echo "- hardening_verdict: $HARDENING_VERDICT"
  echo "- package_provenance: $PACKAGE_PROVENANCE"
  echo "- local_tuning_profile: $LOCAL_TUNING_PROFILE"
  echo "- vs_code_trust: $VS_CODE_TRUST"
  echo "- global_repo_awareness: $GLOBAL_REPO_AWARENESS"
} >"$ROOT/VERDICT.md"

{
  echo "# Environment"
  echo
  echo '```text'
  git status --short || true
  node -v || true
  pnpm -v || true
  npm -v || true
  ollama --version || true
  ollama ps || true
  echo '```'
} >"$ROOT/ENVIRONMENT.md"

{
  echo "# Commands"
  echo
  for key in \
    verify_mcp_security \
    verify_ollama_boundary \
    verify_ollama_dev_live \
    verify_ollama_dev_performance \
    verify_ollama_dev_stack \
    verify_ollama_dev_global_awareness \
    verify_ollama_dev_provenance \
    verify_ollama_dev_tuning \
    test_ollama_dev_hardening_suite \
    detect_recurrence \
    proof_ollama_dev_session; do
    echo "- $key: ${STATUS[$key]} (${OUTPUT[$key]})"
  done
} >"$ROOT/COMMANDS.md"

{
  echo "# Artifacts"
  echo
  for artifact in \
    reports/mcp-package-provenance/ollama-mcp-2.1.0.json \
    reports/mcp-package-provenance/ollama-mcp-2.1.0.md \
    reports/ollama-dev-performance/latest.json \
    reports/ollama-dev-performance/latest.md \
    reports/ollama-dev-tuning/latest.jsonl \
    reports/ollama-dev-tuning/latest.md \
    docs/dev/OLLAMA_DEV_LOCAL_PROFILE.md \
    docs/dev/OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md \
    docs/dev/OLLAMA_DEV_VSCODE_TRUST_RECORD_TEMPLATE.md; do
    if [[ -f "$artifact" ]]; then
      echo "- $artifact"
    fi
  done
} >"$ROOT/ARTIFACTS.md"

{
  echo "# Rollback"
  echo
  echo '```bash'
  echo "git restore -- package.json scripts/mcp/start-ollama-dev-mcp.sh \\"
  echo "  scripts/verify/verify-mcp-security-boundary.sh scripts/verify/verify-ollama-dev-live.sh \\"
  echo "  scripts/verify/verify-ollama-dev-performance.sh scripts/verify/verify-ollama-dev-tuning-matrix.sh \\"
  echo "  scripts/verify/verify-ollama-dev-package-provenance.sh scripts/proof/generate-ollama-dev-hardening-proof.sh \\"
  echo "  tests/unit/scripts/ollamaDevConfig.test.ts tests/unit/scripts/ollamaDevLiveScript.test.ts \\"
  echo "  tests/unit/scripts/ollamaDevFinalSeal.test.ts tests/unit/scripts/ollamaDevHardening.test.ts \\"
  echo "  docs/dev/OLLAMA_DEV_MODEL_POLICY.md docs/dev/OLLAMA_DEV_VSCODE_RUNBOOK.md \\"
  echo "  docs/dev/OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md docs/dev/OLLAMA_DEV_VSCODE_TRUST_RECORD_TEMPLATE.md \\"
  echo "  docs/dev/OLLAMA_DEV_LOCAL_PROFILE.md docs/security/MCP_LOCAL_SECURITY_POLICY.md \\"
  echo "  .github/agents/ollama-dev-chat-boundary.agent.md OLLAMA_RUNTIME_MAP.md scripts/autoheal/autoheal_rules.jsonl"
  echo "rm -rf reports/mcp-package-provenance reports/ollama-dev-tuning reports/proof-packs/OLLAMA_DEV_HARDENING_CERTIFICATION"
  echo '```'
} >"$ROOT/ROLLBACK.md"

echo "SCOPED_VERDICT=$SCOPED_VERDICT HARDENING_VERDICT=$HARDENING_VERDICT PACKAGE_PROVENANCE=$PACKAGE_PROVENANCE LOCAL_TUNING_PROFILE=$LOCAL_TUNING_PROFILE VS_CODE_TRUST=$VS_CODE_TRUST GLOBAL_REPO_AWARENESS=$GLOBAL_REPO_AWARENESS path=$ROOT"
