# Build Verification

## Command

- Canonical build command: `runtime/stable/build.sh`
- Deterministic retry mode used after hang capture: timeout-bounded execution (`2400s`).

## Status

- Build exit code: `0`
- Build summary: `raw/03_build.summary.txt`
- Build log: `03_BUILD_EXECUTION.log`

## Artifact Evidence

- Artifact paths: `raw/03_artifacts_paths.txt`
- Artifact hashes: `raw/03_artifacts_hashes.txt`
- Artifact sizes: `raw/03_artifacts_sizes_bytes.txt`

## Notes

- Retry run produced mixed artifact naming/version streams in `runtime/stable/` (evidence in artifact path/hash files).
