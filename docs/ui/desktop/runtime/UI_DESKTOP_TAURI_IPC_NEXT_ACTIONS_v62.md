# UI_DESKTOP_TAURI_IPC_NEXT_ACTIONS_v62

**Mission:** TITANE UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_v62  
**Date:** 2026-05-10 | **Version:** v33.0.12

---

## v63 Next Actions (Priority Order)

### 1. Fix CLOUD: Register CloudState with Tauri

**Effort:** Low  
**File:** `src-tauri/src/main.rs` (or app setup)  
**Action:**
```rust
// Find CloudState type, then:
app.manage(CloudState::default())
```
After fix: re-run `ui-desktop-v62-real-ipc-cloud.wdio.test.js` → expect `IPC_RESPONSE_PROVEN`

### 2. Add RESEARCH safe command

**Effort:** Medium  
**Action:**
1. Add `research_get_status` Rust command in `src-tauri/src/` — read-only, no external network
2. Register command in Tauri capabilities
3. Add to `E2E_IPC_PROBE_ALLOWLIST` in `src/e2e/desktop/e2eIpcProbeAllowlist.ts`
4. Add to `ALLOWED_COMMANDS` in `src/lib/security.ts`
5. Re-run `ui-desktop-v62-real-ipc-research.wdio.test.js` → expect `IPC_RESPONSE_PROVEN`

### 3. Expand IPC Proof Coverage

**Effort:** Medium  
**Candidates:**
- `memory_state` / `memory_state_alt` — memory module IPC proof
- `helios_metrics` — system metrics IPC proof
- New modules: TODO, SETTINGS, PROFILE

### 4. v62 Bridge: Make CLOUD IPC_RESPONSE_PROVEN

After fixing CloudState management, CLOUD becomes the 3rd proven module.  
Goal for v63: **4/4 modules IPC_RESPONSE_PROVEN**

---

## v62 Completed Actions (Reference)

| Action | Status |
|--------|--------|
| Implement bridge (`e2eIpcProbeBridge.ts`) | ✅ DONE |
| 8-command allowlist (`e2eIpcProbeAllowlist.ts`) | ✅ DONE |
| Unit tests (40/40) | ✅ DONE |
| `cloud_get_status` in ALLOWED_COMMANDS | ✅ DONE |
| WDIO specs (5 files) | ✅ DONE |
| Cargo rebuild (v33.0.12) | ✅ DONE |
| Bridge proven (IPC_RESPONSE_PROVEN) | ✅ DONE |
| AGENT_CHAT proven | ✅ DONE |
| EXPERIENCE proven | ✅ DONE |
| RESEARCH honest blocker | ✅ DONE |
| CLOUD honest blocker (state not managed) | ✅ DONE |
| verify-backend-proof-depth PASS | ✅ DONE |
