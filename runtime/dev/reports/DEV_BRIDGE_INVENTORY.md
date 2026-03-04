# DEV BRIDGE Inventory

Status: RECOGNIZED
Date: 2026-02-09
Capability: TITANE_DEV_BRIDGE
Ring: Ring4 (Modules/UI) - dev tooling surface

## Purpose
Recognize the existing VS Code-driven dev control surface (scripts, runners, guards)
and formalize it as the TITANE_DEV_BRIDGE capability.

## Canonical Entry
pnpm run titane:dev -- <action> --json

## Existing Option B Surfaces (Recognized)

### Scripts (Dev runners)
- scripts/dev/dev_tauri.sh
- scripts/dev/full_local_tauri_ollama.sh
- scripts/dev/dev_on_host.sh
- scripts/dev/dev_with_polling.sh

### Guards
- scripts/guard/guard-ollama-proxy.sh
- scripts/guard/guard-dev-bridge.mjs (new)

### E2E / Runners
- scripts/e2e/ensure-webkit-webdriver.sh
- scripts/e2e/run-desktop-suite.js
- scripts/e2e/require-e2e-build-authorization.sh

### Registry / Logs
- runtime/registry/events.jsonl
- scripts/registry/log-event.js

## Constraints (Stop-the-line)
- Local-first only (no cloud or network dependency)
- Tauri-only (no HTTP server/preview/daemon)
- Structured outputs (JSON ok/error)
- No new permissions without justification

## Notes
This inventory is append-only. New dev bridge actions must extend the contract schema
and remain local-first.
