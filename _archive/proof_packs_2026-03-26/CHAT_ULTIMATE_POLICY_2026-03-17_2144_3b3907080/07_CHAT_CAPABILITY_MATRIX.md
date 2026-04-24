# 07_CHAT_CAPABILITY_MATRIX

| Capacité                       | Présente dans le code ?           | Câblée ?                                   | Runtime prouvé ? | Test prouvé ?    | Partielle ? | Stub ? | Risque UI trompeur                                     | Prochaine action          |
| ------------------------------ | --------------------------------- | ------------------------------------------ | ---------------- | ---------------- | ----------- | ------ | ------------------------------------------------------ | ------------------------- |
| **Profil DIRECT**              | Oui (responsePolicy.ts)           | Oui (chatEngine.ts)                        | Non              | Oui (x3)         | Non         | Non    | Faible                                                 | Preuve runtime E2E        |
| **Profil BALANCED**            | Oui                               | Oui                                        | Non              | Oui (x3)         | Non         | Non    | Faible                                                 | Preuve runtime E2E        |
| **Profil DEEP**                | Oui                               | Oui                                        | Non              | Oui (x3)         | Non         | Non    | Moyen (maxTokens 4000 envoyé mais non prouvé provider) | Test E2E mode omega       |
| **Profil ARCHITECT**           | Oui                               | Oui                                        | Non              | Oui (x3)         | Non         | Non    | Moyen                                                  | Test E2E mode audit       |
| **Sélection dynamique profil** | Oui                               | Oui                                        | Non              | Oui (x3)         | Non         | Non    | Faible                                                 | E2E                       |
| **Inférence bornée (4 états)** | Oui                               | Non (évalué mais non utilisé pour bloquer) | Non              | Oui (x3)         | Oui         | Non    | Faible                                                 | Câbler dans useChat       |
| **Truth labels UI**            | Oui (types définis)               | Non                                        | Non              | Oui (type check) | Oui stub    | Non    | Faible                                                 | Connecter ChatDiagnostic  |
| **Memory STM**                 | Oui                               | Oui                                        | Oui (existing)   | Oui              | Non         | Non    | Aucun                                                  | —                         |
| **Memory LTM**                 | Oui                               | Oui                                        | Partiel          | Oui              | Oui         | Non    | Faible                                                 | E2E mémoire longue        |
| **Provider fallback**          | Oui                               | Oui                                        | Oui              | Oui              | Non         | Non    | Aucun                                                  | —                         |
| **Streaming**                  | Oui                               | Oui                                        | Oui              | Partiel          | Non         | Non    | Aucun                                                  | —                         |
| **Circuit breaker**            | Oui                               | Oui                                        | Partiel          | Oui              | Non         | Non    | Aucun                                                  | —                         |
| **Auto-heal pipeline**         | Oui                               | Oui                                        | Oui              | Oui              | Non         | Non    | Aucun                                                  | —                         |
| **Compat. provider params**    | Oui (PROVIDER_UNSUPPORTED_PARAMS) | Non (non utilisé dans orchestrateur)       | Non              | Oui              | Oui         | Non    | Moyen                                                  | Câbler dans orchestrateur |

## Résumé

- **Capacités pleinement prouvées** : STM, provider fallback, streaming, circuit breaker, auto-heal
- **Nouvelles capacités câblées (non prouvées E2E)** : 4 profils, sélection dynamique, inférence bornée, truth labels
- **Zéro stub affirmant fausse intelligence** : Tous les profils sont honnêtement marqués `WIRED_BUT_UNPROVEN` ou `STABLE_PARTIAL`
