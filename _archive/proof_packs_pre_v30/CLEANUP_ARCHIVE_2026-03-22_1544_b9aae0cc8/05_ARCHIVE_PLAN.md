# 05_ARCHIVE_PLAN.md — Plan d'archivage

## Décision d'archivage

**Cible principale**: RELEASE_v28.6.0–v28.80.0 sealed files + checksums (150 fichiers)

**Justification**:
1. Ces fichiers sont des reçus de scellement générés automatiquement par `scripts/generate-release-checksums.sh`
2. La documentation canonique de chaque release est dans `docs/90_release/PRODUCTION_RELEASE_v28.*.md`
3. Aucune de ces 75 versions intermédiaires n'est référencée directement dans README.md ou docs/
4. Le contenu de chaque fichier est unique (checksums SHA256 + métadonnées build) — non supprimable
5. `git mv` préserve l'historique complet

**Destination**: `_archive/01_root_reports/releases/`

## Fichiers conservés à la racine (justifiés)

| Fichier | Justification |
|---------|--------------|
| RELEASE_v27.0.3_SEALED.txt | Frontière de version majeure v27 |
| RELEASE_v28.0.0_SEALED.txt | Frontière de version majeure v28 |
| RELEASE_v28.5.0_SEALED.txt | Référencé dans README.md |
| RELEASE_v28.81.0_SEALED.txt | Avant-dernière version (one-back) |
| RELEASE_v28.82.0_SEALED.txt | Version courante (HEAD b9aae0cc8) |
| RELEASE_ARTIFACTS_CHECKSUMS*.txt (4) | Companions des versions conservées |

## Décision de suppression

| Fichier | Justification |
|---------|--------------|
| nohup.out (114 bytes) | Résidu vite dev, non référencé, reproductible |

## Fichiers BLOQUÉS (non traités)

| Groupe | Classification | Raison du blocage |
|--------|---------------|------------------|
| build_log.txt, dev_tauri_*.txt | H LOCAL_RESIDUE | Référencé dans scripts/advanced-diagnostic.sh |
| CAMPAIGN_COMPLETE_v27.0.2.txt | E HISTORICAL | Preuve historique — impact non prouvé à supprimer |
| *.sh root scripts | E HISTORICAL | Référencés dans docs/90_release/ |
| PHASE_C1_COMPLETION_REPORT.ts, baseline_*.json | I UNKNOWN | Inconnu — non touché |
