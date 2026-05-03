# MEMORY COMMAND TRUTH

## Rust Command Registration (src-tauri/src/main.rs)
Lines 2124-2135 — all 12 persistent_memory commands registered via `persistent_memory_v19::*`:
```
persistent_memory_read        ← was MISSING from TS whitelist
persistent_memory_get_stats   ← was in whitelist
persistent_memory_get_bundles ← was MISSING from TS whitelist
persistent_memory_get_context ← was in whitelist
persistent_memory_write_entry ← was in whitelist
persistent_memory_create_summary
persistent_memory_create_bundle
persistent_memory_export
persistent_memory_promote_entry
persistent_memory_archive_entry
persistent_memory_delete_entry
persistent_memory_add_to_bundle
```

## Module Path
```
main.rs:79  mod persistent_memory_v19 {
main.rs:80    include!("commands/persistent_memory.rs");
main.rs:81  }
```

## TS Constants (src/lib/tauriCommands.ts)
```typescript
PERSISTENT_MEMORY_READ: 'persistent_memory_read',        // present
PERSISTENT_MEMORY_GET_BUNDLES: 'persistent_memory_get_bundles', // present
```

## Security Whitelist (src/lib/security.ts) — AFTER PATCH
```
'persistent_memory_read',         // ADDED by this fix
'persistent_memory_get_bundles',  // ADDED by this fix
'persistent_memory_get_context',
'persistent_memory_get_stats',
'persistent_memory_write_entry',
...
```

## Verdict: G_MEMORY_COMMANDS_FOUND = PASS
All Rust commands exist and are registered.
Whitelist gap was the only blocker.
