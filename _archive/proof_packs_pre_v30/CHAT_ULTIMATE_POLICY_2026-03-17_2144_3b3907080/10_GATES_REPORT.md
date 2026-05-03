# 10_GATES_REPORT

## Récapitulatif des gates

| Gate | Statut | Preuve |
|---|---|---|
| G_BOOT_TRUTH | PASS | git SHA 3b3907080, node v24, cargo 1.94.0 |
| G_CHAT_SURFACE_TRUTH | PASS | 03_CHAT_SURFACE_MAP.md — chaîne UI→chatEngine complètement tracée |
| G_RESPONSE_POLICY_CANONICAL | PASS | `responsePolicy.ts` créé, source unique, exporté comme default |
| G_PROFILE_SELECTION_ACTIVE | PASS | `selectResponseProfile()` câblée dans chatEngine.generate() |
| G_IMPLICIT_INFERENCE_BOUNDED | PASS | `evaluateInferenceState()` : 4 états bornés, testé x3 |
| G_MEMORY_INJECTION_TRUTH | PARTIAL | STM toujours active (PROVEN), LTM policy définie mais non conditionnée |
| G_PROVIDER_COMPATIBILITY_TRUTH | PASS | `PROVIDER_UNSUPPORTED_PARAMS` + `mapReasoningEffort()` définis |
| G_NO_UNSUPPORTED_PARAM_DRIFT | WIRED | Défini, non encore câblé dans orchestrateur (prochaine étape) |
| G_FALLBACK_HONESTY | PASS | `titane-local` toujours fallback, jamais silencieux |
| G_UI_TRUTH_LABELS | WIRED | `TruthStatus` type défini, non encore exposé dans `ChatDiagnostic.tsx` |
| G_DEFAULT_LENGTH_HARDENED | PASS | Fallback chain `?? modeMaxTokens ?? DEFAULT_AI_CONFIG.maxTokens ?? 2048` |
| G_DEFAULT_DEPTH_HARDENED | PASS | Mode omega/audit/audit transmettent maintenant maxTokens=4000 |
| G_TESTS_X3 | PASS | 41/41 × 3 runs |
| G_ROLLBACK_READY | PASS | git restore plan documenté cf. 12_ROLLBACK.md |

## Verdict gates

- **PASS** : 11 gates
- **PARTIAL** : 1 gate (G_MEMORY_INJECTION_TRUTH — STM prouvé, LTM policy non encore conditionnelle)
- **WIRED** : 2 gates (G_NO_UNSUPPORTED_PARAM_DRIFT, G_UI_TRUTH_LABELS — définis, non encore câblés dans cibles finales)
- **FAIL** : 0 gates
