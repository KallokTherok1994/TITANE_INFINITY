# LOCAL_EVENT_REPLAY_PROOF_SPEC

## Specification: What constitutes runtime proof of event replay

### Minimum requirements

1. **Event emission**: titan_persist_event must write at least one event to events.json
2. **DB persistence**: Event must survive process restart (loadable in next run)
3. **events_persisted counter**: Must increment per emit call
4. **Replay via load_latest_state**: State loaded via snapshot+replay must reflect emitted events
5. **Field mutation verification**: At least one concrete SingularityState field must change as a result of replay
6. **Repeatability**: All above must hold across ≥3 independent runs

### Proof boundary

- In scope: canonical event store (events.json) + snapshot+replay path
- In scope: "memory" module reducer (total_memories += 1)
- Out of scope: other module reducers ("xp", "progress", "knowledge", "settings") — wired but not runtime-exercised
- Out of scope: external sync (BLOCKED_ENV)
- Out of scope: LTM disk layer

### Event structure accepted by runtime

```
{
  event: {
    module: "memory",
    event_type: "add",
    payload: { ... }
  }
}
```

### Replay verification method

```javascript
preMemoryCount = preEventState.memory.total_memories
await titan_persist_event({ event: { module: 'memory', event_type: 'add', payload: {} } })
postEventState = await titan_load_state()
assert postEventState.memory.total_memories === preMemoryCount + 1
```

### Pass criteria

- `postMemoryCount === preMemoryCount + 1`: PASS (reducer applied)
- `postEventsCount > preEventsCount`: PASS (event written to DB)
- `events_persisted counter` increments: PASS
- 3 runs meeting criteria: RUNTIME_PROOF

### This cycle's results against spec

| Requirement | Run 1 | Run 2r | Run 3 | Status |
|-------------|-------|--------|-------|--------|
| Event emitted | ✓ (0→1) | ✓ (1→2) | ✓ (2→3) | PROVEN |
| DB persistent | ✓ | ✓ | ✓ | PROVEN |
| Counter increments | ✓ (0→1) | ✓ (0→1) | ✓ (0→1) | PROVEN |
| total_memories replay | ✓ (0→1) | ✓ (1→2) | ✓ (2→3) | PROVEN |
| Cross-run persistence | N/A | ✓ loaded run1 event | ✓ loaded runs 1+2 events | PROVEN |
| Repeatability (≥3) | 3/3 | — | — | PROVEN |

### Verdict against spec: MEETS_SPEC — RUNTIME_PROOF_SATISFIED
