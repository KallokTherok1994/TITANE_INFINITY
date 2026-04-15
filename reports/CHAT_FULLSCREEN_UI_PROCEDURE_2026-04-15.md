# Chat Fullscreen UI Procedure — 2026-04-15

Date: 2026-04-15T16:45:00Z
Verdict target: PASS

## Scope

- Root fullscreen containment hardening for the chat shell.
- Mandatory frontend/UI procedure encoded in the active instruction layers.
- Instruction hierarchy cleanup for BUILD ALL authority and AutoHeal canonical wording.
- Production Tauri config realigned so desktop devtools stay disabled in the canonical production base.

## Commands

- `pnpm exec vitest run src/__tests__/ui/ui-navigation.test.ts src/components/sections/__tests__/ConversationSection.test.ts src/__tests__/services/moduleRouteContext.test.ts src/__tests__/security/securityFoundation.test.ts tests/contract/tauri-ipc-contract.test.ts`
- `pnpm exec vitest run src/__tests__/config/tauriDevtoolsConfig.test.ts`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `bash scripts/verify/verify_instruction_layers.sh`
- `bash scripts/verify/verify_no_doctrine_duplication.sh`
- `bash scripts/verify/verify_status_vocabulary.sh`
- `bash scripts/verify/verify_agents_index.sh`
- `bash scripts/verify/verify_prompt_files_index.sh`
- `bash scripts/verify/verify_local_markers_consistency.sh`
- `bash scripts/verify/verify_kernel_budget.sh`

## Evidence

- The root AppShell now keeps the fullscreen flex and min-height chain intact through the main scroll host.
- The regression suite asserts the fullscreen chat shell contract directly.
- The active frontend and E2E instructions now require reproduce -> minimal patch -> proofs -> mapping -> AutoHeal -> validators for every UI modification.
- Lower instruction layers no longer redefine BUILD ALL and no longer duplicate the canonical AutoHeal path wording.
- The canonical production Tauri base no longer leaves `devtools` enabled.

## Residual Limits

- Windows native runtime proof remains a workflow/runner path on this Linux host.
- Android device-install proof remains unavailable without a connected device or emulator.

## Final Validation

- Targeted Vitest/UI + contract tests: PASS
- Tauri devtools config test: PASS
- `bash scripts/autoheal/detect_recurrence.sh`: PASS
- `bash scripts/verify_instructions.sh`: PASS
- Instruction architecture validators: PASS