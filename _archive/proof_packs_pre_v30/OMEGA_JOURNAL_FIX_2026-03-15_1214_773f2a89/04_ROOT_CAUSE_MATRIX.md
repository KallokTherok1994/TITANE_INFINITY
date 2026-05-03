# 04_ROOT_CAUSE_MATRIX

| Sujet | Cause racine prouvée | Fichiers | Ring | Gravité | Correctif minimal |
|---|---|---|---|---|---|
| DURÉE | `elapsedTime` passé `undefined` quand `!isLoading`; `providerStatus.latency` (ms) existant non câblé | Chat.tsx:1398 | R4 | P1 | `isLoading ? elapsed : providerStatus.latency/1000` |
| FICHIER SYSTÈME | CSS `oj-non-capture` appliquée inconditionnellement même quand `systemPromptSources.length > 0` | ThinkingPanel.tsx:732,540 | R4 | P2 | className conditionnel |
| SCORE QUALITÉ | `ConversationMetadata` Rust sans `validationScore`; `omegaMetadata?.validationScore` toujours `undefined` côté TS | Chat.tsx:866, types.rs:407 | R2/R4 | P1 | Score completion (steps réels) en fallback |
| XP GAIN PAR TOUR | `+5 XP` hardcodé; `xpTrace.lastGainAmount` disponible mais non utilisé | ThinkingPanel.tsx:626,404 | R4 | P2 | Utiliser `lastGainAmount` quand `lastGainDomain==='chat'` |
| SCROLL MOLETTE | `.oj-journal-body` absent du CSS — pas de `overflow-y`, pas de `max-height` | ThinkingPanel.css | R4 | P1 | 3 propriétés CSS |
| AUTO-HEAL RULES | Pas d'entrée autoheal pour scope OMEGA_JOURNAL | autoheal_rules.jsonl | R1 | P2 | 5 entrées append-only |

## Points hors portée (non patchés)
- `ConversationMetadata` Rust ne sérialise pas `validationScore` → changement backend non requis dans ce scope
- `autoHealed` depuis backend (`omegaMetadata.autoHealed`) n'est jamais vrai → honnête, pas de fix mensonger
- `systemPromptSources` sont des chaînes statiques (pas des chemins réels de fichiers) → libellé "sources mémoire injectées" est suffisamment honest
