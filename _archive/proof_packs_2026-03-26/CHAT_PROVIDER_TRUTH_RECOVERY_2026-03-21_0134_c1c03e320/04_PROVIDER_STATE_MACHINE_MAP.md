# PROVIDER_STATE_MACHINE_MAP

## Ollama (Rust backend — chat_orchestrator.rs)

| Property                  | Source                                           | Details                                                                                                                          | Fixed?       |
| ------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Enabled source            | is_provider_available()                          | probe + count check                                                                                                              | N/A          |
| Disabled source           | count >= MAX_FAILURES (3)                        | within cache window                                                                                                              | N/A          |
| Failure counter           | provider_failure_count HashMap (Arc<RwLock<>>)   | incremented on each failure                                                                                                      | N/A          |
| Success reset             | reset_provider_failures()                        | called on actual successful generate                                                                                             | Pre-existing |
| Probe-success reset       | **ADDED by this fix**                            | reset_provider_failures on probe success in is_provider_available                                                                | ✅ FIXED     |
| Cooldown                  | 30s cache TTL                                    | CACHE_DURATION_MS = 30_000                                                                                                       | N/A          |
| Health probe              | TCP GET localhost:11434/api/tags with 3s timeout | "ollama" arm of match                                                                                                            | N/A          |
| Log on disable            | increment_provider_failures()                    | **WAS**: fires at count >= 3 with hardcoded "3 échecs". **NOW**: fires at count==3 with real count, different message at count>3 | ✅ FIXED     |
| Failure counter authority | Single HashMap in ChatOrchestratorState          | One source of truth                                                                                                              | PASS         |
| Recovery propagation      | reset_provider_failures() resets to 0            | now also triggered on probe success                                                                                              | ✅ FIXED     |

## Cloud Providers (TS — circuitBreaker.ts)

| Property                  | Source                         | Details                                                                   | Fixed?       |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------------- | ------------ |
| Enabled source            | canExecute()                   | state == CLOSED or HALF_OPEN                                              | N/A          |
| Disabled source           | OPEN state                     | failureTimestamps >= threshold in window                                  | N/A          |
| Failure counter           | circuit.failures               | incremented on recordFailure()                                            | N/A          |
| Failure timestamps        | failureTimestamps Map          | used for OPEN decision                                                    | N/A          |
| Success reset (CLOSED)    | recordSuccess()                | **WAS**: failures-- (decrement). **NOW**: failures=0 + timestamps cleared | ✅ FIXED     |
| Success reset (HALF_OPEN) | recordSuccess()                | transitions to CLOSED after threshold successes                           | Pre-existing |
| Recovery timeout          | recoveryTimeoutMs per provider | ollama=10s, cloud=20-25s                                                  | N/A          |
| Health probe              | None at TS level               | relies on actual request outcome                                          | N/A          |
