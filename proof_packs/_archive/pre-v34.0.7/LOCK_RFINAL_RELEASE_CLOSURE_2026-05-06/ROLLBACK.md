# Lock RFINAL — Rollback Plan

**Date:** 2026-05-06

## Rollback Scope

This lock created: documentation files, proof pack, one annotated tag, one GitHub release.
No source code was modified. No runtime flags were activated. No deployment occurred.

## Rollback Steps (if needed)

1. **Remove GitHub release:**
   ```bash
   gh release delete v33.0.9 --yes
   ```

2. **Remove tag locally and remotely:**
   ```bash
   git tag -d v33.0.9
   git push origin :refs/tags/v33.0.9
   ```

3. **Revert documentation commits (RFINAL docs only):**
   ```bash
   git revert HEAD~N  # where N = number of closure commits since last proven state
   git push origin MAIN
   ```

4. **Baseline restore:** D5 seal (eb2861bac) remains valid regardless — rollback of RFINAL does not affect D5 seal truth.

## Risk Assessment

- **LOW** — All changes are documentation and release metadata only.
- Source code, lock files, runtime config, deployment: **UNTOUCHED**.
- Desktop blockers: explicitly preserved in release notes.
