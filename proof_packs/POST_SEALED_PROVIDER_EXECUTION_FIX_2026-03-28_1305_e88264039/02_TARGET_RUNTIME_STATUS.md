# TARGET RUNTIME STATUS

Target: Tauri desktop (embedded assets)
Harness: WDIO/wry via scripts/e2e/run-memory-chat-proof-ui.sh
Scenario: MEMORY_MULTI_TURN

Evidence of availability:
- Tauri target launched and executed in runs:
  - reports/tauri_memory_e2e/20260328T170158Z/
  - reports/tauri_memory_e2e/20260328T170242Z/
  - reports/tauri_memory_e2e/20260328T170352Z/

Runtime status summary:
- Target is available.
- Runtime stability is not yet x3-clean (two runs crashed with invalid session id).
