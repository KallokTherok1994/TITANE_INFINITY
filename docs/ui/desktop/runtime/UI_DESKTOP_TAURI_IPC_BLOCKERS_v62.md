# UI_DESKTOP_TAURI_IPC_BLOCKERS_v62

**Mission:** TITANE UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_v62  
**Date:** 2026-05-10 | **Version:** v33.0.12

---

## Active Blockers

### BLOCKER-1: RESEARCH — Missing Safe IPC Command
- **Classification:** `BLOCKED_BY_MISSING_SAFE_COMMAND`
- **Root cause:** `web_research` Rust command performs uncontrolled external network calls. This violates Rule 5 (One Door network governance). No safe read-only status command exists for RESEARCH.
- **Evidence:** Bridge spec correctly rejects `web_research` before attempt. `PROOF_DEPTH_BLOCKED_BY_MISSING_SAFE_COMMAND` recorded in artifact.
- **Next action (v63):** Implement `research_get_status` read-only Rust command (returns engine state, last query timestamp, cached result count — no external calls).

### BLOCKER-2: CLOUD — Tauri State Not Managed
- **Classification:** `PROOF_DEPTH_BLOCKED_BY_RUNTIME`
- **Root cause:** `cloud_get_status` Tauri command requires a managed state type that is not registered with `.manage()` at app boot. Error: `"state not managed for field state on command cloud_get_status. You must call .manage() before using this command"`.
- **Bridge evidence:** Command invoked (bridge working), IPC reached Rust backend, Rust returned a state management error. `COMMAND_ERROR` errorKind.
- **Latency:** 77ms (IPC round-trip confirmed — this is a Rust-side error, not a bridge error).
- **Next action (v63):** Locate `cloud_get_status` Rust handler, identify required state type, register with `app.manage(CloudState::default())` in `src-tauri/src/main.rs`.

---

## Previously Resolved Blockers

### RESOLVED-1: NO_TAURI_INVOKE (v60/v61)
- **Was:** WDIO helpers checked `window.__TAURI__?.invoke` (Tauri v1 API — does not exist in Tauri v2)
- **Root cause:** Tauri v2 uses `window.__TAURI_INTERNALS__` and `@tauri-apps/api/core invoke()`. No `window.__TAURI__.invoke()` exists.
- **Fix (v62):** Bridge registers from WITHIN the app (which has Tauri v2 access via ES module import). WDIO calls `browser.execute(() => window.__TITANE_E2E_IPC_PROBE__.invoke(...))`.
- **Status:** RESOLVED ✅

### RESOLVED-2: cloud_get_status not in security allowlist
- **Was:** `cloud_get_status` missing from `src/lib/security.ts` ALLOWED_COMMANDS
- **Fix:** Added `'cloud_get_status'` to CLOUD CENTER section in v62
- **Status:** RESOLVED ✅

### RESOLVED-3: Module spec artifacts missing `route` field
- **Was:** `v62-tauri-ipc-response.jsonl` lines lacked `route` field → verifier FAIL
- **Fix:** Added `route: '/'` to all 4 module spec `persistLine` calls
- **Status:** RESOLVED ✅
