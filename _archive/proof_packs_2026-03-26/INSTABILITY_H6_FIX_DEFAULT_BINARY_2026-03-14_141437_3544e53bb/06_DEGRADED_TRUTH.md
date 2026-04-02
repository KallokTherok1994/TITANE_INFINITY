# 06 DEGRADED TRUTH

## DEGRADED_TRUTH_MATRIX

| FIELD | EXPECTED | OBSERVED | STATUS |
|---|---|---|---|
| provider | timeout-degraded | timeout-degraded | PASS |
| mode | REMOTE (network available) | REMOTE | PASS |
| reason | TIMEOUT | TIMEOUT | PASS |
| fallback_triggered | true | true | PASS |
| fallback_used | true | true | PASS |
| TRACE_TIMEOUT_GUARD_5S | present when TITANE_TIMEOUT_TRACE=1 | present | PASS |
| honest wording | service degraded wording | "Service momentanement en degrade" | PASS |
| duration | 5s guard + overhead | 7.2s | PASS |

## Status

Honest degraded fallback: PRESERVED after H6 patch.
The H6 patch only changes which binary is loaded by default.
The degraded path code is in the binary (unchanged by the patch).
