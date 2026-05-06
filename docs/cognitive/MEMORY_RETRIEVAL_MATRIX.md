# Memory Retrieval Matrix

Lock: B1
Date: 2026-05-06
Type: T0/T1

| subsystem | files inspected | claimed capability | actual observed implementation | classification | proof signal | risk | next lock dependency | scorecard dependency | Desktop test dependency |
|---|---|---|---|---|---|---|---|---|---|
| UnifiedMemory STM/MTM/LTM | src/services/memory/UnifiedMemoryService.ts, src/core/pipelines/UnifiedCognitivePipeline.ts | Multi-tier memory orchestration for conversation quality | Services and stores exist; temporal decay and retrieval quality remain partially measured | PARTIAL | Existing memory services and tests in repository | Stale memory or incoherent recall | C1, C2 | MEMORY_TRUTH_SCORECARD, MEMORY_RETRIEVAL_QUALITY_SCORECARD | AI-DESKTOP-06 |
| MemoryGraph shadow path | src/services/memory/v2/MemoryGraphV2ShadowContract.ts | Relational memory in shadow mode | Shadow contract exists; no baseline replacement of UnifiedMemory | PARTIAL | C1 contract and tests in prior lock | Shadow/main divergence | C1 | MEMORY_RETRIEVAL_QUALITY_SCORECARD | AI-DESKTOP-07 |
| Digital Twin memory bridge | src-tauri/src/digital_twin_v14_1, src/services/memory/MemoryBridge.ts | Connect twin signals to memory with boundaries | Surface exists but bounded evidence is incomplete in B1 docs-only audit | UNKNOWN | File presence only in this lock | Identity and consent contamination risk | D3 | KEVIN_AXIS_SCORECARD | AI-DESKTOP-13 |
