# Gate Report

- `cargo test --manifest-path src-tauri/Cargo.toml experience_state_tests` -> PASS
- `pnpm exec vitest run src/services/__tests__/experienceService.chat-sync.test.ts src/__tests__/hooks/useExperience.test.tsx src/pages/__tests__/Experience.test.tsx src/__tests__/hooks/useConversationEngine.test.ts src/features/chat/__tests__/ThinkingPanel.test.tsx src/security/__tests__/securityInit.spec.ts src/security/__tests__/CspManager.spec.ts` -> PASS
- `TITANE_E2E_FULL=1 pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep CHAT_XP_GENERATION_SYNC --reporter=line` -> PASS
- `pnpm run check` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `bash scripts/verify/verify_agents_index.sh` -> PASS
- `bash scripts/verify/verify_prompt_files_index.sh` -> PASS
