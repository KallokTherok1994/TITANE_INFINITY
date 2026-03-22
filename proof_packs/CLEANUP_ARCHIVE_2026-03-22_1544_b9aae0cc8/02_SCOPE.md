# 02_SCOPE.md — Périmètre de la session

**Ring impacté**: Ring 0 (fichiers governance racine) + Ring 4 (résidus logs/transients)  
**Périmètre**:
- Racine du dépôt: fichiers RELEASE_*.txt, nohup.out
- `_archive/01_root_reports/releases/` (nouveau sous-répertoire créé)
- `proof_packs/CLEANUP_ARCHIVE_2026-03-22_1544_b9aae0cc8/` (ce pack)

**HORS PÉRIMÈTRE** (non modifié):
- src/, src-tauri/, e2e/, tests/, scripts/ — interdit par constitution
- docs/, registry/, proof_packs/ existants — intouchables
- deployment/, runtime/ — intouchables
- README.md, CHANGELOG.md, LICENSE.md — conservés tels quels
