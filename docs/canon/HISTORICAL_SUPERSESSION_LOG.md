# HISTORICAL_SUPERSESSION_LOG.md — Journal de Supersession Historique

**Version:** 28.0.0 | **SHA:** c59e9b5b3 | **Date:** 2026-03-15T13:32:00Z
**Classification:** CANON — append-only

---

## Éléments Supersédés

### H001 — handlers_v14.rs / handlers_v16.rs → main.rs v28

| Attribut | Valeur |
|----------|--------|
| ID | H001 |
| Élément supersédé | Blocs invoke_handler dans `src-tauri/src/handlers.rs` (v14, v16) |
| Remplacé par | `src-tauri/src/main.rs` invoke_handler v28 (401 cmds @ SHA c59e9b5b3 / 408 actuel) |
| Raison | Architecture v28 — consolidation dans main.rs unique |
| Statut | SUPERSEDED — blocs legacy présents mais normalement inactifs |
| Risque résiduel | **C003** OPEN — shadowing si blocs legacy encore compilés |
| Action | cargo check --workspace pour confirmer |

---

### H002 — chat_send_message → conversation_generate

| Attribut | Valeur |
|----------|--------|
| ID | H002 |
| Élément supersédé | Commande `chat_send_message` |
| Remplacé par | `conversation_generate` (conversation_engine::commands) |
| Version suppression | v27.0.5-prod |
| Note code | `// [RETRAIT v27.0.5-prod] chat_send_message removed (legacy)` (main.rs l. 1277) |
| Statut | REMOVED — non présent dans generate_handler |

---

### H003 — voice_synthesize_speech → speak()

| Attribut | Valeur |
|----------|--------|
| ID | H003 |
| Élément supersédé | `voice_synthesize_speech` command |
| Remplacé par | `speak()` dans `ai_chat.rs` (audio::commands::speak) |
| Note code | `// voice_synthesize_speech deprecated - use speak()` (main.rs l. 1302) |
| Statut | DEPRECATED |

---

### H004 — REGISTRY_APPEND_TITANE_FINAL.jsonl → registry/*.jsonl

| Attribut | Valeur |
|----------|--------|
| ID | H004 |
| Élément supersédé | `registry/REGISTRY_APPEND_TITANE_FINAL.jsonl` |
| Remplacé par | `registry/repo-events.jsonl`, `registry/ui-events.jsonl`, `registry/autofix-autoheal-rules.jsonl` |
| Raison | Centralisation → distribution par domaine |
| Statut | LEGACY — fichier présent mais ne plus utiliser comme source active |

---

### H005 — REGISTRY_APPEND_TITANE_Ω∞.jsonl → registry/*.jsonl

| Attribut | Valeur |
|----------|--------|
| ID | H005 |
| Élément supersédé | `registry/REGISTRY_APPEND_TITANE_Ω∞.jsonl` |
| Remplacé par | `registry/` actifs |
| Raison | Même raison que H004 |
| Statut | LEGACY |

---

### H006 — Legacy AI Bridge (mock mode) → Conversation Engine OMEGA

| Attribut | Valeur |
|----------|--------|
| ID | H006 |
| Élément supersédé | `legacy_ai_bridge::ai_query` et variantes (mock implementation) |
| Remplacé par | `conversation_engine::conversation_generate` |
| Note | Legacy bridge conservé pour compatibilité IPC — ne pas utiliser pour nouvelles intégrations |
| Statut | LEGACY_COMPAT — 19 cmds encore dans invoke_handler pour compat |

---

## Supersessions Attendues (non encore actées)

| ID | Élément | Cible probable | Condition |
|----|---------|----------------|-----------|
| H007-pending | handlers.rs blocs v14/v16 | Suppression complète | Après confirmation cargo check (C003) |
| H008-pending | web_research stub | Implémentation réelle OU suppression | Décision business requise |

---

*Autorité : Kevin Thibault — TITANE Team | 2026-03-15T13:32:00Z*
