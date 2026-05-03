# MATRICE CHAT IA

## Tableau de certification

| UI action | frontend file | invoke wrapper | tauri command | backend handler | orchestrator | provider selected | provider actually used | memory read | memory write | fallback path | user-visible meta | truth consistency | defect class | patch applied | rerun verdict | proof_ref |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Saisir et envoyer message (ChatPage) | ChatPage.tsx | AUCUN — zone messages vide | N/A | N/A | N/A | ollama (défaut) | N/A | N/A | N/A | N/A | N/A | FAIL — UI sans rendu messages | D02 | NON | FAIL | ChatPage.tsx:~83-87 |
| invoke conversation_generate | services/tauriCommands.ts | secureInvoke | conversation_generate | ConversationEngineState.process_message() | AIRouter | provider_preference enum | Ollama si dispo / Gemini fallback | ConversationMemory SQLite | ConversationMemory SQLite | local→cloud si ollama indispo | {assistant_message, network_used, provider_used, reason_code} | VRAI si provider actif | Aucun (si runtime OK) | NON | BLOCKED_RUNTIME | conv_engine/commands.rs:~177, main.rs:~1272 |
| invoke send_message | legacy frontend | invoke('send_message') | send_message | commands/chat.rs:~8 | AUCUN (stub bypasse tout) | N/A | N/A | NON | NON | AUCUN | `{ ok: true, content: "response" }` | FAIL — stub hardcodé identique à chaque appel | D01 | NON | FAIL | commands/chat.rs:~40 |
| chat_stream_message | N/A | invoke | chat_stream_message | overdrive/chat_orchestrator.rs | ChatOrchestratorState | auto/gemini/ollama | BLOCKED_RUNTIME | ConversationMemory | ConversationMemory | ollama→gemini si clé | streaming events | VRAI structurellement | Aucun | NON | BLOCKED_RUNTIME | chat_orchestrator.rs |

---

## Vérifications obligatoires

### displayed provider == actual provider used
**BLOCKED_RUNTIME** — Le ChatsProviderSelector affiche les providers disponibles,
mais sans runtime actif on ne peut pas vérifier quelle route est réellement utilisée.
Structurellement : conversation_generate retourne `provider_used` dans la réponse → cohérent.

### displayed mode == actual runtime path
**BLOCKED_RUNTIME** — Non vérifiable sans runtime.

### displayed network_used == actual runtime network state
**BLOCKED_RUNTIME** — ConversationResponse contient `network_used` et `reason_code`.
Structure correcte mais valeurs non vérifiables sans runtime.

### displayed memory == actual memory access state
**PARTIAL** — ConversationMemory (SQLite rusqlite bundled) existe et est initialisé.
Accès réel non vérifiable sans runtime.

### fallback messaging must not lie
**PARTIAL** — AIRouter implémente local→cloud fallback avec reason_code explicite.
Comportement non vérifiable sans runtime.

### timeout must not masquerade as success
**BLOCKED_RUNTIME** — Timeout handlers dans conversation_generate : non vérifiable.

### blocked provider must not appear "connected"
**BLOCKED_RUNTIME** — chat_get_providers_status existe et est enregistré.
Logique de vérification présente mais non vérifiable sans runtime.
