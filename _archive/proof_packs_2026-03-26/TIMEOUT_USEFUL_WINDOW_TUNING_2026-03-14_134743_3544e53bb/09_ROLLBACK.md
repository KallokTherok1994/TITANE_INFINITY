# 09_ROLLBACK

## Minimal Rollback

```bash
git restore -- src-tauri/src/conversation_engine/mod.rs src/lib/tauriClient.ts scripts/autoheal/autoheal_rules.jsonl
```

## Proof Pack Rollback (if needed)

```bash
rm -rf proof_packs/TIMEOUT_USEFUL_WINDOW_TUNING_2026-03-14_134743_3544e53bb
```

Rollback status: `READY`
