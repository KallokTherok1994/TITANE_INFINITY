# 11_DIFF_FILES

## Fichiers créés

```
src/services/ai/responsePolicy.ts                  (nouveau, ~360 lignes)
src/__tests__/responsePolicy.unit.test.ts           (nouveau, ~290 lignes)
proof_packs/CHAT_ULTIMATE_POLICY_2026-03-17_2144_3b3907080/  (nouveau)
```

## Fichiers modifiés — chatEngine.ts

### Import ajouté (après ligne chatModes import)

```diff
+ import { getEffectiveProfile } from './responsePolicy'; // v24.4.0: Canonical response policy
```

### Dans generate() — après modeConfig

```diff
+ // v24.4.0: Canonical response policy — compute effective profile from mode + message
+ const { profile: effectiveResponseProfile } = getEffectiveProfile(
+   finalConfig.mode,
+   validatedMessage,
+   modeConfig.maxTokens,
+   modeConfig.temperature
+ );
```

### Appel tryBackendPipeline — params supplémentaires

```diff
  const backendResponse = await this.tryBackendPipeline({
    ...
+   modeMaxTokens: effectiveResponseProfile.maxTokens,
+   modeTemperature: effectiveResponseProfile.temperature,
  });
```

### Interface tryBackendPipeline — nouveaux champs

```diff
+ modeMaxTokens?: number;
+ modeTemperature?: number;
```

### Payload non-stream chaîne de fallback

```diff
- temperature:
-   finalConfig.aiConfig?.temperature ?? DEFAULT_AI_CONFIG.temperature ?? 0.7,
- maxOutputTokens:
-   finalConfig.aiConfig?.maxTokens ?? DEFAULT_AI_CONFIG.maxTokens ?? 1024,
+ temperature:
+   finalConfig.aiConfig?.temperature ?? modeTemperature ?? DEFAULT_AI_CONFIG.temperature ?? 0.7,
+ maxOutputTokens:
+   finalConfig.aiConfig?.maxTokens ?? modeMaxTokens ?? DEFAULT_AI_CONFIG.maxTokens ?? 2048,
```

### Stream path identiques

Mêmes corrections dans `tryBackendStream`, `backendStreamGenerator`, et le calcul de profil dans `generateStream()`.

## Métriques

- Lignes ajoutées (approx.) : +50 dans chatEngine.ts
- Fichiers nouveaux : 2 (+ proof pack)
- Fichiers modifiés : 1 (chatEngine.ts)
- Zéro erreur TypeScript post-patch
