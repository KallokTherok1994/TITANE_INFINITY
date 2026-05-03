# Step 6: Desktop E2E Run Evidence (Previous Run — Same Day)

## Run Metadata
- **Date**: 2026-03-21T06:57:05Z → 2026-03-21T07:29:00Z (31m 53s)
- **Binary**: src-tauri/target/release/titane-infinity (FRESH_RELEASE_BINARY)
- **Driver**: tauri-driver + WebKitWebDriver (wry 0.54.2 linux)
- **Log**: reports/e2e-desktop/wdio.log

## Spec Results Summary
```
18 passed, 7 failed, 25 total (100% completed in 00:31:53)
```

## PASSING specs (18)
| Worker | Spec | Tests |
|--------|------|-------|
| #0-2  | smoke.wdio.test.js                           | 1 passing (8.6s)     |
| #0-3  | preprod_admin_config_propagation             | 1 passing (54.2s)    |
| #0-4  | audio-settings-persistence                   | 4 passing (45.5s)    |
| #0-6  | chat-ar20 (TEST A/B/C)                       | 4 passing (6m 20.3s) |
| #0-7  | chat-mic-accessibility                       | 4 passing (11.1s)    |
| #0-8  | diagnostic-tauri-api (window.__TAURI__)      | 4 passing (1m 15.3s) |
| #0-9  | memory-conversations                         | 4 passing (3.1s)     |
| #0-10 | memory-dashboard-runtime-proof               | 3 passing (9.3s)     |
| #0-12 | online-chat-proof.wdio.test.js               | 1 passing (26.4s)    |
| #0-13 | (other)                                      | 1 passing (1m 21.3s) |
| #0-14 | (other)                                      | 1 passing (1.7s)     |
| #0-15 | total-dev-debug (partial)                    | 2 passing (37.3s)    |
| #0-16 | (other)                                      | 5 passing (6.7s)     |
| #0-17 | (other)                                      | 4 passing (3.9s)     |
| #0-18 | ui-connectivity (partial)                    | 1 passing (22.2s)    |
| #0-20 | (other)                                      | 1 passing (5.5s)     |
| #0-21 | (other)                                      | 5 passing (17.4s)    |
| #0-22 | (other)                                      | 5 passing (31s)      |
| #0-23 | v25_visible_real_chat_functional_truth        | 1 passing (1m 7.2s)  |
| #0-24 | v26_real_online_chat_truth                    | 1 passing (1m 14.1s) |

**KEY**: V25 and V26 online chat truth PASSED — real chat messages sent and received via Tauri IPC.
**KEY**: chat-AR20 TEST A/B/C PASSED — IPC response round-trips confirmed working.

## NOTABLE PASSING DETAILS
- V26 assistant response: `"La prise d'alimentation équilibrée, le respect du rythme de sommeil normal et la gestion adéquate du stress sont essentielles pour maintenir une bonne santé mentale et physique."`
- This is a REAL Ollama gemma2 response captured in the log — online chat IS working.
