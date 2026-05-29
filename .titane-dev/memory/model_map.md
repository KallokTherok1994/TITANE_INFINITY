# MODEL MAP

**Last updated:** 2026-05-28  
**Authority:** OLLAMA_RUNTIME_MAP.md + Gate 1 proofs

## PRODUCTION (Tauri OMEGA pipeline)

```
PRODUCT_CHAT_DEFAULT = gemma2:2b
```

This must NEVER be changed to a qwen model without Kevin explicit approval and a new OLLAMA_RUNTIME_MAP entry.

## DEV AGENTS (MCP + Copilot, 127.0.0.1:11434)

```
DEV_ORCHESTRATOR              = qwen3.5:9b
DEV_SCOPE_SENTINEL            = qwen3.5:9b
DEV_CONFIG_AUDITOR            = qwen3.5:9b
DEV_INSTRUCTION_LAYER_AUDITOR = qwen3.5:9b
DEV_SURFACE_AUDITOR           = qwen3.5:9b
DEV_RUNTIME_ARCHITECT         = qwen2.5-coder:14b
DEV_FRONTEND_REFACTOR         = qwen2.5-coder:14b  DISABLED
DEV_BACKEND_HTTP_RUST         = qwen2.5-coder:14b  DISABLED
DEV_TEST_RUNNER               = qwen2.5-coder:7b or qwen2.5-coder:14b
DEV_SECURITY_GUARD            = qwen3.5:9b
DEV_DOCUMENTATION             = llama3.1:8b or qwen3.5:9b
DEV_REVIEWER                  = qwen3.5:9b
```

## EMBEDDINGS

```
nomic-embed-text
mxbai-embed-large
```

## OPTIONAL (requires explicit Kevin approval before pull)

```
OPTIONAL_HEAVY = qwen2.5-coder:32b
```

## FORBIDDEN IN PRODUCT RUNTIME

```
qwen3.5:9b           -- DEV only
qwen2.5-coder:14b    -- DEV only
qwen2.5-coder:7b     -- DEV only
qwen2.5-coder:32b    -- OPTIONAL, never default
deepseek-coder-v2:16b -- never pull without approval
```

## Gate 1 smoke summary (2026-05-28)

- qwen3.5:9b: RUNTIME_PASS / EXACT_MARKER_QUALIFIED (thinking mode)
- qwen2.5-coder:14b: EXACT_MARKER_PASS
- qwen2.5-coder:7b: EXACT_MARKER_PASS
- gemma2:2b: EXACT_MARKER_PASS
