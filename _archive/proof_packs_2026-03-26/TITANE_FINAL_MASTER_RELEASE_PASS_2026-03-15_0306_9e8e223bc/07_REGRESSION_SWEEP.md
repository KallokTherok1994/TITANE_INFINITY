# 07 REGRESSION SWEEP

## Surfaces précédemment réparées — vérification de régression

| SURFACE | FIX PRECEDENT | REGRESSION? | PREUVE |
|---------|--------------|-------------|--------|
| usePersistentMemory loop guard | DEFAULT_LEVELS + isRefreshingRef | NON | Code présent ligne ~219/~238 |
| OMEGA ThinkingPanel props | Compat ascendante (optionnels) | NON | Tous nouveaux props optionnels, aucun test ID modifié |
| Admin SystemCenter import | import direct + guard throw | NON | AdminPage.tsx ligne 42-48 |
| ConfigurationHub IPC | normalizeSnapshotResponse | NON | ConfigurationHub.tsx ligne 331 |
| Tab grammar CSS | --tab-active-* tokens | NON | 3 fichiers CSS vérifiés |
| ChatWindow ambient glow | ::before supprimé | NON | ChatWindow.css vérifiée |
| Memory counters | fallback → 0 | NON | TitanePage.tsx ligne 165-167 |
| MemorySearch mock notice | isMockData + bannière | NON | MemorySearchPanel.tsx ligne 39 |
| Projects mock notice | bannière inline | NON | Projects.tsx ligne 101 |
| E2E admin truth guard | assertNoAdminBoundaryError | NON | e2e/features/admin-main-menu-truth.spec.ts |
| Autoheal rules | 240 entrées | NON | detect_recurrence.sh PASS |

## Verdict régression
AUCUNE RÉGRESSION DÉTECTÉE.
