# 21 — AUTOHEAL APPEND

Entrées ajoutées dans scripts/autoheal/autoheal_rules.jsonl :

## AH-CHAT-ULTIMATE-001
- scope: list_restorable_conversations IPC
- symptom: aucun mécanisme redécouverte si conversation_id perdu
- fix: Rust command + generate_handler! + ChatService

## AH-CHAT-ULTIMATE-002
- scope: deduplication guard useChat.ts backend-restore
- symptom: doublon potentiel si useEffect re-fires
- fix: existingKeys Set + filter deduped avant setMessages
