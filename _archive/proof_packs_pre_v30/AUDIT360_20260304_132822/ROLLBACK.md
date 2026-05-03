# ROLLBACK — Procédure de rollback
**Session:** AUDIT360_20260304_132822  
**Horodatage UTC:** 2026-03-04T13:28:22Z

---

## Périmètre des changements de cette session

Cette session crée uniquement des fichiers de preuve en mode append-only dans :
- `proof_packs/AUDIT360_20260304_132822/` (nouveau répertoire)
- `reports/MAP_PROOFS.log` (append-only)

**Aucun fichier source, configuration, ou logique métier n'a été modifié.**

---

## Procédure de rollback

### Rollback complet du proof pack

```bash
# Supprimer le proof pack créé par cette session
rm -rf proof_packs/AUDIT360_20260304_132822/
```

### Rollback de l'entrée MAP_PROOFS.log

```bash
# Retirer la dernière entrée ajoutée au log (si nécessaire)
# Identifier la ligne d'entrée AUDIT360_20260304_132822 et la supprimer
grep -n "AUDIT360_20260304_132822" reports/MAP_PROOFS.log
# Puis éditer manuellement ou :
git restore -- reports/MAP_PROOFS.log
```

### Rollback git complet

```bash
# Annuler tous les changements de cette session
git restore -- reports/MAP_PROOFS.log
git rm -rf proof_packs/AUDIT360_20260304_132822/
git commit -m "rollback: supprimer proof pack AUDIT360_20260304_132822"
```

---

## Vérification post-rollback

```bash
# Vérifier que le proof pack a bien été supprimé
ls proof_packs/AUDIT360_20260304_132822/ 2>/dev/null && echo "ROLLBACK_FAILED" || echo "ROLLBACK_OK"

# Vérifier l'intégrité du MAP_PROOFS.log
tail -5 reports/MAP_PROOFS.log
```

---

## Niveau de risque du rollback

| Dimension | Risque | Justification |
|-----------|--------|---------------|
| Code source | 🟢 NUL | Aucun code source modifié |
| Configuration runtime | 🟢 NUL | Aucune configuration modifiée |
| Données utilisateur | 🟢 NUL | Preuves uniquement |
| Documentation | 🟢 MINIMAL | Seule l'entrée MAP_PROOFS.log est impactée |

---

## Rollback non destructif garanti

✅ Ce rollback est **non destructif** : il supprime uniquement les artefacts de preuve créés par cette session, sans affecter aucune fonctionnalité du système.
