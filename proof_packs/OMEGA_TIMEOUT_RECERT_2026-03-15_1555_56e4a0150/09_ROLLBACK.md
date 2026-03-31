# ROLLBACK — OMEGA TIMEOUT RECERT

## Rollback Scope

Commits that may need rollback:
1. `4ede39ac8` — aiTimeouts fix (ONLY timeout values in 1 file)
2. `0cf3dbdff` — ChatProfile + stage timeouts (Rust chat_engine, NOT on default path)

## Rollback Trigger Conditions

Roll back immediately if:
- TTFT increases (baseline: ~1s for stream)
- Total latency increases (baseline: 4177ms simple, 40412ms complex)
- UI appears frozen (new: should never see 24s freeze)
- fallback_count > 1 (baseline: 0)
- unbounded wait reappears
- chat UI blocks

## Rollback Commands

### Full timeout rollback (aiTimeouts only):
```bash
git revert 4ede39ac8 --no-edit
# OR manual restore:
git restore --source 78b45f727 -- src/config/aiTimeouts.config.ts
```

### Full Rust profile rollback:
```bash
git restore --source 7cd1be080 -- src-tauri/src/chat_engine/config.rs
git restore --source 7cd1be080 -- src-tauri/src/chat_engine/mod.rs
git restore --source 7cd1be080 -- src-tauri/src/chat_engine/types.rs
git restore --source 7cd1be080 -- src/services/tauri/chatEngine.commands.ts
```

### Emergency full rollback to origin/MAIN baseline:
```bash
git revert 4ede39ac8 0cf3dbdff --no-edit
cargo build --release  # rebuild without patches
```

## Rollback Verification
After rollback, verify:
```bash
grep "ollama:" src/config/aiTimeouts.config.ts
# Expected: 8_000 (old) or 45_000 (patched)
grep "maxAttempts" src/config/aiTimeouts.config.ts
# Expected: 3 (old) or 2 (patched)
```

## Config Before/After (reference)

| Parameter | Before (old) | After (patched) |
|---|---|---|
| PROVIDER_TIMEOUTS.ollama | 8000ms | 45000ms |
| REQUEST_BUDGETS.providerAttemptMs | 8000ms | 50000ms |
| REQUEST_BUDGETS.maxAttempts | 3 | 2 |
| REQUEST_BUDGETS.globalRequestMs | 60000ms | 52000ms |
