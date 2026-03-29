# PROOF_SCENARIOS

## Scenario A — EVENT APPEND EMISSION (PROVEN)

- Trigger: invokeTauriCommand('titan_persist_event', { event: { module: 'memory', event_type: 'add', payload: { source: 'event_replay_proof_p1_11' } } })
- Verified: events.json count increases by 1 after emit
- Counter: events_persisted 0→1 (per process)
- Event shape: module=memory, event_type=add, ts=[1774739078237|1774739194213|1774739259729]
- Status: PROVEN

## Scenario B — EVENT REPLAY (PROVEN)

- Trigger: invokeTauriCommand('titan_load_state') after event emit
- Verified: postEventState.memory.total_memories === preEventState.memory.total_memories + 1
- Replay path: load_latest_snapshot + load_events_since(snapshot.ts) + apply_event_to_state("memory")
- Run 1: 0→1, Run 2r: 1→2, Run 3: 2→3
- Status: PROVEN

## Scenario C — LOCAL SYNC CLOSURE (PROVEN / PARTIAL)

- Chat sync: singleTurnTest PASS in all 3 runs (Ollama gemma2:2b)
- Snapshot persistence: PROVEN (P1.10d carried forward)
- Event persistence: PROVEN (P1.11 X3)
- Event replay → state: PROVEN (P1.11 X3)
- Cross-component alignment: No silent bypass of canonical events detected
- Status: PROVEN for snapshot+event local path
- Note: Module sync (mock mode), orchestrator sync (P1.10b) remain at prior proof level

## Scenario D — EXTERNAL SYNC CLASSIFICATION (BLOCKED_ENV)

- TURSO_URL: not set
- SYNC_TOKEN: not set
- External sync adapter: not implemented in mock build
- Status: BLOCKED_ENV — consistent with all prior cycles, no regression

## Scenario E — CROSS-RUN EVENT ACCUMULATION (PROVEN, unexpected bonus)

- P1.11 proved a STRONGER property than minimum spec:
  Events from Run N are loaded and replayed correctly in Run N+1 and Run N+2
  This demonstrates deterministic replay across process restarts
- Run 2r preMemoryCount=1 (not 0) because Run 1's event was already in the file
- Run 3 preMemoryCount=2 because runs 1+2's events were already in the file
- All assertions passed: N→N+1 monotonically
- Status: PROVEN (cross-run persistence + replay correctness)

## Summary

| Scenario | Status |
|----------|--------|
| A: Event append | PROVEN |
| B: Event replay | PROVEN |
| C: Local sync closure | PROVEN (local) |
| D: External sync | BLOCKED_ENV |
| E: Cross-run accumulation | PROVEN (bonus) |
