# 07 — IPC COMMAND PARITY

## IPC_PARITY_MATRIX

| Frontend (invoke)           | Commande Tauri              | Wrapper canonique                     | Dérive?                            | Enregistré main.rs?       | Statut                           |
| --------------------------- | --------------------------- | ------------------------------------- | ---------------------------------- | ------------------------- | -------------------------------- |
| `conversation_generate`     | `conversation_generate`     | invokeWithRetry + validateIpcPayload  | Aucune                             | OUI (ligne 1337)          | PASS                             |
| `chat_stream_message`       | `chat_stream_message`       | invokeWithRetry                       | Aucune                             | OUI (ligne 1344)          | PASS                             |
| `load_conversation_history` | `load_conversation_history` | chatService.loadConversationHistory() | Aucune                             | OUI (ligne 1342)          | PASS                             |
| `create_new_conversation`   | `create_new_conversation`   | chatService.createConversation()      | Aucune                             | OUI (ligne 1336)          | PASS                             |
| `chat_get_providers_status` | `chat_get_providers_status` | —                                     | Aucune                             | OUI (overdrive + main.rs) | PASS                             |
| `chat_create_conversation`  | `chat_create_conversation`  | —                                     | Aucune                             | OUI (overdrive)           | PASS                             |
| `send_message`              | `send_message`              | main.rs direct                        | **STUB** — retourne Err, log::warn | OUI mais STUB (ligne 699) | FAIL (stub)                      |
| `twin_get_state`            | `twin_get_state`            | lib/security.ts whitelist             | —                                  | OUI (main.rs ligne 1972)  | PASS (mais non utilisé par chat) |
| `ollama_query`              | `ollama_query`              | —                                     | Aucune                             | OUI                       | PASS                             |

## Constats

1. **`conversation_generate`** : parité complète frontend ↔ backend. Commande principale. PASS.
2. **`chat_stream_message`** : parité complète. Commande streaming. PASS.
3. **`send_message`** : STUB connu et documenté (main.rs ligne 699: "STUB: send_message is not implemented. Use conversation_generate instead."). Risque : un appelant ignorant pourrait invoquer ce stub. Non exposé comme chemin prod normal.
4. **Dérive de nommage** : aucune dérive détectée entre noms frontend et backend pour les commandes actives.
5. **ipcContract.ts** : schéma Zod pour `conversation_generate` validé côté frontend avant invoke.

## Stub send_message — Analyse de risque

- Chemin actif: NON (main.rs log::warn + return Err)
- Capabilité exposée: chat_ai.json NE liste PAS `send_message` → exposition capability = 0
- Risque: **FAIBLE** — stub documenté, non exposé en capability, warn logué
