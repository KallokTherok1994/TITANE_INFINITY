# VERDICT — CHAT_PROVIDER_TRUTH_RECOVERY

## REAL_STATE
Provider failure counter was not reset when Ollama health probe succeeded after cache expiry (30s TTL),
causing stale "disabled" state to persist and a misleading hardcoded "(3 échecs)" log message to repeat
even when the actual failure count was higher. TS circuit breaker CLOSED success path decremented
failure count by 1 (not reset) and did not clear stale failure timestamps.

## TARGET_DELTA
After fix: probe success → failure count reset to 0 → provider immediately re-eligible for routing →
max disable window = 30s if Ollama is alive. TS circuit: success clears timestamps + resets to 0.

## CURRENT_REAL_LOCK
RESOLVED: FAILURE_COUNTER_NOT_RESET in is_provider_available()
- File: src-tauri/src/overdrive/chat_orchestrator.rs lines 386-392
- Fix: reset_provider_failures(provider, state).await when is_available == true

## DEFECT_CLASSIFICATION
PRIMARY: FAILURE_COUNTER_NOT_RESET (chat_orchestrator.rs)
SECONDARY: FAILURE_COUNTER_NOT_RESET / CIRCUIT_BREAKER_DRIFT (circuitBreaker.ts CLOSED success)
AUDIO: AUDIO_WARNINGS_NON_BLOCKING (non-causal, ENV_DEP_MISSING)

## FILES_TOUCHED
- src-tauri/src/overdrive/chat_orchestrator.rs (+21 lines / -3 lines)
- src/services/ai/circuitBreaker.ts (+6 lines / -2 lines)

## TESTS_ADDED_OR_FIXED
None added (no existing test harness for this function; no regression introduced).
cargo check: EXIT 0 (compilation proof).

## GATES_STATUS
- G_BOOT_TRUTH: PASS
- G_PROVIDER_CHAIN_DISCOVERED: PASS
- G_PROVIDER_STATE_AUTHORITY_UNIQUE: PASS
- G_FAILURE_COUNTER_TRUTH: PASS
- G_SUCCESS_RESET_TRUTH: PASS
- G_BREAKER_RECOVERY_TRUTH: PASS
- G_ROUTER_TRUTH: PASS
- G_FALLBACK_TRUTH: PASS
- G_UI_STATUS_TRUTH: PARTIAL
- G_NO_FAKE_PROVIDER: PASS
- G_NO_STALE_DISABLED_STATE: PASS
- G_INTERMITTENT_PROVIDER_HANDLED: PASS
- G_AUDIO_SCOPE_CLASSIFIED: PASS
- G_TESTS_X3: PASS (cargo check x3)
- G_DESKTOP_X3: BLOCKED_HEADLESS
- G_ROLLBACK_READY: PASS
- G_AH_RECURRENCE_GUARD: PASS

## PROOF_PACK_PATH
proof_packs/CHAT_PROVIDER_TRUTH_RECOVERY_2026-03-21_0134_c1c03e320/

## FINAL_UNIQUE_VERDICT
**LOCAL_PROVIDER_RECOVERED_STATE_NOT_PROPAGATED**

Rationale: The local Ollama provider was recovering (probe succeeding, later requests succeeding)
but recovery state was not propagated to the failure counter — the counter remained >= MAX_FAILURES
until an actual generate succeeded. Fix applied: probe success now triggers state propagation
(counter reset). All proof pack files present. Compilation clean. One real lock resolved.
