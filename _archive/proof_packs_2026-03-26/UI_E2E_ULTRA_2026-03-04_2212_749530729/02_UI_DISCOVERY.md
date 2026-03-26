# UI Discovery

- Timestamp: 2026-03-04T22:16:59-05:00
- Pack: `proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729`
- Scope: Ring 4 UI + desktop E2E harness inventory

## Evidence Method

Commands used for discovery (bounded):

- `rg -o 'path="[^"]+"' src/App.tsx | ... | sort -u` (route inventory)
- `rg -n 'data-testid="[^"]+"' src --glob '!src/**/__tests__/**' --glob '!src/**/tests/**'` (stable selectors)
- targeted source reads for route/testid/harness files.

## Ready Protocol Status

- `app-ready` marker present: `src/App.tsx:990`
- `ipc-ready` marker present: `src/App.tsx:998`
- Top navigation anchor present: `src/components/layout/TopNav.tsx:168`
- Overflow navigation anchor present: `src/components/layout/TopNav.tsx:225`

Conclusion: no additional readiness marker change is required at this stage.

## Canonical Desktop Page Surface

Derived from `e2e/desktop/page-objects/uiPages.po.js` and runtime routes in `src/App.tsx`.

| Page ID | Route | Nav TestID | Root selector | Tabs in page object |
|---|---|---|---|---|
| `titane` | `/titane` | `nav-titane` | `page-titane` | 8 |
| `time` | `/time` | `nav-time` | `page-time` | 6 |
| `stats` | `/stats` | `nav-stats` | `page-stats` | 0 |
| `admin` | `/admin` | `nav-admin` | `page-admin` | 6 |
| `dev` | `/dev` | `nav-dev` | `page-dev` | 10 |
| `fusion` | `/fusion` | `nav-fusion` | `page-fusion` | 0 |
| `optimization` | `/optimization` | `nav-optimization` | `page-optimization` | 0 |

References:

- Top-level order: `e2e/desktop/page-objects/uiPages.po.js:87`
- Main route entries: `src/App.tsx:1011`, `src/App.tsx:1057`, `src/App.tsx:1076`, `src/App.tsx:1202`, `src/App.tsx:1133`, `src/App.tsx:1146`

## Full Route Inventory (Declared)

Discovery extracted 85 distinct `path="..."` values from `src/App.tsx`, including canonical routes and aliases.

Primary routes:

- `/titane`, `/time`, `/stats`, `/admin`, `/dev`, `/fusion`, `/optimization`

High-volume aliases (examples):

- TITANE aliases: `/chat`, `/camera`, `/evo`, `/dashboard`, `/evolution-center`, `/progression`, `/xp`
- TIME aliases: `/temporal-center`, `/agenda`, `/time-navigator`
- ADMIN aliases: `/system-center`, `/diagnostics`, `/devtools`, `/settings`, `/governance`, `/audio`, `/voice`, `/tts`
- DEV aliases: `/one-core`, `/command-center`, `/unified`, `/qa`, `/monitoring`, `/tests`, `/developer-mode`, `/dev-mode`

Additional non-top-nav routes declared in `App.tsx` include `/knowledge`, `/creation`, `/evolution`, `/research`, `/performance`, `/cloud`, `/reality-center`, `/orchestration-center`, `/orchestration-intelligence`, and others.

## Stable Selector Discovery

- Count in non-test `src/**`: `113` `data-testid` markers (command evidence captured during discovery).
- Critical chat anti-silence selectors present:
	- `chat-ready`: `src/components/sections/ConversationSection.tsx:1436`
	- `chat-input`: `src/components/sections/ConversationSection.tsx:1443`
	- `chat-send`: `src/components/sections/ConversationSection.tsx:1453`
	- `chat-error`: `src/components/sections/ConversationSection.tsx:1407`

## Desktop Harness Discovery

Authority candidates discovered:

- Wrapper: `scripts/e2e/tauri-wrapper.sh`
- WDIO config: `wdio.desktop.conf.cjs`
- Desktop runner: `scripts/e2e/run-desktop-suite.js`
- Driver helpers: `e2e/desktop/ui-driver.wdio.js`
- Ultra suites: `e2e/desktop/ui-ultra-smoke.e2e.js`, `e2e/desktop/ui-ultra-full.e2e.js`
- AR20 suite: `e2e/desktop/chat-ar20.wdio.test.js`

Governance evidence in harness:

- Wrapper e2e env and witness: `scripts/e2e/tauri-wrapper.sh:23`, `scripts/e2e/tauri-wrapper.sh:34`, `scripts/e2e/tauri-wrapper.sh:92`
- Driver ready/navigation/no-silence primitives: `e2e/desktop/ui-driver.wdio.js:218`, `e2e/desktop/ui-driver.wdio.js:255`, `e2e/desktop/ui-driver.wdio.js:379`
- Ultra smoke and full scenarios: `e2e/desktop/ui-ultra-smoke.e2e.js:16`, `e2e/desktop/ui-ultra-full.e2e.js:26`
- Chat AR20 explicit scenario: `e2e/desktop/chat-ar20.wdio.test.js:436`
- Required export gates declared in autofix runner:
	- `page_classification.json`: `scripts/e2e/run-ui-chat-360-autofix.cjs:262`
	- `chat_dom_map.json`: `scripts/e2e/run-ui-chat-360-autofix.cjs:269`
	- `offline5_ui.json`: `scripts/e2e/run-ui-chat-360-autofix.cjs:311`
	- `navigation_matrix.json`: `scripts/e2e/run-ui-chat-360-autofix.cjs:345`
	- `stability_burst.json`: `scripts/e2e/run-ui-chat-360-autofix.cjs:366`

## Discovery Outcome

- `PASS`: ready markers present, canonical top-nav surface identified, desktop harness and no-silence primitives confirmed.
- `PENDING`: deep route-by-route assertions for non-top-nav routes will be tracked in the coverage map and test matrix artifacts.
