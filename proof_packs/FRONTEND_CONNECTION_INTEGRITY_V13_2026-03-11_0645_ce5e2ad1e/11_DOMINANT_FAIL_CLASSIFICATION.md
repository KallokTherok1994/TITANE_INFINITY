# 11 Dominant Fail Classification

Classification: `FAIL_ROUTE_DUPLICATION_MAP_INTEGRITY`

Severity: medium

Why dominant:

- It affects the V13 core objective (single-source frontend mapping integrity).
- It was deterministic and directly provable.
- It required only one-line removal for safe correction.

Evidence:

- `raw/14_git_diff_patch.txt`
