# ROLLBACK — Lock A2

**Lock**: A2  
**Date**: 2026-05-06

## Rollback Procedure

A2 is T0 (docs-only). No runtime code modified. No build triggered.

### Step 1: Remove source map

```bash
rm -f docs/research/AI_ENGINEERING_SOURCE_MAP.md
```

### Step 2: Revert AutoHeal entry

Remove last JSON line from `scripts/autoheal/autoheal_rules.jsonl` (entry: `LOCK_A2_2026_05_06`).

### Step 3: Revert program status

```bash
git checkout HEAD~1 -- docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md
```

## Risk of Rollback

- Low: no runtime code or build artifacts modified
- After rollback: future locks (B0–D4) lose their source references; B0 scorecard stubs will need re-grounding
