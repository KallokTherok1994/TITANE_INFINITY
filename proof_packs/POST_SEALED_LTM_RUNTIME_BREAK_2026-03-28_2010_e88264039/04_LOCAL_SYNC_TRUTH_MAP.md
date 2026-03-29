# LOCAL SYNC TRUTH MAP — P1.13

## Chat Sync

| Component | Path | Status | Proof |
|-----------|------|--------|-------|
| Chat events | conversation_os_v1.db events table | PROVEN | Append-only, runtime verified |
| Chat snapshots | conversation_os_v1.db snapshots table | PROVEN | Runtime verified |
| Chat IPC | titan_persist_event | PROVEN | E2E tested |
| Chat memory injection | conversationEngine.ts → persistentMemoryGetContext() | WIRED | Connects to providers |

## Orchestrator Sync

| Component | Path | Status | Proof |
|-----------|------|--------|-------|
| Provider decisions | conversation_os_v1.db provider_decisions | PROVEN | Append-only |
| Omega classifier | omegaModeClassifier.ts | PROVEN | 43 evals pass |
| Mode routing | conversationEngine.ts | PROVEN | Runtime verified |

## Module/Engine Sync

| Component | Path | Status | Proof |
|-----------|------|--------|-------|
| Memory reducer | event replay → SingularityState | PROVEN | Multi-reducer replay |
| XP reducer | event replay → SingularityState | PROVEN | Multi-reducer replay |
| Progress reducer | event replay → SingularityState | PROVEN | Multi-reducer replay |
| Knowledge reducer | event replay → SingularityState | PROVEN | Multi-reducer replay |
| Settings reducer | event replay → SingularityState | PROVEN | Multi-reducer replay |

## Local Persistence Sync

| Component | Path | Status | Proof |
|-----------|------|--------|-------|
| Event persistence | titan_events.events.json | PROVEN | Atomic write via .tmp rename |
| Snapshot persistence | titan_events.snapshots.json | PROVEN | Runtime verified |
| Conversation OS | conversation_os_v1.db | PROVEN | 503KB, runtime verified |
| Backup engine | TITANE_INFINITY/persistence/ | PROVEN | Export/restore verified |

## LTM Sync

| Component | Path | Status | Proof |
|-----------|------|--------|-------|
| TypeScript LTM write | UnifiedMemoryService (in-memory) | PARTIAL | In-memory only, no disk |
| TypeScript LTM recall | UnifiedMemoryService.recall() | PARTIAL | In-memory search only |
| TypeScript LTM injection | MemoryBridge.buildInjection() | WIRED | Creates prompt context |
| Rust LTM disk | memory_os/ltm.rs | BROKEN | Exists but not wired to TS |
| Rust LTM persistence | unified_memory_v2/persistence.rs | BROKEN | Exists but not wired to TS |
| LTM restart survival | NONE | BROKEN | All LTM lost on restart |

## External Sync

| Component | Path | Status | Proof |
|-----------|------|--------|-------|
| Turso config | TURSO_DATABASE_URL/TURSO_AUTH_TOKEN | BLOCKED_ENV | Not configured |
| Option1 sync service | sync_service.rs | WIRED | Requires TURSO config |

## Blocked Environment Boundaries

- TURSO_DATABASE_URL: NOT SET
- TURSO_AUTH_TOKEN: NOT SET
- Result: BLOCKED_ENV for all external sync operations
- Classification: HONEST — do not infer sync closure from local-only evidence