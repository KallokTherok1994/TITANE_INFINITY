# Truth Snapshot

## Canonical Build/Repro Path
- Repro gate script: `scripts/gates/g6-build-reproducibility.sh`.
- Effective x3 command chain per run:
	- `pnpm run guard:ollama-proxy`
	- `bash scripts/e2e/require-e2e-build-authorization.sh`
	- `pnpm -s exec vite build`
	- `cargo build --manifest-path src-tauri/Cargo.toml --release --locked`
- Evidence:
	- `raw/28_scan_g6_determinism_knobs_clean.log`
	- `raw/25_scan_package_build_scripts_clean.log`
	- `raw/27_scan_workflow_build_paths_clean.log`

## Environment Snapshot
- Node: `v24.0.0`
- pnpm: `10.30.2`
- cargo: from `raw/05_cargo_version.txt`
- rustc: from `raw/06_rustc_version.txt`

## Observed Failure Signal (pre-fix)
- Prior reproducibility artifacts showed run3 drift while run1/run2 matched.
- Divergent hashes and ELF note evidence captured in:
	- `raw/30_buildid_hypothesis_check.log`
	- `raw/31_stripall_hashes_check.log`

## Post-fix Truth
- Re-run of G6 completed x3 with identical normalized hashes.
- Evidence:
	- `raw/40_g6_rerun_after_patch.log`
	- `deployment/latest/builds/BUILD_REPRODUCIBILITY.md`
