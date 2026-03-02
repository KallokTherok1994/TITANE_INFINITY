# ROOT_CAUSE

- Symptôme demandé: « chargement infini » en prod Tauri.
- Observation prouvée: sur artefact release local (AppImage), la fenêtre principale et `page_load label=main` apparaissent.
- Le blocage infini n'a pas été reproduit sur les 3 runs capturés.
- Cause racine prouvable dans ce contexte: NON DÉMONTRABLE.
- Correctif minimal appliqué en continu de session: durcissement du lancement webServer Playwright via `process.execPath` (commit `6c47b0253`) pour réduire les faux blocages E2E.
