# ROLLBACK — Lock A1

**Lock**: A1  
**Date**: 2026-05-06

## Rollback Procedure

All A1 changes are docs-only (T0). No runtime code was modified. No build was triggered.

### Step 1: Revert README.md

```bash
git checkout HEAD~1 -- README.md
```

Or restore the v33.0.0 badge and version claims manually:
- Badge: `![Release v33.0.0](https://img.shields.io/badge/release-v33.0.0-brightgreen?logo=github)`
- Version: `**Version:** v33.0.0 (repository authority)`
- Canal de release: `v33.0.0`
- Checksums: restore previous values (v33.0.0 from old commit history)

### Step 2: Revert RELEASE_SURFACE_INVENTORY.md

```bash
git checkout HEAD~1 -- RELEASE_SURFACE_INVENTORY.md
```

Or remove the A1 VERSION AUTHORITY NOTE block (lines between the two `---` markers added at top of `# RELEASE SURFACE INVENTORY` heading).

### Step 3: Remove new files

```bash
rm -f docs/reports/VERSION_RELEASE_AUTHORITY_MATRIX.md
```

### Step 4: Revert AutoHeal entry (if needed)

Remove last JSON line from `scripts/autoheal/autoheal_rules.jsonl` (entry: `LOCK_A1_2026_05_06`).

### Step 5: Revert program status

```bash
git checkout HEAD~1 -- docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
```

## Risk of Rollback

- Low: no runtime code or build artifacts modified
- After rollback: README/RELEASE_SURFACE_INVENTORY will show stale v33.0.0 claims again
- Rollback does NOT affect running system
