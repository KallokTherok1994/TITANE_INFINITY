# AUDIT — WebSockets & Polling (Silent-by-default) — v26.2

> Date: 2025-12-18
> Scope: Frontend WebSocket clients + OS Integration Bridge polling fallback
> Goal: Production/Tauri must be silent-by-default (no background polling/loops unless explicitly enabled)

---

## Summary

- WebSocket connection points are limited to the Visual Engine layer.
- OS integration now **will not** silently fall back to interval polling in production.
- Reconnect logic is bounded and avoids duplicate sockets/timers.

## WebSocket Clients (Frontend)

Identified WebSocket implementations:

- [src/visual-engine/TitaneVisualEngine.ts](../../../src/visual-engine/TitaneVisualEngine.ts)
- [src/visual-engine/TitaneVisualEngineV21.ts](../../../src/visual-engine/TitaneVisualEngineV21.ts)
- [src/visual-engine/OSIntegrationBridge.ts](../../../src/visual-engine/OSIntegrationBridge.ts)

No other `new WebSocket(...)` sites found in [src/](../../../src/).

## Production Defaults

### Visual Engine

- `enableWebSocket` defaults to `false`.
- WebSocket connect is only attempted when `enableWebSocket === true` *and* `websocketUrl` is set.

### OSIntegrationBridge

- If no `websocketUrl` is provided: bridge does not connect.
- If `websocketUrl` starts with `ws` / `wss`: uses WebSocket.
- If `websocketUrl` is non-WS (polling URL):
  - Dev: polling is allowed.
  - Production: polling is **disabled** unless explicitly enabled (see below).

## Explicit Opt-ins

### OS WebSocket URL

- Env: `VITE_TITANE_OS_WS_URL` or `VITE_OS_WS_URL`

### OS Polling Fallback Enablement (Production)

Polling fallback requires an explicit opt-in:

- Env: `VITE_TITANE_OS_POLLING_ENABLED=1` (or `VITE_OS_POLLING_ENABLED=1`)
- LocalStorage: `titane_os_polling_enabled=true` (or `1`)

## Verification Evidence (This workspace)

Completed:

- `cargo check` (Tauri backend): PASS
- `pnpm run copilot-xs:validate`: PASS
- `pnpm run copilot-xs:security-scan`: PASS (no known vulnerabilities)
- `pnpm test -- --run && pnpm run test:tauri`: PASS
- Stable build task (`./runtime/stable/build.sh`): completed successfully in this session

## Notes / Operational Guardrails

- For production stability, prefer `ws://`/`wss://` OS integration and keep polling disabled.
- If polling is enabled, it should be a conscious operational choice (env/localStorage) to avoid accidental background loops.
