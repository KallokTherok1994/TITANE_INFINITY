# 15_PATCH_PLAN

## Ordre de correction appliqué (kernel mandate)

1. boot truth ✅ (Phase 0)
2. command truth ✅ (Phase 4 + patches V1/V3)
3. persistence truth → BLOCKED_STRUCTURAL (V2: load_conversation_history manquant)
4. restore truth → BLOCKED (dépend #3)
5. transcript truth → BLOCKED (dépend #3)
6. memory truth → PARTIAL (V4 fixed, V2 structural)
7. chat continuity truth → PARTIAL
8. intelligence upgrades → BLOCKED (dépend vérité du noyau)
9. observability upgrades → PARTIAL (log::warn! ajouté, ghost cmds documentés)

## Patches P0/P1 appliqués

### PATCH-001: send_message stub silencieux (P0)
- RING: R2
- FICHIER: src-tauri/src/main.rs:699-701
- BEFORE: Ok("Message processed")
- AFTER: Err("send_message not implemented — use conversation_generate") + log::warn!
- ROLLBACK: `git restore src-tauri/src/main.rs`

### PATCH-002: memory_get Ok(None) sans log (P1)
- RING: R3
- FICHIER: src-tauri/src/commands/memory_commands.rs:47
- BEFORE: Ok(None)
- AFTER: log::warn! + Ok(None)
- ROLLBACK: `git restore src-tauri/src/commands/memory_commands.rs`

### PATCH-003: 14 ghost commands active:true→false (P1)
- RING: R2
- FICHIER: src/services/tauriCommands.ts
- BEFORE: active: true (14 entrées)
- AFTER: active: false + commentaire GHOST
- ROLLBACK: `git restore src/services/tauriCommands.ts`

### PATCH-004: 5 validators + runner créés (NEW)
- RING: R4 (scripts)
- FICHIERS: scripts/validators/*.sh
- ROLLBACK: `git restore scripts/validators/`
