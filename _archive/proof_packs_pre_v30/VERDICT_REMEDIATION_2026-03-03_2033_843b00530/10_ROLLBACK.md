# ROLLBACK

## Commits (si appliqués ensuite)

- Revert commit unique:
	- `git revert <commit_sha>`

## WIP local (cette session)

- Annuler patch superprompt:
	- `git restore -- .github/copilot-instructions.md`
- Annuler wrapper E2E ajouté:
	- `git restore -- scripts/e2e/run_e2e_tauri.sh`
- Annuler proof-pack:
	- `git restore --staged --worktree proof_packs/VERDICT_REMEDIATION_2026-03-03_2033_843b00530`

## Rollback minimal scope

- `git restore -- .github/copilot-instructions.md scripts/e2e/run_e2e_tauri.sh proof_packs/VERDICT_REMEDIATION_2026-03-03_2033_843b00530`
