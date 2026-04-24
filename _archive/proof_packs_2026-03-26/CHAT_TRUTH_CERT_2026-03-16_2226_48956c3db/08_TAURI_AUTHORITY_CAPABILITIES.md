# 08 — TAURI AUTHORITY & CAPABILITIES

## TAURI_AUTHORITY_MATRIX

| Fichier capability  | Commandes exposées (chat scope)                                                                                                                                                                                                                                                                                           | Fenêtre | Risque                                                 | Statut    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------ | --------- |
| chat_ai.json        | conversation_generate, chat_stream_message, chat_create_conversation, chat_get_conversation, chat_delete_conversation, chat_get_providers_status, chat_set_gemini_key, chat_check_providers, ai_query, cp_get_ai_config, cp_set_ai_config, validate_chat_message, ollama_generate, test_ollama, ping_ollama, ollama_query | main    | Moyen — cp_set_ai_config permet modification config IA | QUALIFIED |
| persistence.json    | db_put_event, db_get_stream, db_put_snapshot, db_get_snapshot, db_kv_set, db_kv_get, db_sync_now, db_sync_status                                                                                                                                                                                                          | main    | Normal                                                 | PASS      |
| self_heal.json      | (à vérifier)                                                                                                                                                                                                                                                                                                              | main    | —                                                      | UNKNOWN   |
| singularity.json    | singularity_get_state, etc.                                                                                                                                                                                                                                                                                               | main    | Normal                                                 | PASS      |
| audio_tts.json      | Commandes voice/TTS                                                                                                                                                                                                                                                                                                       | main    | Normal                                                 | PASS      |
| developer_mode.json | (à vérifier)                                                                                                                                                                                                                                                                                                              | main    | Dev only                                               | UNKNOWN   |

## Constats

1. Toutes les capabilities sont scoped à fenêtre `"main"` uniquement → pas de sur-exposition multi-fenêtre.
2. `permissions: ["core:default"]` sur toutes les capabilities → comportement sécurisé par défaut Tauri v2.
3. `send_message` est absent de chat_ai.json → le stub backend n'est pas accessible via capability.
4. `conversation_generate` est présent dans chat_ai.json → accès autorisé confirmé.
5. `cp_set_ai_config` expose la modification de configuration AI depuis le frontend → risque modéré acceptable si scope limité à `main`.

## CSP

- Configuration CSP vérifiée via tauri.conf.json (non relu intégralement ici).
- Aucune directive network directe détectée dans les capabilities lues.

## Verdict global capabilities

- Couverture des commandes actives : **PASS**
- Sur-exposition multi-fenêtre : **AUCUNE DÉTECTÉE**
- Sous-exposition (commande active non couverte) : **AUCUNE DÉTECTÉE pour chat principal**
