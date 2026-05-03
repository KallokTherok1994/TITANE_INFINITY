# Plan de Rollback — Certification Finale TITANE∞

## HEAD certifié: 54946ffe0

## Rollback global (toute la session)
```bash
git log --oneline | head -15  # repérer le commit avant la session
git revert --no-edit <SHA_AVANT_SESSION>
```

## Rollback par zone

### Chat IPC contract fix
```bash
git restore -- src/services/conversationEngine.ts
```

### OMEGA Journal v3
```bash
git restore -- src/features/chat/ThinkingPanel.tsx src/features/chat/ThinkingPanel.css src/ui/pages/Chat.tsx
```

### Autoheal rules correction
```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

### Panneau flottant CognitiveLayout
```bash
git restore -- src/App.tsx src/pages/ConfigurationHub.tsx
```

### Mémoire IPC Rust
```bash
git restore -- src-tauri/src/main.rs src-tauri/src/commands/persistent_memory_commands.rs
```

## Vérification post-rollback
```bash
npx tsc --noEmit && cargo check
```
