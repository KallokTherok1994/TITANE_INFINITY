# ROLLBACK

Use only if this production execution lane must be reverted.

## Deployment metadata rollback

- `git restore -- deployment/latest/MANIFEST.json`
- `git restore -- deployment/latest/CHECKSUMS.sha256`
- `git restore -- deployment/latest/SHA256SUMS.txt`
- `git restore -- deployment/latest/SIZES.txt`

## Runtime metadata rollback

- `git restore -- runtime/stable/manifest.json`

## Proof pack rollback

- `git restore -- proof_packs/PROD_EXEC_TOKEN_RETRY_20260316_020356_8c17c2e98`

## Safety note

- Reverting tracked metadata does not remove already-built binaries that exist outside git history.
