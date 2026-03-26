# 13 ROLLBACK

## Commandes de rollback par zone

### Tab grammar + admin dénéonisation
```bash
git restore -- src/styles/unified-tokens.css src/pages/TitanePage.css src/pages/DevPage.css src/features/admin/AdminPage.css src/components/ChatWindow.css
```

### OMEGA Journal v4
```bash
git restore -- src/features/chat/ThinkingPanel.tsx src/features/chat/ThinkingPanel.css src/ui/pages/Chat.tsx
```

### Admin IPC robustesse
```bash
git restore -- src/features/admin/AdminPage.tsx src/pages/ConfigurationHub.tsx src/features/system-center/hooks/useSystemDiagnostics.ts e2e/features/admin-main-menu-truth.spec.ts
```

### Memory truth
```bash
git restore -- src/pages/TitanePage.tsx src/features/memory/MemorySearchPanel.tsx src/features/memory/MemorySearchPanel.css
```

### Projects mock notice
```bash
git restore -- src/ui/pages/Projects.tsx
```

### Rollback complet (reset commits)
```bash
git log --oneline  # identifier le SHA avant les changements
git reset --hard <SHA_AVANT>
git push --force-with-lease origin MAIN
```
