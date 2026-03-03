# Rollback Instructions
**Date:** 2026-03-03T19:50:39Z | **Version:** 27.2.0

---

## Ce proof-pack est LECTURE SEULE

Cet audit n'a modifié aucun fichier source. Il contient uniquement des fichiers d'audit générés en `proof_packs/UI_INTERACTIVE_MAP_2026-03-03_1950/`.

---

## Rollback du proof-pack (suppression)

Si le proof-pack doit être supprimé:
```bash
rm -rf proof_packs/UI_INTERACTIVE_MAP_2026-03-03_1950/
git add -A
git commit -m "chore: remove UI cartography proof-pack"
```

---

## Si des corrections ont été appliquées ultérieurement (auto-fix data-testid)

```bash
# Restaurer les fichiers source modifiés
git restore -- src/

# Vérifier l'état
git status --short

# Si nécessaire, revenir au commit de référence
git stash
```

---

## Référence commit baseline

```
Commit: e97177da
Branch: copilot/audit-repository-contents
Tag: fix: Chat IA audit — provider attribution, cache deduplication, health_check accuracy
```
