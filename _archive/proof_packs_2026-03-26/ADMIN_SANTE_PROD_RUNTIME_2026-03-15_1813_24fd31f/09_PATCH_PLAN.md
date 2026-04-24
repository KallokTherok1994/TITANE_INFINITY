# 09 — PLAN DE PATCH

## Patch 1 — Rust : Err() quand CSV absent/vide

| Champ            | Valeur                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Fichier          | `src-tauri/src/api/telemetry_api.rs`                                                                                                     |
| Ring             | Ring 3                                                                                                                                   |
| Surface exposée  | IPC command `read_production_week1_csv`                                                                                                  |
| Objectif         | Retourner `Err("SOURCE_UNAVAILABLE: ...")` quand CSV absent, `Err("SOURCE_EMPTY: ...")` quand vide — supprimer le fake `Ok()` avec zéros |
| Pourquoi minimal | Un seul bloc conditionnel à changer. Aucune nouvelle struct, aucun nouveau comportement.                                                 |
| Effet attendu    | Le hook reçoit une erreur réelle → `setError(...)`, `setData(null)` → l'UI affiche l'état no-data classifié                              |
| Test requis      | Tests Vitest sur le hook + spec E2E S2/S3                                                                                                |
| Rollback         | `git restore -- src-tauri/src/api/telemetry_api.rs`                                                                                      |

## Patch 2 — Hook : supprimer dep `data` + toujours vider sur erreur

| Champ            | Valeur                                                                                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fichier          | `src/services/telemetry/useProductionHealthTelemetry.ts`                                                                                                                                                                                                          |
| Ring             | Ring 3                                                                                                                                                                                                                                                            |
| Surface exposée  | Hook React `useProductionHealthTelemetry`                                                                                                                                                                                                                         |
| Objectif         | (1) Supprimer `data` du dep array de `useCallback` pour éviter la re-création du loadData à chaque succès. (2) Toujours `setData(null)` sur erreur — pas de stale data silencieuse. (3) Exposer `errorKind` classifié depuis le préfixe du message d'erreur Rust. |
| Pourquoi minimal | Changement de deps array + suppression d'une garde `if (!data)` + ajout d'un extracteur de préfixe. Aucune nouvelle API.                                                                                                                                          |
| Effet attendu    | Pas de re-création d'interval à chaque succès. Stale data immédiatement vidée sur erreur. `errorKind` exposé à l'UI.                                                                                                                                              |
| Test requis      | Tests unitaires hook                                                                                                                                                                                                                                              |
| Rollback         | `git restore -- src/services/telemetry/useProductionHealthTelemetry.ts`                                                                                                                                                                                           |

## Patch 3 — UI : états no-data classifiés + label V25 corrigé

| Champ            | Valeur                                                                                                                                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fichier          | `src/features/production-health/ProductionHealthPanel.tsx`                                                                                                                                                                                                                        |
| Ring             | Ring 4                                                                                                                                                                                                                                                                            |
| Surface exposée  | Panneau visible "Santé Prod" dans Admin                                                                                                                                                                                                                                           |
| Objectif         | (1) Quand erreur : afficher message classifié selon `errorKind` (SOURCE_UNAVAILABLE / SOURCE_EMPTY / IPC_ERROR). (2) Retirer le titre hardcodé "Production V25 Week 1" — utiliser "Santé Production" (neutre, sans version). (3) Corriger le footer pour ne pas mélanger V25/V26. |
| Pourquoi minimal | Modifications limitées à `renderContent()` et `ph-footer`. Aucune restructuration.                                                                                                                                                                                                |
| Effet attendu    | L'utilisateur voit POURQUOI il n'y a pas de données. Plus de "❓ Inconnu" sans explication.                                                                                                                                                                                       |
| Test requis      | Tests snapshot + E2E                                                                                                                                                                                                                                                              |
| Rollback         | `git restore -- src/features/production-health/ProductionHealthPanel.tsx`                                                                                                                                                                                                         |

## Patch 4 — types.ts : label onglet sans V25

| Champ            | Valeur                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Fichier          | `src/features/admin/types.ts`                                                                                                       |
| Ring             | Ring 4                                                                                                                              |
| Surface exposée  | Onglet "Santé Prod" dans la barre Admin                                                                                             |
| Objectif         | Changer `label: 'Santé Prod (V25)'` → `label: 'Santé Prod'`. Conserver `badge: 'V26'` (version du système de télémétrie — honnête). |
| Pourquoi minimal | Une ligne.                                                                                                                          |
| Effet attendu    | Plus de mismatch V25/V26 dans le label de l'onglet.                                                                                 |
| Test requis      | Aucun test spécifique requis (label). E2E sélecteur mis à jour si nécessaire.                                                       |
| Rollback         | `git restore -- src/features/admin/types.ts`                                                                                        |

## Types de patch appliqués

- ✅ 4. IPC payload/response fix (Rust: Err au lieu de fake Ok)
- ✅ 8. Honest empty-state classification (UI: messages classifiés)
- ✅ 9. Remove fake defaults/zeros (Rust: plus de Ok avec zéros)
- ✅ 10. Status/source metadata truth fix (UI: titre, footer, label)
- ✅ 5. Adapter/store hydration fix (Hook: dep bug corrigé)

## Interdits respectés

- ❌ Pas de redesign Admin
- ❌ Pas de migration de schéma CSV
- ❌ Pas de métriques fabriquées
- ❌ Pas de collapse silencieux du mismatch version
