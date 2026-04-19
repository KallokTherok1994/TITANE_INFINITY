# Specialist Delegation Fallback 2026-04-19

## mission

Étendre le pattern de continuité gouvernée aux prompts et agents qui supposaient encore la disponibilité implicite de délégations spécialisées.

## scope

- `.github/prompts/release-readiness.prompt.md`
- `.github/agents/memory-root-commander.agent.md`
- `.github/agents/memory-orchestrator.agent.md`
- `scripts/verify/verify-vscode-agent-workflow.sh`
- `docs/CARTOGRAPHY_COMPLETE.md`
- `scripts/autoheal/autoheal_rules.jsonl`

## actions

- Ajout d'un fallback explicite dans `release-readiness` quand `release-proof` est indisponible.
- Ajout d'une continuité par collecte locale canonique dans `memory-root-commander` et `memory-orchestrator` quand un handoff spécialisé est indisponible.
- Extension du validateur workflow pour exiger ces garde-fous.
- Ajout de la cartographie et de l'entrée AutoHeal correspondantes.

## evidence

- `bash scripts/verify_instructions.sh` → `SUMMARY: PASS=33 FAIL=0`
- `bash scripts/verify/verify_instruction_layers.sh` → `SUMMARY: FAIL=0`
- `bash scripts/verify/verify-agent-tooling.sh` → `SUMMARY: FAIL=0`
- `bash scripts/verify/verify-vscode-agent-workflow.sh` → `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_agents_index.sh` → `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_prompt_files_index.sh` → `SUMMARY: FAIL=0`
- `bash scripts/autoheal/detect_recurrence.sh` → `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`, `PASS: G_AH_RECURRENCE_GUARD_PASS`, `INFO: entries=1216`

## risks

- Une délégation spécialisée peut toujours être indisponible côté plateforme.
- La correction retire le blocage sur la délégation elle-même, pas les éventuelles limites externes nécessaires pour certaines preuves.

## verdict

PASS

## next step

Étendre au besoin le même pattern aux autres surfaces de gouvernance si de nouveaux prompts ou agents introduisent encore une hypothèse de disponibilité implicite d'un spécialiste externe.

## rollback note

`git restore -- .github/prompts/release-readiness.prompt.md .github/agents/memory-root-commander.agent.md .github/agents/memory-orchestrator.agent.md scripts/verify/verify-vscode-agent-workflow.sh docs/CARTOGRAPHY_COMPLETE.md scripts/autoheal/autoheal_rules.jsonl reports/SPECIALIST_DELEGATION_FALLBACK_2026-04-19.md`