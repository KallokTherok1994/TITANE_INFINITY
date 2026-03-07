# 06_RUNNER_AUTHORITY_DECISION

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (`wdio.desktop.conf.cjs`, `scripts/e2e/run-desktop-suite.js`, `playwright.config.ts`)
C) RISK: P0
D) PLAN: evaluate repo wiring -> pick one authority -> keep second runner as cross-check
E) PROOFS: package scripts + desktop wrapper + configs inspected
F) ROLLBACK: `git restore -- proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/06_RUNNER_AUTHORITY_DECISION.md`

## Discovered Runner Commands
- `pnpm run e2e:desktop:run` -> `node scripts/e2e/run-desktop-suite.js`
- `pnpm run e2e:desktop` -> guard + authorization + ensure + desktop run
- `pnpm run test:e2e` -> `playwright test e2e`

## Authority Decision
- Authority runner: `WebdriverIO` (desktop/Tauri)
- Secondary runner: `Playwright` (browser cross-check)

## Why Authority = WDIO
- Uses `wry` capability and `tauri-driver` with explicit desktop runtime control.
- Integrated governed wrapper path: `scripts/e2e/tauri-wrapper.sh`.
- Generates desktop-specific diagnostics (`wdio.log`, `tauri_driver.log`, `diagnostics.log`).

## Why Playwright = Secondary
- Config default path targets browser HTTP/webServer flow.
- Valuable for regression cross-check, not primary Tauri desktop truth authority.
