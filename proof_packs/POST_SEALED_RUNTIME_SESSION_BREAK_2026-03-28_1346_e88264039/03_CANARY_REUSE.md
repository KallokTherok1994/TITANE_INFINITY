# CANARY_REUSE

- Harness: `scripts/e2e/run-memory-chat-proof-ui.sh`
- Scenario: `MEMORY_MULTI_TURN`
- Commands:
  - `TITANE_PROOF_RUN=run1 TITANE_PROOF_SCENARIO=MEMORY_MULTI_TURN bash scripts/e2e/run-memory-chat-proof-ui.sh`
  - `TITANE_PROOF_RUN=run2 TITANE_PROOF_SCENARIO=MEMORY_MULTI_TURN bash scripts/e2e/run-memory-chat-proof-ui.sh`
  - `TITANE_PROOF_RUN=run3 TITANE_PROOF_SCENARIO=MEMORY_MULTI_TURN bash scripts/e2e/run-memory-chat-proof-ui.sh`

Evidence (memory verdicts):
reports/tauri_memory_e2e/20260328T174212Z/wdio-memory-chat-proof-ui.log:3491:[0-0] [MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
reports/tauri_memory_e2e/20260328T174212Z/wdio-memory-chat-proof-ui.log:4474:[0-0] [FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
reports/tauri_memory_e2e/20260328T174318Z/wdio-memory-chat-proof-ui.log:3305:[0-0] [MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
reports/tauri_memory_e2e/20260328T174318Z/wdio-memory-chat-proof-ui.log:4366:[0-0] [FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
reports/tauri_memory_e2e/20260328T174422Z/wdio-memory-chat-proof-ui.log:3450:[0-0] [MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
reports/tauri_memory_e2e/20260328T174422Z/wdio-memory-chat-proof-ui.log:4544:[0-0] [FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
