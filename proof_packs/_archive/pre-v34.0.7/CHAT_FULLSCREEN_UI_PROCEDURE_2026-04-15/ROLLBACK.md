# ROLLBACK

1. Restore the fullscreen shell and instructions:
   `git restore -- src/components/layout/AppShell.tsx src/__tests__/ui/ui-navigation.test.ts .github/instructions/frontend.instructions.md .github/instructions/tests-e2e.instructions.md .github/instructions/titane.instructions.md .github/instructions/docs-registry.instructions.md .github/agents/release-proof.agent.md UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`
2. Restore the production Tauri devtools flag if needed:
   `git restore -- src-tauri/tauri.base.json scripts/autoheal/autoheal_rules.jsonl`
3. Remove the session proof files if the governed closure must be reverted:
   `git restore -- reports/CHAT_FULLSCREEN_UI_PROCEDURE_2026-04-15.md proof_packs/CHAT_FULLSCREEN_UI_PROCEDURE_2026-04-15/VERDICT.md proof_packs/CHAT_FULLSCREEN_UI_PROCEDURE_2026-04-15/GATE_REPORT.md proof_packs/CHAT_FULLSCREEN_UI_PROCEDURE_2026-04-15/ROLLBACK.md`