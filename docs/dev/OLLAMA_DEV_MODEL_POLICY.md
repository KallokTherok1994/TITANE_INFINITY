# OLLAMA DEV MODEL POLICY — TITANE_INFINITY

## Canonical DEV model

- `qwen3.5:9b`, if installed and verified locally.

## Allowed DEV-only fallbacks

1. `qwen3:8b`
   - balanced local development fallback
2. `qwen2.5-coder:7b`
   - coding-focused fallback for modest hardware
3. `qwen3:4b`
   - low-memory fallback
4. `qwen3-coder:30b`
   - advanced repo-scale fallback on high-memory machines

## Forbidden

No DEV fallback may enter:

- `src/config/ollamaDefaults.ts`
- `config/championChallenger.json`
- `src-tauri` product runtime defaults
- `chat_orchestrator` product fallback
- product-facing recovery messages

## Product runtime

Product Chat remains `gemma2:2b`.

## Truth standard

Fallback availability is local runtime truth.
If a fallback is not installed, classify as BLOCKED_MODEL_MISSING, not FAIL_BOUNDARY.

## Probe fine-tuning knobs

- `TITANE_OLLAMA_DEV_SMOKE_TIMEOUT_SEC=30`
- `TITANE_OLLAMA_DEV_COMPAT_TIMEOUT_SEC=15`
- `TITANE_OLLAMA_DEV_KEEP_ALIVE=10m`
- `TITANE_OLLAMA_DEV_SMOKE_NUM_CTX=2048`
- `TITANE_OLLAMA_DEV_SMOKE_NUM_PREDICT=8`
- `TITANE_OLLAMA_DEV_PERF_TIMEOUT_SEC=60`
- `TITANE_OLLAMA_DEV_PERF_COMPAT_TIMEOUT_SEC=30`
- `TITANE_OLLAMA_DEV_PERF_KEEP_ALIVE=15m`
- `TITANE_OLLAMA_DEV_PERF_NUM_CTX=4096`
- `TITANE_OLLAMA_DEV_PERF_NUM_PREDICT=48`
- `TITANE_OLLAMA_DEV_TEMPERATURE=0`

These knobs tune only the DEV verification probes.
They do not modify Product Chat defaults, champion/challenger, or Tauri runtime defaults.

## MCP package reproducibility

- Wrapper package pin: `ollama-mcp@2.1.0`
- `.vscode/mcp.json` must keep using the repo-owned wrapper, never direct `pnpm dlx`.
- Provenance report target: `reports/mcp-package-provenance/ollama-mcp-2.1.0.md`
- Local tuning profile target: `docs/dev/OLLAMA_DEV_LOCAL_PROFILE.md`
