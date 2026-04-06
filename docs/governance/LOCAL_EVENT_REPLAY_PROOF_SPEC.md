# LOCAL_EVENT_REPLAY_PROOF_SPEC

## 1. Purpose and scope

This spec defines what constitutes a valid runtime proof of the append-only event emission and replay path in TITANE∞.

This is NOT a broad persistence architecture spec.
This covers exactly: titan_persist_event → events.json → load_latest_state replay → SingularityState field mutation.

## 2. Append-only event truth boundary

- Canonical sink: `~/.local/share/TITANE_INFINITY/persistence/titan_events.events.json`
- Write owner: `PersistenceDB.insert_event()` (atomic write via .tmp rename)
- IPC entry: `titan_persist_event(event: TitanEventDto)` — registered in main.rs + capabilities.json
- Idempotence: enforced by UUID deduplication in EventLog.has_event()
- Events do NOT update snapshots.json — they are a separate append-only log

## 3. Replay proof rules

Replay is proven only if ALL of the following are observed at runtime:

1. A new event is emitted via `titan_persist_event`
2. `titan_get_events_since({ timestamp: 0 })` returns a longer array after emit
3. `titan_get_persistence_status` shows `events_persisted` incremented
4. `titan_load_state` (snapshot + replay path) returns a state where the specific field mutated by the reducer has the expected new value
5. The above holds across ≥3 independent runs

## 4. Local sync closure rules

Local sync closure is proven when:

- Chat path is responsive (singleTurnTest PASS)
- Snapshot path is proven (P1.10d)
- Event path is proven (this spec)
- No silent bypass of canonical events is detected

Local sync closure does NOT require external sync.

## 5. LTM boundary note

- `apply_event_to_state` only mutates shallow SingularityState fields
- Does NOT reach LTM disk storage or encrypted layer
- LTM proof is a separate future cycle

## 6. External sync BLOCKED_ENV rule

If TURSO_URL or SYNC_TOKEN are absent:
- Classify as BLOCKED_ENV
- Do not attempt external sync proof
- Document the boundary explicitly
- Do not treat BLOCKED_ENV as a proof failure for local sync

## 7. Autoheal update rule

- Only add autoheal rule if a real blocking condition is discovered
- Do not add rules for WIRED_BUT_UNPROVEN paths unless they block local proof
- Mark prior autoheal rules RESOLVED when runtime proof closes the gap

## 8. Mermaid summary

Event path:
`titan_persist_event → insert_event → events.json → load_events_since(snapshot.ts) → apply_event_to_state → SingularityState`

Replay filter: `event.timestamp > snapshot.timestamp`

## 9. Mapping summary

See APPEND_ONLY_EVENT_TRUTH_MAP and REPLAY_DEPENDENCY_MAP in proof pack.

## 10. Registry append rule

Append to `registry/proofpack-index.jsonl` only when:
- A new bounded proof cycle completes with a real verdict
- Evidence is observed at runtime (not documentation)

## 11. Reopen / escalation rule

This spec is sealed for the current scope.
It may be extended (not replaced) when:
- Other module reducers are runtime-proven
- External sync becomes unblocked
- LTM proof cycle is initiated

Do not reopen snapshot/restore proof or this event replay proof without a new product trigger.

## 12. Rollback rule

```
git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js
git restore -- docs/governance/LOCAL_EVENT_REPLAY_PROOF_SPEC.md
git restore -- registry/proofpack-index.jsonl
rm -rf proof_packs/POST_SEALED_EVENT_REPLAY_PROVE_2026-03-28_2308_e88264039
```

No Rust code was changed in P1.11. No product rollback needed.
