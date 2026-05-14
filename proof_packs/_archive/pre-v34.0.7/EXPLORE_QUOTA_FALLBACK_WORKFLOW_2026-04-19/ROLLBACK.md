# ROLLBACK

## commande

`git restore -- .github/instructions/hybrid-memory-dispatch.instructions.md .github/prompts/simple-fast-session.prompt.md .github/prompts/heavy-runtime-session.prompt.md .github/prompts/start-hybrid-memory-dispatch.prompt.md .github/agents/titane-conductor.agent.md scripts/verify/verify-vscode-agent-workflow.sh docs/CARTOGRAPHY_COMPLETE.md scripts/autoheal/autoheal_rules.jsonl reports/EXPLORE_QUOTA_FALLBACK_WORKFLOW_2026-04-19.md proof_packs/EXPLORE_QUOTA_FALLBACK_WORKFLOW_2026-04-19/VERDICT.md proof_packs/EXPLORE_QUOTA_FALLBACK_WORKFLOW_2026-04-19/ROLLBACK.md`

## effet attendu

- suppression de la règle de fallback Explore-quota dans les instructions et prompts
- suppression de l'assertion correspondante dans le validateur workflow
- suppression de la trace cartographique, AutoHeal, rapport et proof pack associés