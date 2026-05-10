# UI_DESKTOP_BACKEND_PROOF_DEPTH_SANDBOX_RESULTS_v58

**Date**: 2026-05-10  
**Session**: v58

Sandboxed mutation proof results for all flows tested in `ui-desktop-backend-proof-depth-sandbox.wdio.test.js`.

## Sandbox Run Summary

**Tests**: 14/14 PASS. code=0. Duration: ~30s.

## Flow Results

| Module | Action | Status | Proof Level | Note |
|---|---|---|---|---|
| DOC_CENTER_EXPORT_SANDBOX | Export attempt | GUARDED | GUARDED_ONLY | Path not configurable in E2E — export not executed |
| TIME_SNAPSHOT_SANDBOX | `read_snapshot` | PROBED | IPC_COMMAND_PROVEN | Read-only, no mutation |
| TIME_SNAPSHOT_SANDBOX_SHAPE | `read_snapshot` shape | PROBED | IPC_COMMAND_PROVEN | Shape verified |
| MEMORY_SANDBOX | `memory_get_state` | PROBED | IPC_COMMAND_PROVEN | Read-only, no mutation |
| CLOUD_SANDBOX | Cloud sync | GUARDED | GUARDED_ONLY | One Door policy — no real push/pull |
| CHAT_SANDBOX | `chat_get_providers_status` | PROBED | IPC_COMMAND_PROVEN | No real AI call, read-only |
| ADMIN_CONFIG_SANDBOX | `cp_get_ai_config` | PROBED | IPC_COMMAND_PROVEN | Read-only, no apply |
| ADMIN_CONFIG_SANDBOX_SECRETS | `cp_get_ai_config` | PROBED | PASS (security) | No raw sk- keys in response shape |

## Security Assertions

| Assertion | Result |
|---|---|
| DOC_CENTER export — no file written | PASS (guarded) |
| CLOUD — no real network push/pull | PASS (guarded) |
| ADMIN_CONFIG — no API key exposed | PASS |
| ADMIN_CONFIG — no raw secret in response shape | PASS |

## Mutation Safety

- **Zero destructive mutations executed** in sandbox spec
- **All read-only IPC probes** — no state changes triggered
- **All guarded flows classified honestly** as GUARDED_ONLY
- **Temp file cleanup** — not needed (no temp files created)

## Verdict

All sandbox flows correctly classified. No mutations. No secrets exposed. PASS.
