# GATES

| Gate | Status | Command / Evidence | Notes |
|---|---|---|---|
| G_UX_NO_SILENCE | BLOCKED | `src/main.tsx` watchdog+fallback implemented; `08_RUN_X3.log` on current artifact shows `boot_ready=0 fallback=0` | Needs authorized rebuild to validate fix in prod binary |
| G_IPC_CANONICAL | PASS | `src/lib/security.ts` (`IPC:START/END`, `IPC_TIMEOUT`) | Canonical wrapper traced and timeout categorized |
| G_NO_UNBOUNDED | PASS | `gate_scans.log` (`while(true)/for(;;)` quick scan on changed files) | No new unbounded loop introduced by VNEXT patch |
| G_FRONTEND_NO_WEB | FAIL | `gate_scans.log` section `[G_FRONTEND_NO_WEB]` | Existing direct web patterns still present in repo scope |
| G_NETWORK_ONE_DOOR | FAIL | `gate_scans.log` section `[G_NETWORK_ONE_DOOR ...]` | Existing `invoke(` usages outside canonical client remain |
| G_NO_LYING_FALLBACK | PASS | `src/main.tsx` fallback message preserves unknown cause; `src/lib/security.ts` timeout mapped to `IPC_TIMEOUT` | Cause transparency preserved |
| G_BUILD_X3 | BLOCKED | `09_BUILD_X3.log` | Required prod tokens missing |
| G_RUN_X3 | FAIL | `08_RUN_X3.log` | Current artifact does not expose `BOOT:READY` or fallback markers |

