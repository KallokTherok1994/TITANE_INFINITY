# NEXT LOCK — TOTAL_DEV OLLAMA READINESS PANEL

## Reason deferred

The current TOTAL_DEV surface already carries governed unlock, git, console, file, and chat architecture. Adding a new readiness panel cleanly would extend both the React page and the Rust/Tauri command surface, which is broader than the bounded Ollama Dev MCP certification lock.

## Touched surfaces if promoted later

- `src/pages/TotalDevPage.tsx`
- `src-tauri/src/commands/total_dev_commands.rs`
- Tauri command registry / allowlist
- `e2e/desktop/total-dev-ollama-readiness.wdio.test.js`
- `UI_SURFACE_MAP.md`
- `docs/CARTOGRAPHY_COMPLETE.md`
- `docs/IPC_CATALOG.md`

## Proof plan

1. Add a safe `total_dev_ollama_doctor` command with JSON-only output and no secret reads.
2. Render a visible readiness panel with stable `data-testid` selectors.
3. Prove locked product boundary (`gemma2:2b`) and expected dev model (`qwen3.5:9b`).
4. Add Rust tests plus WDIO coverage for unlock, visibility, boundary state, and revoke.
