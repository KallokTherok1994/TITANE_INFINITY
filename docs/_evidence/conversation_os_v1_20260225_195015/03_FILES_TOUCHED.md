# 03_FILES_TOUCHED.md

## Code (commits observés)
### Commit `7bd00eff`
- `src/types/conversation_os.ts`
- `src/types/index.ts`
- `src-tauri/src/engines/mod.rs`
- `src-tauri/src/engines/conversation_os/mod.rs`
- `src-tauri/src/engines/conversation_os/router.rs`
- `src-tauri/src/engines/conversation_os/policy.rs`
- `src-tauri/src/engines/conversation_os/resilience.rs`
- `src-tauri/src/engines/conversation_os/memory.rs`
- `src-tauri/src/engines/conversation_os/search.rs`
- `src-tauri/src/services/mod.rs`
- `src-tauri/src/services/db_service.rs`
- `src-tauri/src/services/network_gateway.rs`
- `src-tauri/src/services/search_gateway.rs`
- `src-tauri/src/services/embeddings_service.rs`

### Commit `e8e233d6`
- `src-tauri/src/conversation_engine/commands.rs`
- `src/components/debug/TracePanel.tsx`
- `src/components/debug/ChatDebugPanel.tsx`
- `src/components/debug/index.ts`
- `registry/ui-events.jsonl`

### Commit `78b8e5ae`
- `src-tauri/src/services/search_gateway.rs`
- Nature: suppression du fallback implicite en absence de clé Brave, retour explicite `CREDENTIALS_MISSING` + test unitaire dédié

## Evidence pack (ce dossier)
- `00_PLAN.md`
- `01_TRUTH_SNAPSHOT.md`
- `02_SCOPE_FREEZE.md`
- `03_FILES_TOUCHED.md`
- `04_RING_SURFACE_MAP.md`
- `05_NETWORK_ALLOWLIST.md`
- `06_DB_SCHEMA.md`
- `07_GATES_STATUS.md`
- `08_TEST_RUNS_X3.md`
- `09_PROOF_LOGS.txt`
- `10_VERDICT.md`
- `11_ROLLBACK.md`

## Addendum 2026-02-26
- Ring impacté: **Ring 3 (Services)**
- Statut changement: **QUALIFIED**
- Preuve test ciblé: `reports/conversation_os_g1_remediation_search_credentials_x3.log`

## Addendum 2026-02-26 (Phase 1 G1)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut changement: **EXPERIMENTAL**
- Fichier ajouté: `13_G1_PHASE1_INVENTORY.md`
- Preuves: 
	- `reports/conversation_os_g1_phase1_raw_20260226T010320Z.log`
	- `reports/conversation_os_g1_phase1_summary_20260226T010320Z.md`
	- `reports/conversation_os_g1_phase1_classification_20260226T010330Z.csv`

## Addendum 2026-02-26 (Phase 2/3)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut changement: **EXPERIMENTAL**
- Fichiers code touchés (quick-wins):
	- `src/core/http/httpClient.ts`
	- `src/lib/ipc.ts`
	- `src/lib/logger.ts`
	- `src/utils/webVitals.ts`
	- `src/services/ai/retryStrategy.ts`
	- `src/services/README.md`
	- `src/test/setup.ts`
	- `src/__tests__/edge-cases/ErrorHandling.test.tsx`
	- `src/__tests__/e2e/VoiceWorkflow.e2e.test.tsx`
	- `src/services/ai/transports/ollamaTransport.ts`
	- `src/services/ai/providers/glm46v.ts`
	- `src/services/tts/parlerTTSBridge.ts`
- Preuve phase 3:
	- `reports/conversation_os_g1_global_scan_x3_after_phase2.log`

## Addendum 2026-02-26 (Phase 2B/3B)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut changement: **QUALIFIED**
- Fichiers code touchés:
	- `src/visual-engine/OSIntegrationBridge.ts`
	- `src/visual-engine/TitaneVisualEngine.ts`
	- `src/visual-engine/TitaneVisualEngineV21.ts`
- Preuve phase 3B:
	- `reports/conversation_os_g1_global_scan_x3_after_phase2b.log`

## Addendum 2026-02-26 (Continuation check)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut: **QUALIFIED**
- Preuve complémentaire:
	- `reports/conversation_os_g1_global_post_continue_check.log`

## Addendum 2026-02-26 (GO final validation)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut: **QUALIFIED**
- Fichier code ajusté:
	- `src/visual-engine/OSIntegrationBridge.ts` (fix TypeScript alias config)
- Preuves complémentaires:
	- `reports/conversation_os_final_validation_post_go.log`

## Addendum 2026-02-26 (Final closure)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut: **QUALIFIED**
- Fichier ajouté:
	- `15_FINAL_CLOSURE.md`
- Preuves terminales référencées:
	- `reports/conversation_os_g1_global_scan_x3_after_phase2b.log`
	- `reports/conversation_os_g1_global_post_continue_check.log`
	- `reports/conversation_os_final_validation_post_go.log`

## Addendum 2026-02-26 (Executive summary)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut: **QUALIFIED**
- Fichier ajouté:
	- `16_EXECUTIVE_SUMMARY.md`

## Addendum 2026-02-26 (Final state snapshot)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut: **QUALIFIED**
- Fichier ajouté:
	- `17_FINAL_STATE_SNAPSHOT.md`

## Addendum 2026-02-26 (Audit handoff)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut: **QUALIFIED**
- Fichier ajouté:
	- `18_AUDIT_HANDOFF.md`
- Preuve inventaire terminal:
	- `reports/conversation_os_pack_inventory_final.log`

## Addendum 2026-02-26 (All green closure)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut: **QUALIFIED**
- Fichier ajouté:
	- `19_ALL_GREEN_CLOSURE.md`
- Preuve consolidée:
	- `reports/conversation_os_post_format_all_green.log`

## Addendum 2026-02-26 (Verify recovery pass)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut: **QUALIFIED**
- Fichier ajouté:
	- `20_VERIFY_RECOVERY_PASS.md`
- Fichiers conformité ajustés:
	- `package.json` (`scripts.dev` => `tauri dev`)
	- `.github/copilot-instructions.md` (tokens exacts `Local-first` et `diagnose -> plan -> apply -> verify -> report`)
- Preuve décomposée:
	- `reports/conversation_os_verify_gates_decomposed_round2.log`

## Addendum 2026-02-26 (Monolithic verify attempt)
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut: **QUALIFIED**
- Fichier ajouté:
	- `21_MONOLITHIC_VERIFY_ATTEMPT.md`
- Logs monolithiques:
	- `reports/conversation_os_verify_monolithic_final_20260226T015133Z.log`
	- `reports/conversation_os_verify_monolithic_final_retry_20260226T015459Z.log`
- Décision gouvernée:
	- verdict maintenu sur preuve décomposée `reports/conversation_os_verify_gates_decomposed_round2.log`
