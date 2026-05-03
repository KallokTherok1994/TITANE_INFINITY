# UI Coverage Map

- Timestamp: 2026-03-04T22:16:59-05:00
- Source set: `src/App.tsx`, `src/pages/**`, `src/features/**`, `e2e/desktop/**`, `scripts/e2e/**`
- Goal: map desktop UI surfaces to deterministic selectors and E2E authority suites.

## Top-Nav Coverage Matrix

| Route | Root selector | Main interactions | Existing suite linkage | Status |
|---|---|---|---|---|
| `/titane` | `page-titane` | TITANE tabs, conversation input/send, chat toolbar toggles | `ui-ultra-smoke.e2e.js`, `ui-ultra-full.e2e.js` | READY |
| `/time` | `page-time` | time tabs, planning prompt/actions, nav past/present/future, snapshots actions | `ui-ultra-full.e2e.js` | READY |
| `/stats` | `page-stats` | page visibility and route stability checks | `ui-ultra-smoke.e2e.js`, `ui-ultra-full.e2e.js` | READY |
| `/admin` | `page-admin` | admin tab switching, audio-center controls, config/governance surfaces | `ui-ultra-smoke.e2e.js`, `ui-ultra-full.e2e.js` | READY |
| `/dev` | `page-dev` | dev tabs, refresh, diagnostics section | `ui-ultra-full.e2e.js` | READY |
| `/fusion` | `page-fusion` | fusion page visibility + action buttons | `ui-ultra-full.e2e.js` | READY |
| `/optimization` | `page-optimization` | gpu/wasm tests, cache clear, db compaction | `ui-ultra-full.e2e.js` | READY |

## Critical Ready/No-Silence Selectors

| Selector | File reference | Contract |
|---|---|---|
| `app-ready` | `src/App.tsx:990` | App shell readiness marker |
| `ipc-ready` | `src/App.tsx:998` | IPC status marker (`ready` or `fallback`) |
| `nav-top-main` | `src/components/layout/TopNav.tsx:168` | deterministic top navigation root |
| `btn-nav-more` | `src/components/layout/TopNav.tsx:225` | overflow nav to fusion/optimization |
| `chat-ready` | `src/components/sections/ConversationSection.tsx:1436` | conversation readiness marker |
| `chat-input` | `src/components/sections/ConversationSection.tsx:1443` | user prompt input |
| `chat-send` | `src/components/sections/ConversationSection.tsx:1453` | outbound send action |
| `chat-error` | `src/components/sections/ConversationSection.tsx:1407` | visible error path (anti-silence) |

## Alias Route Mapping

Aliases discovered in `src/App.tsx` are grouped by canonical destination.

| Canonical | Alias examples | Mapping status |
|---|---|---|
| `/titane` | `/chat`, `/camera`, `/evo`, `/dashboard`, `/evolution-center`, `/progression`, `/xp` | MAPPED |
| `/time` | `/temporal-center`, `/agenda`, `/time-navigator` | MAPPED |
| `/admin` | `/system-center`, `/diagnostics`, `/devtools`, `/cluster`, `/settings`, `/governance`, `/audio`, `/voice`, `/tts` | MAPPED |
| `/dev` | `/one-core`, `/command-center`, `/unified`, `/qa`, `/monitoring`, `/tests`, `/developer-mode`, `/dev-mode`, `/devmode`, `/ia-dev` | MAPPED |

## Non-Top-Nav Declared Routes

Declared routes such as `/knowledge`, `/creation`, `/evolution`, `/research`, `/performance`, `/cloud`, `/reality-center`, `/orchestration-center`, `/orchestration-intelligence`, `/memory`, `/adaptive`, `/sentinel`, `/watchdog`, `/selfheal`, `/hyper`, `/quantum`, `/identity`, `/persona` are present in `src/App.tsx`.

Current UI_DESKTOP_E2E_ULTRA coverage classification:

- `QUALIFIED`: top-nav canonical routes and anti-silence chat flows.
- `PARTIAL`: non-top-nav routes with page-level selectors but no complete deterministic journey in ultra smoke/full.
- `UNKNOWN`: any route without stable selector or route-specific assertion evidence.

## Harness Authority Mapping

| Layer | Source | Role |
|---|---|---|
| Wrapper | `scripts/e2e/tauri-wrapper.sh` | Tauri launch mediation, E2E env proof, witness file |
| Runner | `scripts/e2e/run-desktop-suite.js` | tauri-driver lifecycle + WDIO execution/logging |
| WDIO config | `wdio.desktop.conf.cjs` | app capability via wrapper, session orchestration |
| Driver API | `e2e/desktop/ui-driver.wdio.js` | ready wait, nav, tab, input/toggle, no-silence send |
| Scenario smoke | `e2e/desktop/ui-ultra-smoke.e2e.js` | fast navigation + OFFLINE5 no-silence probe |
| Scenario full | `e2e/desktop/ui-ultra-full.e2e.js` | route/tab/input/toggle/chat AR20/navigation/stability/error-path |
| Scenario AR20 | `e2e/desktop/chat-ar20.wdio.test.js` | 20-message always-respond runtime validation |

## Coverage Verdict (Current Mapping Stage)

- `PASS`: mapping for canonical desktop routes and required selectors is complete.
- `PENDING`: execution proofs (`05_E2E_RUNS_X3.log`, artifacts index, no-skips gate) are required for seal.
