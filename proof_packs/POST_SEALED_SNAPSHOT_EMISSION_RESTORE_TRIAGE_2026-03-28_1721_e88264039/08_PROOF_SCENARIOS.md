# PROOF_SCENARIOS

Scenario A — Snapshot emission: BLOCKED
- Run2/Run3: IPC titan_force_snapshot_current failed (requires full backend).

Scenario B — Snapshot/Restore: BLOCKED
- No restorable snapshot produced.

Scenario C — No-loss check: BLOCKED
- Restore blocked by snapshot emission.

Scenario D — Chat write persist recheck: PARTIAL
- Run2/Run3 show chat + memory UI entries prior to restore attempt.

Scenario E — Memory write persist recheck: PARTIAL
- Memory UI shows entries; restore not executed.

Scenario F — Sync contract runtime: PARTIAL
- Local-only evidence; external sync BLOCKED_ENV (no TURSO/SYNC env).
