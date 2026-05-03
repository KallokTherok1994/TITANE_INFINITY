# 00 — GIT MAIN AUTHORITY AND REBASE TRUTH

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Authority Worktree

| Clé | Valeur |
|-----|--------|
| Chemin | `/tmp/titane_v15_wt_20260311_080118` |
| Branche | `v15_total_audit_20260311_080118` |
| HEAD | `20fbba4921e7` |
| Alignement origin/MAIN | OUI — identique |
| Etat | propre (3 ficichiers untracked uniquement) |

## Main Repo State (contamination documentée)

| Clé | Valeur |
|-----|--------|
| Chemin | `/home/titane-os/Documents/GitHub/TITANE_INFINITY` |
| Etat pré-correction | Detached HEAD `3a32f5fd1a03` (rebase EN COURS) |
| Conflit | `UU scripts/autoheal/autoheal_rules.jsonl` |
| Correction appliquée | `git rebase --abort` → RC=0 |
| Etat post-correction | Detached HEAD `b6f452ae7` (rebased aborted) |
| Branche MAIN | Verrouillée par worktree v6 (`/tmp/titane_v6_wt_clean_001321`) |
| Distance origin/MAIN | 25 commits behind avant abort |

## Décision

Autorité d'exécution unique = worktree v15. Tous les fichiers produits en v15.
Le commit final sera `git push origin HEAD:MAIN` depuis v15.

## Vérification

```
HEAD = 20fbba4921e7 = origin/MAIN = origin/HEAD
```

**PASS — autorité MAIN confirmée, contamination résolue.**
