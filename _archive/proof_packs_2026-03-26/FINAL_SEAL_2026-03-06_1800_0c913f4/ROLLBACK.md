# ROLLBACK — FINAL_SEAL_2026-03-06_1800_0c913f4

---

## FIX-003 (doublon memory_get_stats)
```bash
git restore -- src-tauri/src/main.rs scripts/autoheal/autoheal_rules.jsonl
```

## Rollback complet cette session + session précédente
```bash
git restore -- \
  src-tauri/src/identity/commands.rs \
  src-tauri/src/commands/ai_chat.rs \
  src-tauri/src/main.rs \
  src-tauri/tauri.conf.json \
  scripts/autoheal/autoheal_rules.jsonl
```

## Note
Les proof_packs/ sont append-only — ne pas supprimer.
