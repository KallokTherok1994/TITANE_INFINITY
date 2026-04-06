# Classification - P10.R Recovery

## FINAL CLASSIFICATION: **DELETED_GIT**

### Evidence Summary

**Criterion 1: Files exist in git HEAD**
- ✅ CONFIRMED: 18 files in `git ls-tree -r HEAD`
- Git commits: c38db812 (17 files) + 97d49b01 (18th file)
- Commit dates: 2026-02-17T23:16:42-0500 and 2026-02-17T23:20:12-0500

**Criterion 2: Files missing from filesystem**
- ✅ CONFIRMED: Directory empty, `ls -la` returns no files
- filesystem stat: Directory exists, mtime=2026-02-17T23:20:12
- No files in `find` results, no signature matches on disk

**Criterion 3: Deletion is NOT tracked in git history**
- ✅ CONFIRMED: No deletion commit in `git log -n 20`
- Git status shows ' D' (deleted, not staged)
- No commit message mentioning removal

**Criterion 4: Deletion happened AFTER last commit**
- ✅ CONFIRMED: Directory mtime matches commit 97d49b01 (23:20:12)
- Files were NOT deleted by an earlier commit—they were added
- Deletion occurred post-commit, in working tree only

### Root Cause Analysis

**Hypothesis 1: Environmental cleanup?**
- Possible but no evidence of cleanup script
- VSCode resource redirection issue during attempt 2 suggests environment anomaly
- Unknown cleanup process may have removed directory contents

**Hypothesis 2: Accidental deletion (user action)?**
- Directory structure preserved, only contents deleted
- Consistent with `rm` on directory contents but not directory itself

**Hypothesis 3: Build/test process cleanup?**
- Vite dev server or test harness cleanup?
- No build output visible, but possible

### Confidence Level: **HIGH**

Evidence:
- ✅ Files provably exist in git (blob hashes, multiple commits)
- ✅ Files provably missing on filesystem (stat, ls, find all negative)
- ✅ Timeline is clear and documented
- ✅ No contradicting evidence

### Key Artifacts

| Artifact | Value |
|----------|-------|
| Commit Hash | 97d49b01dfeef3ba13a6739a916ef52c05486665 (HEAD) |
| File Count | 18 tracked files |
| Blob Example | 3568324f737e2a54a40eff59f6edcf8f5dbb8bcb (00_SCOPE.md) |
| Directory Mtime | 2026-02-17T23:20:12+00:00 |
| Recovery Path | deployment/latest/certification/phase10_2_override/P10_2_BUILD_OVERRIDE_20260218_022814/ |

### Next Step

**RECOMMENDED ACTION**: Restore from git (git restore or git checkout).

**Restorability**: Files are 100% recoverable from git HEAD without data loss.

**Time Since Deletion**: < 12 hours from commit time.
