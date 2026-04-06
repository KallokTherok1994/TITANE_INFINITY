# 23_ROLLBACK.md

## Full Rollback

```bash
# Revert all TOTAL_DEV commits
git revert 4519f2254 58b21b592 7e2464e5c

# Or selective restore to baseline
git restore --source=a303b260f -- \
  src-tauri/src/commands/ \
  src/pages/TotalDevPage.* \
  src/App.tsx \
  src-tauri/src/main.rs \
  e2e/total-dev-smoke.spec.ts
```

## Partial Rollback (safe)

**Remove only** the plaintext comment:

```bash
# In src-tauri/src/commands/total_dev_commands.rs, line 19-22:
# Change:
//   SHA-256 of "Kanele1994" — stored ONLY in Rust, never in frontend

# To:
//   SHA-256 hash of super-admin unlock token — stored ONLY in Rust, never exposed
```

This is the **recommended** fix for plaintext blocker.

## Risk Assessment

- Full rollback: 0% risk (feature only)
- Partial rollback (comment fix): 0% risk (comment only, no logic change)
