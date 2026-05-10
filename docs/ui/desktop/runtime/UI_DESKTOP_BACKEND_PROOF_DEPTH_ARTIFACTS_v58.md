# UI_DESKTOP_BACKEND_PROOF_DEPTH_ARTIFACTS_v58

**Date**: 2026-05-10  
**Session**: v58

All artifacts produced or verified in v58.

## New Artifacts (v58)

| Path | Type | Description |
|---|---|---|
| `artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl` | JSONL | 154 structured proof records (module, route, command, proofLevel, latencyMs, ...) |
| `e2e/desktop/helpers/uiDesktopBackendProofDepth.js` | Helper | Proof-depth helper: probeInvoke, probeGuarded, probeDegraded, probeDisplayOnly, persistProofLine |
| `e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js` | E2E Spec | Core Tier 1 modules (20 tests) |
| `e2e/desktop/ui-desktop-backend-proof-depth-admin-dev.wdio.test.js` | E2E Spec | Admin/Dev/DocCenter (9 tests) |
| `e2e/desktop/ui-desktop-backend-proof-depth-agent-chat.wdio.test.js` | E2E Spec | Cross-route agent/chat IPC consistency |
| `e2e/desktop/ui-desktop-backend-proof-depth-sandbox.wdio.test.js` | E2E Spec | Sandboxed mutation flows (14 tests) |
| `e2e/desktop/ui-desktop-backend-proof-depth-utility.wdio.test.js` | E2E Spec | Tier 2 utility + Tier 3 degraded (22 tests) |
| `docs/ui/desktop/UI_DESKTOP_BACKEND_PROOF_DEPTH_v58_STARTUP_AUDIT.md` | Doc | Session startup audit |
| `docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_TAXONOMY_v58.md` | Doc | 10-level proof depth taxonomy |
| `docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_TARGETS_v58.md` | Doc | Module targets with required proof levels |
| `docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_RESULTS_v58.md` | Doc | Run results, 5/5 PASS |
| `docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_MODULE_MATRIX_v58.md` | Doc | Full module matrix, 37 modules classified |
| `docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_COMMAND_CAPABILITY_MAP_v58.md` | Doc | IPC command → Tauri capability map |
| `docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_SANDBOX_RESULTS_v58.md` | Doc | Sandbox flow results |
| `docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_REPAIRS_v58.md` | Doc | Repair log |
| `docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_BLOCKERS_v58.md` | Doc | Blockers log |
| `docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_NEXT_ACTIONS_v58.md` | Doc | Next actions |
| `docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_READINESS_v58.md` | Doc | Remote/CI readiness |
| `docs/ui/desktop/UI_DESKTOP_BACKEND_PROOF_DEPTH_CERTIFICATION_v58.md` | Doc | Final certification |

## Pre-existing Artifacts (v57, verified in v58)

| Path | Status |
|---|---|
| `e2e/desktop/helpers/uiDesktopBackendActivation.js` | ✅ Intact (v57) |
| `e2e/desktop/ui-desktop-backend-activation-*.wdio.test.js` | ✅ Regression: code=0 |
| `e2e/desktop/ui-desktop-functional-*.wdio.test.js` | ✅ Regression: code=0 |
| `src-tauri/tauri.conf.json` | ✅ 4 oauth_facebook commands (v57) |
| `scripts/autoheal/autoheal_rules.jsonl` | ✅ 1764 entries (v57), +3 added (v58) |

## JSONL Proof Schema

```json
{
  "command": "ipc_command_name",
  "module": "MODULE_NAME",
  "route": "/route",
  "attempted": true,
  "available": false,
  "ok": false,
  "responseShape": "null",
  "rawResponse": null,
  "errorKind": "COMMAND_NOT_FOUND",
  "errorMsg": "...",
  "latencyMs": 42,
  "proofLevel": "PROOF_DEPTH_IPC_COMMAND_PROVEN",
  "uiReflected": false,
  "safeToPersist": true,
  "timestamp": "2026-05-10T..."
}
```
