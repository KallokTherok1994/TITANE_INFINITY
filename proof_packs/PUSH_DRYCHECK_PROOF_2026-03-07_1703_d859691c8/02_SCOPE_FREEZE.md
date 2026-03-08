# PHASE 0 - SCOPE FREEZE

## In Scope

- Git truth validation and transport proof commands only.
- Lane artifacts under `proof_packs/PUSH_DRYCHECK_PROOF_2026-03-07_1703_d859691c8/`.

## Out of Scope

- Reopening historical governance or bucket lanes.
- Runtime/frontend/backend modifications.
- Registry/policy mutations unrelated to dry-check contradiction handling.

## Hard Constraints Applied

- Forbidden: real `git push`, `--force`, branch rewrite, remote writes.
- Allowed: `git push --dry-run` only.
- If any command implies remote write: classify `HARD_STOP_REMOTE_WRITE` and stop.

