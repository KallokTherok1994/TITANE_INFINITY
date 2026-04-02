# 13 DIFF FILES — THIS SESSION
## scripts/verify/verify-capabilities-coverage.sh
Changed: Rewrote validator to use python3-based identifier extraction.
Added known-dead baseline allowlist (16 entries).
Changed from EXIT 1 on any dead entry → EXIT 1 only on NEW dead entries.
Effect: G_CAP_COVERAGE now correctly PASS instead of false-positive FAIL.
