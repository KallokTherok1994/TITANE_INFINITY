# 08 ROLLBACK

## Rollback Commands

```bash
git restore -- wdio.desktop.conf.cjs
```

## What is reverted

- `wdio.desktop.conf.cjs`: APP_PATH fallback reverts to AppImage (re-introduces instability)

## Rollback safe?

YES — single file, E2E config only, no binary/Rust change.

## When to rollback

- If release binary becomes unavailable and AppImage is needed
- Before any prod deployment that requires AppImage-only testing
