# ROLLBACK

Use only if this proof lane must be reverted.

## Proof Pack Rollback

- `git restore -- proof_packs/PROD_DEPLOY_TOKEN_EXEC_2026-03-13_2057_5b164aa87`

## Runtime Artifact Rollback (workspace local)

- `rm -f runtime/stable/Titan-Stable_27.2.0_amd64.AppImage`
- `rm -f src-tauri/target/release/bundle/deb/Titan-Stable_27.2.0_amd64.deb`

## Safety Note

- Removing local artifacts does not alter remote release state or previously published binaries.
- `git restore` only reverts tracked files in this repository.
