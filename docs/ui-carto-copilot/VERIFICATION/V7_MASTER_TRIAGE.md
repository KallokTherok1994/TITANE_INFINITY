# V7_MASTER_TRIAGE (P0/P1)

Tableau des causes P0/P1 (preuve obligatoire). Aucune correction appliquée sans preuve.

| ID | Symptôme | Preuve | Cause racine | Fix minimal | Risque | Rollback |
|---|---|---|---|---|---|---|
| P1-DEVTAURI-001 | `pnpm run dev:tauri` termine par erreur non‑zéro (beforeDevCommand) | Log runtime: erreur `beforeDevCommand` ([docs/ui-carto-copilot/VERIFICATION/SCANS_V7/runtime-dev-tauri.log](docs/ui-carto-copilot/VERIFICATION/SCANS_V7/runtime-dev-tauri.log#L30-L139)) | Hypothèse (non prouvée) : arrêt inattendu du process Vite (beforeDevCommand) ou sortie non‑zéro lors du piping du `vite dev`. Aucune erreur visible dans [runtime/dev/logs/vite.log](runtime/dev/logs/vite.log). | Aucun patch (preuve insuffisante). Expérience proposée : relancer `pnpm run dev:tauri` avec `VITE_LOG_LEVEL=debug` et capturer `runtime/dev/logs/vite.log` + sortie terminal pour isoler le code de sortie. | Faible | N/A |

Notes:
- Gate F bloqué (baseline Kevin V5 absent), sans impact sur ce triage.
