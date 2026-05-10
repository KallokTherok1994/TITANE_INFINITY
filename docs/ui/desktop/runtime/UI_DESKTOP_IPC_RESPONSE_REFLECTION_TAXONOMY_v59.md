# UI_DESKTOP_IPC_RESPONSE_REFLECTION_TAXONOMY_v59

**Date**: 2026-05-10  
**Session**: v59 — TITANE UI_DESKTOP_IPC_RESPONSE_REFLECTION_AND_REMOTE_SYNC

---

## Purpose

This taxonomy clarifies the strict hierarchy of backend proof depth.  
**IPC_COMMAND_PROVEN is NOT equivalent to a live backend.**

---

## Level Hierarchy (ascending proof depth)

### Level 0 — DISPLAY_ONLY_CONFIRMED
The module renders static or simulated content only. No IPC call is attempted or needed.  
**Evidence**: DOM content rendered, no network/IPC calls.  
**Use when**: Module is intentionally frontend-only (e.g., simulation dashboard, future feature stub).

### Level 1 — DEGRADED_VISIBLE
The module attempted IPC or live data, failed, and correctly shows a degraded/error UI state.  
**Evidence**: DOM shows degraded indicator or error message.  
**Use when**: Provider unavailable and UI correctly reflects this.

### Level 2 — GUARDED_ONLY
The module's IPC flow is explicitly blocked by governance (One Door, auth gate, export guard).  
**Evidence**: Governance policy documented; UI shows gate/disabled state.  
**Use when**: Flow is intentionally blocked for safety — NOT because it failed.

### Level 3 — PROOF_DEPTH_BLOCKED_BY_RUNTIME
The IPC bridge itself was unavailable during the E2E session (e.g., `NO_TAURI_INVOKE` at WebDriver level).  
**Evidence**: `probeInvoke()` catch block returns this.  
**Use when**: Tauri runtime/bridge was not accessible — not a module issue.

### Level 4 — IPC_COMMAND_PROVEN *(also: PROOF_DEPTH_IPC_COMMAND_PROVEN)*
The IPC channel was reached, a command was dispatched, and a response (success or controlled error) came back.  
**This does NOT mean the backend is live.**  
The command could have returned: "command not found", provider error, or provider offline.  
**Evidence**: `{ attempted: true, available: true, ok: false, errorKind: 'COMMAND_NOT_FOUND' }` is still IPC_COMMAND_PROVEN — the bridge is alive.  
**Use when**: IPC bridge reachable and command dispatched.

> ⚠️ **Critical distinction**: `IPC_COMMAND_PROVEN` proves the IPC channel exists. It does NOT prove the backend service behind it is running or returning valid data.

### Level 5 — IPC_RESPONSE_PROVEN *(also: PROOF_DEPTH_IPC_RESPONSE_PROVEN)*
The command returned a typed, structured response shape (not null, not empty, not error-only).  
The response shape is captured and stored.  
**Evidence**: `{ ok: true, responseShape: '{"key":"..."}', latencyMs: 42 }` or controlled error with shape.  
**Use when**: Backend returned a real response that can be inspected.

### Level 6 — UI_REFLECTS_BACKEND_RESULT
The UI visibly changed to display the backend result, error, or degraded state.  
A specific DOM selector or visible text change is captured as evidence.  
**Evidence**: `{ uiSelector: '[data-testid="..."]', uiReflected: true }` with actual DOM content.  
**Use when**: IPC result is visible in the rendered UI.

### Level 7 — SANDBOXED_MUTATION_PROVEN
A safe, non-production mutation was executed in an isolated temp/test path, verified, and cleaned up.  
**Evidence**: `{ tempPath: '/tmp/titane-test-...', cleanupStatus: 'CLEANED', nonProductionMarker: true }`.  
**Use when**: Export, write, or mutation operation was safely tested and reversed.

---

## Forbidden Proof Levels

The following proof levels must NEVER appear in governed artifacts:

| Level | Why Forbidden |
|---|---|
| `UNKNOWN` | Unclassified module — governance failure |
| `IMPLIED_LIVE` | Assuming live without evidence |
| `BUTTON_EXISTS_AS_PROOF` | UI element existence ≠ backend proof |
| `TRYINVOKE_SWALLOWED_AS_PASS` | Swallowed IPC errors classified as success |
| `COMMAND_ONLY_AS_LIVE` | IPC command dispatched ≠ backend live |

---

## Tier 1 Module Minimum Level

All Tier 1 modules must reach at least one of:
- `IPC_RESPONSE_PROVEN`
- `UI_REFLECTS_BACKEND_RESULT`
- `SANDBOXED_MUTATION_PROVEN`
- `GUARDED_WITH_UI_PROOF` (guarded by design, with visible UI evidence)
- `DEGRADED_WITH_UI_PROOF` (degraded by design, with visible UI evidence)
- `BLOCKED_BY_PROVIDER` (provider known-offline, not a code issue)
- `BLOCKED_BY_SECRET` (auth required, governance gate active)
- `BLOCKED_BY_NETWORK` (one-door network block, intentional)
- `BLOCKED_BY_RUNTIME` (IPC bridge unavailable — document root cause)
- `BLOCKED_BY_MISSING_COMMAND` (command not registered — action required)

`IPC_COMMAND_PROVEN` alone is insufficient for Tier 1 certification.

---

## v59 Delta from v58

| v58 Classification | v59 Target |
|---|---|
| PROOF_DEPTH_BLOCKED_BY_RUNTIME (108 records) | Must investigate: is IPC bridge available in single-session? |
| PROOF_DEPTH_GUARDED_ONLY (15 records) | Promote to GUARDED_WITH_UI_PROOF where possible |
| PROOF_DEPTH_DEGRADED_VISIBLE (19 records) | Promote to DEGRADED_WITH_UI_PROOF or IPC_RESPONSE_PROVEN |
| PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED (12 records) | Keep — intentional |
