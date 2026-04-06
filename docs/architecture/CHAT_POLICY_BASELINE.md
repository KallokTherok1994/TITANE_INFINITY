# CHAT_POLICY_BASELINE
**TITANE∞ — Politique canonique du chat**
**Date**: 2026-03-26
**Phase**: PHASE 7 — POLICY CANONIQUE DU CHAT
**Source de vérité**: `src/services/ai/responsePolicy.ts` + `src/services/ai/omegaModeClassifier.ts`
**Verdict**: QUALIFIED

---

## Autorité unique

```
responsePolicy.ts          ← SOURCE CANONIQUE des profils (DIRECT/BALANCED/DEEP/ARCHITECT/OMEGA)
omegaModeClassifier.ts     ← Classification du mode → profil
conversationEngine.ts      ← Orchestration: classifyMode → resolveMode → processMessage
championChallenger.ts      ← Routing provider par mode canonique
```

**Règle**: toute politique chat divergente d'une autre source est une politique concurrente à geler.

---

## Profils de réponse canoniques (5 profils)

| Profil | maxTokens | Timeout | Mémoire STM | Mémoire LTM | Providers préférés | TruthStatus |
|--------|-----------|---------|-------------|-------------|-------------------|------------|
| **DIRECT** | 1 024 | 20s | ✅ | ❌ | ollama, titane-local | STABLE_PARTIAL |
| **BALANCED** | 4 096 | 45s | ✅ | ✅ | ollama, gemini, openai | STABLE_PARTIAL |
| **DEEP** | 8 192 | 120s | ✅ | ✅ | gemini, openai, claude | WIRED_BUT_UNPROVEN |
| **ARCHITECT** | 12 000 | 180s | ✅ | ✅ (targeted) | gemini, claude, openai | WIRED_BUT_UNPROVEN |
| **OMEGA** | 16 000 | 240s | ✅ | ✅ (full) | gemini, claude, openai | WIRED_BUT_UNPROVEN |

---

## Vérité de dégradation (TruthStatus)

| Status | Signification | Profils concernés |
|--------|--------------|------------------|
| `STABLE_PARTIAL` | Stable, non prouvé E2E complet | DIRECT, BALANCED |
| `WIRED_BUT_UNPROVEN` | Câblé dans le code, non prouvé en runtime réel | DEEP, ARCHITECT, OMEGA |
| `PROVEN_RUNTIME` | Prouvé par test E2E ou runtime — NON ATTEINT pour aucun profil | — |

**Honnêteté**: aucun profil n'est `PROVEN_RUNTIME`. DIRECT et BALANCED sont `STABLE_PARTIAL`.

---

## Politique provider / fallback

### Chaîne de routing (omegaModeClassifier → championChallenger)

```
classifyMode(message, mode) → CanonicalMode
resolveMode(classification, userMode) → ConversationMode (OMEGA | DEEP | STANDARD | CREATIVE)
championChallenger.selectProvider(canonicalMode) → provider + model
```

### Providers par mode canonique (championChallenger.json)

| CanonicalMode | Champion provider | Champion model | Fallback |
|--------------|-----------------|---------------|---------|
| DIRECT | ollama | sonnet | gemini/haiku |
| CLARIFY_LIGHT | ollama | sonnet | — |
| DEEP_REASONING | gemini | opus | claude/opus |
| ARCHITECT | gemini | opus | claude/opus |
| REPAIR | ollama | sonnet | — |
| CERTIFY | gemini | opus | openai/opus |
| EXPLORATION | ollama | sonnet | — |
| SHADOW_LEARNING | ollama | sonnet | — |

### Fallback honnête

- Provider primary fail → fallback chain (défini par champion-challenger registry)
- Registry désactivé (`comparison.enabled: false`) — pas de comparaison active en prod
- Timeout par profil (voir table ci-dessus) — pas de timeout global unique
- provider_used = 'fallback' si metadata manquante (conversationEngine.ts:242)

