# ROLLBACK — MASTER_AUTOHEAL_2026-03-06_1728_402c2ae

---

## Rollback par fix

### FIX-001 (P2-001 identity stubs)
```bash
git restore -- src-tauri/src/identity/commands.rs src-tauri/src/main.rs src-tauri/tauri.conf.json
```

### FIX-002 (P2-002 AIChatState Default)
```bash
git restore -- src-tauri/src/commands/ai_chat.rs src-tauri/src/main.rs src-tauri/tauri.conf.json
```

### Rollback global (tous les changements de cette session)
```bash
git restore -- src-tauri/src/identity/commands.rs src-tauri/src/commands/ai_chat.rs src-tauri/src/main.rs src-tauri/tauri.conf.json scripts/autoheal/autoheal_rules.jsonl
```

---

## Impact rollback

| Fichier | Impact |
|---------|--------|
| identity/commands.rs | Suppression de 8 fonctions + import ExtendedRule |
| commands/ai_chat.rs | Suppression impl Default for AIChatState |
| main.rs | Suppression 8+14 commandes + 1 .manage(AIChatState::default()) |
| tauri.conf.json | Suppression 24 entrées allowlist |
| autoheal_rules.jsonl | Retour à 68 entrées (suppression AH-0056, AH-0057) |

---

## Note

Les proof pack files (ce répertoire) sont append-only.
Ne pas supprimer — artefact de gouvernance.
