# GATE 1 — OLLAMA MODEL REPORT

**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01

---

## COMMANDS_RUN

```powershell
ollama --version
ollama list
Invoke-RestMethod http://127.0.0.1:11434/api/version
Invoke-RestMethod http://127.0.0.1:11434/api/tags
Invoke-RestMethod http://127.0.0.1:11434/api/ps (before)
# Smoke tests x4
Invoke-RestMethod http://127.0.0.1:11434/api/ps (after)
```

## PROOFS

### Ollama version

```
ollama version is 0.24.0
API version: 0.24.0
```

### Installed models (all required present — no pulls needed)

| Model | Size | Quantization | Status |
|-------|------|--------------|--------|
| qwen3.5:9b | 6.6 GB | Q4_K_M | INSTALLED |
| qwen2.5-coder:14b | 9.0 GB | Q4_K_M | INSTALLED |
| qwen2.5-coder:7b | 4.7 GB | Q4_K_M | INSTALLED |
| gemma2:2b | 1.6 GB | Q4_0 | INSTALLED |
| llama3.1:8b | 4.9 GB | Q4_K_M | INSTALLED |
| nomic-embed-text | 274 MB | F16 | INSTALLED |
| mxbai-embed-large | 670 MB | F16 | INSTALLED |

No forbidden models (qwen2.5-coder:32b, deepseek-coder-v2:16b) present.  
Extra model present: qwen2.5-coder:1.5b-base (not forbidden, not required — ignored).

### Smoke tests

| Model | Prompt | Response | Done Reason | Status |
|-------|--------|----------|-------------|--------|
| qwen3.5:9b | OK TITANE ORCHESTRATOR | "" (thinking consumed tokens) | length | QUALIFIED* |
| qwen2.5-coder:14b | OK TITANE CODE 14B | "OK" | stop | PASS |
| qwen2.5-coder:7b | OK TITANE CODE 7B | "OK TITANE CODE 7B" | stop | PASS |
| gemma2:2b | OK TITANE PRODUCT CHAT BASELINE | "OK. ..." | length | PASS |

*qwen3.5:9b uses extended thinking mode by default. The `thinking` field contains valid reasoning output; the `response` field was empty because all 32 `num_predict` tokens were consumed by the thinking block. Model loaded and executed successfully. QUALIFIED — increase `num_predict` or disable thinking for functional responses.

## BLOCKERS

- qwen3.5:9b thinking mode consumes token budget at num_predict=32; increase to 512+ for real usage.

## ROLLBACK

No model mutations performed (no pulls required). Rollback: N/A.

## GATE_VERDICT

```
OLLAMA_API=PASS
MODELS_INSTALLED=PASS
SMOKE_QWEN35=QUALIFIED   (thinking mode; model operational)
SMOKE_CODER14=PASS
SMOKE_CODER7=PASS
SMOKE_GEMMA2=PASS
```
