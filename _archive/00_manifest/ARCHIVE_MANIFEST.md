# ARCHIVE_MANIFEST.md — _archive/01_root_reports/releases/

**Date**: 2026-03-22  
**Session SHA**: b9aae0cc8  
**Scope**: Archivage des preuves de release racine v28.6.0–v28.80.0  
**Opérateur**: Copilot governed cleanup agent  

---

## Rationale

Les fichiers `RELEASE_v28.*_SEALED.txt` et `RELEASE_ARTIFACTS_CHECKSUMS_28.*.txt` représentent les reçus de scellement de chaque version de la branche v28.x. Ces fichiers sont générés automatiquement par le processus de release et stockés à la racine du dépôt.

Après 75 cycles de release (v28.6.0 → v28.80.0), la racine contenait 150+ fichiers de preuve versionnés, rendant la navigation difficile. Ces fichiers ont été déplacés vers `_archive/01_root_reports/releases/` pour réduire le bruit racine **sans supprimer aucune preuve**.

---

## Fichiers archivés

| Plage | Opération | Destination |
|-------|-----------|-------------|
| RELEASE_v28.6.0_SEALED.txt → RELEASE_v28.80.0_SEALED.txt (75 fichiers) | `git mv` | `_archive/01_root_reports/releases/` |
| RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt → 28.80.0.txt (75 fichiers) | `git mv` | `_archive/01_root_reports/releases/` |

**Total archivé**: 150 fichiers  
**Supprimé**: `nohup.out` (114 bytes, résidu vite transient, non référencé)

---

## Fichiers conservés à la racine

| Fichier | Raison |
|---------|--------|
| RELEASE_v27.0.3_SEALED.txt | Frontière de version majeure v27 |
| RELEASE_v28.0.0_SEALED.txt | Frontière de version majeure v28 |
| RELEASE_v28.5.0_SEALED.txt | Référencé dans README.md (prod-redeploy proof) |
| RELEASE_v28.81.0_SEALED.txt | Avant-dernière version scellée |
| RELEASE_v28.82.0_SEALED.txt | Version scellée courante (HEAD) |
| RELEASE_ARTIFACTS_CHECKSUMS.txt | Checksums v27.0.1 (frontière v27) |
| RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt | Companion v28.5.0 |
| RELEASE_ARTIFACTS_CHECKSUMS_28.81.0.txt | Companion v28.81.0 |
| RELEASE_ARTIFACTS_CHECKSUMS_28.82.0.txt | Companion v28.82.0 (courant) |

---

## Rollback

```bash
cd /path/to/TITANE_INFINITY
# Restaurer tous les fichiers archivés à la racine
for f in _archive/01_root_reports/releases/*.txt; do
  git mv "$f" "$(basename "$f")"
done
# Restaurer nohup.out si nécessaire
# nohup.out n'était pas critique (114 bytes, résidu vite)
```

---

## Autorité de preuve

- Proof pack: `proof_packs/CLEANUP_ARCHIVE_2026-03-22_1544_b9aae0cc8/`
- Historique git préservé via `git mv` (pas de perte de contenu)
- Aucun fichier canonical, de registre, de governance, ou product modifié
