# ROLLBACK

- To remove the integration merge from MAIN:
  - `git revert -m 1 <merge_commit_sha>`
- To remove the Cargo.lock refresh commit if reverted separately:
  - `git revert <cargo_lock_refresh_commit_sha>`
- Local user changes were restored from stash and remain independent of the integration merge.
