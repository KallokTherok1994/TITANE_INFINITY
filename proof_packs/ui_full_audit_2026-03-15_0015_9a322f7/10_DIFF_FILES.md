# DIFF FILES — Phase 10

## Fichiers modifiés

### src/pages/CloudCenter/VaultStatus.tsx
- Ajout `const [actionError, setActionError] = useState<string | null>(null);`
- `catch(e)` dans `loadBackups`, `handleAutoHeal`, `handleCreateBackup`, `handleRestoreBackup` → `setActionError(msg)`
- JSX: banner dismissible `❌ {actionError}` en tête de `vault-status`

### src/pages/CloudCenter/SyncLogs.tsx
- Ajout `const [loadError, setLoadError] = useState<string | null>(null);`
- `catch(err)` dans `loadLogs` → `setLoadError(msg)`
- JSX: banner avec bouton "Réessayer" affichant `loadError`

### src/pages/DevPage.tsx
- Ajout `const [orchestrationDegraded, setOrchestrationDegraded] = useState(false);`
- catch orchestration → `setOrchestrationDegraded(true)` (en plus du mock fallback existant)
- JSX: badge warning `⚠️ Orchestration — données statiques (IPC indisponible)` conditionnel

### scripts/autoheal/autoheal_rules.jsonl
- AH-2026-03-15-0215 — entry UI audit error surfacing
