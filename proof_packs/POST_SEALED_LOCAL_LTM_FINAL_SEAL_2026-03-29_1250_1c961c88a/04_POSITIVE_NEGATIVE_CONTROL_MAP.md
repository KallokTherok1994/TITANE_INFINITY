# POSITIVE/NEGATIVE CONTROL MAP

## Positive Control (SC2)
- **Saved fact**: code=ZEPHYR-7X3-KOI
- **Write path**: persist_explicit_memory_write_facts() → entries.json
- **Load path**: load_persistent_entries() → UnifiedMemory STM
- **Recall path**: unified_memory.recall("ZEPHYR", 10)
- **Expected**: fact appears in recall results
- **Expected**: recalled content exactly matches written fact
- **Result**: PASS ✅

## Negative Control (SC3)
- **Unsaved fact**: NONEXISTENT_FACT_XYZ
- **Write path**: empty entries.json (no facts written)
- **Load path**: load_persistent_entries() → loads nothing
- **Recall path**: unified_memory.recall("NONEXISTENT_FACT_XYZ", 10)
- **Expected**: empty recall results
- **Expected**: no false claiming of unsaved fact
- **Result**: PASS ✅

## Disallowed Behavior
- Claiming a fact that was never written
- Returning stale data from a previous session without explicit load
- Hallucinating memory content
