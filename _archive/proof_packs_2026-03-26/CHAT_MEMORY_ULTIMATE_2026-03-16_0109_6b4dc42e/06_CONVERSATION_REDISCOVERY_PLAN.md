# 06 — CONVERSATION REDISCOVERY PLAN

## Commande IPC: list_restorable_conversations
```
list_restorable_conversations(limit?: number) → [{conversationId, messageCount, lastTs}]
```
- Trie par lastTs DESC
- Retourne [] si DB absent (jamais d'erreur)
- limit par défaut 50, max 200

## Flow de redécouverte
1. UI détecte conversation_id manquant dans localStorage
2. Appelle chatService.listRestorableConversations(5)
3. Présente les N dernières conversations à l'utilisateur
4. User sélectionne → UI restaure avec load_conversation_history(conversationId)

## Statut implémentation
- [x] Rust command: DONE (commands.rs)
- [x] Enregistré generate_handler!: DONE (main.rs)
- [x] Frontend ChatService: DONE (chat.ts)
- [ ] UI de redécouverte: NOT_IMPLEMENTED — hors scope patch minimal

## Condition d'activation
- Le frontend doit explicitement appeler listRestorableConversations
- Non activé automatiquement (patch minimal)
