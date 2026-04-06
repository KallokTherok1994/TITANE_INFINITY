# 07_SOURCE_OF_TRUTH_MATRIX

| Donnée | Source of Truth | Backup | Récupérable | Label |
|---|---|---|---|---|
| Historique chat UI | localStorage | Aucun | Non si clear | UI_ONLY_VOLATILE |
| Historique chat backend | SQLite conversation_os_v1.db | Aucun | Oui (si LTM actif) mais pas depuis UI | BACKEND_ONLY_INACCESSIBLE |
| conversation_id actif | conversationStorage (localStorage) | Aucun | Non si clear | UI_ONLY_VOLATILE |
| Configuration AI provider | localStorage omega-chat-preferred-provider | Aucun | Non si clear | UI_ONLY_VOLATILE |
| Mémoire persistante | PersistentMemory JSON chiffré | Aucun | Oui via IPC | PARTIAL_PROVEN |
| Logs boot système | memory_core_state.json | Git | Oui | PROVEN |
| Chat history dans memory_core_state | N/A — chat_history=[] | N/A | N/A | BROKEN_ALWAYS_EMPTY |
