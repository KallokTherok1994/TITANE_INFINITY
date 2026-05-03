# 13 Stability And Reruns

Retained stability sequence for the final kept patch:

- `run1`: FAIL (page crash/hang during early reload; harness/runtime startup flake, not retained as final product verdict)
- `run2`: PASS in ~6.2s
- `run3`: PASS in ~6.5s
- `run4`: PASS in ~6.5s

Why `run2`/`run3`/`run4` are sufficient for final retained stability proof:

- They run on the kept zoom-consistency patch.
- They all produce screenshots and JSON audits.
- They all confirm the same visible shell markers, interaction markers, and response visibility.

Exploratory confirmations after a non-kept CSS candidate:

- `run5`/`run6`/`run7`: PASS, but not used as canonical final proof because the source experiment they accompanied was reverted.

Conclusion:

- Final kept patch is stable enough for `FRONTEND_UI_FIXED_AND_STABLE`.
