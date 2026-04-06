# ROLLBACK
## Date: 2026-03-21

## Rollback Commands
```bash
git restore -- scripts/e2e/run-online-chat-proof-ui.sh
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

## Scope
- Only harness script and autoheal log affected
- NO product code changed
- Zero binary impact

## What is restored
- scripts/e2e/run-online-chat-proof-ui.sh: removes Ollama pre-warm block
- scripts/autoheal/autoheal_rules.jsonl: removes AH-2026-03-21-OLLAMA-COLD-START-PREWARM entry

## Effect
After rollback: online desktop X3 will return to 2/3 PASS behavior (cold-start timeout 1/3)
