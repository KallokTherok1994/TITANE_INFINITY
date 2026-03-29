# ROLLBACK PLAN

## Single File Changed
- `.clinerules/05-truth-surface.md`

## Rollback Command
```bash
git checkout -- .clinerules/05-truth-surface.md
```

## Verification After Rollback
```bash
grep "DOES NOT EXIST" .clinerules/05-truth-surface.md | grep -E "(agents|instructions)"
```

## Impact of Rollback
- Truth surface returns to previous state (2 contradictions restored)
- No product runtime impact (governance surface only)
- No data loss
- No build impact