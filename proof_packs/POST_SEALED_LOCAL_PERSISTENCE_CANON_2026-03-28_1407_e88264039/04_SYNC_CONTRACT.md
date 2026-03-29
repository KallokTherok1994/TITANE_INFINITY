# SYNC_CONTRACT

## Canonical sync contract
- Chat/orchestrator writes: Conversation OS v1 append‑only events/snapshots.
- Provider decisions/sources: append‑only in Conversation OS v1.
- Memory snapshots: append‑only if `CONVOS_MEMORY_SNAPSHOTS=true`.
- Modules/engines: must emit canonical events via Option1 events or be explicitly mapped.
- Derived views: read from canonical stores only.
- Sync completion: Option1SyncService `sync_now` requires TURSO env; otherwise explicit SYNC_MISSING_CONFIG.
- Failure semantics: no silent success; last_sync_ok must reflect failures.
- Replay semantics: Option1 events ordered by ts; conversation_os events ordered by ts/session.
