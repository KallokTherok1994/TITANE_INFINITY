# VALIDATOR PLAN — Chat/Memory Integrity
## TITANE∞ Phase 5 — VALIDATORS-FIRST

**Créé:** 2026-03-16 (suite Phases 0–4)  
**Répertoire:** `scripts/validators/`  
**Stratégie:** 1 validator = 1 règle = 1 cause racine = 1 preuve = read-only

## V1 — validate_chat_commands.sh

| Champ | Valeur |
|---|---|
| **Règle** | Toute commande `active: true` dans `tauriCommands.ts` doit être dans `generate_handler!` |
| **Cause racine** | Commandes déclarées actives sans handler → IPC `Command not found` silencieux |
| **Statut attendu** | **PASS** (après fix des 14 ghosts → active:false) |

## V2 — validate_memory_persistence.sh

| Champ | Valeur |
|---|---|
| **Règle** | `memory_core_state.json::chat_history` non vide si fichier > 100 octets |
| **Cause racine** | chatMemoryCompactor → localStorage disconnect (structural P0) |
| **Statut attendu** | **FAIL** (BLOCKED_STRUCTURAL — nécessite load_conversation_history) |

## V3 — validate_no_send_message_stub.sh

| Champ | Valeur |
|---|---|
| **Règle** | `send_message` registered dans main.rs ne doit pas retourner Ok silencieux |
| **Cause racine** | main.rs:673 Ok("Message processed") → stub silencieux enregistré |
| **Statut attendu** | **PASS** (après fix → Err explicite) |

## V4 — validate_ipc_no_silent_mock.sh

| Champ | Valeur |
|---|---|
| **Règle** | `memory_get` ne retourne pas `Ok(None)` sans log |
| **Cause racine** | memory_commands.rs:47 Ok(None) sans log::warn! |
| **Statut attendu** | **PASS** (après ajout log::warn!) |

## V5 — validate_conversation_id_stable.sh

| Champ | Valeur |
|---|---|
| **Règle** | `useChat.ts` charge conv_id depuis storage, fallback conditionnel |
| **Cause racine** | Fallback conv-${Date.now()} conditionnel sur activeId (correct) |
| **Statut attendu** | **PASS** |

## Runner — run_all_chat_memory_validators.sh

- Lance V1→V5 séquentiellement
- Exit 0 = tous PASS | Exit 1 = FAIL/BLOCKED
