# SYNC CONTRACT RUNTIME

Runtime contract (current evidence):
- Chat writes canonical events to events table.
- Orchestrator writes provider decisions to provider_decisions.
- Snapshots capture derived memory state per request.
- Modules/engines must emit canonical events; no parallel truth path observed in this cycle.
- Sync completion is event append + snapshot append + derived view update.

Observed runtime evidence:
- events and provider_decisions updated at 2026-03-28 14:29:08 EDT.
- snapshots updated at 2026-03-28 14:29:08 EDT.

Status: PARTIAL (module/engine sync not proven).
