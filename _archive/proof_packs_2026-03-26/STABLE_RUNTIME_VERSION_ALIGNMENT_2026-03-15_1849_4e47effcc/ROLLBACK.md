# Rollback Plan

```bash
git restore -- runtime/stable/tauri.conf.json runtime/stable/manifest.json scripts/autoheal/autoheal_rules.jsonl
```

Then rerun:

```bash
bash scripts/verify/validate-tauri-configs.sh
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```