---

## Politique mémoire par profil

| Profil | STM | LTM | targetedRetrievalOnly | maxSources |
|--------|-----|-----|-----------------------|-----------|
| DIRECT | ✅ | ❌ | non | 2 |
| BALANCED | ✅ | ✅ | non | 5 |
| DEEP | ✅ | ✅ | non | 10 |
| ARCHITECT | ✅ | ✅ | **oui** | 12 |
| OMEGA | ✅ | ✅ | non | 20 |

**Note**: LTM injection via `chatMemorySingleDoor.ts` → `formatContextEnvelopeForSystemPrompt()`. L'activation LTM dépend du runtime IPC Tauri étant disponible.

---

## Politique streaming / retry

| Profil | Streaming | maxRetries | Stratégie retry |
|--------|-----------|-----------|----------------|
| DIRECT | ✅ | 1 | linear |
| BALANCED | ✅ | 2 | linear |
| DEEP | ✅ | 2 | exponential |
| ARCHITECT | ✅ | 3 | exponential |
| OMEGA | ✅ | 3 | exponential |

Tous les profils ont streaming activé. Les profils complexes (DEEP+) ont retry exponential pour absorber les timeouts provider.

---

## Politique de mode chat (chatModes.config.ts)

Les modes UI (coach, dev, admin, etc.) sont mappés vers des profils de réponse:

```
default    → BALANCED
standard   → BALANCED
reflection → DEEP
creation   → BALANCED
brainstorming → DEEP
journal    → BALANCED
debug_cognitive → DEEP
coach      → BALANCED
dev        → DEEP
```

Le mapping est dans `responsePolicy.ts:MODE_PROFILE_MAP` — source canonique unique.

---

## Politiques concurrentes identifiées

| Source | Nature | Décision |
|--------|--------|---------|
| `src/config/chatModes.config.ts` → SYSTEM_PROMPTS | Prompts système par mode UI — complémentaires, non concurrents | **KEEP** — les prompts système s'ajoutent au profil de réponse |
| `src/services/chatMemory.ts` | Mémoire chat v1 (rôle vs chatMemoryCompactor non clarifié) | **ALIAS_COMPAT** — voir MEMORY_AUTHORITY_MAP |
| `config/championChallenger.json` vs `championChallenger.ts` | JSON est source de données, TS est logique — cohérent | **KEEP** — pas de conflit |

**Conclusion**: aucune politique chat radicalement concurrente identifiée. responsePolicy.ts est l'unique source de paramètres.

---

## Vérité modes UI

Les modes UI (OMEGA, DEEP, etc.) dans l'interface sont distincts des profils de réponse:
- Les modes UI = contexte + persona (prompt système)
- Les profils de réponse = paramètres de génération (tokens, timeout, mémoire)
- Le mapping UI → profil est explicite dans `MODE_PROFILE_MAP`

---

## Actions recommandées

1. **Promouvoir `runtimeProven: true` pour DIRECT + BALANCED** quand les tests E2E passeront (Phase 10+)
2. **Aligner `truthStatus`** avec les résultats des gates réels: si un profil est testé en runtime → passer à `PROVEN_RUNTIME`
3. **`comparison.enabled: false`** dans championChallenger — à ne pas activer sans baseline métrique

---

## Verdict

```
PHASE 7: QUALIFIED
- Policy canonique: responsePolicy.ts (5 profils + politique mémoire/stream/provider)
- Profils clairs: DIRECT / BALANCED / DEEP / ARCHITECT / OMEGA
- Fallback honnête: documenté (champion-challenger + fallback chain)
- Vérité dégradation: STABLE_PARTIAL pour DIRECT/BALANCED, WIRED_BUT_UNPROVEN pour DEEP+
- Politiques concurrentes: aucune radicale — complémentaires identifiées et documentées
- Prochaine action: PHASE 9 — VÉRITÉ DE TEST ET VALIDATION
```
