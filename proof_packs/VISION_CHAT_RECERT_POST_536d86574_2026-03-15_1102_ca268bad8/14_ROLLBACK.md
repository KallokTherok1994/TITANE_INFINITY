# 14_ROLLBACK

## Rollback du commit 536d86574

```bash
git revert 536d86574 --no-commit
git commit -m "revert: VISION_CHAT_AUDIT 2026-03-15 patch"
```

## Rollback du fix IPC generate_response (recertification)

```bash
git restore -- src-tauri/src/main.rs
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

## Rollback complet (les deux)

```bash
git revert HEAD --no-commit  # revert recert patch
git restore -- src-tauri/src/main.rs
git restore -- scripts/autoheal/autoheal_rules.jsonl
```
