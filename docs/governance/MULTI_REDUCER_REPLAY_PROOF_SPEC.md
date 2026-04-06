# MULTI_REDUCER_REPLAY_PROOF_SPEC

## 1. Purpose and scope

This spec defines what constitutes a valid runtime proof of multi-reducer event replay coverage in TITANE∞.

This is NOT a broad persistence architecture spec.
This covers exactly: the 4 non-memory reducers in `apply_event_to_state` — xp, progress, knowledge, settings — proven via `titan_persist_event` → `events.json` → `titan_load_state` replay → specific `SingularityState` field mutations.

## 2. Reducer truth boundary

- Canonical dispatch: `PersistenceEngine::apply_event_to_state()` in `src-tauri/src/persistence/mod.rs`
- Triggered by: `titan_load_state()` → `load_latest_state()` → `load_events_since(snapshot.ts)` → per-event dispatch
- All 5 reducers share the same entry point and the same `state.last_sync_ms = event.timestamp` side effect

## 3. Proof rules per reducer

Proof is valid only if ALL of the following are observed at runtime for each reducer:

### xp reducer
1. Event `{ module: "xp", payload: { amount: N } }` emitted via `titan_persist_event`
2. `titan_load_state` after emit returns `state.metrics.ticks === pre_ticks + N`
3. Holds across ≥3 independent runs with monotonically increasing pre_ticks

### progress reducer
1. Event `{ module: "progress", payload: { level: L } }` emitted via `titan_persist_event`
2. `titan_load_state` after emit returns `state.cognition.depth === L` (with `L <= 10`)
3. Idempotent across ≥3 runs when same level is used

### knowledge reducer
1. Event `{ module: "knowledge", payload: {} }` emitted via `titan_persist_event`
2. `titan_load_state` after emit returns `state.memory.total_memories === pre + 1` AND `state.cognition.active_thoughts === pre + 1`
3. Both fields increment monotonically across ≥3 runs

### settings reducer
1. Event `{ module: "settings", payload: {} }` emitted last in batch via `titan_persist_event`
2. `titan_load_state` after emit returns `state.metrics.last_update_ms > pre_last_update_ms`
3. Identity holds: `state.metrics.last_update_ms === state.last_sync_ms` (because settings is last)
4. Holds across ≥3 runs

## 4. Batch emit protocol

To prove the settings identity property, the 4 events MUST be emitted in this order:
1. xp
2. progress
3. knowledge
4. settings (last — ensures last_sync_ms === settings.timestamp)

## 5. Cross-run state accumulation

Events accumulate in `events.json` across runs. The `preTicks + delta` assertion form correctly handles accumulated state. The `progress.depth` assertion uses absolute value (not delta) because the reducer sets (not increments) the field.

## 6. Scope boundaries

- This spec extends LOCAL_EVENT_REPLAY_PROOF_SPEC.md
- Does NOT cover: memory reducer (proven P1.11), external sync (BLOCKED_ENV), LTM layer (MOCK_MODE)
- Does NOT require: Rust code changes, new IPC commands, binary rebuild

## 7. BLOCKED_ENV rule

If TURSO_URL or SYNC_TOKEN are absent:
- Classify as BLOCKED_ENV
- Do not attempt external sync proof
- This does NOT affect multi-reducer local proof validity

## 8. Mermaid summary

```
titan_persist_event (xp/progress/knowledge/settings)
  → events.json (append)
  → titan_load_state → load_events_since(snapshot.ts)
  → apply_event_to_state per event
  → SingularityState: ticks, depth, total_memories, active_thoughts, last_update_ms
```

## 9. Registry append rule

Append to `registry/proofpack-index.jsonl` only when:
- X3 independent runs all PASS
- All 4 reducer assertions confirmed
- Proof pack files 00–18 complete

## 10. Rollback rule

```
git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js
git restore -- docs/governance/MULTI_REDUCER_REPLAY_PROOF_SPEC.md
git restore -- registry/proofpack-index.jsonl
rm -rf proof_packs/POST_SEALED_MULTI_REDUCER_REPLAY_PROVE_2026-03-28_2335_e88264039
```

No Rust code was changed in P1.12. No product rollback needed.

## 11. Reopen / escalation rule

This spec is sealed for the current scope.
It may be extended (not replaced) when:
- New reducers are added to `apply_event_to_state`
- External sync becomes unblocked
- LTM proof cycle is initiated

Do not reopen reducer proof without a new product trigger.
