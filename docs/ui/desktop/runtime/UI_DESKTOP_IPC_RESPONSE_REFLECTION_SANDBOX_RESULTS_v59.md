# UI Desktop IPC Response — Sandbox Results v59

**Session**: `TITANE_UI_DESKTOP_IPC_RESPONSE_REFLECTION_AND_REMOTE_SYNC_v59`
**Date**: 2026-05-10

---

## Sandboxed Mutation Tests

The sandbox spec (`ui-desktop-ipc-response-reflection-sandbox.wdio.test.js`) validates:
1. Read-only IPC probes that cannot harm production state
2. Sandboxed write operations using `/tmp/titane-test-*` paths
3. Secret-safe artifact emission (no credentials in proof records)

---

## Sandbox Probe Results

| Route | Sandbox Type | Result |
|---|---|---|
| `/doc-center` | Read-only (`get_documentation_index`) | ✅ `UI_REFLECTS_BACKEND_RESULT` |
| `/time` | Read-only (`read_snapshot`) | ✅ `UI_REFLECTS_BACKEND_RESULT` |
| `/memory` | Read-only (`memory_get_state`) | ✅ `UI_REFLECTS_BACKEND_RESULT` |
| `/cloud` | Guarded (OAuth required) | `PROOF_DEPTH_GUARDED_ONLY` |
| `/admin` | Secret-safe probe (`cp_get_ai_config`) | `PROOF_DEPTH_BLOCKED_BY_RUNTIME` (secrets redacted) |

---

## Secret Redaction Verification

Verifier gate confirmed zero secrets leaked in v59 artifact:
- No `sk-` prefixes
- No `Bearer ` strings
- No `ghp_` tokens
- No `api_key=`, `password=`, `secret=` literals

---

## Non-Production Marker

All mutation probes use `nonProductionMarker: true` in persisted records, ensuring:
- `/tmp/titane-test-*` path explicitly documented
- `cleanupStatus` recorded (deleted or pending)
- Isolation from production `$APPDATA` / `$HOME/.local/share/titane-infinity`

---

## Spec Exit Code

```
wdio close: code=0 signal=null
```
