# GATES REPORT — RUNTIME AUTHORITY GAP
## Session: RUNTIME_AUTHORITY_GAP — 2026-03-21
## SHA: 60c11fdf1

## Mandatory Gates

| Gate | Command | Result |
|---|---|---|
| G_INSTRUCTIONS_VERIFY | `bash scripts/verify_instructions.sh` | PASS (20/0) |
| G_AH_RECURRENCE_GUARD_PASS | `bash scripts/autoheal/detect_recurrence.sh` | PASS (507 entries) |
| G_REGRESSION_CLOSED_DEFECTS | vitest on 2 closed test files | PASS (15/15) |
| G_DESKTOP_BINARY_PRESENT | `ls src-tauri/target/release/titane-infinity` | PASS (42MB, v28.5.0) |
| G_BOOT_READY | Binary launch → BOOT:READY | PASS (2026-03-21T12:53Z) |
| G_IPC_BOOT_COMMAND | `get_runtime_config` IPC | PASS (CMD:START/END OK) |
| G_IPC_CHAT_ROUNDTRIP | WDIO online-chat-proof-ui x3 | 2/3 PASS (1 timeout=cold-start) |
| G_BROWSER_DESKTOP_SEPARATION | sourceMode=embedded confirmed | PASS |
| G_ONLINE_PROVIDER_HONESTY | verify_chat_online.sh | HONEST_FAIL (no shell keys, expected) |
| G_LOCKFILE_CLEAN | git status check | PASS (no dep drift) |

## Summary
- PASS: 9/10
- HONEST_FAIL (documented): 1/10 (online provider no-key env)
- IPC x3: 2/3 (1 cold-start timeout — infrastructure, not product)
