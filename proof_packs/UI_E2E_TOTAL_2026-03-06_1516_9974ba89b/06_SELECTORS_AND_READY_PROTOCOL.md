# SELECTORS AND READY PROTOCOL

## Core Markers

- App ready marker: `[data-testid="app-ready"]` with `data-state="ready"`
- IPC marker: `[data-testid="ipc-ready"]` with `data-state="ready|fallback"`
- Chat ready marker: `[data-testid="chat-ready"]` with `data-state="ready"`

## Chat Surface Contract

- Primary selectors: `[data-testid="chat-input"]`, `[data-testid="tab-conversation"]`
- No-silence success markers: assistant message growth, user message growth, visible error marker, alert marker, or prompt reflection/body growth.

## Autofix-specific Protocol Update

- Deterministic recovery path in `e2e/desktop/ui-driver.wdio.js`:
- `ensureChatSurfaceVisible` now re-anchors using `browser.url('tauri://localhost/titane')` then waits for readiness.
- Refresh fallback removed due timeout failure observed in run evidence.

