# TITANE∞ — MemoryGraph v2 Shadow Mode Plan

Lock: C1
Date: 2026-05-06
Status: CLEAN (commit 7c00a69a1, extended with v9 schema)

## Objective

Deploy MemoryGraph v2 in **shadow mode** alongside UnifiedMemory v1. No reads switch.
v1 remains the sole production source of truth. v2 collects write traffic behind a
feature flag for future C2 migration feasibility analysis.

## Architecture

```
[write request]
      │
      ├─► v1 (UnifiedMemory) ── source of truth ── SYNC ── result returned to caller
      │
      └─► v2 shadow (MEMORYGRAPH_V2_SHADOW_ENABLED=true only)
               └── ASYNC, fire-and-forget, non-blocking
               └── v2 failure never propagates to caller
```

## Feature Flag

| Flag | Surface | Default | Activation |
|------|---------|---------|------------|
| `VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW` | Frontend env | false | T3 explicit only |
| `TITANE_C1_MEMORYGRAPH_V2_SHADOW` | Rust env | false | T3 explicit only |

## Schema v2 Fields (additive to v1)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `type` | MemoryNodeType enum | required | Semantic type |
| `validation_status` | MemoryValidationStatus enum | system_observed | Identity-safety gate |
| `source` | string\|null | null | Origin signal |
| `confidence` | number 0..1 | 0.5 | Reliability score |
| `expires_at` | datetime\|null | null | Optional TTL |
| `links` | UUID[] | [] | Forward links |
| `contradictions` | UUID[] | [] | Contradicted node IDs |
| `embeddings_status` | EmbeddingsStatus enum | not_indexed | Vector readiness |
| `content_hash` | string | required | SHA-256 dedup |

## Identity Safety Rule (C1-UNIT-03)

Identity-sensitive types: `identity_fact`, `symbolic_axis`, `financial_pressure`,
`constraint`, `instruction_truth`.

**Rule:** Any node with an identity-sensitive type AND `validation_status != confirmed`
must NOT influence model behavior. Function `isBlockedByIdentitySafety()` enforces this
guard. Shadow mode only — no production activation until confirmed.

## Desktop E2E Lanes

| Lane ID | Name | Status | Lock dependency |
|---------|------|--------|-----------------|
| AI-DESKTOP-06 | Memory write/read baseline | PLANNED | C1/E0 |
| AI-DESKTOP-07 | MemoryGraph shadow write | PLANNED | C1/E0 |

## Test Coverage

| Test ID | Description | Status |
|---------|-------------|--------|
| C1-UNIT-01 | MemoryNode schema serializes/deserializes | PASS (47 tests total) |
| C1-UNIT-02 | validation_status required and validated | PASS |
| C1-UNIT-03 | identity-sensitive memory blocked without confirmed | PASS |
| C1-UNIT-04 | shadow write does not replace UnifiedMemory | PASS |
| C1-UNIT-05 | default feature flags are safe/off | PASS |
| C1-UNIT-06 | contradictions field accepts UUID list or empty | PASS |
| C1-UNIT-07 | embeddings_status supports unavailable state | PASS |

## Migration Feasibility Gate (C1→C2)

Before C2 (MemoryGraph v2 reads activated), the following must be proven:
1. Shadow writes succeed for ≥30 days real sessions
2. Zero data corruption detected (content_hash integrity)
3. Embedding coverage ≥ 80% (embeddings_status distribution)
4. Identity-safe gate passing 100% of identity_fact nodes
5. Performance: shadow write latency p95 < 200ms
6. Rollback plan tested (documented below)

## Rollback Plan

1. `VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW=false` (default) → v2 shadow writes stop
2. No v2 reads ever active → zero data loss risk
3. v1 UnifiedMemory: untouched, production baseline preserved
4. git restore: `src/services/memory/v2/MemoryGraphV2ShadowContract.ts` if needed

## Reference

- Commit: 7c00a69a1 (initial scaffold, 26 tests)
- Extended: v9 schema (47 tests: + C1-UNIT-02..07)
- Proof pack: `proof_packs/LOCK_C1_MEMORYGRAPH_V2_SHADOW_2026-05-06/`
