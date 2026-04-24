# 07 — MEMORY RECALL OPTIMIZATION PLAN

## Signal vs Noise (état réel)

| Source                        | Signal                            | Bruit                             | Verdict               |
| ----------------------------- | --------------------------------- | --------------------------------- | --------------------- |
| chatMemoryCompactor (session) | Derniers N messages pour contexte | Accumulation infinie si pas purgé | MEDIUM                |
| LTM SQLite                    | Tous les turns (append-only)      | Events système hors chat          | HIGH signal si activé |
| memory_get (important)        | Clés explicitement promues        | Clés orphelines                   | HIGH                  |

## Recommandations (non implémentées — hors scope patch minimal)

- Activer CONVOS_MEMORY_LTM=true en prod pour que la persistance SQLite soit effective
- Purger les memory_session après N messages (compactor déjà configuré)
- Ne pas injecter la mémoire dans les prompts sans source identifiable

## LTM status

- CONVOS_MEMORY_LTM par défaut: false (line 225 commands.rs)
- Si false: persist_conversation_os_turn toujours appelée mais... à vérifier si gated
- RISK: si LTM=false gate aussi l'écriture SQLite, load_conversation_history retourne [] en prod
