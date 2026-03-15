# 08 — TEST MATRIX

| TEST_ID | COMMAND | SCOPE | WHY_RELEVANT | RUN_COUNT | RESULT | LOG_PATH | PASS_PROVEN |
|---|---|---|---|---|---|---|---|
| T-01 | cargo check --manifest-path=src-tauri/Cargo.toml | Rust twin_commands.rs, mod.rs, lib.rs | Valide compilation Rust du scope twin | 1 | EXIT 0 ✅ | terminal output | YES |
| T-02 | npx tsc --noEmit --project tsconfig.json | TwinEvolutionPanel.tsx, types/numericTwin.ts, hooks, service | Valide contrats TypeScript twin scope | 2 (avant+après patches) | EXIT 0 ✅ | terminal output | YES |
| T-03 | pnpm exec playwright tests/e2e/twins | E2E navigation /twins + interactions | BLOCKED — runtime Tauri non disponible | 0 | BLOCKED | N/A | NO (BLOCKED) |

## Note sur T-03 (BLOCKED)

Raison: Les tests E2E Playwright/WebdriverIO pour la page /twins nécessitent un runtime Tauri actif.
En mode background CI, le binaire Tauri n'est pas disponible.

Commande manuelle pour validation runtime:
```
pnpm exec playwright test --grep "twins" --headed
```
ou via wdio:
```
pnpm exec wdio run wdio.desktop.conf.cjs --spec '**/twins*'
```
