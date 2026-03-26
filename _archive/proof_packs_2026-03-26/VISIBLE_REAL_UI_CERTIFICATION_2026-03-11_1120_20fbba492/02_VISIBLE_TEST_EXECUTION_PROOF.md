# 02 — VISIBLE TEST EXECUTION PROOF

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Stack technique

| Composant | Version |
|-----------|---------|
| WebdriverIO | 9.x (pnpm exec wdio) |
| Driver | tauri-driver + WebKitWebDriver |
| Config | `wdio.desktop.conf.cjs` |
| DISPLAY | `:1` |
| Spec | `e2e/desktop/v22_visible_real_ui_cert.wdio.test.js` |
| Runtime | AppImage 27.2.0 |

## Runs exécutés

### Run1 (partiel — session crash S2)

| Attribut | Valeur |
|----------|--------|
| RC | 1 (crash S2 / `.click()` tab element) |
| Mode détecté | MODE_B_REAL_UI |
| Screenshots | 4 (`run1/screens/`) |
| Cause crash | WebDriver element.click() sur nav item → session disconnect |
| Action corrective | Spec refactorisée avec hash navigation JS-safe |

### Run2 (complet)

| Attribut | Valeur |
|----------|--------|
| RC | 0 |
| Durée | 18.9s |
| Tests | 5/5 PASSED |
| Mode détecté | MODE_B_REAL_UI |
| Screenshots | 16 (`run2/screens/`) |
| Session ID | `a1b34534-2a2c-4b91-b5d9-230ac3920e4e` |
| Log | `raw/02_run2_suite.log` (716 lignes) |

## Résultat final

```
[wry 0.54.2 linux #0-0] V22 — VISIBLE REAL UI CERTIFICATION (AppImage 27.2.0)
   ✓ V22-S1 — Boot, surface canonique, MODE decision
   ✓ V22-S2 — Navigation DOM audit + hash nav proof
   ✓ V22-S3 — Chat: saisie visible + send + changement etat
   ✓ V22-S4 — Surface secondaire + fullstack IPC probe
   ✓ V22-S5 — Retour principal + stabilite + metriques finales

5 passing (18.9s)

Spec Files:      1 passed, 1 total (100% completed) in 00:00:21
```

**PASS — 5/5 tests passed, RC=0, exécution déterministe.**
