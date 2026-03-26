# Rollback Instructions — Provider Recovery Triple Fix

## Immediate rollback (code only)
```
git revert 664728743 --no-edit
git push origin MAIN
```

## Per-file rollback
```
git restore --source 207d3dd9e -- src/lib/errorClassification.ts src-tauri/src/overdrive/chat_orchestrator.rs
git push origin MAIN
```

## Release assets rollback
Re-upload previous build artifacts from dist-28.0.0.tar.gz backup if needed.
