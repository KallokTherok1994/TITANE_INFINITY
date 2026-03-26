# 19_ROLLBACK

## Principe
Rollback non destructif uniquement, reproductible et par niveaux.

## File-level rollback commands
- proof-pack courant complet:
  - `git restore -- proof_packs/INSTRUCTIONS_SYSTEM_UPGRADE_2026-03-06_1001_c72d13de1`

- kernel futur (si modifie ensuite):
  - `git restore -- .github/copilot-instructions.md`

- instructions path-specific futures:
  - `git restore -- .github/instructions/*.instructions.md`

- prompts futurs:
  - `git restore -- .github/prompts/*.prompt.md`

- agents locaux/custom futurs:
  - `git restore -- src/AGENTS.md src-tauri/AGENTS.md e2e/AGENTS.md docs/AGENTS.md scripts/AGENTS.md .github/agents/*.agent.md`

- validators/schemas futurs:
  - `git restore -- scripts/verify governance`

## Grouped rollback commands
- rollback gouvernance complet (hors code produit):
  - `git restore -- .github scripts docs reports proof_packs governance`

- rollback strict instruction system uniquement:
  - `git restore -- .github/copilot-instructions.md .github/instructions .github/agents .github/prompts scripts/verify governance`

## Safest rollback order
1. rollback validators/schemas nouveaux
2. rollback prompts
3. rollback agents locaux/custom
4. rollback path-specific instructions
5. rollback kernel
6. rollback proof-pack session

## Priorite restauration si contradiction apparait
1. restaurer kernel (`.github/copilot-instructions.md`)
2. restaurer layer priority schema/validator
3. restaurer fichiers path-specific touches
4. reexecuter `bash scripts/verify_instructions.sh`

## Verification post-rollback
- `git status --short --branch`
- `bash scripts/verify_instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`
