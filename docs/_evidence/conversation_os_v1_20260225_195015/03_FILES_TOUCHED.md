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
