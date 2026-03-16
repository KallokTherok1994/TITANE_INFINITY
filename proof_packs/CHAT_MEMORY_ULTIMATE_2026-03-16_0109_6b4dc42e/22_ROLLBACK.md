# 22 — ROLLBACK

## Rollback complet (git revert)
```bash
git revert HEAD  # après commit final de cette session
```

## Rollback granulaire PATCH-A
```bash
git restore -- src-tauri/src/conversation_engine/commands.rs
git restore -- src-tauri/src/main.rs
git restore -- src/services/api/chat.ts
```

## Rollback granulaire PATCH-B
```bash
git restore -- src/hooks/useChat.ts
```

## Rollback granulaire PATCH-C
```bash
git restore -- scripts/validators/validate_restore_no_duplication.sh
git restore -- scripts/validators/run_all_chat_memory_validators.sh
git restore -- scripts/tests/chat_restore_x3.sh
```

## Rollback AutoHeal (manuel)
```bash
# Retirer les 2 dernières lignes de scripts/autoheal/autoheal_rules.jsonl
```
