# Rollback (Required)

Target SHA (current head): 6c27c7f14314afe5a66de3aa1c90a305a027b8cf

```bash
git restore --source 6c27c7f14314afe5a66de3aa1c90a305a027b8cf -- \
  docs/_evidence/RELEASE_PROMOTION_20260221_201727/ \
  registry/ui-events.jsonl \
  e2e/desktop/chat-uiux-cert.wdio.test.js

git status --porcelain=v1
```
