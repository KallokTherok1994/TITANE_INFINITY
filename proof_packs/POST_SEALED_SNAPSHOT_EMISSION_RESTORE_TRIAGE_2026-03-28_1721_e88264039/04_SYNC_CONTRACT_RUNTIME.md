# SYNC_CONTRACT_RUNTIME

- Chat sync: PARTIAL (local events + UI evidence; restore not exercised).
- Orchestrator sync: PARTIAL (provider_decisions append in prior pack; not revalidated after restore).
- Module/engine sync: UNKNOWN (no runtime proof in this cycle).
- External sync: BLOCKED_ENV (no TURSO/SYNC env config detected).

Contract properties
- Canonical write owner: Conversation OS v1 + persistence engine.
- Append-only event path: conversation_os_v1.db events; titan_events.db for persistence engine.
- Derived view update: memory UI, dashboard, search index (derived).
- Failure semantics: missing external config -> SYNC_MISSING_CONFIG/BLOCKED_ENV.
