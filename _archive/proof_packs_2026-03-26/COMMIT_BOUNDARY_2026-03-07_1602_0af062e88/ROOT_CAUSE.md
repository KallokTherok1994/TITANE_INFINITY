# ROOT CAUSE

`GLOBAL_SEAL_READINESS` and `COMMIT_READINESS` remain `BLOCKED` after successful Bucket A execution because the repository still contains unresolved mixed dirty scope outside the executed boundary:

- `tracked_modified=13`
- `untracked_count=27`
- `staged_count=0`

Executed boundary was exact and successful, but it intentionally did not include deferred runtime/proof-pack buckets.

Evidence:

- `raw/readiness_recalc_counts.env`
- `raw/post_commit_status_short_fresh.txt`
- `08_READINESS_RECALC.md`
