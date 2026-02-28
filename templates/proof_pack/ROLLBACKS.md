# Rollbacks
<!-- APPEND-ONLY: Add new rollback entries below with ## timestamp header -->

## Template — Fill in per session

**Session ID:** `{{SESSION_ID}}`  
**Date:** `{{DATE_UTC}}`

### Rollback Instructions

#### Full session rollback

```bash
git revert <commit_sha>
# or
git restore -- <file1> <file2>
```

#### Per-file rollbacks

| File | Restore command |
|------|-----------------|
| `{{FILE}}` | `git restore -- {{FILE}}` |

### Verification after rollback

```bash
bash scripts/proofpack_verify.sh
bash scripts/run_all.sh
```

### Notes

> State any side effects or dependencies to be aware of during rollback.

---
<!-- Append new rollback entries above this line -->
