# 12_ROLLBACK.md — Plan de rollback

## Rollback complet

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Étape 1: Restaurer tous les RELEASE_v28 SEALED
for v in $(seq 6 80); do
  git mv "_archive/01_root_reports/releases/RELEASE_v28.${v}.0_SEALED.txt" "RELEASE_v28.${v}.0_SEALED.txt"
done

# Étape 2: Restaurer tous les CHECKSUMS
for v in $(seq 6 80); do
  git mv "_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.${v}.0.txt" "RELEASE_ARTIFACTS_CHECKSUMS_28.${v}.0.txt"
done

# Étape 3: Supprimer les nouveaux fichiers de manifest
rm -rf _archive/00_manifest/
rm -rf proof_packs/CLEANUP_ARCHIVE_2026-03-22_1544_b9aae0cc8/

# Étape 4: Commit de rollback
git add -A
git commit -m "chore(rollback): restore root RELEASE files v28.6.0-v28.80.0 from archive"
```

## Note: nohup.out (supprimé)

`nohup.out` était un résidu de 114 bytes (sortie vite dev). Il est reproductible:
```bash
# Pour recréer: lancer pnpm dev et le fichier sera régénéré
```
Il n'existe aucune donnée de preuve dans ce fichier.

## Vérification post-rollback

```bash
ls RELEASE_v28.*_SEALED.txt | wc -l  # doit retourner 78
ls RELEASE_ARTIFACTS_CHECKSUMS_28.*.txt | wc -l  # doit retourner 77
```
