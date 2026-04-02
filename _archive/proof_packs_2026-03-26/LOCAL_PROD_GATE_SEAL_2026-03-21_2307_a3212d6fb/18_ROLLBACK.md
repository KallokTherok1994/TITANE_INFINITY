# ROLLBACK

## This session only (capabilities + CHANGELOG)
git restore -- src-tauri/capabilities/chat_ai.json CHANGELOG.md scripts/autoheal/autoheal_rules.jsonl

## All 5 prior sessions + this session
git revert --no-commit a3212d6fb 61df44d0b 69c1c948f ce2cbecac 34b2097d7
git commit -m "revert: rollback sessions 1-5 (provider + LTM + injection + backup)"
git restore -- src-tauri/capabilities/chat_ai.json CHANGELOG.md

## Risk: LOW — all changes additive; no DB migration; no schema change
## LTM files already written to disk are orphaned but harmless
