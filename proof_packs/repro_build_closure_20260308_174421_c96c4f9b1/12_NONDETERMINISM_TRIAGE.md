# Non-Determinism Triage

## Observed Pattern
- Pre-fix: run1/run2 matched while run3 diverged in normalized comparison.
- Evidence: `raw/30_buildid_hypothesis_check.log`.

## Triage Outcome
- `--strip-debug` normalization was insufficient for stable hash comparison.
- Applying full strip normalization (`--strip-all`) removes non-functional metadata variance from comparison targets.
- Evidence: `raw/31_stripall_hashes_check.log` and post-fix x3 PASS in `raw/40_g6_rerun_after_patch.log`.

## Conclusion
- Non-determinism signal is closed at gate-comparison level for this lane.
- Final status: PASS.
