# Rollback Instructions

To cancel P10.3.2 FAIL verdict and revert:

```bash
# Remove proof pack
rm -rf "deployment/latest/certification/phase10_3_2/P10_3_2_FULL_DESKTOP_E2E_X3_20260218T200739Z"

# Update registry (remove P10.3.2 entry)
# (Requires manual edit or script)

# Revert last commit (if pushed)
git revert -n dbd8c089c442451d911963d373d59cc851c6f67a
git commit -m "revert: P10.3.2 failed E2E verdict"
git push origin/MAIN
```

**Note**: FAIL verdict stands as truth. Do not skip to PASS without re-running E2E x3.
