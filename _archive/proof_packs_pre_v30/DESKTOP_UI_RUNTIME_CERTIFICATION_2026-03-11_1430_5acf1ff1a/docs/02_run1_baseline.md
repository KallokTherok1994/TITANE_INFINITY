# 02 — RUN1 BASELINE

## Spec v1 (lenient, sans assertion dure)
- Avant: browser.url('tauri://localhost'), pause(2000)
- Tests S1..S5: captures + check metrics, pas d'assert bloquant sur UI
- exit=0, 14/14 passed

## Resultat
- appReadyReached: jamais verifie (pas d'assertion)
- Screenshots: ~26KB chacun (uniformes = meme etat visual)
- Frictions loguees: FAIL_SHELL_RENDER, FAIL_TAB_NAVIGATION, etc.
- Conclusion: spec trop lenient, app probablement en loading-splash
