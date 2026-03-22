# 06_MOVES_EXECUTED.md — Déplacements exécutés

**Opération**: `git mv` (historique préservé)  
**Date**: 2026-03-22 | **SHA**: b9aae0cc8

## Groupe 1: RELEASE_v28.{6..80}.0_SEALED.txt → _archive/01_root_reports/releases/

75 fichiers déplacés (v28.6.0 à v28.80.0)

```bash
for v in $(seq 6 80); do
  git mv "RELEASE_v28.${v}.0_SEALED.txt" "_archive/01_root_reports/releases/RELEASE_v28.${v}.0_SEALED.txt"
done
# Résultat: 75/75 fichiers déplacés ✓
```

## Groupe 2: RELEASE_ARTIFACTS_CHECKSUMS_28.{6..80}.0.txt → _archive/01_root_reports/releases/

75 fichiers déplacés (v28.6.0 à v28.80.0)

```bash
for v in $(seq 6 80); do
  git mv "RELEASE_ARTIFACTS_CHECKSUMS_28.${v}.0.txt" "_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.${v}.0.txt"
done
# Résultat: 75/75 fichiers déplacés ✓
```

## Vérification post-déplacement

```
ls _archive/01_root_reports/releases/ | wc -l → 150 ✓
ls RELEASE_v28.*_SEALED.txt | wc -l → 4 restants (v28.0.0, v28.5.0, v28.81.0, v28.82.0) ✓
ls RELEASE_ARTIFACTS_CHECKSUMS*.txt | wc -l → 4 restants ✓
```

## Fichiers racine conservés après déplacement

```
RELEASE_v27.0.3_SEALED.txt
RELEASE_v28.0.0_SEALED.txt
RELEASE_v28.5.0_SEALED.txt
RELEASE_v28.81.0_SEALED.txt
RELEASE_v28.82.0_SEALED.txt
RELEASE_ARTIFACTS_CHECKSUMS.txt
RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt
RELEASE_ARTIFACTS_CHECKSUMS_28.81.0.txt
RELEASE_ARTIFACTS_CHECKSUMS_28.82.0.txt
```
