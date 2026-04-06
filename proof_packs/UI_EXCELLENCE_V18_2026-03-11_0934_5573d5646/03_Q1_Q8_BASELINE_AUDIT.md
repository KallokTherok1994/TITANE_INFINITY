# 03 Q1..Q8 Baseline Audit

Source: `raw/11_run1_metrics.json`

## Q-axis Summary (run1)

- `Q1`: visual hierarchy present (`primaryTitlePresent: true`).
- `Q2`: text contrast/readability acceptable (`inputContrast: 21`).
- `Q3`: shell coherence acceptable (`activeVsInactiveDistinct: true`).
- `Q4`: density/reflow acceptable (`contentReflowReasonable: true`).
- `Q5`: interaction accessibility partly failing (`tabFocusRulePresent: false`).
- `Q6`: semantics and bindings pass (`tablistPresent: true`, `tabpanelBound: true`).
- `Q7`: visible actionable UI and non-white screen pass.
- `Q8`: no critical overlay condition in measured snapshot.

## Baseline Verdict

- `PASS` on Q1, Q2, Q3, Q4, Q6, Q7, Q8.
- `FAIL` on Q5 due to missing dedicated tab keyboard focus styling.
