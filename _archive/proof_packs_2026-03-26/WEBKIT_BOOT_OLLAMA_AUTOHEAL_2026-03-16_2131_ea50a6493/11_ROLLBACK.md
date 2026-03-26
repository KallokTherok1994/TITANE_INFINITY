# ROLLBACK

## Full rollback
```bash
git restore -- src/main.tsx src/services/ai/providers/ollama.ts scripts/autoheal/autoheal_rules.jsonl
git status  # verify clean
pnpm build  # verify build passes
```

## Selective rollback
```bash
git restore -- src/main.tsx                          # FIX-1 only
git restore -- src/services/ai/providers/ollama.ts   # FIX-2+3 only
```
