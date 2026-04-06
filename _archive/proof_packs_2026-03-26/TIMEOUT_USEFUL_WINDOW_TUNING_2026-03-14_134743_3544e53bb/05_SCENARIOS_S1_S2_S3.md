# 05_SCENARIOS_S1_S2_S3

## S1 BEFORE (Pre-patch)

Source: `/tmp/timeout_tuning_s1_before.log`

- `[PROOF] scenario=TUNING_S1_BEFORE run=before_nominal`
- `[CHAT_DECISION] online=true mode=REMOTE reason=TIMEOUT provider=timeout-degraded`
- `[D2_DERIVED] fallback_triggered=true fallback_used=true`
- `1 passing (22.7s)`

Result: `PASS` (baseline captured), behavior: degraded fallback on nominal path.

## S2 AFTER (Post-patch nominal x3)

Sources: `/tmp/timeout_tuning_s2_after_run1.log`, `/tmp/timeout_tuning_s2_after_x3.log`

Run 1:
- `[PROOF] scenario=TUNING_S2_AFTER run=after_nominal_run1`
- `[CHAT_DECISION] online=false mode=LOCAL reason=OK provider=Ollama`
- `[D2_DERIVED] fallback_triggered=false fallback_used=false`
- `1 passing (45.2s)`

Run 2:
- `[PROOF] scenario=TUNING_S2_AFTER run=after_nominal_run2`
- `[CHAT_DECISION] online=false mode=LOCAL reason=OK provider=Ollama`
- `[D2_DERIVED] fallback_triggered=false fallback_used=false`
- `1 passing (38.3s)`

Run 3:
- `[PROOF] scenario=TUNING_S2_AFTER run=after_nominal_run3`
- `[CHAT_DECISION] online=false mode=LOCAL reason=OK provider=Ollama`
- `[D2_DERIVED] fallback_triggered=false fallback_used=false`
- `1 passing (24.6s)`

Result: `PASS` (x3 stable, non-degraded responses).

## S3 FORCED DEGRADED (Honesty preservation)

Source: `/tmp/timeout_tuning_s3_degraded.log`

Runtime params:
- `TITANE_CONVERSATION_TIMEOUT_SECS=5`
- `TITANE_TIMEOUT_TRACE=1`

Evidence:
- `[PROOF] scenario=TUNING_S3_DEGRADED run=forced_timeout_guard5`
- `[CHAT_DECISION] online=true mode=REMOTE reason=TIMEOUT provider=timeout-degraded`
- `[D2_DERIVED] fallback_triggered=true fallback_used=true`
- Assistant text contains `TRACE_TIMEOUT_GUARD_5S`
- `1 passing (6.9s)`

Result: `PASS` (degraded path remains explicit and honest).
