# FILES CHANGED — ONLINE-FIRST vΩ

## Git diff --name-only (relative to HEAD at baseline)

### Ring 1 — Types
- `src/types/providerMeta.ts` — ajout de `CONTRACT_VIOLATION_CLAMPED` dans ReasonCode
- `src/types/providerDecisionMeta.ts` *(nouveau)* — Truth Contract: validateProviderDecisionMeta + clampProviderDecisionMeta

### Ring 3 — Services
- `src/services/conversationEngine.ts` — P0 fix: mode REMOTE→LOCAL quand network_used=false (2 violations)

### Ring 4 — UI/Hooks
- `src/hooks/useConversationEngine.ts` — guard NO_LYING_VIOLATION_FRONTEND

### Tests
- `src/__tests__/provider-decision-invariants.test.ts` *(nouveau)* — 15 tests invariants (Gate G4)

### Docs/Evidence
- `docs/_evidence/online_first_vΩ/00_BASELINE.md` *(nouveau)*
- `docs/_evidence/online_first_vΩ/00_SCOPE.md` *(nouveau)*
- `docs/_evidence/online_first_vΩ/G1_INVENTORY_RAW.txt` *(nouveau)*
- `docs/_evidence/online_first_vΩ/G1_CLASSIFICATION.md` *(nouveau)*
- `docs/_evidence/online_first_vΩ/G3_NO_SILENT_FALLBACK.md` *(nouveau)*
- `docs/_evidence/online_first_vΩ/G4_TEST_RUNS_X3.txt` *(nouveau)*
- `docs/_evidence/online_first_vΩ/FILES_CHANGED.md` *(ce fichier)*
- `docs/_evidence/online_first_vΩ/ROLLBACK.md` *(nouveau)*
- `docs/_evidence/online_first_vΩ/VERDICT.md` *(nouveau)*
- `docs/_evidence/online_first_vΩ/COMMANDS_RUN.txt` *(nouveau)*
- `docs/_evidence/online_first_vΩ/SHA256SUMS.txt` *(nouveau)*
- `docs/01_architecture/NETWORK_DIAGNOSTIC_ENGINE_4RING.md` *(nouveau)*
