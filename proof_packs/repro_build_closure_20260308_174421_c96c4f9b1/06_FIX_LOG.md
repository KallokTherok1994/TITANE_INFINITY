# Fix Log

## Minimal Patch Applied
- File: `scripts/gates/g6-build-reproducibility.sh`
- Function: `normalize_binary_for_hash`
- Change:
	- `llvm-strip --strip-debug` -> `llvm-strip --strip-all`
	- `strip --strip-debug` -> `strip --strip-all`

## Rationale
- Keep gate semantics unchanged.
- Strengthen normalization to remove non-functional metadata drift in compared binaries.

## Blast Radius
- Limited to G6 normalized hash comparison stage.
- No runtime behavior change for application execution.
