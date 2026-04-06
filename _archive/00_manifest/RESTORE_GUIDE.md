# RESTORE_GUIDE.md — Procédure de restauration des fichiers archivés

**Date**: 2026-03-22  
**Session SHA**: b9aae0cc8

## Contexte

Cette archive contient les reçus de scellement de release v28.6.0 à v28.80.0, déplacés de la racine vers `_archive/01_root_reports/releases/` pour réduire le bruit racine. L'historique git est **entièrement préservé** (opération `git mv`).

## Restauration complète

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Restaurer tous les fichiers archivés à la racine
for f in _archive/01_root_reports/releases/RELEASE_v28.*.txt; do
  git mv "$f" "$(basename "$f")"
done
for f in _archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.*.txt; do
  git mv "$f" "$(basename "$f")"
done
git commit -m "chore(cleanup): rollback archive - restore root RELEASE files v28.6.0-v28.80.0"
```

## Restauration d'un fichier individuel

```bash
git mv _archive/01_root_reports/releases/RELEASE_v28.42.0_SEALED.txt RELEASE_v28.42.0_SEALED.txt
git mv _archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.42.0.txt RELEASE_ARTIFACTS_CHECKSUMS_28.42.0.txt
```

## Restauration via historique git (si archivé déjà commité)

```bash
# Retrouver l'SHA du commit d'archivage
git log --oneline -- _archive/01_root_reports/releases/RELEASE_v28.42.0_SEALED.txt
# Le contenu est toujours accessible via git show
git show HEAD:_archive/01_root_reports/releases/RELEASE_v28.42.0_SEALED.txt
```

## Note sur nohup.out

`nohup.out` a été supprimé (114 bytes, contenu: démarrage serveur vite). Ce fichier est parfaitement reproductible en lançant `pnpm dev`. Aucune donnée de preuve perdue.
