# ROLLBACK — CHAT_PROVIDER_TRUTH_RECOVERY

## Files Modified

1. `src-tauri/src/overdrive/chat_orchestrator.rs`
2. `src/services/ai/circuitBreaker.ts`

## Rollback Command

```bash
git restore -- src-tauri/src/overdrive/chat_orchestrator.rs src/services/ai/circuitBreaker.ts
```

## What This Undoes

- Removes probe-success reset in is_provider_available()
- Restores increment-by-1 decrement in circuitBreaker.ts CLOSED success path
- Restores hardcoded "(3 échecs)" log message
- Restores stale timestamp behavior in TS circuit breaker

## Rollback Risk

LOW — reverting re-introduces the original FAILURE_COUNTER_NOT_RESET defect (stale disabled state).
No data loss. No configuration change. Rust must be rebuilt after rollback (cargo build).

## Verification After Rollback

```bash
cargo check --manifest-path src-tauri/Cargo.toml
grep -n "3 échecs" src-tauri/src/overdrive/chat_orchestrator.rs  # should return 1 line
grep -n "Math.max(0" src/services/ai/circuitBreaker.ts  # should return 1 line
```
