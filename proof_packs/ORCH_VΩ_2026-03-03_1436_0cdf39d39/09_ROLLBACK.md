# 09_ROLLBACK

## Objectif
Annuler strictement les artefacts ORCH de cette session, sans toucher au runtime applicatif.

## Commandes (non destructif code)
1. Vérifier l’état:
	- `git status --short`
2. Supprimer uniquement le pack ORCH courant:
	- `rm -rf "proof_packs/ORCH_VΩ_2026-03-03_1436_0cdf39d39"`
3. Revérifier:
	- `git status --short`

## Rollback alternatif (si pack déjà tracké)
- `git restore --source=HEAD --worktree --staged "proof_packs/ORCH_VΩ_2026-03-03_1436_0cdf39d39"`

## Impact attendu
- Aucun impact sur `src/`, `src-tauri/`, `tests/`.
- Suppression uniquement des preuves ORCH locales de cette exécution.

