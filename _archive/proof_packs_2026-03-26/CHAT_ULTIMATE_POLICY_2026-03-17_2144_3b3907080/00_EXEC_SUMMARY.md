# 00_EXEC_SUMMARY — CHAT_ULTIMATE_POLICY

## Métadonnées

| Champ | Valeur |
|---|---|
| Pack | CHAT_ULTIMATE_POLICY_2026-03-17_2144_3b3907080 |
| Date | 2026-03-17 |
| SHA | 3b3907080 |
| Branche | MAIN |
| Mode | REPAIR + HARDEN |
| Scope Ring | Ring 4 (UI) → Ring 3 (Services) |

## EXEC_MODE

```
A) EXEC_MODE: BACKGROUND / GOVERNED
B) SCOPE_RING: Ring4 UI → Ring3 Services (src/services/ai/)
C) RISK: MEDIUM — réponse depth mal appliquée, zero regression risk (additive fallback chain)
D) MODE: REPAIR + CERTIFY
E) PLAN: Bootstrap → Discovery Maps → Single Lock Identification → Minimal Patch → Tests x3 → Proof Pack
F) PROOFS: 41/41 tests PASS x3 | Zero TypeScript errors
G) ROLLBACK: git restore src/services/ai/chatEngine.ts src/services/ai/responsePolicy.ts src/__tests__/responsePolicy.unit.test.ts
```

## REAL_STATE (avant patch)

- **Fichier** `chatEngine.ts` lignes 1031 et 1223 : fallback chain = `finalConfig.aiConfig?.maxTokens ?? DEFAULT_AI_CONFIG.maxTokens ?? 1024`
- `DEFAULT_AI_CONFIG.maxTokens = 2048` — acceptable pour mode 'default'
- Modes profonds (`omega`, `audit`, `brainstorming`, `synthesis`) ont `maxTokens: 4000` dans `chatModes.config.ts` mais ces valeurs n'étaient **jamais** passées au payload engine
- Aucune politique de réponse canonique (DIRECT/BALANCED/DEEP/ARCHITECT)
- Aucune inférence bornée d'intention
- Aucune étiquette de vérité (TruthStatus)

## SINGLE CURRENT REAL LOCK

**Mode maxTokens/temperature non appliqués au payload engine** → modes profonds limités silencieusement à 2048 tokens.

## TARGET_DELTA (après patch)

- `responsePolicy.ts` créé : 4 profils + sélection dynamique + inférence bornée + truth labels + compat. provider
- `chatEngine.ts` patché : 3 sites de payload (non-streaming x2, streaming x1) avec nouvelle chaîne de fallback `explicit → mode policy → DEFAULT_AI_CONFIG`
- 41 tests unitaires PASS x3
- Zero régression TypeScript

## VERDICT PRÉLIMINAIRE

`QUALIFIED` — Lock primary fixé, politique câblée mais non prouvée runtime E2E (WIRED_BUT_UNPROVEN)
