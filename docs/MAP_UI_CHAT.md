# MAP UI CHAT

- generated_at_utc: 2026-03-05T12:00:00Z
- ring: Ring 4
- responsibility: canonical map of desktop chat UI surfaces used by governed WDIO runtime E2E
- status: STABLE (x3 confirmed: unit/full/smoke)

## Route and Entry Points

- page root: `src/pages/TitanePage.tsx`
  - `data-testid="page-titane"`
  - tab trigger `data-testid="tab-conversation"`
- conversation module: `src/components/sections/ConversationSection.tsx`
  - conversation root `data-testid="page-conversation"`

## Chat Readiness and Controls

- readiness marker: `data-testid="chat-ready"` (`data-state=ready|loading`)
- input area: `data-testid="chat-input"`
- send action: `data-testid="chat-send"`
- error surface: `data-testid="chat-error"`
- loading state: `data-testid="chat-loading"`
- provider selection: `data-testid="select-chat-provider"`
- mode builder trigger: `data-testid="btn-mode-builder"`

## Chat Message DOM Contract

- user message node: `data-testid="chat-message-user"`
- assistant message node: `data-testid="chat-message-assistant"`
- message content node: `data-testid="chat-message-content"`

## E2E Driver Usage

- runtime harness: `scripts/e2e/run-desktop-suite.js`
- WDIO config: `wdio.desktop.conf.cjs`
- helper assertions: `e2e/desktop/ui-driver.wdio.js`
- full coverage scenario: `e2e/desktop/ui-ultra-full.e2e.js`
- smoke scenario: `e2e/desktop/ui-ultra-smoke.e2e.js`

## One Door / Network Note

- Chat UI does not call external network directly in this map.
- Runtime path remains governed through Tauri IPC/client layers (`src/services/tauriClient.ts`, `src/services/tauriCommands.ts`).

## Evidence

- discovery logs:
  - `proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729/logs/discovery_rg_tests_harness.log`
  - `proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729/logs/chat_testid_focus.log`
- runtime x3 logs:
  - `proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729/08_TESTS_X3.log`
  - `proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729/E2E_RUNS_X3.log`
