# P1.13d — PROOF SCENARIOS

## Scenario 1: Persistence Baseline Recheck

**Objective**: Verify persistence write path still works
**Result**: PASS
**Evidence**: cargo test `persist_explicit_memory_write_facts_writes_intermediate_entries` — 1 passed, 0 failed

## Scenario 2: Positive Control (Behavioral Consumption)

**Objective**: Prove improbable fact is written → persisted → loaded → recalled → consumed
**Result**: PASS
**Evidence**:
- Improbable fact "code=ZEPHYR-7X3-KOI" written to entries.json
- `load_persistent_entries()` loaded fact into UnifiedMemory STM
- `recall("ZEPHYR")` returned the fact
- Recalled content exactly matches written fact
- Dedup verified: reload does not duplicate

## Scenario 3: Negative Control (No False Recall)

**Objective**: Prove unsaved facts are NOT claimed
**Result**: PASS
**Evidence**:
- Empty entries.json created (no facts)
- `load_persistent_entries()` loaded 0 items into STM
- `recall("NONEXISTENT_FACT_XYZ")` returned empty results
- No false positives detected

## Scenario 4: x3 Reruns (Stability)

**Objective**: Verify test stability across 3 runs
**Result**: PASS
**Evidence**:

| Run | Passed | Failed | Duration |
|-----|--------|--------|----------|
| 1   | 5      | 0      | 0.00s    |
| 2   | 5      | 0      | 0.01s    |
| 3   | 5      | 0      | 0.00s    |

**Internal x3**: SC4 test itself runs 3 iterations, each verifying write → load → recall → consume chain.

## Scenario 5: Consume-Ready Fallback

**Objective**: Verify memoryRecallIds coherence
**Result**: PASS
**Evidence**:
- Entry "test-consume-001" with content "metier=PILOTE" written
- `recall("PILOTE")` returned entry with correct id
- Recall IDs contain the written entry ID
- Content exactly matches: "metier=PILOTE"

## Regression Check

| Test Suite | Result | Details |
|------------|--------|---------|
| Unified Memory | PASS | 69/69 tests passed (0.76s) |
| LTM Consumption Proof | PASS | 5/5 tests passed (0.00s) |
| Conversation Engine | PASS | 533/534 passed (1 pre-existing failure unrelated) |

**Verdict**: All scenarios PASS. LTM behavioral consumption proven.