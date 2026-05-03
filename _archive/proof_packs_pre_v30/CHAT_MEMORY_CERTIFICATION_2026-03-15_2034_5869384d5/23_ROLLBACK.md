# 23_ROLLBACK

## Rollback complet
```bash
git restore src-tauri/src/main.rs
git restore src-tauri/src/commands/memory_commands.rs
git restore src/services/tauriCommands.ts
git restore scripts/validators/
```

## Rollback individuel par patch

### PATCH-001 (send_message)
```bash
git restore src-tauri/src/main.rs
```

### PATCH-002 (memory_get log)
```bash
git restore src-tauri/src/commands/memory_commands.rs
```

### PATCH-003 (ghost commands)
```bash
git restore src/services/tauriCommands.ts
```

### PATCH-004 (validators)
```bash
rm -rf scripts/validators/
```

## Vérification post-rollback
```bash
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```
