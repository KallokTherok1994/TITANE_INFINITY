# Rollback Plan

## Scope
3 files changed in this session's governance patch family.

## Rollback Command
```bash
git restore src-tauri/src/ai/ollama.rs scripts/e2e/run-online-chat-proof-ui.sh wdio.desktop.conf.cjs
```

## Effect of Rollback
- ai/ollama.rs: removes ollama_request_timeout(), reverts to .build() with no timeout
- run-online-chat-proof-ui.sh: restores TITANE_CONVERSATION_TIMEOUT_SECS export, removes OLLAMA_REQUEST_TIMEOUT_SECS
- wdio.desktop.conf.cjs: restores TITANE_CONVERSATION_TIMEOUT_SECS in passthrough keys

## Risk Assessment
LOW — rollback reverts to the prior STABLE state.
The prewarm fix (session 4) is NOT affected by this rollback.
No product behavior changes: rollback only removes the client timeout (system was working without it before).

## AutoHeal Entry
AH-2026-03-21-OLLAMA-TIMEOUT-GOVERNANCE (entry 509 in autoheal_rules.jsonl)
