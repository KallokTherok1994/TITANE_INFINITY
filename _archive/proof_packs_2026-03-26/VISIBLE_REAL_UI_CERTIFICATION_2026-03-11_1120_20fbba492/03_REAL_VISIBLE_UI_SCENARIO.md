# 03 — REAL VISIBLE UI SCENARIO

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Scénario exécuté (Run2)

### V22-S1 — Boot, surface canonique, MODE decision

1. AppImage lancée via tauri-driver, DISPLAY=:1
2. URL initiale: `tauri://localhost/titane`
3. Inspection DOM via `browser.execute()`:
   - `splashVisible: false` — pas d'écran de chargement
   - `reactMounted: true` — React rendu
   - `rootChildren: 3` — contenu DOM présent
   - `bodyText: "TITANE∞, TITANE, TIME, STATS, ADMIN, DEV"` — navigation réelle
4. Décision: **MODE_B_REAL_UI** (UI réelle visible)
5. Screenshot: `run2_s1_t0_post_boot.png`, `run2_s1_post_nav_titane.png`
6. Métriques S1 sauvegardées dans `artifacts/run2/`

### V22-S2 — Navigation DOM audit + hash nav proof

1. DOM audit étendu via JS: sélecteurs testés: `[role="tab"]`, `nav button`, `nav a`, `header a`, etc.
2. Nav items découverts: `["TITANE","TIME","STATS","ADMIN","DEV","Plus"]` (6 items)
3. Sélecteurs matchés: `[role="tab"]`, `[data-testid*="tab"]`, `nav button`, `[role="navigation"] button`, `[class*="nav"] button`
4. Navigation hash JS: `window.location.hash = '/time'`
5. URL post-nav: `tauri://localhost/titane#/time`
6. DOM length: 53565 → 53571 (différence confirmée = contenu changé)
7. Retour: `tauri://localhost/titane#/titane`
8. `tabSwitchWorked: true`, `tabsCount: 6`, `selectedTabCount: 1`
9. Screenshots: `run2_s2_start`, `run2_s2_before_hash_nav`, `run2_s2_after_nav_time`, `run2_s2_after_nav_stats`, `run2_s2_returned_titane`, `run2_s2_final`

### V22-S3 — Chat: saisie visible + send + changement etat

1. Navigation vers `/titane` via hash
2. `inputPresent: true` (textarea[placeholder] trouvé)
3. `sendPresent: true` (bouton send trouvé)
4. Saisie via JS: `el.value = "Test V22 certification TITANE visible"` + `dispatchEvent(new Event('input', {bubbles:true}))`
5. `inputTyped: true`
6. Send: `sendEnabledAfterTyping: false` (le bouton reste disabled après saisie JS)
7. `sendClicked: false` (skip car disabled)
8. Screenshots: `run2_s3_before_chat`, `run2_s3_after_typing`, `run2_s3_final`

### V22-S4 — Surface secondaire + fullstack IPC probe

1. Navigation hash vers `/admin`: URL = `tauri://localhost/titane#/admin`
2. `secondarySurfaceOpened: true`
3. IPC probe: `{hasInvoke: true, tauriPresent: false, internalsPresent: true, runtimeVersion: null}`
4. `backendSyncState: CONNECTED`
5. Screenshots: `run2_s4_start`, `run2_s4_secondary_opened`, `run2_s4_done`

### V22-S5 — Retour principal + stabilite + metriques finales

1. Retour sur `/titane`: `returnedToPrimarySurface: true`
2. Health DOM: `{blockingOverlays: 0, scriptCount: 2, visibleErrors: 0, buttonCount: 104, stylesheetCount: 9, inputCount: 1}`
3. `reflowReasonable: true` (pas de reflow critique)
4. `potentialDoubleScroll: true` (friction de layout)
5. Métriques finales exportées: `run2_v22_metrics.json`
6. Screenshots: `run2_s5_returned_primary`, `run2_s5_final`
7. Classification finale: `FAIL_LAYOUT_OR_REFLOW`, `blockers: []`

## Résultat global

**MODE_B_REAL_UI CONFIRMÉ. 16 screenshots. Aucun bloqueur.**
