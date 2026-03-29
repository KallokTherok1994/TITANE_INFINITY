# SYNC_CLASSIFICATION

| Sync Type | Owner | Proof Source | Status | Contradiction/Risk | Action |
|-----------|-------|-------------|--------|-------------------|--------|
| Chat sync (local session) | conversationEngine.ts | E2E test | PROVEN | None | No action needed |
| Orchestrator sync (local) | conversation_engine/commands.rs | Prior audit | PROVEN | None | No action needed |
| Module/engine sync (local) | SingularityEngine | Prior audit | PARTIAL | Full-build broken | Track full-build errors |
| Local persistence sync | PERSISTENCE_ENGINE | This cycle | PROVEN | snapshots_created was 0 — FIXED | Fix applied |
| External sync (Turso/cloud) | Not wired | ENV check | BLOCKED_ENV | TURSO_URL missing | No action — env missing |

## External Sync Detail
- TURSO_URL: not set
- SYNC_TOKEN: not set
- External sync requires these env vars to be present
- Classification: BLOCKED_ENV (honest — no env, no proof, no claim)

## Chat Sync
- Local Ollama lane: PROVEN (prior cycles)
- Online/API lane: PROVEN (E2E harness)

## Persistence Sync
- Local SQLite snapshots + event log: PROVEN (this cycle)
- External backup/export: WIRED_BUT_UNPROVEN (backup module exists, not tested this cycle)
