# TARGET_STRUCTURE

## Structure racine cible
- src/
- src-tauri/
- docs/
- scripts/
- tests/ (si présent)
- reports/
- proof_packs/
- archive/
- dist/

## Affectation
- Documentation canonique: `docs/`
- Evidences et preuves: `docs/_evidence/` et/ou `proof_packs/`
- Sorties opérationnelles: `reports/`
- Héritage/legacy: `archive/`
- Build artefacts: `dist/`

## Contrôle anti-dérive
- Gate obligatoire: `scripts/check_structure.sh`
- Toute violation => FAIL + auto-fix avant verdict
