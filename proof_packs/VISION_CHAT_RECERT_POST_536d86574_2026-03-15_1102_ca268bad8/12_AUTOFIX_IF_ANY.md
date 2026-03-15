# 12_AUTOFIX_IF_ANY

## Defect D_NEW_IPC_DEAD_GENERATE — AUTOFIX APPLIQUÉ

**Cause singulière prouvée:**
`generate_response` défini dans `mock_commands.rs` et `chat_engine/commands.rs` mais absent de `generate_handler![]` dans `main.rs`.
Toute invocation Tauri de 'generate_response' retourne erreur "command not found".

**Patch appliqué (minimal):**
```rust
// src-tauri/src/main.rs — dans generate_handler![]
#[cfg(feature = "mock")]
mock_commands::generate_response,
#[cfg(all(not(feature = "mock"), feature = "full"))]
chat_engine::commands::generate_response,
```
+ import ajouté:
```rust
#[cfg(feature = "mock")]
use titane_infinity::mock_commands;
```

**Vérification:** `cargo check EXIT=0`
**Rollback:** `git restore -- src-tauri/src/main.rs`
**AutoHeal:** AH-2026-03-15-IPC-003 ajouté dans autoheal_rules.jsonl
**detect_recurrence.sh:** PASS
**verify_instructions.sh:** PASS=20 FAIL=0
