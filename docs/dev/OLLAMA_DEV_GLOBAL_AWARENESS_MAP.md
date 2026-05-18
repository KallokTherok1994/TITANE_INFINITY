# Ollama DEV Global Awareness Map

Status: `OLLAMA_DEV_AWARENESS_GOVERNED`

## Purpose

This map defines the compact context that Ollama DEV may use to reason about the TITANE_INFINITY repo without ingesting raw secrets, `.env` files, or unbounded memory/log dumps.

Canonical generated proof:

- JSON: `reports/ollama-dev-awareness/latest.json`
- Markdown: `reports/ollama-dev-awareness/latest.md`
- Generator: `scripts/verify/generate-ollama-dev-awareness.mjs`
- Gate: `pnpm run verify:ollama:dev:awareness`
- Global gate: `pnpm run verify:ollama:dev:global-awareness`

## Indexed Surfaces

The manifest indexes metadata and hashes for:

- authority and instruction files: `AGENTS.md`, `.github/copilot-instructions.md`, Ollama DEV agent/prompt files;
- cartography: `OLLAMA_RUNTIME_MAP.md`, `ARCHITECTURE.md`, `UI_SURFACE_MAP.md`, `docs/CARTOGRAPHY_COMPLETE.md`, `docs/IPC_CATALOG.md`;
- Ollama DEV runtime config: `.vscode/mcp.json`, `scripts/mcp/start-ollama-dev-mcp.sh`, live/performance/stack/global-awareness gates;
- visible UI and backend certification surface: `src/pages/TotalDevPage.tsx`, `src-tauri/src/commands/total_dev_commands.rs`, TOTAL_DEV capability, browser and desktop tests;
- bounded inventories for `src/`, `src-tauri/`, `tests/`, `e2e/`, `scripts/`, `docs/`, `.github/`, `memory/`, `logs/`, and `reports/`.

## Boundary

- Product Chat remains `gemma2:2b`.
- Ollama DEV remains `qwen3.5:9b`.
- Product defaults checked by the manifest must not contain the DEV model.
- TOTAL_DEV may expose `qwen3.5:9b` only as a DEV surface.
- The manifest excludes `.env`, `.key`, `.pem`, and `.secret` paths and does not print raw memory or log dumps.

## Visible Certification

The `/total-dev` Certification tab uses the IPC command `total_dev_run_certification_profile` and exposes only fixed profiles:

- `ollama-global-awareness`
- `ollama-live`
- `ollama-performance`
- `ollama-stack`
- `browser-total-dev-proof`
- `desktop-total-dev-proof`

Each profile returns a structured verdict: `PASS`, `FAIL`, or `BLOCKED`, plus command, exit code, duration, output tail, and artifact paths.

## Rollback

```bash
git restore -- scripts/verify/generate-ollama-dev-awareness.mjs scripts/verify/verify-ollama-dev-global-awareness.sh docs/dev/OLLAMA_DEV_GLOBAL_AWARENESS_MAP.md src-tauri/src/commands/total_dev_commands.rs src-tauri/capabilities/total_dev.json src-tauri/tauri.conf.json src-tauri/src/main.rs src-tauri/src/commands/security.rs src-tauri/src/commands/capability_commands.rs src/core/commands/TAURI_COMMANDS.ts src/lib/tauriCommands.ts src/lib/security.ts src/pages/TotalDevPage.tsx src/pages/TotalDevPage.css src/__tests__/pages/TotalDevPage.test.tsx tests/unit/scripts/ollamaDevAwareness.test.ts tests/contract/tauri-ipc-contract.test.ts e2e/desktop/total-dev.wdio.test.js package.json OLLAMA_RUNTIME_MAP.md ARCHITECTURE.md UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md docs/IPC_CATALOG.md docs/dev/OLLAMA_DEV_VSCODE_RUNBOOK.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl
rm -rf reports/ollama-dev-awareness reports/playwright-total-dev
```
