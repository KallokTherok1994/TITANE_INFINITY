# UI_DESKTOP_TAURI_IPC_BRIDGE_DIAGNOSIS_v62

**Mission:** TITANE UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_v62  
**Date:** 2026-05-10 | **Version:** v33.0.12

---

## Root Cause Analysis: Why v60/v61 Couldn't Prove IPC

### Tauri v2 API vs v1

| API | Tauri v1 | Tauri v2 |
|-----|----------|----------|
| Invoke | `window.__TAURI__.invoke()` | `window.__TAURI_INTERNALS__` + `@tauri-apps/api/core invoke()` |
| WDIO accessible | Yes (window global) | No (ESM only from app context) |

v60/v61 WDIO helpers checked `window.__TAURI__?.invoke` → always `undefined` in Tauri v2 → `NO_TAURI_INVOKE` error.

### Tauri v2 Confirmed

- `tauri = "2.0"` in `src-tauri/Cargo.toml`
- `@tauri-apps/api: "^2.10.1"` in `package.json`
- `window.__TAURI_INTERNALS__` present (internal v2 object), NOT `window.__TAURI__`

### Why Direct WDIO Injection Fails

`browser.execute()` runs in the WebView JS context but cannot dynamically import `@tauri-apps/api/core` — the ESM module is bundled into the app. It's only accessible from within the app's own module graph.

### Solution

Register the bridge from WITHIN the app bootstrap (`main.tsx`). The app has full access to `@tauri-apps/api/core invoke()`. After registration, WDIO can call `window.__TITANE_E2E_IPC_PROBE__.invoke()` which proxies through the app's IPC channel.

---

## Rebuild Requirement

The bridge required a new Tauri binary because:
1. The bridge code is in TypeScript (`src/e2e/desktop/`) — compiled into the frontend bundle
2. The frontend bundle is embedded in the Tauri binary
3. Old binary had no bridge → `bridgeAvailable=false` → `BRIDGE_NOT_AVAILABLE`
4. After `pnpm run build` (frontend) + `cargo build --release` (Tauri) → bridge active

---

## Timeline

| Phase | Outcome |
|-------|---------|
| v60 | DOM evidence only, `NO_TAURI_INVOKE` failures |
| v61 | DOM evidence improved, IPC still not proven |
| v62 start | Tauri v2 root cause identified |
| v62 bridge built | All security guards, allowlist, unit tests (40/40) |
| v62 binary rebuild | 10m54s, v33.0.12 |
| v62 bridge proof | `IPC_BRIDGE_REGISTERED` + `IPC_RESPONSE_PROVEN` ✅ |
| v62 final | AGENT_CHAT + EXPERIENCE `IPC_RESPONSE_PROVEN` ✅ |
