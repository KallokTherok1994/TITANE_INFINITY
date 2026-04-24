# 21_OBSERVABILITY_MATRIX

| Signal                          | Avant                        | Après                                 | Statut  |
| ------------------------------- | ---------------------------- | ------------------------------------- | ------- |
| send_message appelé directement | Succès silencieux            | log::warn! + Err explicite            | FIXED   |
| memory_get clé absente          | Ok(None) invisible           | log::warn! [memory_get] key not found | FIXED   |
| Ghost command appelée           | Command not found silencieux | active:false → erreur visible         | FIXED   |
| Conversation sauvegardée UI     | localStorage silencieux      | flushPendingSaves() (v26.4.0)         | PARTIAL |
| SQLite écriture backend         | MemoryEngine log Rust        | Pas de ack vers UI                    | PARTIAL |
| Crash durant écriture           | Perte silencieuse            | flushPendingSaves() mitigue           | PARTIAL |
| LTM écriture                    | ABSENT (désactivé)           | Log si activé                         | ABSENT  |
| message_id UI vs backend        | Drift silencieux             | Non résolu                            | OPEN    |
| conversation_id reload          | Fallback conditionnel        | conversationStorage.initialize()      | PROVEN  |
