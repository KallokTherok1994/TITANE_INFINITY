# UI Desktop IPC Response — Artifacts v59

**Session**: `TITANE_UI_DESKTOP_IPC_RESPONSE_REFLECTION_AND_REMOTE_SYNC_v59`
**Date**: 2026-05-10

---

## Artifact Inventory

| File | Type | Records | Status |
|---|---|---|---|
| `artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl` | JSONL proof artifact | 65 | ✅ Written |
| `artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl` | JSONL proof artifact (baseline) | 204 | ✅ Committed (v58) |

---

## v59 Artifact Schema

Each record follows the `probeInvoke` and `probeInvokeAndReflect` schema:

```json
{
  "date": "2026-05-10T...",
  "route": "/titane",
  "moduleId": "TITANE_CHAT",
  "command": "chat_get_providers_status",
  "args": {},
  "attempted": true,
  "available": true,
  "ok": true,
  "proofLevel": "UI_REFLECTS_BACKEND_RESULT",
  "latencyMs": 574,
  "responseShape": "object",
  "uiSelector": "[data-testid=\"page-titane\"]",
  "uiEvidence": "providers_status element updated",
  "safeToPersist": true,
  "errorKind": null,
  "errorMessageRedacted": null
}
```

---

## Verifier Evidence

```
Script: scripts/verify/verify-backend-proof-depth.mjs
Command: TITANE_PROOF_ARTIFACT=artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl pnpm run verify:backend-proof-depth
Result: PASS: 4 | WARN: 219 | FAIL: 0
VERDICT: PASS
```

WARNs: `sourceSpec` field absent in helper-generated records (non-blocking, recommended only).

---

## Spec Files Producing This Artifact

| Spec | Modules Covered |
|---|---|
| `e2e/desktop/ui-desktop-ipc-response-reflection-core.wdio.test.js` | TITANE_CHAT, TIME, MEMORY, EXPERIENCE, RESEARCH, CLOUD |
| `e2e/desktop/ui-desktop-ipc-response-reflection-admin-dev.wdio.test.js` | ADMIN_SYSTEM, ADMIN_CONFIG, DEV_COCKPIT |
| `e2e/desktop/ui-desktop-ipc-response-reflection-utility.wdio.test.js` | PERFORMANCE, SKILLS, KNOWLEDGE, CREATION, EVOLUTION, TWINS, FUSION, Tier 3 |
| `e2e/desktop/ui-desktop-ipc-response-reflection-agent-chat.wdio.test.js` | Cross-route consistency, Chat context reflection, Auth OAuth |
| `e2e/desktop/ui-desktop-ipc-response-reflection-sandbox.wdio.test.js` | Doc Center, Time, Memory, Cloud, Admin (sandboxed) |

---

## Helper Module

`e2e/desktop/helpers/uiDesktopBackendProofDepth.js` v59 additions:
- `waitForTauriReady(timeoutMs)` — guards IPC readiness before first probe
- `probeInvokeAndReflect(command, args, uiSelector, opts)` — emits `UI_REFLECTS_BACKEND_RESULT`
- `probeSandboxedMutation(opts)` — emits `SANDBOXED_MUTATION_PROVEN` for `/tmp` writes
- `getConfiguredArtifactFile()` — reads `TITANE_PROOF_ARTIFACT` env, falls back to v58 path
- `redactHomePath(str)` — replaces `/home/<user>` with `/home/[REDACTED]`
