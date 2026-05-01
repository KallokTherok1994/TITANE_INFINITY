# TITANE Natural Voice Report

- Date: `2026-04-30`
- Lock: rendre les réponses de TITANE plus naturelles, humaines et vivantes sans perdre la profondeur cognitive
- Scope: chaîne de prompt conversationnelle canonique + fallback UI + cartographie associée

## Diagnostic

La capture et les fichiers actifs montraient un verrou commun:

1. `src/services/userPreferencesEngine.ts` injectait un protocole 5 phases avec incitation à "penser à voix haute".
2. `src/services/ai/chatEngine.ts` imposait des chaînes de raisonnement visibles dans les profils de profondeur.
3. `src/services/ai/chatModes.ts`, `src/services/ai/chatModes.config.ts`, `src/config/chatModes.config.ts` et `src/ui/pages/ChatIA/InstructionModeManager.ts` surjouaient une posture "maître d'analyse / God Mode / rapports avancés".

Effet runtime attendu: réponses scolaires, auto-commentées, cérémonielles, surtout en mode standard ou sur demandes créatives simples.

## Delta

Le patch garde la cognition forte en interne, mais change le contrat d'expression:

- ne plus exposer spontanément phases, protocole ou chaîne de raisonnement
- répondre d'abord dans un langage humain, vivant et direct
- livrer d'abord le résultat créatif quand la demande est créative
- conserver l'honnêteté sur la fraîcheur des connaissances et les limites

Phase 2 ajoutée:

- garde runtime `anti prompt-theater` dans `chatEngine.postProcess()`
- suppression des préambules procéduraux si un vrai livrable suit déjà
- clarification créative concise si la réponse générée n'est qu'un protocole sans livrable

## Commands

```bash
pnpm vitest run src/services/__tests__/userPreferencesEngine.test.ts src/__tests__/services/ai/ollamaPipelineFixes.test.ts src/__tests__/chatEngine.test.ts src/__tests__/services/ai/chatModes.runtimeDepth.test.ts src/__tests__/services/ai/chatModeRegistryBoundaries.test.ts src/__tests__/config/customModeRegistry.test.ts src/ui/pages/ChatIA/InstructionModeManager.test.ts
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
bash scripts/verify/verify-copilot-instructions.sh
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify_no_doctrine_duplication.sh
bash scripts/verify/verify_status_vocabulary.sh
bash scripts/verify/verify_agents_index.sh
bash scripts/verify/verify_prompt_files_index.sh
bash scripts/verify/verify_local_markers_consistency.sh
bash scripts/verify/verify_kernel_budget.sh
pnpm run check
```

## Outputs

- `pnpm vitest run ...` -> `7 passed`, `113 passed`
- `bash scripts/autoheal/detect_recurrence.sh` -> `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`, `PASS: G_AH_RECURRENCE_GUARD_PASS`
- `bash scripts/verify_instructions.sh` -> `SUMMARY: PASS=33 FAIL=0`
- `bash scripts/verify/verify-copilot-instructions.sh` -> `PASS: verify-copilot-instructions`
- `bash scripts/verify/verify_instruction_layers.sh` -> `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_no_doctrine_duplication.sh` -> `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_status_vocabulary.sh` -> `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_agents_index.sh` -> `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_prompt_files_index.sh` -> `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_local_markers_consistency.sh` -> `SUMMARY: FAIL=0`
- `bash scripts/verify/verify_kernel_budget.sh` -> `SUMMARY: FAIL=0`
- `pnpm run check` -> `tsc --noEmit` exit `0`

## Files touched

- `src/services/userPreferencesEngine.ts`
- `src/services/ai/chatEngine.ts`
- `src/services/ai/chatModes.ts`
- `src/services/ai/chatModes.config.ts`
- `src/config/chatModes.config.ts`
- `src/ui/pages/ChatIA/InstructionModeManager.ts`
- Tests ciblés associés
- `ARCHITECTURE.md`
- `UI_SURFACE_MAP.md`
- `docs/CARTOGRAPHY_COMPLETE.md`

## Verdict

`PASS` — verrou conversationnel corrigé avec preuves ciblées et gates verts.

## Remaining limits

- Pas de replay UI live post-correctif dans cette session
- Pas de capture post-correctif
- Pas d'E2E conversationnel réel sur un prompt "poème Facebook"
