# 12_ROLLBACK

## Commandes rollback (non destructif)

- `git restore -- proof_packs/SCELLEMENT_06_2026-03-03_1900_bf85a5adf`
- `git clean -fd -- proof_packs/SCELLEMENT_06_2026-03-03_1900_bf85a5adf`

## Portée

- Uniquement le pack de continuité `SCELLEMENT_06`.
- Aucun impact code source (`src/`, `src-tauri/`).
