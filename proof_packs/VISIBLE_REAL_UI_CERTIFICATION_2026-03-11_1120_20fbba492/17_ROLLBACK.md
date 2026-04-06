# 17 — ROLLBACK

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Plan de rollback

### Périmètre de cette session

Cette session n'a modifié aucun fichier de production existant.
Seuls des fichiers **untracked** ont été créés:
- `e2e/desktop/v22_visible_real_ui_cert.wdio.test.js`
- `proof_packs/VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492/`

### Rollback complet (si nécessaire)

```bash
# Supprimer la spec V22
rm /tmp/titane_v15_wt_20260311_080118/e2e/desktop/v22_visible_real_ui_cert.wdio.test.js

# Supprimer le proof pack
rm -rf /tmp/titane_v15_wt_20260311_080118/proof_packs/VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492/

# Si déjà commité sur MAIN:
git revert HEAD  # revert le commit V22
git push origin MAIN
```

### Rollback post-commit

Si le commit V22 a été poussé sur `origin/MAIN`:
```bash
# Identifier le commit
git log --oneline -3 origin/MAIN

# Revert propre (preserve history)
git revert <commit_sha_v22>
git push origin HEAD:MAIN
```

### Impact du rollback

| Impact | Valeur |
|--------|--------|
| Fichiers production modifiés | **AUCUN** |
| Régression fonctionnelle possible | **NON** |
| Perte de données | Spec V22 + proof pack uniquement |
| Temps de rollback | < 2 minutes |

## Autorté de rollback

Le rollback peut être décidé par le mainteneur MAIN sans token requis.
(Aucune action PROD dans cette session — Rule 11 non activée.)

## État des artefacts PROD

Aucun artefact de production (`deployment/latest/`) n'a été modifié.
L'AppImage 27.2.0 reste inchangée.

**Rollback minimal, propre, réversible à tout moment.**
