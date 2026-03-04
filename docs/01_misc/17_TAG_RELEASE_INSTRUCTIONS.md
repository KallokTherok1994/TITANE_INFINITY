# Explicit Tag/Release Instructions (NO --follow-tags)

## Prerequisites
- Working tree is clean
- On MAIN branch
- No tags will be auto-pushed

## Create annotated release tag (if not already existing)
```bash
git tag -a "v27.0.2" -m "TITANE_INFINITY v27.0.2 (P2 certified: bundle plateau, no regressions)" "97b566d3"
```

## Push ONLY this tag (explicit, safe)
```bash
git push origin "v27.0.2"
```

## Verify remote
```bash
git ls-remote --tags origin | grep "v27.0.2"
```

## Optional: GitHub Release (if gh CLI available and authenticated)
```bash
gh release create "v27.0.2"   --title "TITANE_INFINITY v27.0.2 (P2 certified: bundle plateau, no regressions)"   --notes-file "reports/ai_local_vΩ3/P2_DEPLOYMENT_GATE_97b566d3_*/12_RELEASE_NOTES.md"
```

## Post-release verification
Git tags should show only:
- P2_PHASE2A_SYNCED
- P2_POST_MERGE_BUILD_VERIFIED_97b566d3
- v27.0.2
