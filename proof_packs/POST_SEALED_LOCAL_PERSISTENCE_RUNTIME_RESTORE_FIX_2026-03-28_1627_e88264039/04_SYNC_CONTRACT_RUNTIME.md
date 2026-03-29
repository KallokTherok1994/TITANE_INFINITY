# SYNC_CONTRACT_RUNTIME

## Runtime sync contract status
- Chat -> canonical events: PROVEN (prior runtime proof pack).
- Orchestrator -> provider_decisions: PARTIAL (not revalidated here).
- Modules/engines -> canonical events: UNKNOWN (no runtime proof).
- External sync (Option1/TURSO): BLOCKED_ENV (no config detected).

## Notes
- External sync must not be claimed without TURSO/Option1 configuration and runtime proof.
- Local-only sync remains partial for this cycle due to restore/no-loss block.
