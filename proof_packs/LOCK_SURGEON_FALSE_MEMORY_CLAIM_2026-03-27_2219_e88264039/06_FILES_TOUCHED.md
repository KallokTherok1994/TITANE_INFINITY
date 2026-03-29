# 06 — Files Touched

## Modified Files
1. `src-tauri/src/conversation_engine/commands.rs`
   - Function: `build_canonical_memory_fact_block()`
   - Lines: ~15 lines modified
   - Change: Inject CANONICAL_MEMORY_FACTS block even when history is empty

## Unchanged Files
- `src/services/conversationEngine.ts` (frontend) — No changes needed
- `evals/datasets/v1/lane_a_golden_tasks.jsonl` — No dataset changes
- `evals/datasets/v1/lane_d_honesty.jsonl` — No dataset changes
- `evals/scorecards/v1/HONESTY_SCORECARD.json` — No scorecard changes
- All other source files — No changes

## Rollback Path
To revert the patch:
```bash
git checkout HEAD -- src-tauri/src/conversation_engine/commands.rs
```

Or manually revert the changes in `build_canonical_memory_fact_block()` to the original version.