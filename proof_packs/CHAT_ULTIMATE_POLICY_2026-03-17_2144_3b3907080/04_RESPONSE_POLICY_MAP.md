# 04_RESPONSE_POLICY_MAP

## Décision points — Avant patch

| Point | Fichier | Comportement avant | Conflit/Manque | Après patch |
|---|---|---|---|---|
| maxTokens payload (non-stream) | `chatEngine.ts:1031` | `finalConfig.aiConfig?.maxTokens ?? DEFAULT_AI_CONFIG.maxTokens ?? 1024` (cap 2048) | Mode omega/audit ignorait maxTokens=4000 | `… ?? modeMaxTokens ?? DEFAULT_AI_CONFIG.maxTokens ?? 2048` |
| maxTokens payload (stream) | `chatEngine.ts:1242` | même | même | même correction |
| temperature payload (non-stream) | `chatEngine.ts:1029` | `finalConfig.aiConfig?.temperature ?? DEFAULT_AI_CONFIG.temperature ?? 0.7` | Mode admin/audit ignorait temperature=0.4 | `… ?? modeTemperature ?? DEFAULT_AI_CONFIG.temperature ?? 0.7` |
| temperature payload (stream) | `chatEngine.ts:1240` | même | même | même correction |
| Sélection profil DIRECT/BALANCED/DEEP/ARCHITECT | Absent | Absent | Toujours BALANCED par défaut | `responsePolicy.selectResponseProfile()` — NOUVEAU |
| Inférence implicite | Absent | Absent | Toujours demander | `responsePolicy.evaluateInferenceState()` — NOUVEAU |
| Truth labels | Absent | Absent | Aucune étiquette de vérité | `TruthStatus` type — NOUVEAU |

## Politique canonique — Profils résultants

| Profil | maxTokens | temperature | structureLevel | clarificationThreshold | Modes par défaut |
|---|---|---|---|---|---|
| DIRECT | 512 | 0.5 | 0 | 0.85 | quick, emergency |
| BALANCED | 2048 | 0.7 | 1 | 0.6 | default, standard, coach, journal, creation |
| DEEP | 4000 | 0.65 | 2 | 0.4 | reflection, omega, brainstorming, debug_cognitive, dev |
| ARCHITECT | 6000 | 0.55 | 3 | 0.3 | strategy, synthesis, planning, admin, audit |

## Autorité canonique : `src/services/ai/responsePolicy.ts`
