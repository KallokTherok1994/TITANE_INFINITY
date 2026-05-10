# UI_DESKTOP_BACKEND_PROOF_DEPTH_TAXONOMY_v58

**Date**: 2026-05-10  
**Session**: v58 — TITANE UI_DESKTOP_BACKEND_PROOF_DEPTH_AND_REMOTE_READINESS

---

## Proof Depth Levels (ordered, lowest to highest)

### Level 1 — UI_ONLY
**Visible page/control only; no action proof.**

The page renders. Controls are visible. No interaction proof exists.  
No IPC call, no handler, no service reached.  
Example: A page that only shows static text or layout elements.

WDIO assertion pattern:
```js
await navigateAndWait('/route', 'page-testid');
// Only: page root found, no ErrorBoundary
```
Verdict example: `PROOF_DEPTH_UI_ONLY`

---

### Level 2 — DISPLAY_ONLY_CONFIRMED
**Page intentionally display-only; no backend claim.**

The module is designed as read-only display. No action is expected, no backend call is claimed.  
Explicitly classified — not a failure.  
Example: A status display board with no live data fetch.

Verdict example: `PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED`

---

### Level 3 — GUARDED_ONLY
**Action exists but is disabled/guarded; no backend execution.**

The UI control or action button is present but is behind a guard:  
- disabled state  
- permission gate  
- confirmation dialog never triggered  
- export guarded to safe paths only

No backend execution occurs.  
Example: Doc Center export button present but guarded.

Verdict example: `PROOF_DEPTH_GUARDED_ONLY`

---

### Level 4 — DEGRADED_VISIBLE
**Backend unavailable or unsupported; degraded state visible and honest.**

The backend or provider is unavailable and the UI visibly reflects this (error state, offline badge, degraded indicator).  
Not a failure — honest degraded state is valid proof.  
Example: Hyper Center showing "subsystem offline" badge.

Verdict example: `PROOF_DEPTH_DEGRADED_VISIBLE`

---

### Level 5 — HANDLER_PROVEN
**User action reaches frontend handler.**

A user action (click, keypress) triggers a frontend handler function.  
The handler is called. No backend call verified.  
Example: Send button activates `handleSubmit()`.

Verdict example: `PROOF_DEPTH_HANDLER_PROVEN`

---

### Level 6 — SERVICE_PROVEN
**Frontend handler reaches a service method.**

The handler calls a frontend service (TypeScript class, hook, function).  
The service method is invoked. No IPC call verified.  
Example: Chat submit calls `conversationEngine.send()`.

Verdict example: `PROOF_DEPTH_SERVICE_PROVEN`

---

### Level 7 — IPC_COMMAND_PROVEN
**Tauri command is invoked in desktop runtime.**

`window.__TAURI__?.invoke(command, args)` is called.  
The IPC channel is reached. Response not yet verified.  
Example: `invoke('get_system_health')` executes without throwing.

WDIO assertion pattern:
```js
const r = await tryInvoke('get_system_health');
expect(r.attempted).toBe(true);
expect(r.available).toBe(true);
// proofLevel: IPC_COMMAND_PROVEN
```
Verdict example: `PROOF_DEPTH_IPC_COMMAND_PROVEN`

---

### Level 8 — IPC_RESPONSE_PROVEN
**Command returns a typed/safe response, success or controlled error.**

The IPC invocation completes and returns:  
- a typed success payload (`{ ok: true, content: {...} }`), OR  
- a controlled/expected error (not NO_TAURI_INVOKE, not crash)

The response shape is inspected.  
Example: `get_system_health` returns `{ ok: true, content: { status: 'operational' } }`.

WDIO assertion pattern:
```js
const r = await tryInvoke('get_system_health');
expect(r.ok || r.error !== 'NO_TAURI_INVOKE').toBe(true);
expect(r.responseShape).not.toBe('null');
// proofLevel: IPC_RESPONSE_PROVEN
```
Verdict example: `PROOF_DEPTH_IPC_RESPONSE_PROVEN`

---

### Level 9 — UI_REFLECTS_BACKEND_RESULT
**UI visibly reflects the backend response.**

After the IPC call, the UI state changes to reflect the result:  
- data rendered from response  
- status badge updated  
- content populated from backend  

Example: System health call → health indicator turns green in Admin panel.

Verdict example: `PROOF_DEPTH_UI_REFLECTS_BACKEND_RESULT`

---

### Level 10 — SANDBOXED_MUTATION_PROVEN
**A safe temp/test mutation is executed and verified without touching real data.**

A write/mutation operation is performed in a sandboxed context:  
- temp file written and read back  
- test namespace entry created and deleted  
- mock snapshot created then cleaned  

Real user data is NOT modified. Test namespace explicitly isolated.  
Example: Doc Center exports to `/tmp/titane-e2e-test-export/` — file exists → deleted.

Verdict example: `PROOF_DEPTH_SANDBOXED_MUTATION_PROVEN`

---

## Blocked States

| Label | Meaning |
|---|---|
| `PROOF_DEPTH_BLOCKED_BY_PROVIDER` | Local provider (Ollama) not reachable in E2E context |
| `PROOF_DEPTH_BLOCKED_BY_SECRET` | Action requires secret/credential not injectable in test |
| `PROOF_DEPTH_BLOCKED_BY_NETWORK` | One Door policy blocks network access required by action |
| `PROOF_DEPTH_BLOCKED_BY_RUNTIME` | Tauri IPC not available or command absent at runtime |
| `PROOF_DEPTH_BLOCKED_BY_MISSING_COMMAND` | IPC command registered but not reachable (not in allow list) |
| `PROOF_DEPTH_BLOCKED_BY_REMOTE_SYNC` | Proof complete locally but remote sync pending |

---

## Forbidden Proof Labels

The following labels are **explicitly forbidden** and must never appear in classification:

| Forbidden Label | Why |
|---|---|
| `PROOF_DEPTH_UNKNOWN` | Every module must be classified |
| `IMPLIED_LIVE` | No implicit backend claims |
| `ASSUMED_BACKEND` | No assumption without IPC evidence |
| `BUTTON_EXISTS_AS_PROOF` | UI control presence ≠ backend proof |
| `TRYINVOKE_SWALLOWED_AS_PASS` | `tryInvoke` never-throws ≠ IPC response proof |

---

## Promotion Matrix

| v57 Classification | Maps to v58 Depth |
|---|---|
| BACKEND_FLOW_PROVEN | IPC_RESPONSE_PROVEN or UI_REFLECTS_BACKEND_RESULT |
| BACKEND_LOCAL_PROVIDER_PROVEN | IPC_RESPONSE_PROVEN or BLOCKED_BY_PROVIDER |
| BACKEND_READ_ONLY_PROVEN | IPC_RESPONSE_PROVEN or IPC_COMMAND_PROVEN |
| BACKEND_GUARDED_PROVEN | GUARDED_ONLY |
| BACKEND_DEGRADED_EXPECTED | DEGRADED_VISIBLE |
| BACKEND_SIMULATED_CONFIRMED | DISPLAY_ONLY_CONFIRMED |
| BACKEND_BLOCKED_BY_RUNTIME | PROOF_DEPTH_BLOCKED_BY_RUNTIME |
