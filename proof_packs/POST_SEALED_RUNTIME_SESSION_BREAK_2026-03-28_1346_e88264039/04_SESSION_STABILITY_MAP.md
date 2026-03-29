# SESSION_STABILITY_MAP

## Target + harness
- Target: Tauri desktop embedded assets (APP_SOURCE in logs).
- Harness: WDIO/wry via `scripts/e2e/run-memory-chat-proof-ui.sh`.

## Stage map
| Stage | Owner | Evidence | Status | Action |
| --- | --- | --- | --- | --- |
| TARGET_BOOT | Tauri runtime | APP_SOURCE embedded assets | PROVEN | None |
| DRIVER_ATTACH | tauri-driver + WDIO | wdio log session creation | PROVEN | None |
| SESSION_CREATE | WDIO/wry | wdio session id present | PROVEN | None |
| SESSION_PERSIST_STEP | WDIO/wry | no invalid session id during steps | PROVEN | None |
| SESSION_PERSIST_RUN | WDIO/wry | run completes with PASS_MEMORY_REAL | PROVEN | None |
| SESSION_PERSIST_X3 | WDIO/wry | three consecutive runs pass | PROVEN | None |
| CANARY_COMPLETE | WDIO/wry + app | FALSE_RECALL_VERDICT logged | PROVEN | None |

## Evidence snapshots
- PASS_MEMORY_REAL logged in all three runs (see `03_CANARY_REUSE.md`).
- No invalid session id in any of the three runs.
