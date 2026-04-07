# ROLLBACK — CHAT IPC ARGS WRAP VERIFY

If rollback is required:

```bash
git revert ce85a922
pnpm test
pnpm run guard:ipc-contract
```

Notes:
- Do not use destructive commands (no reset --hard).
- Re-run dev:tauri smoke after rollback.
