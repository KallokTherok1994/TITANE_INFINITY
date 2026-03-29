# ALIGNMENT_OR_FIXES

## Cycle: P1.11

This cycle is a PROOF cycle (LANE A). No Rust/production code changes applied.

---

## Changes made this cycle

### e2e/desktop/online-chat-proof-ui.wdio.test.js

Added `eventReplayProofTest` (gated by `TITANE_EVENT_REPLAY_PROOF=1`):
- New env var: `runEventReplayProof = process.env.TITANE_EVENT_REPLAY_PROOF === '1'`
- New gate: `eventReplayProofTest = runEventReplayProof ? it : it.skip`
- New test: "proves append-only event emission and replay via Tauri IPC"
  - Calls `titan_persist_event` with module="memory"
  - Calls `titan_get_events_since({ timestamp: 0 })`
  - Calls `titan_load_state` pre and post emit
  - Asserts `total_memories` increments correctly
  - Asserts `events_persisted` counter increments

### docs/governance/LOCAL_EVENT_REPLAY_PROOF_SPEC.md

Created new governance spec for the event replay proof rules.

---

## No production code changes

- src-tauri/src/persistence/commands.rs: NO CHANGE
- src-tauri/src/persistence/mod.rs: NO CHANGE
- src-tauri/src/persistence/database.rs: NO CHANGE
- src-tauri/src/persistence/event_log.rs: NO CHANGE
- src-tauri/src/main.rs: NO CHANGE
- src-tauri/capabilities/persistence.json: NO CHANGE

The event path was already correct. The only gap was the absence of a runtime proof harness.

---

## Deferred items

| Item | Reason deferred |
|------|-----------------|
| Other module reducers ("xp", "progress", etc.) | Not required for current scope |
| Event idempotence runtime test | UUID collision risk negligible |
| External sync | BLOCKED_ENV |
| LTM layer proof | Out of scope (mock mode) |
| Full-feature build (7 errors) | Pre-existing, unrelated |
| events.json compaction | No overflow risk yet (3 events) |
