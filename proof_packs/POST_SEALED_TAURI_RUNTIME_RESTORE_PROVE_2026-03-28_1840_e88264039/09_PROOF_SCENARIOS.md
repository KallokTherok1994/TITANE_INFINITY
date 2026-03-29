# PROOF_SCENARIOS

## Scenario matrix

### Scenario A: Cold start (preSnapshots=0)
- Condition: DB empty, no prior snapshots
- Path: titan_force_snapshot_current → emit default state → load → prove
- Observed: Run 1 — preSnapshots=0, postSnapshots=2
  - titan_force_snapshot_current → snapshot 1 (default state)
  - titan_force_snapshot(baselineJson) → snapshot 2 (baseline)
  - titan_recover_state → matches snapshot 2
  - Hash: d161cf82... ✓
- Status: PROVEN

### Scenario B: Warm start (preSnapshots>0)
- Condition: DB already has snapshots from prior run
- Path: titan_load_state → load existing → skip force_snapshot_current → prove
- Observed: Run 2 (preSnapshots=2→3), Run 3 retry (preSnapshots=3→4)
  - titan_load_state returns existing baselineState (not null)
  - Skips titan_force_snapshot_current branch
  - titan_force_snapshot(baselineJson) → one new snapshot
  - titan_recover_state → matches
  - Hash: d161cf82... ✓ (same state persisted from run 1)
- Status: PROVEN

### Scenario C: WRY session invalidation (non-persistence failure)
- Condition: WRY WebView session becomes invalid mid-run
- Path: chat passes, session drops before restore test
- Observed: Run 3 — singleTurnTest PASS, restoreProofTest FAIL (session invalid)
- Root cause: Pre-existing WRY instability (~25% rate)
- Persistence verdict: NOT A PERSISTENCE FAILURE
- Recovery: Retry (Run 3 retry) passed all assertions
- Status: CLASSIFIED (environment/WRY, not persistence)

### Scenario D: External sync (BLOCKED_ENV)
- Condition: TURSO_URL not set, SYNC_TOKEN not set
- Path: External sync adapter → ENV check → BLOCKED
- Observed: ENV check confirms vars absent in all runs
- Impact: External sync path not exercised
- Status: BLOCKED_ENV — boundary documented, not a regression

### Scenario E: Event log (WIRED_BUT_UNPROVEN)
- Condition: No titan_persist_event calls in restore harness
- Path: events.json stays at 0 entries
- Observed: events_persisted=0 in all runs, events.json empty
- Impact: Append-only event path is wired in code but not exercised
- Status: WIRED_BUT_UNPROVEN — separate future cycle

---

## Scenario coverage summary

| Scenario | Type | Status |
|----------|------|--------|
| A: Cold start | Happy path | PROVEN |
| B: Warm start | Happy path (persistent state) | PROVEN |
| C: WRY session drop | Env failure | CLASSIFIED non-persistence |
| D: External sync | Env boundary | BLOCKED_ENV |
| E: Event log | Untested path | WIRED_BUT_UNPROVEN |
