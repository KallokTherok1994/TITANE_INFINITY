# Repo Structure Index

Last Updated: 2026-02-09

## Top-Level Map (Canonical)

Product Code
- src/ (React/TS app, Ring 4)
- src-tauri/ (Rust/Tauri backend, Ring 2-3 + Ring 4 boundary)
- public/ (static assets)
- e2e/ (Playwright)
- tests/ (unit/integration)

Docs and Governance
- docs/ (documentation canon)
- registry/ (append-only logs)

Tooling
- scripts/ (automation)
- config/ (config helpers)
- .github/ (CI)

Generated / Local
- dist/, dist_stub/
- node_modules/
- playwright-report/
- test-results/
- .vite-cache/
- logs/, monitoring-logs/
- runtime/

Archive / Legacy
- legacy/
- _archive/
- deployment/
- .archive/ and .archive_cleanup/

## Key Entry Points
- UI entry: src/main.tsx
- App root: src/App.tsx
- Tauri base config: tauri.base.json
- Playwright: playwright.config.ts
- Vite: vite.config.ts
- TypeScript: tsconfig.json

## Notes
- Structure is preserved (no moves in this run).
- Any future moves must follow SAFE MOVE and update docs/links.
