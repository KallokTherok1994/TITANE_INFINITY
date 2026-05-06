# C1 Ingress Audit — MemoryGraph v2 Shadow Mode

Date: 2026-05-06
Auditor: LOCK C1I

## Classification

**C1_PARTIAL_COMMITTED**

Commit 7c00a69a1 exists with `feat(C1): add MemoryGraph v2 shadow mode scaffold + 26 tests [LOCK_C1 CLEAN]`.

## What Exists

- `src/services/memory/v2/MemoryGraphV2ShadowContract.ts` — T3 contract, dual-write coordinator, basic schemas
- `src/services/memory/v2/__tests__/MemoryGraphV2ShadowContract.test.ts` — 26 tests, ALL PASSING
- `proof_packs/LOCK_C1_MEMORYGRAPH_V2_SHADOW_2026-05-06/VERDICT.md` — CLEAN
- `proof_packs/LOCK_C1_MEMORYGRAPH_V2_SHADOW_2026-05-06/NEXT_LOCK.md` — present

## What Is Missing (v9 requirements)

### Schema gaps
- `validation_status` field (`confirmed|hypothesis|rejected|expired|system_observed|requires_kevin_validation`) — MISSING
- `type` enum (`identity_fact|project_context|decision|constraint|preference|risk|symbolic_axis|financial_pressure|technical_state|contradiction|evolution_milestone|instruction_truth|unknown`) — MISSING
- `source`, `confidence`, `expires_at`, `links`, `contradictions` — MISSING
- `embeddings_status` (`not_indexed|pending|indexed|failed|unavailable`) — MISSING
- Identity-safety rule: identity-sensitive memory cannot affect behavior without `validation_status=confirmed` — MISSING

### Test gaps (Super Prompt v9 UNIT matrix)
- C1-UNIT-02: validation_status is required — MISSING
- C1-UNIT-03: identity-sensitive memory cannot activate without confirmed validation — MISSING
- C1-UNIT-06: contradictions field accepts linked node ids or empty list — MISSING
- C1-UNIT-07: embeddings_status supports unavailable state — MISSING

### Proof pack gaps
- ROLLBACK.md — MISSING
- VALIDATORS.log — MISSING
- FILES_CHANGED.md — MISSING
- AUTHORITY_MAP.md — MISSING
- RISK_REGISTER.md — MISSING
- SHADOW_COMPARISON.md — MISSING
- DESKTOP_LANE_LINKAGE.md — MISSING

### Doc/Registry gaps
- `docs/memory/MEMORYGRAPH_V2_SHADOW_PLAN.md` — MISSING
- `reports/memorygraph_shadow_comparison.md` — MISSING
- `TITANE_ADVANCED_INTELLIGENCE_REGISTRY.md` — C1 entry missing
- `TITANE_TEST_REGISTRY.md` — C1 tests missing
- `TITANE_RUNTIME_FEATURE_FLAGS.md` — FF-C1 flag missing
- `TITANE_DESKTOP_E2E_REGISTRY.md` — AI-DESKTOP-06/07 status still PLANNED (needs link to scaffold)
- `docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md` — C1 row missing v8 evidence

## Worktree Safety
- `memory/memory_core_state.json` — modified, unrelated, NOT staged
- `memory/stm.json` — modified, unrelated, NOT staged
- UnifiedMemory production baseline: UNCHANGED (confirmed)
- Shadow mode default: DISABLED (confirmed)

## Action Plan

1. Extend MemoryGraphV2ShadowContract.ts with v9 schema fields (additive only)
2. Extend tests with C1-UNIT-02..07
3. Create docs/memory/MEMORYGRAPH_V2_SHADOW_PLAN.md
4. Create reports/memorygraph_shadow_comparison.md
5. Update all registries
6. Create complete proof pack (all 9 files)
7. Add AutoHeal entry
8. Run all validators
9. Single targeted commit
