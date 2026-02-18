# Rollback Instructions

If P10.3.1 requires cancellation, execute:

```bash
# Revert the selector fix commit
git revert -n c6988d45e9d892a302c27ce884335946d677971e

# Remove fast track proof pack
rm -rf deployment/latest/certification/phase10_3_1/P10_3_1_FAST_TRACK_*

# Complete the revert
git commit -m "revert: P10.3.1 selector fix"

# Push
git push origin/MAIN
```

**Note**: Transport layer patch (ollama.ts) was committed earlier and may need separate handling.
