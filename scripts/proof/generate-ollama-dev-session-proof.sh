#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +%F_%H%M%S)"
ROOT="reports/proof-packs/OLLAMA_DEV_SESSION_CERTIFICATION/$STAMP"
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
run_capture "test_ollama_dev_config" "pnpm vitest run tests/unit/scripts/ollamaDevConfig.test.ts"
run_capture "test_ollama_dev_boundary_suite" "pnpm vitest run tests/unit/scripts/ollamaBoundaryDoctrine.test.ts tests/unit/scripts/ollamaDevLiveScript.test.ts tests/unit/scripts/ollamaDevFinalSeal.test.ts"
run_capture "audit_agents_stack" "pnpm run audit:agents:stack"
run_capture "detect_recurrence" "bash scripts/autoheal/detect_recurrence.sh"
run_capture "verify_ollama_dev_global_awareness" "bash scripts/verify/verify-ollama-dev-global-awareness.sh"

SCOPED_VERDICT="SEALED"
GLOBAL_REPO_AWARENESS="GLOBAL_REPO_GATES_SKIPPED"
TRUST_STATUS="MANUAL_TRUST_REQUIRED"
TRUST_CLI="TRUST_NOT_CLI_PROVABLE"
TRUST_DOCS="TRUST_DOCS_PRESENT"
TOTAL_DEV_STATUS="TOTAL_DEV_READINESS_DEFERRED_VALID"

if [[ ! -f docs/dev/OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md ]] || ! grep -q 'OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md' docs/dev/OLLAMA_DEV_VSCODE_RUNBOOK.md; then
  TRUST_DOCS="TRUST_DOCS_MISSING"
fi

if grep -Rqs "BLOCKED_OLLAMA_SERVER:" "$OUT_DIR"; then
  SCOPED_VERDICT="FAIL_RUNTIME_SMOKE"
elif grep -Rqs "BLOCKED_MODEL_MISSING:" "$OUT_DIR"; then
  SCOPED_VERDICT="FAIL_RUNTIME_SMOKE"
elif [[ "${STATUS[verify_ollama_boundary]}" == "FAIL" ]]; then
  SCOPED_VERDICT="FAIL_BOUNDARY"
elif [[ "${STATUS[verify_mcp_security]}" == "FAIL" ]]; then
  SCOPED_VERDICT="FAIL_SECURITY"
elif [[ "${STATUS[verify_ollama_dev_live]}" == "FAIL" ]]; then
  SCOPED_VERDICT="FAIL_RUNTIME_SMOKE"
elif [[ "${STATUS[verify_ollama_dev_performance]}" == "FAIL" ]]; then
  SCOPED_VERDICT="FAIL_PERFORMANCE"
elif [[ "${STATUS[test_ollama_dev_config]}" == "FAIL" || "${STATUS[test_ollama_dev_boundary_suite]}" == "FAIL" || "${STATUS[audit_agents_stack]}" == "FAIL" || "${STATUS[detect_recurrence]}" == "FAIL" ]]; then
  SCOPED_VERDICT="FAIL_TESTS"
fi

if [[ "${STATUS[verify_ollama_dev_global_awareness]}" == "PASS" ]]; then
  if grep -q 'GLOBAL_REPO_GATES_PARTIAL' "${OUTPUT[verify_ollama_dev_global_awareness]}"; then
    GLOBAL_REPO_AWARENESS="GLOBAL_REPO_GATES_PARTIAL"
  elif grep -q 'GLOBAL_REPO_GATES_PASS' "${OUTPUT[verify_ollama_dev_global_awareness]}"; then
    GLOBAL_REPO_AWARENESS="GLOBAL_REPO_GATES_PASS"
  fi
elif grep -q 'GLOBAL_REPO_GATES_FAIL_UNKNOWN' "${OUTPUT[verify_ollama_dev_global_awareness]}" 2>/dev/null; then
  GLOBAL_REPO_AWARENESS="GLOBAL_REPO_GATES_FAIL_UNKNOWN"
