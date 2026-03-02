# FRONTEND AUDIT

- Boot markers présents dans `src/main.tsx`.
- Anti-silence renforcé: timeout failsafe chat affiche désormais erreur visible `IPC_TIMEOUT` (`src/hooks/useChat.ts`).
- Page loading fallback existe avec warning long chargement (`src/ui/components/PageLoadingFallback.tsx`).
- Écart persistant: multiples URLs littérales en `src/**` (liens docs/research/config) => revue manuelle nécessaire pour distinguer UI-only links vs I/O runtime.
- No-skip E2E: suppressions de `test.skip` explicites sur suites critiques/legacy; scan résiduel e2e attendu vide.
