# 03_CLASSIFICATION_MATRIX.md — Matrice de classification

## Catégories utilisées

- **A. CANONICAL_AUTHORITY**: Autorité canonique — ne jamais toucher
- **B. SEALED_PROOF**: Preuve scellée — archiver uniquement, ne pas supprimer
- **C. RELEASE_ARTIFACT**: Artefact de release — archiver si pas référencé directement
- **D. GOVERNANCE_APPEND_ONLY**: Governance append-only — intouchable
- **E. HISTORICAL_ARCHIVE_USEFUL**: Historique utile — laisser en place (non touché)
- **F. DUPLICATE_NON_CANONICAL**: Doublon non-canonique — N/A (aucun trouvé)
- **G. GENERATED_TRANSIENT**: Résidu transient — suppression prouvée safe
- **H. LOCAL_RESIDUE**: Résidu local — classification partielle, non touché
- **I. UNKNOWN_REQUIRES_PROOF**: Inconnu — non touché

## Fichiers classifiés

| Fichier / Groupe | Catégorie | Action |
|-----------------|-----------|--------|
| README.md, CHANGELOG.md, LICENSE.md | A | Intouché |
| package.json, tsconfig*.json, vite.config.ts | A | Intouché |
| src/, src-tauri/, e2e/, scripts/ | A | Interdit de modifier |
| proof_packs/ | B | Append-only, intouché |
| docs/90_release/PRODUCTION_RELEASE_v28.*.md | B | Intouché |
| registry/*.jsonl | D | Intouché |
| RELEASE_v27.0.3_SEALED.txt | B | Conservé racine (frontière v27) |
| RELEASE_v28.0.0_SEALED.txt | B | Conservé racine (frontière v28) |
| RELEASE_v28.5.0_SEALED.txt | B | Conservé racine (référencé README) |
| RELEASE_v28.81.0_SEALED.txt | B | Conservé racine (avant-dernière) |
| RELEASE_v28.82.0_SEALED.txt | B | Conservé racine (courante HEAD) |
| RELEASE_v28.6.0–v28.80.0_SEALED.txt (75 fichiers) | C | **Archivé** → `_archive/01_root_reports/releases/` |
| RELEASE_ARTIFACTS_CHECKSUMS_28.6.0–28.80.0.txt (75 fichiers) | C | **Archivé** → `_archive/01_root_reports/releases/` |
| RELEASE_ARTIFACTS_CHECKSUMS.txt (v27.0.1) | B | Conservé racine |
| RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt | B | Conservé racine |
| RELEASE_ARTIFACTS_CHECKSUMS_28.81.0.txt | B | Conservé racine |
| RELEASE_ARTIFACTS_CHECKSUMS_28.82.0.txt | B | Conservé racine |
| nohup.out | G | **Supprimé** (114 bytes, résidu vite) |
| build_log.txt | H | Conservé (référencé dans scripts/advanced-diagnostic.sh) |
| dev_tauri_*.txt, final_*.txt, minimal_*.txt | H | Conservé (listé dans audit historique) |
| CAMPAIGN_COMPLETE_v27.0.2.txt, MISSION_COMPLETE.txt | E | Conservé (preuve historique v27) |
| DEPLOYMENT_READINESS_v27.0.3.txt, etc. | E | Conservé (preuve historique v27) |
| *.sh à la racine (monitoring.sh, mega-deploy.sh, etc.) | E | Conservé (référencés dans docs) |
| PROD_*_PATCH010.md | A | Conservé (governance active récente) |
| ACTION_RUNTIME_MAP.md, GAP_MATRIX.md, etc. | A | Conservé (governance active récente) |
| logs/, build_logs/, runs/, runtime/ | E | Conservé (contenu opérationnel) |
| deployment/, artifacts/, dist/ | A | Conservé (production runtime) |
| docs/ | B+D | Conservé intégralement |
