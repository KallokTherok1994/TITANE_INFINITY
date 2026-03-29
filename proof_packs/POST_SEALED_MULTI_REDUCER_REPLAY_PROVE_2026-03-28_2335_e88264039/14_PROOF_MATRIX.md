# PROOF_MATRIX — P1.12

## Cumulative local persistence proof matrix (post P1.12)

| Component | Status | Cycle | Evidence |
|-----------|--------|-------|----------|
| Snapshot emission | PROVEN | P1.10c | snapshots_created 0→1, file written |
| snapshots_created counter | PROVEN | P1.10c | runtime counter increments confirmed |
| Snapshot → restore roundtrip | PROVEN | P1.10d | X3 hash equality d161cf82... |
| No-loss hash equality (X3) | PROVEN | P1.10d | sha1 identical across 3 independent restores |
| Event emission (append) | PROVEN | P1.11 | events.json grows, cross-run survival |
| Event file persistence (cross-run) | PROVEN | P1.11 | event survives process restart |
| Event replay → memory state field | PROVEN | P1.11 | total_memories monotonic 0→1→2→3 |
| xp reducer (ticks += amount) | PROVEN | P1.12 | ticks monotonic 0→100→200→300 |
| progress reducer (depth = level) | PROVEN | P1.12 | depth idempotent 0→7→7→7 |
| knowledge reducer (memories++ + active++) | PROVEN | P1.12 | both fields delta +1/run |
| settings reducer (last_update_ms = ts) | PROVEN | P1.12 | identity with last_sync_ms X3 |
| External sync | BLOCKED_ENV | N/A | TURSO_URL absent |
| LTM encrypted layer | MOCK_MODE | N/A | future cycle |
| Other reducers | N/A | — | only 5 reducers exist in current code |

## Reducer coverage summary

```
apply_event_to_state reducer coverage:
  "xp"       → PROVEN (P1.12)   [was WIRED_BUT_UNPROVEN]
  "progress" → PROVEN (P1.12)   [was WIRED_BUT_UNPROVEN]
  "knowledge"→ PROVEN (P1.12)   [was WIRED_BUT_UNPROVEN]
  "settings" → PROVEN (P1.12)   [was WIRED_BUT_UNPROVEN]
  "memory"   → PROVEN (P1.11)

Coverage: 5/5 (100% of implemented reducers)
```

## Local sync closure status

Per LOCAL_EVENT_REPLAY_PROOF_SPEC.md §4:
- Chat path responsive: PROVEN (singleTurnTest PASS)
- Snapshot path: PROVEN (P1.10d)
- Event path: PROVEN (P1.11 + P1.12)
- No silent bypass detected

**LOCAL_SYNC_CLOSURE: PROVEN** (for all currently implemented reducers)

External sync remains BLOCKED_ENV — does not affect local sync closure verdict.
