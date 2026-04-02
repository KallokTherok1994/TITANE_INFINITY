# 02 — SCOPE FREEZE

**SHA de référence** : 24fd31fc4  
**Date gel** : 2026-03-15T18:13Z  

## Fichiers dans le scope de modification

| Fichier | Ring | Motif |
|---|---|---|
| `src-tauri/src/api/telemetry_api.rs` | Ring 3 | Retourne faux Ok avec zéros au lieu de Err quand CSV absent |
| `src/services/telemetry/useProductionHealthTelemetry.ts` | Ring 3 | Dépendance `data` dans useCallback + stale data sur erreur |
| `src/features/production-health/ProductionHealthPanel.tsx` | Ring 4 | Label V25 hardcodé + états no-data non classifiés |
| `src/features/admin/types.ts` | Ring 4 | Label onglet "Santé Prod (V25)" — mismatch V25/V26 |

## Fichiers consultés (lecture seule, non modifiés)

- `src/types/telemetry.ts`
- `src/lib/tauriClient.ts`
- `src/lib/tauriCommands.ts`
- `src/lib/security.ts`
- `src/features/admin/AdminPage.tsx`
- `e2e/features/production-health.spec.ts`

## Fichiers hors scope (ne pas toucher)
- Tout autre fichier non listé ci-dessus
- Pas de redesign AdminPage
- Pas de migration de schéma CSV
- Pas de nouveau composant

## Rollback instantané
```bash
git restore -- src-tauri/src/api/telemetry_api.rs \
               src/services/telemetry/useProductionHealthTelemetry.ts \
               src/features/production-health/ProductionHealthPanel.tsx \
               src/features/admin/types.ts
```
