# 03 — TRANSCRIPT PARITY MATRIX

| Dimension | UI (messages state) | localStorage | SQLite events | Cohérent? |
|-----------|---------------------|--------------|---------------|-----------|
| Présence | Oui si session active | Oui si pas effacé | Oui si LTM actif | PARTIAL |
| Ordre | Chronologique (push) | Chronologique (save) | ts ASC | YES |
| Format | AIMessage (role/content/ts) | AIMessage JSON | {kind,payload.message,ts} | CONVERTIBLE |
| Restore source | React state | getConversationSync() | load_conversation_history | CHAINED |
| Durée de vie | Session | localStorage persist | DB persist | SQLITE > LOCAL > UI |
| Duplication risk | Faible (dedup guard) | Faible (overwrite key) | Faible (PK) | LOW after PATCH-B |

## Parity gaps
- Si localStorage effacé ET LTM désactivé: transcript perdu définitivement
- Si conversation_id inconnu: list_restorable_conversations permet redécouverte (PATCH-A)
