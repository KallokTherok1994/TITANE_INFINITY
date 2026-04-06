# 04 — MEMORY CLASSIFICATION

## Architecture mémoire

### STM (Short-Term Memory)
- **Implémentation** : useState/useRef dans useChat.ts + useChatCore.ts
- **Couche Rust** : ImmediateMemory dans MultiLayerMemoryManager (multilayer_memory.rs)
- **Portée** : session UI courante uniquement
- **Persistence** : AUCUNE — perte au refresh
- **Verdict** : **PARTIAL** — réel pour la session, non persistent

### MTM (Medium-Term Memory)
- **Implémentation** : chatMemoryCompactor.ts
- **Storage** : localStorage via clé `titane_chat_mode_<mode>`
- **Comportement** : compaction si >30 messages → garde 20
- **Portée** : par mode (default, coach, brainstorming, etc.)
- **Persistence** : localStorage (survit au refresh, perdu si clear)
- **Verdict** : **PARTIAL** — real write path prouvé (localStorage.setItem ligne 174), pas de sync backend

### LTM (Long-Term Memory)
- **Implémentation frontend** : useLTMContext.ts → chatService.loadConversationHistory()
- **Implémentation backend** : load_conversation_history() (commands.rs ligne 509)
- **Storage** : SQLite `conversation_os_v1.db`
- **Injection AI** : OUI — history injectée dans ConversationRequest.history (lignes 509-543 commands.rs)
- **Flag** : CONVOS_MEMORY_LTM défaut=false MAIS le chargement SQLite est **inconditional** (PATCH-012: "Always load (not gated by LTM flag)")
- **UI display** : useLTMContext via chatService.loadConversationHistory()
- **Verdict** : **PROVEN** (écriture SQLite prouvée via persist_conversation_os_artifacts, lecture prouvée via load_conversation_history toujours appelée)

### Snapshot
- **Backend** : `convos_memory_snapshots_enabled` défaut=true (commands.rs ligne 227)
- **Code** : persist_snapshot appelé si flag actif (lignes 821, 1056 commands.rs)
- **Verdict** : **PARTIAL** — code présent, non testé en runtime ici

### Memory Stats
- **Frontend** : chatMemoryCompactor.getStats() → localStorage scan
- **Backend** : conversation_memory_stats command enregistrée (main.rs)
- **Verdict** : **PARTIAL** — stats calculées mais non prouvées comme alimentant UI en runtime

### MultiLayerMemoryManager (Rust)
- **Couches** : immediate, episodic, semantic, procedural, reflective
- **Usage dans pipeline** : MemoryEngine utilisé dans conversation_generate (RouterEngine, PolicyEngine, MemoryEngine)
- **Verdict** : **PARTIAL** — structure complète (1019 lignes), intégration OMEGA confirmée par code, runtime non prouvé

## MEMORY_CLASSIFICATION_MATRIX

| Unité | Fichier(s) | Chemin écriture | Chemin lecture | Persistence | Preuve runtime | Verdict |
|-------|-----------|-----------------|----------------|-------------|----------------|---------|
| STM (session) | useChat.ts, useChatCore.ts | useState setMessages | messages state | Session RAM | — | PARTIAL |
| MTM (compactor) | chatMemoryCompactor.ts | localStorage.setItem(titane_chat_mode_*) | localStorage.getItem | localStorage | Ligne 174 | PARTIAL |
| LTM (SQLite) | commands.rs, useLTMContext.ts | persist_conversation_os_artifacts() | load_conversation_history() | SQLite | Lignes 509-543 | PROVEN |
| Snapshot | commands.rs | persist_snapshot() | db_get_snapshot | SQLite | Flag=true par défaut | PARTIAL |
| Memory stats | chatMemoryCompactor.ts | Calculé | getStats() | — | — | PARTIAL |
| MultiLayer Rust | multilayer_memory.rs | analyze_memory_layers() | mémoire objet | RAM session | Structure vérifiée | PARTIAL |

## MEMORY_SCOPE_MATRIX

| Unité mémoire | Portée | Isolation | Risque de fuite | Statut |
|---------------|--------|-----------|-----------------|--------|
| STM | conversation courante (session) | Oui (React state) | Faible | PARTIAL |
| MTM | par mode chat | Oui (clé localStorage préfixée) | Faible | PARTIAL |
| LTM SQLite | par conversation_id | Oui (indexé par conv_id) | Faible | PROVEN |
| Snapshot | par conv_id + req_id | Oui (indexé) | Faible | PARTIAL |
| moduleContext localStorage | global (par clé fixe) | Non — écrasé à chaque navigation | MOYEN | PARTIAL |
