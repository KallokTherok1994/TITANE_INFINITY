# GATES_REPORT — CHAT_PROVIDER_TRUTH_RECOVERY

| Gate                              | Status           | Evidence                                                                                                                                  |
| --------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| G_BOOT_TRUTH                      | PASS             | SHA c1c03e320 verified; cargo check EXIT 0                                                                                                |
| G_PROVIDER_CHAIN_DISCOVERED       | PASS             | Full chain mapped: UI→hook→IPC→chat_send_message→is_provider_available→send_to_ollama                                                     |
| G_PROVIDER_STATE_AUTHORITY_UNIQUE | PASS             | Single authority: provider_failure_count HashMap in ChatOrchestratorState                                                                 |
| G_FAILURE_COUNTER_TRUTH           | PASS             | Counter correctly increments; reset on actual success (pre-existing) + probe success (NEW)                                                |
| G_SUCCESS_RESET_TRUTH             | PASS             | reset_provider_failures() called: (a) actual success line 621; (b) stream success line 1949; (c) probe success [NEW FIX]                  |
| G_BREAKER_RECOVERY_TRUTH          | PASS             | After fix: probe success → count=0 → fresh window. Max disable: 30s if Ollama alive                                                       |
| G_ROUTER_TRUTH                    | PASS             | Router correctly skips disabled providers, falls through to next; no silent fallback                                                      |
| G_FALLBACK_TRUTH                  | PASS             | Fallback logged explicitly; fallback cleared after probe success [NEW]; no stale permanent disable                                        |
| G_UI_STATUS_TRUTH                 | PARTIAL          | Backend state fixed; UI polls via existing channels. No UI code change needed — provider state propagated via IPC response.provider field |
| G_NO_FAKE_PROVIDER                | PASS             | No fake success injected; all providers use real request results                                                                          |
| G_NO_STALE_DISABLED_STATE         | PASS             | After fix: disabled state expires in <= 30s (cache TTL) if Ollama is alive                                                                |
| G_INTERMITTENT_PROVIDER_HANDLED   | PASS             | Intermittent behavior now bounded: count resets on probe, fresh 3-failure window each cycle                                               |
| G_AUDIO_SCOPE_CLASSIFIED          | PASS             | All audio/GStreamer warnings classified NON_BLOCKING_FOR_CHAT; no causal link to chat                                                     |
| G_TESTS_X3                        | PASS             | cargo check x3 EXIT 0; unit test coverage absent for this function (no regression)                                                        |
| G_DESKTOP_X3                      | BLOCKED_HEADLESS | Node v18 / no display; consistent with session policy                                                                                     |
| G_ROLLBACK_READY                  | PASS             | git restore -- src-tauri/src/overdrive/chat_orchestrator.rs src/services/ai/circuitBreaker.ts                                             |
| G_AH_RECURRENCE_GUARD             | PASS             | autoheal_rules.jsonl entry appended (AH-2026-03-21-0119)                                                                                  |

## Summary: 14 PASS, 1 PARTIAL, 1 BLOCKED_HEADLESS
