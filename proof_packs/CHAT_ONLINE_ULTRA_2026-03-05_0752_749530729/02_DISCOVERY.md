# DISCOVERY

- generated_at_utc: 2026-03-05T13:03:00Z

## Commands Executed

- `read package.json` (scripts authority)
- `rg -n "vitest|playwright|wdio|webdriverio|e2e|test:e2e|verify|online|provider|health" package.json .github scripts e2e src src-tauri`
- `find . -maxdepth 4 -name "playwright.config*" -o -name "wdio*.conf*" -o -name "vitest.config*"`

## Config Files Found

- `playwright.config.ts`
- `wdio.desktop.conf.cjs`
- `vitest.config.ts`

## E2E Desktop Authority

- REQUIRED: `WDIO` (`package.json` -> `e2e:desktop:run`, `wdio.desktop.conf.cjs`, `scripts/e2e/run-desktop-suite.js`)
- EXTENDED (non-required): `Playwright` (`test:e2e`, `playwright.config.ts`)

## Discovery Proof Snippets

- `package.json` contains:
  - `e2e:desktop:run`: `node scripts/e2e/run-desktop-suite.js`
  - `e2e:desktop:proof:online-chat`: `bash scripts/e2e/run-online-chat-proof-ui.sh`
  - `test:e2e`: `playwright test e2e`
  - `verify:online-first`: `bash scripts/verify/enforce-online-first.sh`
- Provider health commands/call sites detected:
  - `scripts/verify/verify_chat_online.sh`
  - `src/components/layout/TopNav.tsx` -> `safeInvoke('chat_check_providers')`
  - `src-tauri/src/overdrive/chat_orchestrator.rs` -> `chat_check_providers`
