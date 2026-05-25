# 03 - Authority Graph

## Canonical Chain
```text
Chat UI / hook
  -> chatMemoryCompactor localStorage history
  -> conversation/memory integration
  -> chatMemorySingleDoor prompt context
  -> provider/system prompt injection
  -> backend IPC and Rust memory lanes where applicable
```

## Backend Authority
```text
src-tauri/src/memory_os/
src-tauri/src/unified_memory_v2/
src-tauri/src/neural_memory/
src-tauri/src/memory/
```

## Data Authority
```text
memory/memory-index.json
memory/memory_core_state.json
memory/stm.json, mtm.json, ltm.json
data/knowledge_base/default/kevin_owner_profile_v30.json
data/knowledge_base/default/identity_profile.json
```

## Legacy / Parallel Paths
- `src/services/memory/UnifiedMemoryService.ts` persists JSON files through Node APIs and is explicitly marked legacy/test-only.
- `MemoryBridge.ts` remains a compatibility/risk bridge.
- Docs still record a gap between JSON memory files and SQLite/backend memory consumption.

## Evidence
- Authority map extracts: `raw/18_docs_authority_memory_extracts.out.txt`
- Import/use scan: `raw/15_memory_import_usage_summary.out.txt`
- Surface matrix: `raw/21_memory_surface_matrix.csv`
