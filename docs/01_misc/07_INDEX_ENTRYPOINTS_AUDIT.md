# 07_INDEX_ENTRYPOINTS_AUDIT

## Entrypoints UI
- `src/main.tsx` (bootstrap app)
- `src/index.css` (styles globaux)

## Entrypoints backend Tauri
- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`

## Surfaces commandes Tauri
- Multiples déclarations `tauri::command`.
- Multiples points `tauri::generate_handler!`:
  - `src-tauri/src/main.rs`
  - `src-tauri/src/handlers.rs`
  - `src-tauri/src/api/handlers_v14.rs`
  - autres modules documentés.

## Registry/API clients
- Client canonique `src/lib/tauriClient.ts` (invariant invoke centralisé déclaré).
- Coexistence d’autres chemins de service legacy/documentaires (`src/services/api/index.ts`).

## Risque
- Densité élevée d’entrypoints et d’enregistrements commande, rendant l’audit manuel fragile.

## Recommandation
- Générer automatiquement un index des commandes Tauri et lier chaque commande à son ring + owner + test.

## Preuves
- `proof_logs/phase2_inventory_hooks_scripts_entrypoints.log`
- `proof_logs/phase3_metrics.log`
