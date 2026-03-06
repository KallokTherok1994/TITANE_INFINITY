# 15_FILES_TO_CREATE_UPDATE_MOVE_DELETE

## A. files to create
- file: `.github/prompts/audit-instructions.prompt.md`
- why: externaliser workflow audit lourd
- expected gain: startup plus rapide
- risk: faible
- rollback command: `git restore --staged --worktree .github/prompts/audit-instructions.prompt.md`

- file: `.github/prompts/fix-instructions-drift.prompt.md`
- why: runbook anti-drift
- expected gain: correction plus deterministe
- risk: faible
- rollback command: `git restore --staged --worktree .github/prompts/fix-instructions-drift.prompt.md`

- file: `.github/prompts/update-mapping.prompt.md`
- why: normaliser updates map
- expected gain: coherence mapping
- risk: faible
- rollback command: `git restore --staged --worktree .github/prompts/update-mapping.prompt.md`

- file: `.github/prompts/run-proof-pack.prompt.md`
- why: standardiser generation preuve
- expected gain: moins d oublis
- risk: faible
- rollback command: `git restore --staged --worktree .github/prompts/run-proof-pack.prompt.md`

- file: `.github/prompts/release-readiness.prompt.md`
- why: gate release structure
- expected gain: moins ambiguite prod
- risk: moyen
- rollback command: `git restore --staged --worktree .github/prompts/release-readiness.prompt.md`

- file: `.github/prompts/contradiction-resolution.prompt.md`
- why: formaliser resolution conflits
- expected gain: baisse BLOCKED_DOCTRINE
- risk: faible
- rollback command: `git restore --staged --worktree .github/prompts/contradiction-resolution.prompt.md`

- file: `.github/prompts/simple-fast-session.prompt.md`
- why: path simple
- expected gain: acceleration locale
- risk: faible
- rollback command: `git restore --staged --worktree .github/prompts/simple-fast-session.prompt.md`

- file: `.github/prompts/heavy-runtime-session.prompt.md`
- why: path heavy
- expected gain: execution governnee complete
- risk: faible
- rollback command: `git restore --staged --worktree .github/prompts/heavy-runtime-session.prompt.md`

- file: `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `docs/AGENTS.md`, `scripts/AGENTS.md`
- why: autorite locale explicite
- expected gain: routage deterministic
- risk: faible
- rollback command: `git restore --staged --worktree src/AGENTS.md src-tauri/AGENTS.md e2e/AGENTS.md docs/AGENTS.md scripts/AGENTS.md`

- file: `scripts/verify/verify_instruction_layers.sh` et validators associes
- why: mecaniser conflits de couches
- expected gain: verite machine
- risk: moyen
- rollback command: `git restore --staged --worktree scripts/verify/verify_instruction_layers.sh`

- file: `governance/statuses.yaml`, `governance/layer_priority.yaml`, `governance/proof_pack.schema.json`, `governance/allowed_rule_homes.yaml`
- why: source canonique mecanique
- expected gain: anti-drift fort
- risk: moyen
- rollback command: `git restore --staged --worktree governance`

## B. files to update
- `.github/copilot-instructions.md`
- why: kernel court 10-12 regles
- expected gain: charge always-on reduite
- risk: moyen-haut
- rollback command: `git restore -- .github/copilot-instructions.md`

- `.github/instructions/titane.instructions.md`
- why: retirer doctrine dupliquee
- expected gain: ambiguite reduite
- risk: moyen
- rollback command: `git restore -- .github/instructions/titane.instructions.md`

- `.github/instructions/docs-registry.instructions.md`
- why: clarifier reports + proof_packs
- expected gain: moins de faux FAIL
- risk: faible
- rollback command: `git restore -- .github/instructions/docs-registry.instructions.md`

## C. files to move
- `.github/copilot-agents/*.agent.md` (doc-only) -> `.github/legacy/copilot-agents-doc/` (propose)
- why: separer legacy et operationnel
- expected gain: routage clair
- risk: moyen
- rollback command: `git restore -- .github/copilot-agents`

## D. files to delete
- candidats apres migration: doc-only agents redondants non references
- why: supprimer bruit
- expected gain: maintenance reduite
- risk: moyen (liens casses)
- rollback command: `git restore -- .github/copilot-agents`

## E. files to split
- `.github/copilot-instructions.md`
- why: decoupler kernel vs workflows
- expected gain: cout cognitif baisse
- risk: moyen-haut
- rollback command: `git restore -- .github/copilot-instructions.md`

- `.github/instructions/titane.instructions.md`
- why: isoler surface locale
- expected gain: priorite claire
- risk: moyen
- rollback command: `git restore -- .github/instructions/titane.instructions.md`

## F. files to mechanize
- status vocabulary -> `governance/statuses.yaml` + `verify_status_vocabulary.sh`
- layer priority -> `governance/layer_priority.yaml` + `verify_instruction_layers.sh`
- doctrine duplication -> `verify_no_doctrine_duplication.sh`
- kernel budget -> `verify_kernel_budget.sh`
- prompt inventory -> `verify_prompt_files_index.sh`
- agents inventory -> `verify_agents_index.sh`

## G. files to leave unchanged
- `scripts/autoheal/detect_recurrence.sh`
- `scripts/verify_instructions.sh`
- `scripts/map_refresh.sh`
- `docs/MAP_*.md`
- `reports/MAP_PROOFS.log`

Raison: deja operationnels et alignes avec verifications executes dans ce run.
