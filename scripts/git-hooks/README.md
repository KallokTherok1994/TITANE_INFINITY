# TITANE_INFINITY — Git hooks (opt-in governance)

Doctrine: do NOT enforce hooks via `.husky` or global git config.
Each developer installs locally:

```bash
git config core.hooksPath scripts/git-hooks
chmod +x scripts/git-hooks/*
```

## `pre-push`

Enforces tag convention `refs/tags/release/vX.Y.Z-<scope>-<YYYY-MM-DD>` for new
release tags. Blocks plain semver `vX.Y.Z` tags to prevent collision with legacy
tags already on origin (`v36.0.0`, `v37.1.0`).

Bypass (governance audit trail required in commit / proof_pack):

```bash
TITANE_ALLOW_LEGACY_TAG=1 git push origin <tag>
```

Other tag namespaces (e.g. `windows-pr292-launcher-pack-20260412`) are allowed
unconditionally.

## Verification

```bash
# Dry-run: simulate a forbidden tag push (no actual remote interaction)
printf 'refs/tags/v99.0.0 abc refs/tags/v99.0.0 def\n' | \
  bash scripts/git-hooks/pre-push origin git@github.com:KallokTherok1994/TITANE_INFINITY.git
# → exit 1, message printed

# Canonical convention passes
printf 'refs/tags/release/v35.2.0-d-tests-2026-05-14 abc refs/tags/release/v35.2.0-d-tests-2026-05-14 def\n' | \
  bash scripts/git-hooks/pre-push origin git@github.com:KallokTherok1994/TITANE_INFINITY.git
# → exit 0
```

Rollback: `git config --unset core.hooksPath` (or remove the directory).
