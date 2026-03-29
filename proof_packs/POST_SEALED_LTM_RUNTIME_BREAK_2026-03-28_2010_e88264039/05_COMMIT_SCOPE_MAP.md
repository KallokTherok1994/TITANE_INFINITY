# COMMIT SCOPE MAP — P1.13

## Files Changed in This Cycle

| File | Type | Intentional | Justification |
|------|------|-------------|---------------|
| docs/governance/LTM_RUNTIME_QUALIFICATION_SPEC.md | New | YES | Canonical LTM spec |
| proof_packs/POST_SEALED_LTM_RUNTIME_BREAK_2026-03-28_2010_e88264039/* | New | YES | Proof pack |

## Files NOT Changed

| File | Intentional | Reason |
|------|-------------|--------|
| src/services/memory/MemoryBridge.ts | NO | No fix applied |
| src/core/services/unifiedMemory.ts | NO | No fix applied |
| src/services/conversationEngine.ts | NO | No fix applied |
| src-tauri/src/memory_os/* | NO | No fix applied |
| src-tauri/src/unified_memory_v2/* | NO | No fix applied |
| src-tauri/src/persistence/* | NO | No fix applied |

## Commit-Eligible Set
- docs/governance/LTM_RUNTIME_QUALIFICATION_SPEC.md
- proof_packs/POST_SEALED_LTM_RUNTIME_BREAK_2026-03-28_2010_e88264039/*
- registry/proofpack-index.jsonl (append only)

## Rollback-Ready Set
- git restore -- docs/governance/LTM_RUNTIME_QUALIFICATION_SPEC.md
- rm -rf proof_packs/POST_SEALED_LTM_RUNTIME_BREAK_2026-03-28_2010_e88264039/
- git restore -- registry/proofpack-index.jsonl

## Scope Assessment
- No product code changed
- No architecture redesigned
- Pure governance + proof artifacts
- Commit scope: CLEAN