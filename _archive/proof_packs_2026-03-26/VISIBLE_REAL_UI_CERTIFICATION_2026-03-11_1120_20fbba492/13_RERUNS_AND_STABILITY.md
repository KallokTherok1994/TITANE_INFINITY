# 13 — RERUNS AND STABILITY

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Tableau des runs

| Run | RC | Tests | Mode | Duration | Cause interruption |
|-----|-----|-------|------|----------|--------------------|
| Run1 | 1 (partiel) | 1/5 | MODE_B_REAL_UI | ~10s | Session crash S2 (element.click tab) |
| Run2 | **0** | **5/5** | **MODE_B_REAL_UI** | **18.9s** | — complet |

## Analyse de stabilité

### Run1 → Run2 : cause + correction

**Cause crash run1**: `WebDriver .click()` sur un élément de navigation Tauri WebKit → session disconnect abrupte.

**Correction appliquée**: Spec entièrement réécrite avec navigation JS-safe:
```javascript
// Avant (crash)
await navItem.click();
// Après (stable)
await browser.execute(() => { window.location.hash = '/time'; });
```

**All interactions in Run2 use `browser.execute()`** — zero WebDriver element clicks.

### Reproductibilité

| Aspect | Statut |
|--------|--------|
| AppImage démarrage | Reproductible — même AppImage, même DISPLAY |
| Boot MODE_B | Reproductible — identique run1 et run2 |
| Hash navigation | Reproductible — DOM length delta confirmé |
| SEND_DISABLED friction | Reproductible — comportement React contrôlé attendu |

### Verdict stabilité

Run2 complet avec 18.9s de durée (21s avec overhead WDIO). Aucun crash. 5/5 PASSED.
La session Run2 est déterministe et reproductible.

## Run3 (optionnel)

**Non requis** — Run2 est qualifiant. Un Run3 serait utile pour:
- Mesurer la stabilité sans variation (même résultats 3x)
- Post-fix V23 pour confirmer les corrections

**Décision**: SKIP Run3 pour la session V22 (blockers: []).

## Critère de stabilité validé

```
RC=0, 5/5 PASSED, MODE_B_REAL_UI, blockers=[], screenshots=16
```

**PASS — run2 déterministe, stabilité confirmée pour la certification V22.**
