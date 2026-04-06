# Rollbacks
<!-- Status: STABLE | Ring: 4 -->

## Rollback Policy (Invariant I9)

Every change merged to the repository must have documented rollback steps in the relevant proof pack's `ROLLBACKS.md`.

## General Rollback Commands

### Single file rollback
```bash
git restore -- <path/to/file>
```

### Commit rollback (non-destructive)
```bash
git revert <commit_sha>
```

### Session rollback (restore all files in proof pack)
```bash
# Get list from proof pack CHANGELOG_FILES.md
git restore -- file1 file2 file3
```

## Prohibited rollback commands

- `git reset --hard` (destructive, requires force push)
- `git rebase` (rewrites history, requires force push)
- `git push --force` (not available in this environment)

## Script rollbacks

All new scripts can be rolled back with:
```bash
git restore -- scripts/run_all.sh scripts/run_x3.sh \
  scripts/proofpack_init.sh scripts/proofpack_verify.sh \
  scripts/redact_secrets.sh scripts/collect_support_bundle.sh

git restore -- checks/
git restore -- templates/proof_pack/
git restore -- docs/PROOF_SYSTEM_OVERVIEW.md docs/POLICY_SPINE.md \
  docs/TRUTH_CONTRACT.md docs/ANTI_DRIFT.md docs/ROLLBACKS.md \
  docs/PR_READY_REPORT_TEMPLATE.md docs/STATUS.md

git restore -- .github/workflows/ci-guardrails.yml
```

## Verification after rollback

```bash
bash scripts/proofpack_verify.sh
bash scripts/run_all.sh
```

If `scripts/` was rolled back, verify manually:
```bash
ls checks/ scripts/ templates/proof_pack/
```
