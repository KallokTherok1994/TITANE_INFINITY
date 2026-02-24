# FILES CHANGED — ONLINE-FINAL

## Runtime changes (patch minimal)

### Rust Backend
- `src-tauri/src/conversation_engine/commands.rs` — P0 fix: `"mode": "REMOTE"` → `"mode": "LOCAL"` dans le backend gate (ligne 101)

### TypeScript (session précédente — online_first_vΩ, inclus dans ce PR)
- `src/types/providerMeta.ts` — +`CONTRACT_VIOLATION_CLAMPED` dans ReasonCode
- `src/types/providerDecisionMeta.ts` *(nouveau)* — validateProviderDecisionMeta + clampProviderDecisionMeta
- `src/services/conversationEngine.ts` — P0 fix: mode REMOTE→LOCAL (frontend policy-blocked path)
- `src/hooks/useConversationEngine.ts` — guard NO_LYING_VIOLATION_FRONTEND

### Tests
- `src/__tests__/online-availability.test.ts` *(nouveau)* — 14 tests G5 (ONLINE-FINAL)
- `src/__tests__/provider-decision-invariants.test.ts` *(de la session précédente)* — 15 tests

### Evidence/Docs
- `docs/_evidence/online_final/` *(nouveau répertoire)*
  - `00_BASELINE.md`, `COMMANDS_RUN.txt`
  - `G1_INVENTORY_RAW.txt`, `G1_CLASSIFICATION.md`
  - `G2_NETWORK_SURFACE.md`
  - `G3_META_SOURCES.md`, `G3_PATCH_DIFF.patch`, `G3_LOGS_SAMPLE.txt`
  - `G4_NETWORK_CHECK.md`, `G4_PROVIDER_REACHABILITY.md`
  - `G5_TEST_RUNS_X3.txt`
  - `G6_RUNTIME_LOGS.txt`, `G6_RUNTIME_ASSERTIONS.md`
  - `FILES_CHANGED.md`, `ROLLBACK.md`, `VERDICT.md`, `SHA256SUMS.txt`
