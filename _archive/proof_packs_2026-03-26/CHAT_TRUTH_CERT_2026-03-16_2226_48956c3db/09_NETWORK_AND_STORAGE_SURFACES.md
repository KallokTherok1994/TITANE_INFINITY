# 09 — NETWORK AND STORAGE SURFACES

## Surfaces réseau

| Surface                  | Type        | Gouvernance                                                         | One Door respecté?                                     | Statut |
| ------------------------ | ----------- | ------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| Ollama (localhost:11434) | Local HTTP  | Via chatEngine/AIRouter → Tauri backend → reqwest                   | OUI — guard-no-frontend-ollama-direct.sh vérifié       | PASS   |
| Gemini API               | Cloud HTTPS | Via Tauri backend → reqwest (feature=full requis pour prod)         | OUI — PATCH-010: policy_verdict.allow_external_ai gate | PASS   |
| Brave Search API         | Cloud HTTPS | run_governed_search() — DÉSACTIVÉ en build default (feature="mock") | OUI — TRUTH LABEL PATCH-009 présent                    | PASS   |
| Direct fetch frontend    | —           | INTERDIT par architecture                                           | Aucun fetch direct détecté dans chat pipeline          | PASS   |

## Surfaces storage

| Surface                                              | Clé/chemin                         | Données stockées               | TTL/Purge                  | Statut  |
| ---------------------------------------------------- | ---------------------------------- | ------------------------------ | -------------------------- | ------- |
| localStorage `titane_chat_mode_*`                    | Par mode                           | Messages chat compressés (MTM) | Compaction si >30 messages | PARTIAL |
| localStorage `titane_chat_active_module_context_v1`  | Unique                             | ModuleRouteContext actif       | Écrasé à chaque navigation | PARTIAL |
| localStorage `titane_chat_module_context_history_v1` | Unique                             | 40 derniers contextes          | Rotation max 40            | PARTIAL |
| localStorage `titane_chat_context_envelope_v1`       | Unique                             | Dernier envelope chat          | Écrasé                     | PARTIAL |
| localStorage `omega-chat-conversation-id`            | Unique                             | ID conversation active         | Non expirant               | PARTIAL |
| localStorage `titane_active_conversation_id`         | Unique                             | ID conversation canonique      | Non expirant               | PARTIAL |
| SQLite `conversation_os_v1.db`                       | ~/.local/share/TITANE_INFINITY/... | Historique conversations (LTM) | Aucun TTL détecté          | PROVEN  |

## Constats

1. **One Door réseau** : respecté — aucun appel réseau direct depuis UI sans passer par Tauri IPC.
2. **SQLite** : stockage LTM principal, chemin résolu via env TITANE_CONVOS_DB_PATH ou XDG_DATA_HOME ou HOME.
3. **localStorage** : utilisé pour STM/MTM côté frontend. Pas de chiffrement détecté sur les clés chat*mode*\*.
4. **Purge LTM** : aucune politique TTL/purge détectée sur SQLite → risque de croissance illimitée à terme.
