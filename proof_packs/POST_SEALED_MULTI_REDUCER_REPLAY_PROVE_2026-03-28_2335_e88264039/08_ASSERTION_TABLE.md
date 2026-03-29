# ASSERTION_TABLE — P1.12

## Per-reducer assertion matrix across X3 runs

| Reducer | Assertion | Run 1 | Run 2 | Run 3 |
|---------|-----------|-------|-------|-------|
| xp | `postTicks === preTicks + 100` | 0→100 ✓ | 100→200 ✓ | 200→300 ✓ |
| progress | `postDepth === 7` | 0→7 ✓ | 7→7 ✓ | 7→7 ✓ |
| knowledge | `postMemories === preMemories + 1` | 3→4 ✓ | 4→5 ✓ | 5→6 ✓ |
| knowledge | `postActiveThoughts === preActiveThoughts + 1` | 0→1 ✓ | 1→2 ✓ | 2→3 ✓ |
| settings | `postMetricsLastUpdate > preMetricsLastUpdate` | ...894→...988 ✓ | ...988→...055 ✓ | ...055→...785 ✓ |
| settings | `postMetricsLastUpdate === postLastSyncMs` | ✓ | ✓ | ✓ |
| counter | `events_persisted >= pre + 4` | 0→4 ✓ | 0→4 ✓ | 0→4 ✓ |

## Cross-run monotonic verification

### xp.ticks (cumulative)
- After Run 1: 100 (1 xp event replayed)
- After Run 2: 200 (2 xp events replayed)
- After Run 3: 300 (3 xp events replayed)
- Increment per run: exactly +100 ✓

### knowledge.total_memories (cumulative, includes P1.11 memory events)
- After P1.11: 3 (3 memory events)
- After P1.12 Run 1: 4 (+1 knowledge event)
- After P1.12 Run 2: 5 (+1 knowledge event)
- After P1.12 Run 3: 6 (+1 knowledge event)
- Increment per run: exactly +1 ✓

### knowledge.active_thoughts (cumulative)
- After Run 1: 1
- After Run 2: 2
- After Run 3: 3
- Increment per run: exactly +1 ✓

### progress.depth (idempotent set, not cumulative)
- After Run 1: 7 (set from 0)
- After Run 2: 7 (re-set to 7 — same value, multiple progress events all level=7)
- After Run 3: 7 (re-set to 7)
- Idempotent ✓

### settings.last_update_ms (monotonically increasing timestamps)
- After Run 1: 1774740677988
- After Run 2: 1774740733055
- After Run 3: 1774740779785
- Each run's settings event has a later timestamp ✓
- Identity with last_sync_ms holds in all 3 runs ✓

## events_persisted counter notes

The `events_persisted` counter resets to 0 at process start (it is an in-memory counter, not persisted). Each run emits 4 events → counter reaches exactly 4 per run. This is expected and correct behavior.

## Proof completeness

All 7 assertions pass in all 3 runs. No partial failures. No retries needed in P1.12. The multi-reducer proof is complete and unambiguous.
