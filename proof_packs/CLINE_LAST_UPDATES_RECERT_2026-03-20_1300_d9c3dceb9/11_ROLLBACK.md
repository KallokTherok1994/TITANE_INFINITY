# 11 — ROLLBACK

## Rollback Instructions

### Full rollback (restore .clinerules/ to pre-patch state)

```bash
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
git restore -- .clinerules/behavioral_analysis_report.md
git restore -- .clinerules/observation_protocol_operational.md
git restore -- .clinerules/verdict_final_sealed.md
rm -rf proof_packs/CLINE_LAST_UPDATES_RECERT_2026-03-20_1300_d9c3dceb9
```

### Partial rollback (restore one file only)

```bash
git restore -- .clinerules/verdict_final_sealed.md
```

## Rollback Risk Assessment
- **Impact**: LOW — only documentation/protocol/verdict files moved, no code changed
- **Reversibility**: IMMEDIATE — single `git restore` per file
- **Side effects**: NONE — no cross-references in active rules, validator, or hooks
- **Time estimate**: < 30 seconds

## Why rollback would be needed
Only if a downstream tool (e.g. future CLINE rule checker) expects these files in `.clinerules/` by hardcoded path. No such reference found in current codebase (verified by grep).
