# GATE REPORT

- Session: `titane-natural-voice-2026-04-30`
- Mode: `Durable`
- Verdict: `PASS`

## Gates

1. `pnpm vitest run src/services/__tests__/userPreferencesEngine.test.ts src/__tests__/services/ai/ollamaPipelineFixes.test.ts src/__tests__/chatEngine.test.ts src/__tests__/services/ai/chatModes.runtimeDepth.test.ts src/__tests__/services/ai/chatModeRegistryBoundaries.test.ts src/__tests__/config/customModeRegistry.test.ts src/ui/pages/ChatIA/InstructionModeManager.test.ts`
Result: `7 passed`, `113 passed`

2. `bash scripts/autoheal/detect_recurrence.sh`
Result: `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`, `PASS: G_AH_RECURRENCE_GUARD_PASS`

3. `bash scripts/verify_instructions.sh`
Result: `SUMMARY: PASS=33 FAIL=0`

4. `bash scripts/verify/verify-copilot-instructions.sh`
Result: `PASS: verify-copilot-instructions`

5. `bash scripts/verify/verify_instruction_layers.sh`
Result: `SUMMARY: FAIL=0`

6. `bash scripts/verify/verify_no_doctrine_duplication.sh`
Result: `SUMMARY: FAIL=0`

7. `bash scripts/verify/verify_status_vocabulary.sh`
Result: `SUMMARY: FAIL=0`

8. `bash scripts/verify/verify_agents_index.sh`
Result: `SUMMARY: FAIL=0`

9. `bash scripts/verify/verify_prompt_files_index.sh`
Result: `SUMMARY: FAIL=0`

10. `bash scripts/verify/verify_local_markers_consistency.sh`
Result: `SUMMARY: FAIL=0`

11. `bash scripts/verify/verify_kernel_budget.sh`
Result: `SUMMARY: FAIL=0`

12. `pnpm run check`
Result: `tsc --noEmit` exit `0`

## Proofs obtained

- Regression tests alignés sur le nouveau contrat "raisonnement interne, expression naturelle"
- Garde runtime `anti prompt-theater` qualifiée sur stripping de préambule, fallback créatif answer-first et préservation des réponses naturelles
- Compilation TypeScript globale valide
- Gates AutoHeal et instructions vertes
- Marqueur noyau `Local-first` réaligné avec le validator canonique
- Preuves `reports/` et `proof_packs/` scellées et versionnées avec le correctif

## Proofs missing

- Pas de preuve UI live post-correctif
- Pas de capture post-correctif
- Pas d'E2E conversationnel réel sur un prompt créatif final
