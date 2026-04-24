# ANTI_LIE_REPORT

## Anti-Lie Violations Found

### ALV-01: FAILURE_COUNTER_NOT_RESET_ON_PROBE_SUCCESS

| Property       | Value                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Violation name | FAILURE_COUNTER_NOT_RESET_ON_PROBE_SUCCESS                                                                  |
| Probable cause | is_provider_available() updated cache timestamp on probe success but did NOT call reset_provider_failures() |
| Rupture point  | chat_orchestrator.rs lines 386-392 (pre-fix)                                                                |
| Classification | BREAKER                                                                                                     |
| Minimal fix    | Call reset_provider_failures(provider, state).await when is_available == true at cache-expiry path          |
| Rollback note  | git restore -- src-tauri/src/overdrive/chat_orchestrator.rs                                                 |
| Status         | ✅ FIXED                                                                                                    |

### ALV-02: LOG_MESSAGE_HARDCODED_COUNT

| Property       | Value                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Violation name | LOG_MESSAGE_HARDCODED_COUNT                                                                      |
| Probable cause | increment_provider_failures() printed "(3 échecs)" even when count was 4, 5, 6                   |
| Rupture point  | chat_orchestrator.rs line 403 (pre-fix)                                                          |
| Classification | PROVIDER                                                                                         |
| Minimal fix    | Change `>= 3` to `== 3` with actual count in message; separate `> 3` case with different wording |
| Rollback note  | git restore -- src-tauri/src/overdrive/chat_orchestrator.rs                                      |
| Status         | ✅ FIXED                                                                                         |

### ALV-03: TS_CIRCUIT_CLOSED_SUCCESS_NOT_CLEARING_TIMESTAMPS

| Property       | Value                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Violation name | TS_CIRCUIT_CLOSED_SUCCESS_NOT_CLEARING_TIMESTAMPS                                               |
| Probable cause | circuitBreaker.ts recordSuccess() CLOSED path decremented by 1, never cleared failureTimestamps |
| Rupture point  | circuitBreaker.ts line 205 (pre-fix)                                                            |
| Classification | BREAKER                                                                                         |
| Minimal fix    | Reset failures=0 and delete failureTimestamps on CLOSED success                                 |
| Rollback note  | git restore -- src/services/ai/circuitBreaker.ts                                                |
| Status         | ✅ FIXED                                                                                        |

## Anti-Lie Checks Passing (Post-Fix)

- ✅ Provider NOT marked disabled after probe success (reset called)
- ✅ Failure count resets after probe success (now: count=0)
- ✅ Log message shows actual count (not hardcoded "3 échecs")
- ✅ Failure count resets after actual success (pre-existing, still true)
- ✅ Fallback reason explicit in logs (provider skip messages)
- ✅ Audio warnings NOT propagated as chat failure (classified NON_BLOCKING)
- ✅ One authority for provider state (single HashMap in ChatOrchestratorState)
- ✅ TS circuit breaker timestamps cleared on success (stale timestamps purged)
