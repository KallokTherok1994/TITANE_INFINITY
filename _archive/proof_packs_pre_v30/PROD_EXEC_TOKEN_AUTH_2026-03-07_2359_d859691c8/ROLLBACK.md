# ROLLBACK

Use only if this lane must be reverted.

## Proof pack rollback

- `git restore -- proof_packs/PROD_EXEC_TOKEN_AUTH_2026-03-07_2359_d859691c8`

## Deployment metadata rollback (if required)

- `git restore -- deployment/latest/MANIFEST.json`
- `git restore -- runtime/stable/manifest.json`

## Registry append rollback (if required)

- `git restore -- registry/proofpack-index.jsonl`
- `git restore -- registry/closure-events.jsonl`

## Safety note

- Artifact binaries generated/deployed by build/deploy commands are operational side effects. Reverting tracked metadata does not delete already-produced binaries outside git history.
