# OLLAMA DEV LOCAL PROFILE — TITANE_INFINITY

## Current scoped status

- scoped_stack_status: OLLAMA_DEV_STACK_SEALED
- tuning_matrix_verdict: LOCAL_TUNING_PROFILE_RECORDED
- warm_result_note: WARM_MODEL_RESULT
- generated_at_utc: 2026-05-18T02:56:24Z

## Model

- qwen3.5:9b
- host: http://127.0.0.1:11434

## Recommended environment exports

```bash
export TITANE_OLLAMA_DEV_MODEL=qwen3.5:9b
export TITANE_OLLAMA_DEV_SMOKE_TIMEOUT_SEC=60
export TITANE_OLLAMA_DEV_COMPAT_TIMEOUT_SEC=60
export TITANE_OLLAMA_DEV_SMOKE_NUM_CTX=4096
export TITANE_OLLAMA_DEV_SMOKE_NUM_PREDICT=32
export TITANE_OLLAMA_DEV_PERF_TIMEOUT_SEC=60
export TITANE_OLLAMA_DEV_PERF_NUM_CTX=4096
export TITANE_OLLAMA_DEV_PERF_NUM_PREDICT=32
export TITANE_OLLAMA_DEV_TEMPERATURE=0
```

## Fast smoke profile

- ctx=1024 predict=16 timeout=30 elapsed=0s

## Stable work profile

- ctx=4096 predict=32 timeout=60 compatibility_retry=false

## Extended profile, if supported

- No extended passing profile recorded or extended matrix not enabled.

## Known limitations

- Compatibility retry state: COMPAT_RETRY_NOT_REQUIRED
- One-shot performance remains a smoke signal, not a benchmark.
- VS Code MCP trust remains manual.

## Proof reports

- tuning matrix: reports/ollama-dev-tuning/latest.md
- tuning jsonl: reports/ollama-dev-tuning/latest.jsonl
- performance smoke: reports/ollama-dev-performance/latest.md
- package provenance: reports/mcp-package-provenance/ollama-mcp-2.1.0.md

## Last certified commands

- pnpm run verify:ollama:dev:live
- pnpm run verify:ollama:dev:performance
- pnpm run verify:ollama:dev:tuning
