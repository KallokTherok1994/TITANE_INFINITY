# 05_MEMORY_INJECTION_MAP

## Chemins mémoire actifs

| Type | Chemin | Déclencheur | Format injection | Statut runtime |
|---|---|---|---|---|
| STM (session) | `src/services/ai/memoryIntegration.ts:loadContext()` | Chaque tour de conversation | `context.sources[]` → `promptContext.memory` | PROVEN (parallel load dans generate()) |
| LTM (unified) | `src/core/services/unifiedMemory.ts` | Chaque tour via save + load | Synthèse projet/décisions/rituels | PARTIAL |
| LTM cognitive | `src/services/cognitive/cognitiveOmegaIntegration.ts:enrichContext()` | Chaque tour (parallel) | `cognitiveContext` string injecté dans systemPrompt | WIRED_BUT_UNPROVEN |

## Politique mémoire par profil (définie dans responsePolicy.ts)

| Profil | STM | LTM | Retrieval ciblé | Max sources |
|---|---|---|---|---|
| DIRECT | Non | Non | Non | 0 |
| BALANCED | Oui | Non | Non | 3 |
| DEEP | Oui | Oui | Non | 6 |
| ARCHITECT | Oui | Oui | Oui | 8 |

## Note

La politique mémoire par profil est **définie** dans `responsePolicy.ts` mais pas encore **appliquée** conditionnellement dans `chatEngine.ts` (le chargement mémoire est actuellement non-conditionnel).

**Prochaine action potentielle** (non dans ce patch minimal) : conditionner `memoryIntegration.loadContext()` selon `effectiveResponseProfile.memory`.

Statut : `DEFINED / NOT_YET_APPLIED`
