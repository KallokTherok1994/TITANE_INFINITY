# 09_IPC_DRIFT_REPORT

## DRIFT_LEVEL: CRITIQUE → RÉDUIT (après patches)

### Avant patches
- send_message: doublon stub (chat.rs:Err + main.rs:Ok silencieux) → BROKEN
- 14 ghost commands: active:true sans handler → IPC Command not found silencieux
- memory_get: Ok(None) sans log → perte invisible

### Après patches
- send_message main.rs: Err explicit + log::warn! → FIXED
- 14 ghost commands: active:false + commentaire GHOST → FIXED
- memory_get: log::warn! ajouté → FIXED

### Drift structurel restant
- localStorage ↔ memory_core_state.json::chat_history: DISCONNECT PERMANENT
- SQLite backend ↔ UI: PAS DE COMMANDE RELOAD → BLOCKED_STRUCTURAL
- LTM: DISABLED_BY_DEFAULT → DOC_ONLY
