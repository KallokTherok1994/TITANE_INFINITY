# Lock C1 — Rollback Plan

Lock: C1 — MemoryGraph v2 Shadow Mode
Date: 2026-05-06

## Rollback Steps

### Step 1 — Disable feature flag (instant, no restart required)
```
VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW=false
```
Default value. Shadow writes immediately stop. No v2 reads were ever active.

### Step 2 — If contract must be reverted
```bash
git restore src/services/memory/v2/MemoryGraphV2ShadowContract.ts
git restore src/services/memory/v2/__tests__/MemoryGraphV2ShadowContract.test.ts
```

### Step 3 — Verify UnifiedMemory integrity
UnifiedMemory v1 was never modified by C1. No action required.
```bash
git diff src/services/memory/UnifiedMemoryService.ts  # should be empty
git diff src/core/services/unifiedMemory.ts           # should be empty
```

### Step 4 — Verify production behavior unchanged
```bash
pnpm vitest run src/services/unified/__tests__/UnifiedMemory.unit.test.ts
```

## Data Loss Risk
ZERO — v2 shadow mode only writes. v2 data is experimental, never read by production.
v1 (UnifiedMemory) is the sole source of truth throughout C1.

## Rollback Trigger Conditions
- isBlockedByIdentitySafety() bypass discovered
- v2 write latency causing caller regression
- Schema validation failures in production environment
