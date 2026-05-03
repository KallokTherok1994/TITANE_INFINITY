# ROLLBACK PLAN

## Trigger Conditions
- TTFT increases vs baseline
- Total latency increases vs baseline
- Chat UI blocks
- fallback_depth increases
- unbounded wait reappears

## Commands
```bash
# Full rollback of all patches in this session:
git restore -- \
  src-tauri/src/chat_engine/config.rs \
  src-tauri/src/chat_engine/mod.rs \
  src-tauri/src/chat_engine/types.rs \
  src/services/tauri/chatEngine.commands.ts

# Verify rollback:
cd src-tauri && cargo check
```

## Partial Rollback (config only — preserve meta truth):
```bash
git restore -- src-tauri/src/chat_engine/config.rs src-tauri/src/chat_engine/mod.rs
```
