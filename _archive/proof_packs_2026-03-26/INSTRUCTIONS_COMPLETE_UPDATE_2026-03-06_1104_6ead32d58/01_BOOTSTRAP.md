# 01_BOOTSTRAP

## Etat git reel

- Branche: `MAIN`
- Commit court: `6ead32d58`
- `git status` au bootstrap:
  - branche a jour avec `origin/MAIN`
  - non suivi detecte: `proof_packs/INSTRUCTIONS_MAINTENANCE_2026-03-06_1042_6ead32d58/`

## Arborescence instructionnelle reelle

- Noyau: `.github/copilot-instructions.md`
- Instructions scopees:
  - `.github/instructions/docs-registry.instructions.md`
  - `.github/instructions/frontend.instructions.md`
  - `.github/instructions/tauri.instructions.md`
  - `.github/instructions/tests-e2e.instructions.md`
  - `.github/instructions/titane.instructions.md`

## Agents reellement presents

- Agents gouvernance: `.github/agents/*.agent.md`
- Agents copilot additionnels: `.github/copilot-agents/**/*.agent.md`
- AGENTS locaux:
  - `src/AGENTS.md`
  - `src-tauri/AGENTS.md`
  - `e2e/AGENTS.md`
  - `docs/AGENTS.md`
  - `scripts/AGENTS.md`

## Prompts reellement presents

- `.github/prompts/audit-instructions.prompt.md`
- `.github/prompts/contradiction-resolution.prompt.md`
- `.github/prompts/fix-instructions-drift.prompt.md`
- `.github/prompts/heavy-runtime-session.prompt.md`
- `.github/prompts/release-readiness.prompt.md`
- `.github/prompts/run-proof-pack.prompt.md`
- `.github/prompts/simple-fast-session.prompt.md`
- `.github/prompts/update-mapping.prompt.md`

## Validators reellement presents

- `scripts/verify_instructions.sh`
- `scripts/verify/verify-copilot-instructions.sh`
- `scripts/verify/verify_status_vocabulary.sh`
- `scripts/verify/verify_instruction_layers.sh`
- `scripts/verify/verify_prompt_files_index.sh`
- `scripts/verify/verify_agents_index.sh`
- `scripts/verify/verify_local_markers_consistency.sh`
- `scripts/verify/verify_kernel_budget.sh`
- `scripts/verify/verify_no_doctrine_duplication.sh`

## Scripts AutoHeal reellement presents

- `scripts/autoheal/autoheal_rules.jsonl`
- `scripts/autoheal/detect_recurrence.sh`
- `scripts/autoheal/apply_autoheal.sh`
- `scripts/qa/check_autofix_autoheal_registry.mjs`

## Inconnus explicites

- `find . -name AGENTS.md` retourne aussi un fichier dans `node_modules` (hors perimetre gouvernance active).
- Le scan `rg` global retourne un volume important de traces d'archives/proof packs; ces occurrences ne sont pas toutes des couches actives.

## Risque principal du cycle actuel

- Risque principal: derive future d'index prompts/agents si de nouveaux fichiers sont ajoutes sans mise a jour des checks associes.

Preuve source: `01_BOOTSTRAP_RAW.log`.
