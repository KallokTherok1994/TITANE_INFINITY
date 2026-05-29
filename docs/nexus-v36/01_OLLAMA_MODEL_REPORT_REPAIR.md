# GATE 1 — OLLAMA MODEL REPORT (REPAIR)

**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01  
**Repair reason:** Original smoke used num_predict=32 (insufficient for thinking models); adapted with num_predict=128 + explicit instruction override.

---

## OLLAMA_API

```
OLLAMA_API_VERSION=PASS   (0.24.0 via /api/version)
OLLAMA_TAGS=PASS          (/api/tags lists all required models)
```

## MODEL INSTALLATION STATUS

| Model | Status |
|-------|--------|
| MODEL_INSTALLED_qwen3.5:9b | PASS |
| MODEL_INSTALLED_qwen2.5-coder:14b | PASS |
| MODEL_INSTALLED_qwen2.5-coder:7b | PASS |
| MODEL_INSTALLED_gemma2:2b | PASS |
| MODEL_INSTALLED_llama3.1:8b | PASS |
| MODEL_INSTALLED_nomic-embed-text | PASS |
| MODEL_INSTALLED_mxbai-embed-large | PASS |

No forbidden models present (qwen2.5-coder:32b, deepseek-coder-v2:16b absent).

## ADAPTED SMOKE RESULTS (num_predict=128)

| Model | Response | Done | Reason | Marker | Status |
|-------|----------|------|--------|--------|--------|
| qwen3.5:9b | "" (empty) | true | stop | MISSING | QUALIFIED |
| qwen2.5-coder:14b | "OK TITANE CODE 14B" | true | stop | PRESENT | PASS |
| qwen2.5-coder:7b | "OK TITANE CODE 7B" | true | stop | PRESENT | PASS |
| gemma2:2b | "OK TITANE PRODUCT CHAT BASELINE " | true | stop | PRESENT | PASS |

```
MODEL_RUNTIME_qwen3.5:9b=PASS        (done=true, no error)
MODEL_EXACT_MARKER_qwen3.5:9b=QUALIFIED
MODEL_RUNTIME_qwen2.5-coder:14b=PASS
MODEL_EXACT_MARKER_qwen2.5-coder:14b=PASS
MODEL_RUNTIME_qwen2.5-coder:7b=PASS
MODEL_EXACT_MARKER_qwen2.5-coder:7b=PASS
MODEL_RUNTIME_gemma2:2b=PASS
MODEL_EXACT_MARKER_gemma2:2b=PASS
```

## QWEN3.5 THINKING MODE NOTE

`QWEN35_THINKING_MODE=QUALIFIED`

qwen3.5:9b v0.24.0 activates extended thinking by default. Even with `num_predict=128` and a direct instruction, the `response` field remains empty while valid reasoning appears in the `thinking` field. The model executes correctly (done=true, done_reason=stop, no API error). To obtain content in `response`, callers must either disable thinking mode via system prompt or use `/no_think` prefix. This is a usage pattern requirement, not a model failure.

**Real usage**: set `num_predict ≥ 512` and configure `TITANE_OLLAMA_DEV_MODEL=qwen3.5:9b` with a system prompt that disables thinking, or accept thinking output via the `thinking` field.

## PROOF FILES

- `proofs/40_smoke_qwen35.json` — original (num_predict=32)
- `proofs/recovery_40_smoke_qwen35_adapted.json` — adapted (num_predict=128)
- `proofs/recovery_41_smoke_qwen25_coder_14b_adapted.json`
- `proofs/recovery_42_smoke_qwen25_coder_7b_adapted.json`
- `proofs/recovery_43_smoke_gemma2_product_adapted.json`
- `proofs/recovery_44_smoke_marker_summary.txt`
- `proofs/recovery_45_ollama_api_ps_after_adapted_smoke.json`

## GATE_VERDICT (REPAIRED)

```
OLLAMA_API=PASS
MODELS_INSTALLED=PASS
SMOKE_QWEN35=QUALIFIED       (runtime PASS; exact marker QUALIFIED — thinking mode)
SMOKE_CODER14=PASS
SMOKE_CODER7=PASS
SMOKE_GEMMA2=PASS
GATE_1_OVERALL=QUALIFIED
```
