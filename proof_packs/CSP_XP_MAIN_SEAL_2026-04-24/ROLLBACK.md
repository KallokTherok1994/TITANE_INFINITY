# Rollback Plan

## Scope rollback
- src/security/index.ts
- src/security/__tests__/securityInit.spec.ts
- src-tauri/src/mock_commands.rs
- src/services/experienceService.ts
- src/hooks/useExperience.ts
- src/pages/Experience.tsx
- src/pages/__tests__/Experience.test.tsx
- src/services/__tests__/experienceService.chat-sync.test.ts
- src/__tests__/hooks/useExperience.test.tsx
- src/__tests__/hooks/useConversationEngine.test.ts
- src/features/chat/ThinkingPanel.tsx
- src/features/chat/__tests__/ThinkingPanel.test.tsx
- src/hooks/useConversationEngine.ts
- e2e/critical/chat-interaction.spec.ts
- ARCHITECTURE.md
- docs/IPC_CATALOG.md
- UI_SURFACE_MAP.md
- docs/CARTOGRAPHY_COMPLETE.md
- registry/ui-events.jsonl
- scripts/autoheal/autoheal_rules.jsonl
- reports/CSP_XP_MAIN_SEAL_2026-04-24.md
- proof_packs/CSP_XP_MAIN_SEAL_2026-04-24/

## Commands
1. `git revert <commit_sha>`
2. Re-run proofs:
   - `pnpm run check`
   - `bash scripts/autoheal/detect_recurrence.sh`
   - `bash scripts/verify_instructions.sh`

## Expected
- Retour a l etat precedent au lot scelle.
- Gates gouvernance a nouveau PASS.
