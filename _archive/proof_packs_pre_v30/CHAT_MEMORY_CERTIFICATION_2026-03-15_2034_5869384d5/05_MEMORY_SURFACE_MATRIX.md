# 05_MEMORY_SURFACE_MATRIX

| Type | Format | Chemin | Créateur | Lecteur | Restore | STATUT |
|---|---|---|---|---|---|---|
| Chat UI immediate | localStorage | titane_chat_mode_* | chatMemoryCompactor | useChatMemory | Auto on mode change | PROVEN |
| Conversation engine SQLite | SQLite WAL | ~/.local/share/TITANE_INFINITY/runtime/memory/conversation_os_v1.db | MemoryEngine | AUCUN frontend | ABSENT (no load cmd) | PARTIAL |
| memory_core_state.json | JSON | memory/memory_core_state.json | write_log (boot) | backendV17.memory | Non applicable | BROKEN (chat_history=[]) |
| PersistentMemory 3-niveaux | JSON AES-256-GCM | app_data_dir/persistent_memory/ | persistent_memory_write_entry | persistent_memory_read | persistent_memory_get_context | PARTIAL |
| memoryStore (Zustand) | In-memory RAM | — | backendV17.memory.* | useMemoryStore | fetchState() | PARTIAL |
| titan_persistence SQLite | SQLite WAL + EventLog | app_data_dir/titan_persistence.db | titan_persist_event | titan_load_state | titan_recover_state | PARTIAL |
| memory/cognitive.json | JSON | memory/cognitive.json | cognitive engine | Unknown | Unknown | DOC_ONLY |
| LTM (long-term memory) | SQLite/JSON | conversation_os_v1.db LTM table | MemoryEngine (disabled) | N/A | N/A | ABSENT (env disabled) |
