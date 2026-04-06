# 12_ROLLBACK

## Release seal rollback plan

### If release binary causes regression
```bash
# Revert to STABLE_LANE certified state
git checkout 27b4998d3
pnpm exec tauri build  # rebuild from known-stable SHA
```

### If tauri.conf.json needs revert
```bash
git restore -- src-tauri/tauri.conf.json
```

### If this proof pack must be retracted
```bash
# Append retraction notice to 13_VERDICT.md (append-only, never delete)
echo "RETRACTED: <reason> — $(date -u)" >> proof_packs/RELEASE_SEAL_2026-03-15_1606_773f2a89e/13_VERDICT.md
git add proof_packs/RELEASE_SEAL_2026-03-15_1606_773f2a89e/13_VERDICT.md
git commit -m "docs(proof): retract RELEASE_SEAL verdict — <reason>"
```

### Known rollback points
| SHA | State |
|-----|-------|
| 27b4998d3 | STABLE (tests 3218/3218 + E2E 4/4 x3) |
| b81cc6e21 | beforeBuildCommand fixed (C001) |
| c59e9b5b3 | pre-STABLE baseline |

### Autoheal reference
AH-TESTS-001: vitest.config.ts toxic test exclusion
AH-CANON-001: canon doc command count correction
