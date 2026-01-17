# ROOT CAUSE NOTES - BOOT FIX P0

## Date
2026-01-17 00:14

## Summary
Analyse des erreurs de boot P0 : CSP/IPC, lazy import, boucles React, orchestrator, healing.

## IPC Fetch Error
- **Symptôme**: `[Error] Fetch API cannot load ipc://localhost/singularity_get_state due to access control checks.`
- **Cause**: Utilisation incorrecte de fetch() pour IPC Tauri. L'IPC doit utiliser @tauri-apps/api invoke().
- **Localisation**: Non trouvé dans le code actuel (grep -R "ipc://localhost" src = 0 résultats). Possiblement injection devtools ou code dynamique.
- **Preuve**: Erreur console lors du boot dev.

## Lazy Import Failure
- **Symptôme**: `[LAZY-IMPORT-FAIL] ConsoleMonitorDashboard: Importing a module script failed.` + `chunk-XO35FAC6.js` échoue.
- **Cause**: Cache Vite corrompu ou dépendance non pré-bundlée correctement (ESM/CJS mismatch).
- **Localisation**: React.lazy non trouvé, mais ConsoleMonitorDashboard existe dans src/components/dev/. Pas d'imports lazy détectés actuellement.
- **Preuve**: Erreur réseau 404 ou CSP sur chunk Vite.

## React Loop
- **Symptôme**: `Maximum update depth exceeded` dans SystemIntegrationHub + useLivingEngines.
- **Cause**: useEffect non stabilisé (dépendances variables), pas de guards anti-réentrance.
- **Localisation**: src/components/SystemIntegrationHub.tsx, hooks useLivingEngines.
- **Preuve**: Console warnings répétées.

## Orchestrator Metrics
- **Symptôme**: `quantumState.value.active_thought_processes.length` undefined → crash.
- **Cause**: Accès non safe à quantumState.
- **Localisation**: src/utils/quantumOrchestrator.ts gatherSystemMetrics().
- **Preuve**: Exception dans logs.

## Healing Contract
- **Symptôme**: `titaneSelfHealing.executeHealingPlan is not a function`.
- **Cause**: Appel API inexistante ou façade non implémentée.
- **Localisation**: src/utils/selfHealingSystem.ts.
- **Preuve**: Exception "executeHealingPlan undefined".

## Action Plan
1. Implémenter wrapper IPC invoke() + gate anti-ipc://
2. Purger caches Vite + rendre lazy import résilient
3. Guards anti-loop + deps stables
4. Safe access metrics
5. Check capability healing
6. Script verify:bootfix
