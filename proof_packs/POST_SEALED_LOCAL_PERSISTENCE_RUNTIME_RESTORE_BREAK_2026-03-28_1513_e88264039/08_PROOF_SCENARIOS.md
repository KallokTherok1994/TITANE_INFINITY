# PROOF_SCENARIOS

Scenario A — Chat write persist recheck: PROVEN.
- Evidence: events table count=4042, recent event IDs with max_ts=1774724296161.

Scenario B — Memory write persist recheck: PARTIAL.
- Evidence: WDIO memory UI shows ORIONTURNRUN1/ALICETURNRUN1/AZURTURNRUN1 entries in run3; LTM derived store (unified_memory.db) remains empty.

Scenario C — Restart survival: PARTIAL.
- Evidence: separate canary runs (run1/run3) show persisted memory and new events; run2 failed due to session crash.

Scenario D — Snapshot/restore: BLOCKED.
- Evidence: snapshots table populated (count=2021); restore path not executed (no harness).

Scenario E — Sync contract runtime: PARTIAL/BLOCKED.
- Evidence: provider_decisions append exists; external sync config missing (no TURSO env).

Scenario F — No-loss check: BLOCKED.
- Evidence: restore not executed; no-loss comparison not possible.
