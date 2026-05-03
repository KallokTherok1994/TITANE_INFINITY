# 14 — ENTRÉE AUTOHEAL

## Entrée ajoutée à scripts/autoheal/autoheal_rules.jsonl

```json
{
  "id": "AH_LOCAL_DISK_CLEANUP_2026-03-22",
  "signature": "src-tauri/target >100G and/or deployment/latest/builds/target-run-* present",
  "prevention": "run cargo clean after each release build; never commit target/ to deployment/",
  "verification": "du -sh src-tauri/target/ < 10G after clean"
}
```

## Commandes vérification post-autoheal

```bash
bash scripts/autoheal/detect_recurrence.sh 2>/dev/null | tail -3
bash scripts/verify_instructions.sh 2>/dev/null | tail -3
```
