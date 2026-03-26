# 04 — RUN2 (waitForAppReady strict)

## Spec v2: waitForAppReady(20000) + assert.ok(appReadyReached)
- exit=1, 13/14 passes, 1 failure: S1.1
- Failure: AssertionError APP_READY: waitMs=20001

## Analyse tauri_driver.log
- App init OK: auth, HeliosCore, Memory, window shown
- Multiple page_load events: 14:25:14.683, 14.774, 15.027, 15.031 (SPA nav normale)
- entry_ts: non verifie dans run2 (spec v2 ne le capte pas)
- Conclusion: app reste sur loading-splash 20s+