fi

{
  echo "# Ollama Dev Session Certification"
  echo
  echo "- timestamp: $STAMP"
  echo
  echo "## Ollama Dev scoped verdict"
  echo
  echo "- verdict: $SCOPED_VERDICT"
  echo
  echo "## Global repo awareness"
  echo
  echo "- verdict: $GLOBAL_REPO_AWARENESS"
  if [[ -f "${OUTPUT[verify_ollama_dev_global_awareness]:-}" ]]; then
    echo "- details: ${OUTPUT[verify_ollama_dev_global_awareness]}"
  fi
  echo
  echo "## VS Code MCP trust"
  echo
  echo "- status: $TRUST_STATUS"
  echo "- cli: $TRUST_CLI"
  echo "- docs: $TRUST_DOCS"
  echo "- checklist: docs/dev/OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md"
  echo
  echo "## TOTAL_DEV readiness"
  echo
  echo "- status: $TOTAL_DEV_STATUS"
} >"$ROOT/VERDICT.md"

{
  echo "# Environment"
  echo
  echo '```text'
  git status --short || true
  node -v || true
  pnpm -v || true
  rustc -V || true
  cargo -V || true
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
    test_ollama_dev_config \
    test_ollama_dev_boundary_suite \
    audit_agents_stack \
    detect_recurrence \
    verify_ollama_dev_global_awareness; do
    echo "- $key: ${STATUS[$key]} (${OUTPUT[$key]})"
  done
} >"$ROOT/COMMANDS.md"

{
  echo "# Optional Artifacts"
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
  echo "git restore -- .vscode/mcp.json .vscode/settings.json package.json \\"
  echo "  .github/agents/ollama-dev-chat-boundary.agent.md \\"
  echo "  .github/prompts/ollama-dev-session.prompt.md \\"
  echo "  OLLAMA_RUNTIME_MAP.md docs/dev/LOCAL_AI_SURFACES_AUTHORITY.md \\"
  echo "  docs/dev/OLLAMA_DEV_MODEL_POLICY.md docs/dev/OLLAMA_DEV_VSCODE_RUNBOOK.md \\"
  echo "  docs/security/MCP_LOCAL_SECURITY_POLICY.md docs/dev/NEXT_LOCK_TOTAL_DEV_OLLAMA_READINESS_PANEL.md \\"
  echo "  scripts/mcp/start-ollama-dev-mcp.sh scripts/ollama/pull-dev-model.sh \\"
  echo "  scripts/ollama/preload-dev-model.sh scripts/ollama/unload-dev-model.sh \\"
  echo "  scripts/proof/generate-ollama-dev-session-proof.sh \\"
  echo "  scripts/verify/verify-mcp-security-boundary.sh scripts/verify/verify-ollama-dev-live.sh \\"
  echo "  scripts/verify/verify-ollama-dev-performance.sh scripts/verify/verify-ollama-dev-stack.sh scripts/verify/verify-ollama-dev-global-awareness.sh \\"
  echo "  tests/unit/scripts/ollamaDevConfig.test.ts tests/unit/scripts/ollamaBoundaryDoctrine.test.ts \\"
  echo "  tests/unit/scripts/ollamaDevLiveScript.test.ts tests/unit/scripts/ollamaDevFinalSeal.test.ts \\"
  echo "  docs/dev/OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md scripts/autoheal/autoheal_rules.jsonl scripts/verify/verify-vscode-agent-workflow.sh scripts/verify/verify-ollama-copilot-boundary.sh scripts/verify_instructions.sh"
  echo "rm -rf reports/ollama-dev-performance reports/proof-packs/OLLAMA_DEV_SESSION_CERTIFICATION"
  echo '```'
} >"$ROOT/ROLLBACK.md"

echo "SCOPED_VERDICT=$SCOPED_VERDICT GLOBAL_REPO_AWARENESS=$GLOBAL_REPO_AWARENESS path=$ROOT"
