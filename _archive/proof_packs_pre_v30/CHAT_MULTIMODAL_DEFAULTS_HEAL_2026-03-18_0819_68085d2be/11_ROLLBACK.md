# 11 — ROLLBACK

## Rollback Command
```bash
git restore -- src/utils/APISupport.ts src/services/ai/responsePolicy.ts src/core/prompts/providers.ts
```

## What each file rollback does
- `src/utils/APISupport.ts`: Restores hasMicrophone/hasCamera to label-check (reintroduces false-negative bug)
- `src/services/ai/responsePolicy.ts`: Restores BALANCED clarificationThreshold=0.6, inferenceAggression=0.6, Rule 7 threshold=30
- `src/core/prompts/providers.ts`: Restores low token budgets (ollama=500, titane-local=400, etc.)

## Risk of rollback
LOW — all 3 changes are value/threshold changes with no structural impact.
