# PROOF SCENARIOS

Scenario A — CHAT WRITE PERSIST
- Status: PROVEN
- Evidence: events table tail shows user_message + assistant_message at 2026-03-28 14:29:08 EDT.

Scenario B — MEMORY WRITE PERSIST
- Status: PARTIAL
- Evidence: memory canary PASS_MEMORY_REAL and memory dashboard entries 49 -> 52 -> 55.
- LTM store unified_memory.db remains empty.

Scenario C — RESTART SURVIVAL
- Status: PROVEN (bounded to event store)
- Evidence: three separate Tauri runs wrote events/snapshots with new timestamps.

Scenario D — SNAPSHOT / RESTORE
- Status: BLOCKED
- Evidence: snapshot table updated, no restore execution in runtime proof.

Scenario E — SYNC CONTRACT RUNTIME
- Status: PARTIAL
- Evidence: provider_decisions updated; module/engine sync not observed.

Run logs:
- run1: reports/tauri_memory_e2e/20260328T182534Z/wdio-memory-chat-proof-ui.log
- run2: reports/tauri_memory_e2e/20260328T182651Z/wdio-memory-chat-proof-ui.log
- run3: reports/tauri_memory_e2e/20260328T182802Z/wdio-memory-chat-proof-ui.log
