# Gate R6: Rollback Plan (Verified Commands)

Target SHA (current head): 6c27c7f14314afe5a66de3aa1c90a305a027b8cf

Rollback commands (non-destructive):

```bash
# Restore repo to recorded SHA for release pack artifacts only
git restore --source 6c27c7f14314afe5a66de3aa1c90a305a027b8cf -- \
  docs/_evidence/RELEASE_PROMOTION_20260221_201727/ \
  registry/ui-events.jsonl \
  e2e/desktop/chat-uiux-cert.wdio.test.js

# Verify clean state
git status --porcelain=v1

# Re-run release smoke (after stopline cleared)
# R2: reuse existing AppImage path from R2_APPIMAGE_PATH.txt
# R4: timeout 60 "$(cat R2_APPIMAGE_PATH.txt)" > R4_RELEASE_BOOT_STDOUT.log 2>&1
```
