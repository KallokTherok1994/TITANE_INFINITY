# 04_EXTERNAL_SYNC_PATH_MAP

## External Sync Path (When Configured)

```
User Action → SyncConfig UI → tauriClient.cloudUpdateConfig()
    → [Tauri IPC] → persistence/commands.rs → Option1SyncService
    → sync_now() → TURSO_ENDPOINT → External Turso DB
    ← sync_ok / sync_error
```

## Current State (No Config)

```
User Action → SyncConfig UI → handleSave()
    → mode=auto → BLOCKED (UI disabled)
    → mode=manual → tauriClient.cloudUpdateConfig() → backend=local_folder
    → [No external target configured]
```

## Readback Path (If Configured)

```
External Turso DB → Option1SyncService.pull() → local_db merge
    → conversation_os_v1.db queries → load_conversation_history()
    → UI restoration
```

## Current Readback State
Not applicable — no external target configured.

## Failure Modes
1. Missing TURSO env vars → SYNC_MISSING_CONFIG
2. Service unreachable → timeout / connection refused
3. Auth invalid → 401 / permission denied
4. Network blocked → One Door governance (policy_engine)
