# BREAKPOINT_ANALYSIS

Primary breakpoint: BREAK_AT_SNAPSHOT_EMISSION

Evidence
- reports/tauri_memory_e2e/20260328T211800Z/wdio-memory-chat-proof-ui.log: IPC titan_force_snapshot_current failed: requires full backend (features: full, no mock)
- reports/tauri_memory_e2e/20260328T211924Z/wdio-memory-chat-proof-ui.log: IPC titan_force_snapshot_current failed: requires full backend (features: full, no mock)

Secondary observation
- Run1 (reports/tauri_memory_e2e/20260328T211651Z) hit WRY invalid session id before restore harness.
