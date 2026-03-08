# Root Cause

## Category
RC4 - Hash normalization insufficiency (single dominant cause retained).

## Statement
`scripts/gates/g6-build-reproducibility.sh` normalized binaries with `--strip-debug` only, which left non-functional ELF metadata that can drift across runs and contaminate reproducibility hash comparisons.

## Evidence
- Divergent run hashes pre-fix captured in:
	- `raw/30_buildid_hypothesis_check.log`
- Full strip normalization converged the compared binaries in:
	- `raw/31_stripall_hashes_check.log`

## Why this is dominant
- A single-line normalization policy in G6 is directly in the comparison path.
- Fixing this point yielded x3 PASS immediately without widening scope.
