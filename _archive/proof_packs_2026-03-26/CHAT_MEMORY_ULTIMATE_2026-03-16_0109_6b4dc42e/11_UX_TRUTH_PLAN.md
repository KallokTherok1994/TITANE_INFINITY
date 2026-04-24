# 11 — UX TRUTH PLAN

## Statuts UI autorisés

| Statut                       | Condition                                 | Source          |
| ---------------------------- | ----------------------------------------- | --------------- |
| "Restauré depuis la mémoire" | restored.length > 0 après backend-restore | useChat log     |
| "Aucun historique trouvé"    | restored.length === 0                     | useChat log     |
| "Offline"                    | provider = Ollama + local détection       | providers state |
| "Online"                     | provider externe répondant                | providers state |

## NO_FAKE_STATUS_GUARD

- Aucun badge "Sauvegardé" sans IPC confirmé
- Aucun badge "Intelligent" vide
- Aucun "Restauré" si restored.length === 0

## UX non implémentée (hors scope)

- UI de redécouverte (listRestorableConversations → sélecteur conversations)
- Indicateur persistance SQLite activée/désactivée
