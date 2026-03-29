# X3 RUNS (SAME CANARY)

Run1:
- Path: reports/tauri_memory_e2e/20260328T170158Z/
- Result: FAIL (invalid session id / page crash).
- Evidence: wdio-memory-chat-proof-ui.log shows "invalid session id".

Run2:
- Path: reports/tauri_memory_e2e/20260328T170242Z/
- Result: PASS_MEMORY_REAL.
- Evidence:
  - MEMORY_PROOF_VERDICT PASS_MEMORY_REAL
  - FALSE_RECALL_VERDICT NO_FALSE_MEMORY_BUT_UNPROVEN
  - providerReason=OK; providerUsed=OLLAMA (OMEGA+SINGULARITY)

Run3:
- Path: reports/tauri_memory_e2e/20260328T170352Z/
- Result: FAIL (invalid session id / page crash).
- Evidence: wdio-memory-chat-proof-ui.log shows "invalid session id".

Conclusion:
- x3 runtime runs not complete; stability blocked by session crashes.
