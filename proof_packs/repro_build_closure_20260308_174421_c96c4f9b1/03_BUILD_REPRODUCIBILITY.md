# Build Reproducibility

## Pre-fix Observation
- Repro lane showed non-deterministic hash outcome on run3.
- Diagnostic captures:
	- `raw/30_buildid_hypothesis_check.log`
	- `raw/31_stripall_hashes_check.log`

## Post-fix Re-run (x3)
- Gate executed: `bash scripts/gates/g6-build-reproducibility.sh`
- Run result: PASS.
- Final normalized hash for all 3 runs:
	- `987963dddf387dbc5349d3deb53da376dad2633ffd8b32e1e826a26774482bce`
- Evidence:
	- `deployment/latest/builds/BUILD_REPRODUCIBILITY.md`
	- `deployment/latest/builds/hash_run_1.txt`
	- `deployment/latest/builds/hash_run_2.txt`
	- `deployment/latest/builds/hash_run_3.txt`
	- `raw/40_g6_rerun_after_patch.log`
