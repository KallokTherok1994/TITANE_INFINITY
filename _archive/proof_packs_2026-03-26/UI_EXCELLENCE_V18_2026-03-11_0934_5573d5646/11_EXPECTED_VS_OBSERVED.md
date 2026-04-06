# 11 Expected vs Observed

| Item | Expected | Observed | Status |
|---|---|---|---|
| Dominant friction closure | `FX-FOCUS-TABS-001` removed | `frictions: []` in run2/run3/run4 | PASS |
| Keyboard focus visibility | `tabFocusRulePresent: true` after fix | true in run2/run3/run4 | PASS |
| Regression on layout/readability | no drop on Q1..Q4/Q6..Q8 | metrics remain positive | PASS |
| Stability after fix | rerun x3 with success | run2=0 run3=0 run4=0 | PASS |

Source artifacts: `raw/11_run2_metrics.json`, `raw/11_run3_metrics.json`, `raw/11_run4_metrics.json`, `raw/12_reruns_exitcodes.txt`.
