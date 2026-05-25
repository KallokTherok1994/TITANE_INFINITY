# 02 - Memory Surface Inventory

## Inventory Result
Portable surface matrix generated from tracked files:
- Total memory-related surfaces: 437
- Canonical: 45
- Legacy/risk: 132
- Runtime data: 14
- Test: 63
- Governance docs: 55
- Unknown: 128

## Primary Artifacts
- Full path list: `raw/14_memory_surface_files.out.txt`
- CSV matrix: `raw/21_memory_surface_matrix.csv`
- Summary: `raw/21_memory_surface_matrix.summary.txt`

## Interpretation
The memory system is broad and historically layered. The current canonical path exists, but many legacy, archive, and unknown surfaces remain discoverable. This increases drift risk unless authority maps and validators remain active.

## Canonical Surface Families
- Frontend chat context: `chatMemorySingleDoor`, `chatMemoryCompactor`
- Frontend unified memory: `services/unified/UnifiedMemory.ts`
- Backend memory engines: `memory_os`, `unified_memory_v2`, `neural_memory`, `src-tauri/src/memory`

## Risk Surface Families
- `src/services/memory/UnifiedMemoryService.ts`: file-based, Node `fs/promises`, marked legacy/test-only in source comments
- `MemoryBridge.ts`: compatibility/risk surface per authority docs
- Historical docs and archived memory reports: useful for context, not current runtime truth
