# Explore Quota Fallback Workflow 2026-04-19

## mission

Rendre le workflow gouverné non bloquant quand le sous-agent Explore est indisponible à cause d'une limite hebdomadaire de quota GitHub Copilot.

## scope

- `.github/instructions/hybrid-memory-dispatch.instructions.md`
- `.github/prompts/simple-fast-session.prompt.md`
- `.github/prompts/heavy-runtime-session.prompt.md`
- `.github/prompts/start-hybrid-memory-dispatch.prompt.md`
- `.github/agents/titane-conductor.agent.md`
- `scripts/verify/verify-vscode-agent-workflow.sh`
- `docs/CARTOGRAPHY_COMPLETE.md`
- `scripts/autoheal/autoheal_rules.jsonl`

## actions

- Ajout d'une règle commune classifiant le quota Explore comme limite plateforme externe.
- Ajout d'une bascule immédiate vers la discovery locale canonique (`search_subagent`, recherche workspace, lectures ciblées) dans les prompts et instructions gouvernées.
- Réalignement du workflow de planification de `titane-conductor` pour éviter tout blocage sur une délégation d'exploration indisponible.
- Extension du validateur `verify-vscode-agent-workflow.sh` pour exiger explicitement la présence du fallback Explore-quota dans les fichiers critiques.
- Mise à jour de la cartographie et ajout de l'entrée AutoHeal canonique.

## evidence

- Reproduction de la vérité externe: l'invocation réelle de Explore a échoué avec le message de quota hebdomadaire GitHub Copilot et une réinitialisation annoncée le `19 avril 2026 à 20:00`.
- `bash scripts/verify_instructions.sh` → `SUMMARY: PASS=33 FAIL=0`
- `bash scripts/verify/verify_instruction_layers.sh` → `SUMMARY: FAIL=0`
- `bash scripts/verify/verify-agent-tooling.sh` → `SUMMARY: FAIL=0`
- `bash scripts/verify/verify-vscode-agent-workflow.sh` → `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_agents_index.sh` → `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_prompt_files_index.sh` → `SUMMARY: FAIL=0`
- `bash scripts/autoheal/detect_recurrence.sh` → `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`, `PASS: G_AH_RECURRENCE_GUARD_PASS`, `INFO: entries=1214`

## risks

- Le quota Explore lui-même reste externe et peut toujours empêcher l'usage du sous-agent natif jusqu'au reset de quota.
- La correction ici supprime le blocage du workflow repo, mais ne modifie pas la politique de quota de la plateforme.

## verdict

PASS

## next step

Surveiller les prochaines sessions pour confirmer que la discovery locale canonique est effectivement privilégiée quand Explore échoue sur quota, puis étendre le même pattern si d'autres prompts repo présument encore une disponibilité implicite d'un sous-agent externe.

## rollback note

`git restore -- .github/instructions/hybrid-memory-dispatch.instructions.md .github/prompts/simple-fast-session.prompt.md .github/prompts/heavy-runtime-session.prompt.md .github/prompts/start-hybrid-memory-dispatch.prompt.md .github/agents/titane-conductor.agent.md scripts/verify/verify-vscode-agent-workflow.sh docs/CARTOGRAPHY_COMPLETE.md scripts/autoheal/autoheal_rules.jsonl reports/EXPLORE_QUOTA_FALLBACK_WORKFLOW_2026-04-19.md`