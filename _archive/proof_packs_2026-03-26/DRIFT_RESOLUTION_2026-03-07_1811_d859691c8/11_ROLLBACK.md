# 11 Rollback

Current lane action used KEEP acceptance with no file mutation.

Rollback options (if policy requests revert later):

1. Revert drift targets to HEAD:
	- `git restore -- runtime/stable/manifest.json titane-infinity.desktop`
2. Recompute drift proofs:
	- `git status --short`
	- `git --no-pager diff -- runtime/stable/manifest.json titane-infinity.desktop`

Rollback impact:

- May reintroduce launcher incoherence if old desktop `Exec` points to missing AppImage.
- Must be accompanied by a new decision lane or explicit approval.

