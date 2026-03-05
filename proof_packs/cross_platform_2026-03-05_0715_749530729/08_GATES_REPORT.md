# 08_GATES_REPORT
Generated: 2026-03-05T12:22:10Z

| Gate | Status | Where to verify |
|---|---|---|
| G_RING_INTEGRITY | FAIL | `03_INVARIANTS_CHECK.md` |
| G_FRONTEND_NO_WEB | FAIL | `03_INVARIANTS_CHECK.md` |
| G_NETWORK_ONE_DOOR | FAIL | `03_INVARIANTS_CHECK.md` |
| G_NO_UNBOUNDED | FAIL | `03_INVARIANTS_CHECK.md` |
| G_IPC_CANON | FAIL | `03_INVARIANTS_CHECK.md` |
| G_VERSION_SYNC | FAIL | `03_INVARIANTS_CHECK.md` |
| G_PATHS_OK_PER_OS | FAIL | `03_INVARIANTS_CHECK.md` |
| G_WINDOWS_BUILD_X3 | BLOCKED | `06_BUILD_X3.log` |
| G_WINDOWS_WEBVIEW2_STRATEGY | NON PROUVE | `06_BUILD_X3.log` |
| G_WINDOWS_SMOKE_X3 | BLOCKED | `05_TESTS_X3.log` |
| G_ANDROID_INIT_READY | BLOCKED | `06_BUILD_X3.log` |
| G_ANDROID_BUILD_X3 | BLOCKED | `06_BUILD_X3.log` |
| G_ANDROID_PERMISSIONS_AUDIT | NON PROUVE | `05_TESTS_X3.log` |
| G_ANDROID_SMOKE_X3 | BLOCKED | `05_TESTS_X3.log` |
| G_E2E_RUNTIME_PROOF | NON PROUVE | `07_E2E_ARTIFACTS_INDEX.md` |

## SUPERSEDED/REBUILT (append-only) - 2026-03-05T07:56:53-05:00
- Correction note: rebuilt gate section was previously dropped by mistake; this block re-states gates from strict rerun evidence.

| Gate | Rebuilt Status | Evidence |
|---|---|---|
| G_RING_INTEGRITY | FAIL | `03_INVARIANTS_CHECK.md` inherited ring findings (not resolved) |
| G_FRONTEND_NO_WEB | FAIL | `CMD_2` (`/tmp/scan_cmd2.txt`) |
| G_NETWORK_ONE_DOOR | FAIL | `CMD_4` (`/tmp/scan_cmd4.txt`) |
| G_NO_UNBOUNDED | FAIL | `CMD_5` (`/tmp/scan_cmd5.txt`) |
| G_IPC_CANON | FAIL | `CMD_10` (`/tmp/scan_cmd10_invoke_prod.txt`) |
| G_VERSION_SYNC | FAIL | `CMD_7` (`/tmp/scan_cmd7.txt`) |
| G_PATHS_OK_PER_OS | FAIL | `CMD_8` (`/tmp/scan_cmd8.txt`) |
| G_WINDOWS_BUILD_X3 | BLOCKED | `06_BUILD_X3.log` (missing rust target, PASS=0/3 FAIL=3/3) |
| G_WINDOWS_WEBVIEW2_STRATEGY | NON PROUVE | no runtime proof in this pack |
| G_WINDOWS_SMOKE_X3 | BLOCKED | no executable Windows runtime on this Linux host |
| G_ANDROID_INIT_READY | BLOCKED | `06_BUILD_X3.log` (`tauri android init` prerequisite missing) |
| G_ANDROID_BUILD_X3 | BLOCKED | `06_BUILD_X3.log` (PASS=0/3 FAIL=3/3) |
| G_ANDROID_PERMISSIONS_AUDIT | NON PROUVE | no dedicated audit artifact in this pack |
| G_ANDROID_SMOKE_X3 | BLOCKED | no Android runtime smoke proof artifact |
| G_E2E_RUNTIME_PROOF | NON PROUVE | `07_E2E_ARTIFACTS_INDEX.md` unchanged |
