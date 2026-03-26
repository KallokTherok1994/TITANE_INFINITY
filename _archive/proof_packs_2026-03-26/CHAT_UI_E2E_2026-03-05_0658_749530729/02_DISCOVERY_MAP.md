# Discovery Map

- generated_at_utc: 2026-03-05T12:00:00Z
- scope: CHAT IA desktop ultra (governed)
- proof_pack: proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729

## Sources of Truth Read

- package scripts and test harness inventory: `package.json`
- desktop runtime harness: `scripts/e2e/run-desktop-suite.js`, `wdio.desktop.conf.cjs`
- alternate web E2E harness (non-authority for desktop): `playwright.config.ts`
- chat surfaces (UI): `src/pages/TitanePage.tsx`, `src/components/sections/ConversationSection.tsx`, `src/features/chat/ChatProviderSelector.tsx`
- tauri/IPC client layer: `src/services/tauriClient.ts`, `src/services/tauriCommands.ts`
- fallback UI map source: `docs/tests/UI_COVERAGE_MAP.md`

## Discovery Commands Executed

- mandatory harness regex scan output: `logs/discovery_rg_tests_harness.log`
- chat selector inventory output: `logs/chat_selector_scan.log`
- focused chat selector inventory output: `logs/chat_testid_focus.log`

## Key Findings

- Desktop E2E authority is WDIO/Tauri runtime:
  - `package.json` script `e2e:desktop:run` points to `node scripts/e2e/run-desktop-suite.js`.
  - `scripts/e2e/run-desktop-suite.js` starts `tauri-driver` and executes `wdio.desktop.conf.cjs`.
  - `wdio.desktop.conf.cjs` uses `browserName: wry` and `scripts/e2e/tauri-wrapper.sh`.
- Playwright remains available but is web-server based (`playwright.config.ts`, `baseURL` + `webServer`), therefore not selected as desktop runtime authority for this campaign.
- Chat testids required for no-silence coverage are present in code:
  - `tab-conversation`, `chat-ready`, `chat-input`, `chat-send`, `chat-error`, `chat-message-user`, `chat-message-assistant`, `btn-mode-builder`, `select-chat-provider`.
- Requested file `docs/ui/INDEX_UI.md` not found in repository at runtime. Discovery fallback used `docs/tests/UI_COVERAGE_MAP.md`.

## Authority Decision (for this proof pack)

- selected_e2e_authority: `WDIO_DESKTOP_TAURI`
- rationale:
  - real Tauri runtime via tauri-driver and wry
  - existing deterministic desktop suites for smoke/full coverage (`e2e/desktop/ui-ultra-smoke.e2e.js`, `e2e/desktop/ui-ultra-full.e2e.js`)
  - aligned with tests-e2e instructions requiring wrapper and memory guard

## Known Discovery Limits

- chat selector scan includes many style-only class matches; coverage map is restricted to runtime-relevant selectors and `data-testid` markers.
