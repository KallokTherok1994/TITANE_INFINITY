# 01_BOOTSTRAP

## Etat git reel

- Branche: `MAIN`
- Commit court: `6ead32d58`
- Statut initial: copie de travail propre
- Historique recent (5):
  - `6ead32d58 chore(governance): apply layered instruction system with validators and proof-pack`
  - `c72d13de1 chore(docs): harden conflict-marker snippet and capture autoheal`
  - `e42c5940b fix(e2e): stabilize full-mode flows and update governance proofs`
  - `5262f10bf fix(ci-unified): relax Clippy lint to unblock Rust stable 1.94 CI`
  - `77d1644cd chore(proof-packs): add FINAL_PROD_UNLOCK_2026-03-06_0213_b61b1a251`

Preuve brute: `01_BOOTSTRAP_RAW.log`.

## Fichiers d'instructions trouves

- `.github/copilot-instructions.md`
- `.github/instructions/docs-registry.instructions.md`
- `.github/instructions/frontend.instructions.md`
- `.github/instructions/tauri.instructions.md`
- `.github/instructions/tests-e2e.instructions.md`
- `.github/instructions/titane.instructions.md`

## Agents trouves

- Globaux: `.github/agents/*.agent.md`
- Locaux: `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `docs/AGENTS.md`, `scripts/AGENTS.md`

## Prompt files trouves

- `.github/prompts/audit-instructions.prompt.md`
- `.github/prompts/fix-instructions-drift.prompt.md`
- `.github/prompts/update-mapping.prompt.md`
- `.github/prompts/run-proof-pack.prompt.md`
- `.github/prompts/release-readiness.prompt.md`
- `.github/prompts/contradiction-resolution.prompt.md`
- `.github/prompts/simple-fast-session.prompt.md`
- `.github/prompts/heavy-runtime-session.prompt.md`

## Validators trouves

- `scripts/verify_instructions.sh`
- `scripts/verify/verify-copilot-instructions.sh`
- `scripts/autoheal/detect_recurrence.sh`
- `scripts/verify/verify_status_vocabulary.sh`
- `scripts/verify/verify_instruction_layers.sh`
- `scripts/verify/verify_prompt_files_index.sh`
- `scripts/verify/verify_agents_index.sh`
- `scripts/verify/verify_local_markers_consistency.sh`
- `scripts/verify/verify_kernel_budget.sh`
- `scripts/verify/verify_no_doctrine_duplication.sh`
- `scripts/qa/check_autofix_autoheal_registry.mjs`
- `scripts/map_refresh.sh`

## Scripts AutoHeal trouves

- `scripts/autoheal/autoheal_rules.jsonl`
- `scripts/autoheal/detect_recurrence.sh`
- `scripts/autoheal/apply_autoheal.sh`
- `scripts/autoheal/README.md`

## Inconnus explicites

- Un `AGENTS.md` present dans `node_modules` a ete detecte par la commande generique `find`; il est hors gouvernance active du depot.
- Le chemin non canonique `scripts/verify-copilot-instructions.sh` n'existe pas (le chemin canonique est sous `scripts/verify/`).

## Risque principal du cycle courant

- Risque principal: derive d'index (agents/prompts) lors d'ajouts futurs sans mise a jour des fichiers de reference.
