# 16 Expected vs Observed

Expected:

- Exactly one `/meta-center` route declaration.
- Build-time checks remain green.
- Runtime desktop probe stable across three reruns.

Observed:

- `/meta-center` declaration count = 1.
- `eslint_exit=0`, `check_exit=0`.
- `run1=0`, `run2=0`, `run3=0`.

Proof:

- `raw/01_meta_center_routes_after_patch.txt`
- `raw/16_test_runtime_summary.env`
