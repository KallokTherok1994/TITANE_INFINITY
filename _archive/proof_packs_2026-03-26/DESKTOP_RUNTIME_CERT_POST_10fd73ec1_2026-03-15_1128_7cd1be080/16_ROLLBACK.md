# 16_ROLLBACK

## Rollback complet audit session (commits 536d86574 + 10fd73ec1 + 7cd1be080)

```bash
git revert HEAD --no-commit     # revert audio fix
git revert HEAD~1 --no-commit   # revert IPC + proof pack
git revert HEAD~2 --no-commit   # revert VISION_CHAT_AUDIT
git commit -m "revert: full audit session 536d86574..7cd1be080"
```

## Rollback generate_response uniquement

```bash
git restore -- src-tauri/src/main.rs
cargo check --manifest-path=src-tauri/Cargo.toml
```
