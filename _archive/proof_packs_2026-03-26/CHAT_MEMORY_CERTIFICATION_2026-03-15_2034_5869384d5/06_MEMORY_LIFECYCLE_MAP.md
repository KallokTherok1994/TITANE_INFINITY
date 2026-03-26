# 06_MEMORY_LIFECYCLE_MAP

## Cycle de vie mémoire chat

1. **MESSAGE ENVOYÉ** → useChat.ts → ChatService → IPC conversation_generate
2. **STOCKAGE UI** → chatMemoryCompactor.saveForMode() → localStorage['titane_chat_mode_*']
3. **STOCKAGE BACKEND** → MemoryEngine::decide_memory_strategy() → SQLite conversation_os_v1.db (si LTM activé)
4. **RESTART** → localStorage conservé (si même navigateur) → SQLite non rechargé en UI
5. **RESTORE** → localStorage.getItem('titane_chat_mode_*') → messages affichés — PARTIAL
6. **CRASH** → localStorage peut perdre les dernières entrées non flushées — RISK P0

## Gaps identifiés
- STEP 3: LTM désactivé par défaut → écriture SQLite conditionnelle
- STEP 4: Pas de commande load_conversation_history → SQLite données inaccessibles depuis UI
- STEP 5: Restore depuis localStorage seulement → perte si clear/crash
- STEP 6: flushPendingSaves() appelé à chaque save (v26.4.0) → mitige mais ne garantit pas
