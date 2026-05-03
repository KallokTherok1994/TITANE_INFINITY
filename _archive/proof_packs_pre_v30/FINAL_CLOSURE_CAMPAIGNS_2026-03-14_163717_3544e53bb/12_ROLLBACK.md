# 12 ROLLBACK

```bash
git restore -- \
  e2e/desktop/online-chat-proof.wdio.test.js \
  e2e/desktop/online-chat-proof-ui.wdio.test.js \
  wdio.desktop.conf.cjs \
  scripts/e2e/tauri-wrapper.sh \
  scripts/gates/g5-ci-wiring.sh \
  scripts/gates/g7-tauri-allowlist-lock.sh \
  scripts/gates/run-all.sh \
  docs/_evidence/g7-tauri-allowlist-lock-report.md \
  docs/_evidence/g8-provider-api-only-report.md \
  scripts/autoheal/autoheal_rules.jsonl

git clean -fd -- proof_packs/FINAL_CLOSURE_CAMPAIGNS_2026-03-14_163717_3544e53bb
```
