# Gate Report

- targeted tests: PASS
  - `src/__tests__/chatEngine.test.ts`
  - `src/__tests__/config/customModeRegistry.test.ts`
  - `src/ui/pages/ChatIA/InstructionModeManager.test.ts`
- french prompt guard: PASS
  - `src/__tests__/config/chatModes.phase17.test.ts`
- governance validators: PASS
  - `bash scripts/autoheal/detect_recurrence.sh`
  - `bash scripts/verify_instructions.sh`
  - `bash scripts/verify/verify_agents_index.sh`
  - `bash scripts/verify/verify_prompt_files_index.sh`
- broader suite note: `src/__tests__/chatModes.config.test.ts` still reports a pre-existing duplicate `sortOrder` configuration and was not changed in this patch.