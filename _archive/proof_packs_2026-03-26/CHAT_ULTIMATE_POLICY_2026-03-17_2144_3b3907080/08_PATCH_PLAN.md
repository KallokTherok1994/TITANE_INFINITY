# 08_PATCH_PLAN

## Verrouillage single real lock

**Lock identifié** : Les `maxTokens` et `temperature` configurés par mode dans `chatModes.config.ts` n'étaient jamais injectés dans le payload engine. Les modes profonds (omega: 4000, audit: 4000) étaient capés à `DEFAULT_AI_CONFIG.maxTokens = 2048`.

## Patches appliqués

### P1 — Création `src/services/ai/responsePolicy.ts`

**Contenu** :

- 4 profils canoniques : DIRECT (512t), BALANCED (2048t), DEEP (4000t), ARCHITECT (6000t)
- `selectResponseProfile()` : sélection lexicale + mode default + heuristiques longueur/complexité
- `evaluateInferenceState()` : 4 états bornés (SAFE_TO_INFER, INFER_WITH_DISCLOSURE, CLARIFY_REQUIRED, BLOCKED_BY_MISSING_FACT)
- `estimateComplexity()` : fonction pure [0.0, 1.0]
- `getEffectiveProfile()` : combine profil sélectionné + paramètres mode pour budget effectif
- `PROVIDER_UNSUPPORTED_PARAMS` : liste per-provider
- `mapReasoningEffort()` : OpenAI-only, no-op pour les autres

**Philosophie** : I14 respecté (meilleur libellé ≠ intelligence supérieure), I15 respecté (DIRECT = 512t, pas de padding)

### P2 — Import dans `chatEngine.ts`

```typescript
import { getEffectiveProfile } from './responsePolicy'; // v24.4.0: Canonical response policy
```

### P3 — Computation profil dans `generate()` (non-stream path)

Après `const modeConfig = (chatModes[...])`:

```typescript
const { profile: effectiveResponseProfile } = getEffectiveProfile(
  finalConfig.mode,
  validatedMessage,
  modeConfig.maxTokens,
  modeConfig.temperature
);
```

Passé comme `modeMaxTokens` + `modeTemperature` à `tryBackendPipeline`.

### P4 — Payload non-stream `tryBackendPipeline`

Chaîne de fallback : `explicit → modePolicy → DEFAULT_AI_CONFIG → 2048`

```typescript
temperature: finalConfig.aiConfig?.temperature ?? modeTemperature ?? DEFAULT_AI_CONFIG.temperature ?? 0.7,
maxOutputTokens: finalConfig.aiConfig?.maxTokens ?? modeMaxTokens ?? DEFAULT_AI_CONFIG.maxTokens ?? 2048,
```

### P5 — Payload stream `backendStreamGenerator`

Même correction dans le streaming path.

### P6 — Computation profil dans `generateStream()` (stream path)

```typescript
const { profile: streamResponseProfile } = getEffectiveProfile(
  finalConfig.mode,
  validatedMessage,
  modeConfig.maxTokens,
  modeConfig.temperature
);
```

Passé à `tryBackendStream`.

## Principes respectés

- Rule 1 : Minimal patch — Aucun refactor. 6 insertions/modifications ciblées.
- Rule 3 : 4-Ring — Ring3/Ring4 uniquement, aucun I/O Ring1/2.
- Rule 6 : IPC contract non modifié.
- I3-I6 : Aucune intelligence fake affirmée.
