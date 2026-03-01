# TARGET_STRUCTURE

## Racine canonique autorisée
- src/
- src-tauri/
- docs/
- scripts/
- tests/
- tools/ (si justifié)
- dist/ (artefacts)
- reports/ (artefacts)
- proof_packs/ (artefacts)
- archive/ (historique)

## Tolérances contrôlées (héritage)
- .github/, .husky/, .clinerules/, e2e/, runtime/, deployment/, public/

## Décisions de ce cycle
- Aucune migration massive de dossiers racine (risque de casse élevé et couplages implicites).
- Correction structurelle ciblée des dérives versionnées hors zones canon.
