#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_ROOT="${REPO_ROOT}/reports/agent_dispatch/${STAMP}"
HANDOFF_ROOT="${RUN_ROOT}/handoffs"
EVIDENCE_ROOT="${RUN_ROOT}/evidence"
MISSION="${1:-Hybrid Memory Rollout}"
MODE="${MODE:-Plan}"
OWNER="${OWNER:-Memory Root Commander}"

mkdir -p "${HANDOFF_ROOT}" "${EVIDENCE_ROOT}"

cat > "${RUN_ROOT}/MISSION.md" <<EOF
# Hybrid Memory Dispatch Run

Mission: ${MISSION}
Mode: ${MODE}
Owner: ${OWNER}

Dispatch order:
1. Memory Root Commander
2. Memory Orchestrator
3. Memory Architecture Master
4. Memory Backend Master
5. Memory Frontend Master
6. Memory QA and Ops Master

Required verdict vocabulary:
PASS / FAIL / BLOCKED / BLOCKED_APPROVAL / DONE / SEALED
EOF

cat > "${RUN_ROOT}/COMMANDER_PROMPT.md" <<EOF
Act as the Memory Root Commander.
Launch the governed hybrid-memory program.
Keep the current memory system as the safe baseline.
Use shadow mode first.
Demand proof from every master agent.
Block unsafe changes.
Return one final verdict with rollback readiness.
EOF

printf '%s\n' 'BLOCKED pending agent execution and proof collection' > "${RUN_ROOT}/STATUS.md"

if command -v wl-copy >/dev/null 2>&1; then
  wl-copy < "${RUN_ROOT}/COMMANDER_PROMPT.md"
elif command -v xclip >/dev/null 2>&1; then
  xclip -selection clipboard < "${RUN_ROOT}/COMMANDER_PROMPT.md"
fi

echo "Dispatch kit ready."
echo "Run folder: ${RUN_ROOT}"
echo "Commander prompt: ${RUN_ROOT}/COMMANDER_PROMPT.md"