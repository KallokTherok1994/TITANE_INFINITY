# UI_DESKTOP_TAURI_IPC_ARTIFACTS_v62

**Mission:** TITANE UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_v62  
**Date:** 2026-05-10 | **Version:** v33.0.12

---

## Artifact Files

| File | Lines | Purpose |
|------|-------|---------|
| `artifacts/backend-proof-depth/v62-tauri-ipc-probe-bridge.jsonl` | 3 | Bridge presence + system_health IPC proof |
| `artifacts/backend-proof-depth/v62-tauri-ipc-response.jsonl` | 4 | Module IPC proof levels (4 modules) |

---

## v62-tauri-ipc-probe-bridge.jsonl

3 lines written by `ui-desktop-tauri-ipc-probe-bridge.wdio.test.js`:

| Line | proofLevel | description |
|------|-----------|-------------|
| 1 | `IPC_BRIDGE_REGISTERED` | Bridge availability check (pre-invoke) |
| 2 | `IPC_BRIDGE_REGISTERED` | Bridge version + allowlist check |
| 3 | `IPC_RESPONSE_PROVEN` | `system_health` invoke via `health_check` command |

---

## v62-tauri-ipc-response.jsonl

4 lines written by module specs:

| Line | moduleId | proofLevel | ok | errorKind |
|------|----------|-----------|-----|-----------|
| 1 | `AGENT_CHAT` | `IPC_RESPONSE_PROVEN` | true | None |
| 2 | `EXPERIENCE` | `IPC_RESPONSE_PROVEN` | true | None |
| 3 | `RESEARCH` | `PROOF_DEPTH_BLOCKED_BY_MISSING_SAFE_COMMAND` | false | `BLOCKED_BY_MISSING_SAFE_COMMAND` |
| 4 | `CLOUD` | `PROOF_DEPTH_BLOCKED_BY_RUNTIME` | false | `COMMAND_ERROR` |

---

## Artifact Schema (v62)

```json
{
  "schemaVersion": "v62",
  "capturedAt": "<ISO8601>",
  "sourceSpec": "<wdio-spec-filename>",
  "moduleId": "<MODULE_ID>",
  "tier": 1,
  "route": "/",
  "bridgeAvailable": true,
  "bridgeVersion": "v62",
  "commandId": "<allowlist-id>",
  "command": "<rust-command>",
  "attempted": true,
  "available": true,
  "ok": true,
  "responseShape": ["field1", "field2"],
  "contentPreviewRedacted": "[shape-only]",
  "errorKind": null,
  "errorMessageRedacted": null,
  "latencyMs": 45,
  "proofLevel": "IPC_RESPONSE_PROVEN",
  "blockerClass": null,
  "safeToPersist": true,
  "redactionApplied": true,
  "secretScanPassed": true,
  "promotionFrom": "UI_REFLECTS_BACKEND_RESULT",
  "promotionTo": "IPC_RESPONSE_PROVEN",
  "nextAction": "v63-expand-coverage"
}
```

---

## Verifier

`scripts/verify/verify-backend-proof-depth.mjs` — patched for v62:
- Accepts `schemaVersion: 'v62'`
- Validates `bridgeVersion` field
- Validates `commandId` field
- Checks destructive commandIds blocked
- Missing v62 artifacts → `warn` (not fail)
