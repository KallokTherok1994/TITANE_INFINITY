# Lock C1 — Authority Map

Lock: C1 — MemoryGraph v2 Shadow Mode
Date: 2026-05-06

## Authority Chain

| Layer | Owner | File |
|-------|-------|------|
| L1 — Constitutional kernel | Kernel rules | .github/copilot-instructions.md |
| L2 — Path instructions | Frontend contract | .github/instructions/frontend.instructions.md |
| L3 — Repo AGENTS | titane-conductor | AGENTS.md |
| L4 — Memory master | memory-backend-master | .github/agents/memory-backend-master.agent.md |
| L6 — Mechanical truth | Tests | src/services/memory/v2/__tests__/MemoryGraphV2ShadowContract.test.ts |

## Boundaries

| Boundary | Rule |
|----------|------|
| v1 source of truth | UnifiedMemory v1 is sole production read source |
| v2 shadow only | VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW must be explicit to activate |
| Identity-safety | isBlockedByIdentitySafety() gates sensitive types |
| No v2 reads | v2 reads BLOCKED until C2 feasibility gate |
| No cross-contamination | v2 writes cannot affect v1 caller result |

## Doctrine Compliance

- Rule 1 (minimal patch): Only MemoryGraphV2ShadowContract.ts extended; no other memory files touched
- Rule 2 (proof before verdict): 47 tests PASS; 5 gates PASS
- Rule 3 (4-Ring): Ring 4 only (UI/service layer)
- Rule 5 (One Door): No IPC change — contract is TS only (no network)
- Rule 10 (AutoHeal): Entry LOCK_C1_MEMORYGRAPH_V2_SHADOW_2026_05_06 appended
- Rule 15 (mapping): TITANE_ADVANCED_INTELLIGENCE_REGISTRY, TEST_REGISTRY, RUNTIME_FEATURE_FLAGS updated
- Rule 16 (tests): 47 unit tests cover all 7 C1-UNIT cases
