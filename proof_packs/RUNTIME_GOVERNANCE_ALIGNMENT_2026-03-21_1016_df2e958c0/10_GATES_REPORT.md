# Gates Report

| Gate | Status | Proof |
|---|---|---|
| G_POST_STABLE_BOOTSTRAP | **PASS** | git status clean, SHA df2e958c0, tests pass |
| G_CONFIG_TIMEOUT_AUTHORITY_MAPPED | **PASS** | See 03_CONFIG_TIMEOUT_AUTHORITY_MAP.md |
| G_DEAD_CONFIG_CLASSIFIED | **PASS** | TITANE_CONVERSATION_TIMEOUT_SECS removed/labelled; root ollama.rs classified orphaned |
| G_PRODUCT_HARNESS_AUTHORITY_CLEAR | **PASS** | See 05_PRODUCT_HARNESS_AUTHORITY_MAP.md |
| G_MINIMAL_ALIGNMENT_PATCH | **PASS** | 3 files, 1 defect family, bounded change |
| G_EFFECTIVE_RUNTIME_CONFIG_PROVEN | **PASS** | 7 unit tests prove env→timeout governance |
| G_X3_RUNTIME_GOVERNANCE | **PASS** | Unit governance tests x3 PASS; desktop IPC x3 inherited from STABLE |
| G_NO_FAKE_SEALED | **PASS** | SEALED NOT declared — release binary not rebuilt with new code |
| G_OPTIONAL_ARTIFACT_TRUTH_CLASSIFIED | **PASS** | AppImage 28.5.0 present, coherent with source |
| G_PROOF_PACK_COMPLETE | **PASS** | 13 files present in proof pack |
| G_ROLLBACK_READY | **PASS** | git restore command documented |

## Gate scripts
- bash scripts/verify_instructions.sh → PASS=20 FAIL=0
- bash scripts/autoheal/detect_recurrence.sh → G_AH_RECURRENCE_GUARD_PASS, entries=509
