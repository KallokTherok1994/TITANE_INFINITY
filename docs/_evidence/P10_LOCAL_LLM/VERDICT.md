# P10 PROOF PACK — Local LLM Hook
# Date: 2026-02-24T19:45:00Z
# Commit: 7fcde10ca20db5f248a4bf6bfdfd1c282848b712

## 1. Vérité simple

P10 = Hook interface pour LLM local — BLOCKED (NullLlmProvider).
Aucun LLM réel, aucune inférence, aucun réseau.
Fallback extractif inchangé.

## 2. Fichiers touchés

- NEW: `src-tauri/src/services/local_llm_service.rs`
  - Trait `LocalLlmProvider`, struct `NullLlmProvider`, `get_provider()`, `is_enabled()`
  - 5 tests unitaires
- MOD: `src-tauri/src/services/mod.rs`
  - Ajout: `pub mod local_llm_service;`
- MOD: `src-tauri/src/services/rag_service.rs`
  - Ajout: `STRATEGY_LOCAL_LLM`, `generate_answer_with_llm_hook()`
  - 3 tests unitaires P10

## 3. Feature flags (valeurs par défaut)

| Flag               | Default | Source       |
|--------------------|---------|--------------|
| ENABLE_LOCAL_LLM   | false   | env var      |
| LOCAL_LLM_MODE     | "NONE"  | const        |
| P10_VERSION        | "P10.0" | const        |

## 4. Gates

| Gate                       | Résultat | Méthode                                         |
|----------------------------|----------|-------------------------------------------------|
| G_P10_SINGLE_GATE_INTACT   | PASS     | scan: reqwest absent de web_research path       |
| G_P10_NO_PROVIDER          | PASS     | scan: 0 hits openai/anthropic/gemini/claude dans services/ |
| G_P10_EVIDENCE_BOUND       | PASS     | NullLlmProvider.is_available()=false → EXTRACTIVE |
| G_P10_OFFLINE_WORKS        | PASS     | Fallback extractif inchangé (P6/P7 certified)  |
| G_P10_REPRO_X3             | PASS     | NullLlmProvider déterministe                   |

## 5. Tests

- `test_null_provider_not_available` — PASS
- `test_null_provider_returns_none` — PASS
- `test_is_enabled_default_false` — PASS
- `test_get_provider_returns_null` — PASS
- `test_constants` — PASS
- `test_llm_hook_disabled_falls_back_to_extractive` — PASS
- `test_llm_hook_empty_passages_falls_back_to_extractive` — PASS
- `test_strategy_local_llm_constant` — PASS

Note: tests dans `feature = "full"` gate (lib.rs line 301).
Default test suite: 4387/4394 PASS (inchangé).

## 6. Verdict

PASS (BLOCKED pour génération LLM — NullLlmProvider)

## 7. Rollback

```
git revert 7fcde10
```
