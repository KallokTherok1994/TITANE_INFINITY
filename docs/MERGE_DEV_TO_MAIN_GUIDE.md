# Quick Guide: Merging dev into MAIN

**Last Updated:** 2026-01-01  
**Status:** ✅ Ready to Execute  
**Estimated Time:** 5-10 minutes

## TL;DR

```bash
# Quick merge (if you're confident)
cd /path/to/TITANE_INFINITY
./scripts/merge-dev-to-main.sh
```

## Context

The **dev** branch has 3 commits (created Dec 23, 2025) that need to be merged into **MAIN**:

1. **c979a52** - sync local changes
2. **beaf7f0** - v26.2.1 completion marker  
3. **a7f1770** - deep analysis documentation

These are documentation and housekeeping commits from after PR #46 was merged.

## Why This Merge is Needed

**Timeline:**
- ✅ Dec 23, 01:26: PR #46 merged dev → MAIN
- 📝 Dec 23, 03:20-03:29: 3 new commits added to dev (completion docs)
- ✅ Dec 24-Jan 1: MAIN received PRs #47-#50  
- ❌ **Missing**: Those 3 dev commits never made it to MAIN

## Pre-Flight Checklist

Before running the merge:

- [ ] You have push access to the repository
- [ ] Your working directory is clean (`git status`)
- [ ] You're connected to the internet (for git fetch/push)
- [ ] You have ~10 minutes available (in case of conflicts)

## Method 1: Automated Script (Recommended)

The safest and easiest approach:

```bash
# From repository root
./scripts/merge-dev-to-main.sh
```

This script will:
1. ✅ Check working directory is clean
2. ✅ Fetch latest from remote
3. ✅ Checkout and update MAIN
4. ✅ Show commits to be merged
5. ✅ Ask for confirmation
6. ✅ Perform the merge
7. ✅ Run tests (if available)
8. ✅ Push to remote
9. ✅ Provide next steps

## Method 2: Manual Steps

If you prefer to do it manually or the script fails:

```bash
# 1. Prepare
git status  # Should be clean
git fetch origin

# 2. Checkout MAIN
git checkout MAIN
git pull origin MAIN

# 3. Review what will be merged
git log --oneline MAIN..origin/dev

# 4. Perform merge
git merge origin/dev -m "Merge dev branch: sync changes and v26.2.1 completion markers"

# 5. If conflicts occur
git status  # See conflicted files
# Resolve conflicts, then:
git add .
git commit

# 6. Test (optional but recommended)
pnpm test

# 7. Push
git push origin MAIN
```

## Method 3: Cherry-Pick (Alternative)

If you want to be more selective:

```bash
git checkout MAIN
git pull origin MAIN

# Cherry-pick the 3 specific commits
git cherry-pick a7f1770130ef55eb5c94b599dc7947e3a89f3b14
git cherry-pick beaf7f079bddca6901482007c08f8a82aae7473d
git cherry-pick c979a52a68199157c7a26f8933407681ab759d9e

git push origin MAIN
```

## Conflict Resolution (If Needed)

**Expected Conflicts:** NONE or MINIMAL (documentation only)

If conflicts occur:

1. **Identify conflicts:**
   ```bash
   git status
   ```

2. **Open conflicted files** - look for conflict markers:
   ```
   <<<<<<< HEAD
   (MAIN's version)
   =======
   (dev's version)
   >>>>>>> dev
   ```

3. **Resolve each conflict** by choosing the correct version or merging both

4. **Mark as resolved:**
   ```bash
   git add <file>
   ```

5. **Complete the merge:**
   ```bash
   git commit
   ```

6. **Push:**
   ```bash
   git push origin MAIN
   ```

## Post-Merge Actions

After successfully merging:

### 1. Sync dev with MAIN (Recommended)

Keep dev up-to-date with MAIN's recent PRs:

```bash
git checkout dev
git merge MAIN -m "Sync dev with MAIN (includes PRs #47-#50)"
git push origin dev
```

### 2. Verify on GitHub

- Check the GitHub repository to confirm the merge
- Review the commit graph
- Ensure all tests pass (if CI/CD is configured)

### 3. Update Documentation (If Needed)

If you made significant changes during conflict resolution, update:
- CHANGELOG.md
- Version numbers
- README.md

## Troubleshooting

### Problem: "Working directory not clean"
**Solution:** Commit or stash your changes first
```bash
git stash
# or
git commit -am "WIP: saving work"
```

### Problem: "Failed to fetch from remote"
**Solution:** Check your network and authentication
```bash
git remote -v  # Verify remote URL
git fetch origin --verbose  # See detailed error
```

### Problem: "Merge conflicts in [file]"
**Solution:** Follow the conflict resolution steps above

### Problem: "Tests failing after merge"
**Solution:** Investigate test failures
```bash
pnpm test -- --verbose
# Fix issues, commit fixes
git commit -am "fix: resolve post-merge test failures"
git push origin MAIN
```

### Problem: "Permission denied (push)"
**Solution:** Check your GitHub permissions
- Ensure you have write access to the repository
- Verify your GitHub authentication (SSH key or HTTPS token)

## Validation Checklist

After merge, verify:

- [ ] MAIN branch includes the 3 dev commits (check GitHub)
- [ ] `pnpm test` passes ✅
- [ ] `pnpm run build` succeeds ✅
- [ ] `cargo build` (backend) succeeds ✅
- [ ] No merge conflict markers remain in files
- [ ] Documentation is coherent and consistent
- [ ] CI/CD pipeline passes (if configured)

## Risk Assessment

**Overall Risk:** 🟢 LOW

- **Commits:** Only 3, all documentation/sync related
- **Conflict Probability:** <10% (no code changes visible)
- **Recovery Time:** <5 minutes (if issues occur)
- **Impact:** Low - these are completion markers from December

## Additional Resources

- **Detailed Analysis:** See `docs/DEV_TO_MAIN_MERGE_ANALYSIS.md`
- **Merge Script:** `scripts/merge-dev-to-main.sh`
- **Git Documentation:** https://git-scm.com/docs/git-merge
- **GitHub Docs:** https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request

## Support

If you encounter issues:

1. **Check the detailed analysis:** `docs/DEV_TO_MAIN_MERGE_ANALYSIS.md`
2. **Review git status:** `git status --verbose`
3. **Check commit history:** `git log --oneline --graph --all -20`
4. **Ask for help:** Create an issue with:
   - Error messages
   - Git status output
   - Steps you've tried

## Success Criteria

Merge is complete when:

✅ All 3 commits from dev are in MAIN  
✅ No conflicts remain  
✅ Tests pass  
✅ MAIN pushed successfully to GitHub  
✅ GitHub shows the merge commit  

---

**Document Version:** 1.0  
**Author:** TITANE_INFINITY Team  
**License:** Same as repository
