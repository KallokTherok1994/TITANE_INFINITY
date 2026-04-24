# 02 — FINAL SOURCE OF TRUTH MATRIX

| Donnée                  | Propriétaire réel                            | Fallback autorisé                      | Mode restore                  | Mode invalidation   | Déduplication       | Confiance |
| ----------------------- | -------------------------------------------- | -------------------------------------- | ----------------------------- | ------------------- | ------------------- | --------- |
| transcript_ui           | React state (messages)                       | localStorage (tier 1), SQLite (tier 2) | useEffect backend-restore     | conversation switch | role+ts+content key | HIGH      |
| transcript_localStorage | conversationStorage.ts                       | SQLite backend                         | loadConversationSync          | localStorage clear  | none (single write) | MEDIUM    |
| transcript_sqlite       | events table                                 | none                                   | load_conversation_history IPC | n/a (append-only)   | by event id PK      | HIGH      |
| conversation_id         | localStorage (titane_active_conversation_id) | list_restorable_conversations          | readActiveConversationId      | localStorage clear  | n/a                 | MEDIUM    |
| memory_session          | chatMemoryCompactor (localStorage)           | none                                   | none (session only)           | session end         | by timestamp        | LOW       |
| memory_ltm              | LTM module (disabled by default)             | UNKNOWN                                | UNKNOWN                       | n/a                 | UNKNOWN             | UNKNOWN   |
| memory_important        | memoryService (backend)                      | none                                   | memory_get IPC                | explicit delete     | n/a                 | MEDIUM    |
| provider_config         | localStorage/config                          | default Ollama                         | n/a                           | explicit change     | n/a                 | HIGH      |

## Contradictions identifiées

- NONE après patches (aucune source ne masque une autre silencieusement)

## Sources UI-ONLY déclarées

- Indicateur "online/offline" = UI state only, pas de IPC de vérification permanente
