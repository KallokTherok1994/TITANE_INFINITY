# 05 — CARTE DE PROPAGATION ADMIN

## Chaîne complète

```
Navigation
  └─ AdminPage.tsx (lazy tab routing)
       └─ types.ts ADMIN_TABS[production-health] label="Santé Prod (V25)"
            └─ ProductionHealthPanel.tsx (Ring 4 UI)
                 └─ useProductionHealthTelemetry() hook (Ring 3 service)
                      └─ tauriClient.readProductionWeek1Csv()
                           └─ IPC invoke("read_production_week1_csv")
                                └─ telemetry_api.rs :: read_production_week1_csv()
                                     └─ /tmp/titane_production_week1.csv (SOURCE ABSENTE)
                                          └─ FAKE Ok({status:"UNKNOWN", zeros...})
                                               └─ isProductionHealthSummary() PASS ← PROBLÈME
                                                    └─ setData(fake_summary)
                                                         └─ UI render panneau complet avec zéros
```

## Détail par lien

| Lien | Fichier | Fonction/Composant | Input | Output | Modes de défaillance | Statut |
|---|---|---|---|---|---|---|
| Navigation → Admin | `AdminPage.tsx` | `TabContent` switch | `tab="production-health"` | lazy import `ProductionHealthPanel` | import fail | PROVEN |
| Types tab | `types.ts` | `ADMIN_TABS` | — | `label: 'Santé Prod (V25)'` | label mismatch V25/V26 | MISMATCHED |
| UI → Hook | `ProductionHealthPanel.tsx` | `useProductionHealthTelemetry()` | options | `{data, loading, error, refresh}` | infinite re-render (dep bug) | BROKEN |
| Hook → IPC | `useProductionHealthTelemetry.ts` | `loadData` | — | `tauriClient.readProductionWeek1Csv()` | stale closure | BROKEN |
| IPC Client | `tauriClient.ts` | `readProductionWeek1Csv()` | — | `invoke(READ_PRODUCTION_WEEK1_CSV)` | IPC timeout | PROVEN |
| Tauri command | `telemetry_api.rs` | `read_production_week1_csv` | — | `ProductionHealthSummary` | **retourne faux Ok si CSV absent** | BROKEN |
| CSV lecture | `telemetry_api.rs` | `parse_and_summarize` | CSV bytes | `ProductionHealthSummary` | CSV absent → faux Ok | BROKEN |
| Source CSV | `/tmp/titane_production_week1.csv` | fichier | — | lignes CSV | **ABSENT** | BROKEN |

## Mode d'alimentation actuel
- ❌ Direct CSV read : **ABSENT**
- ✅ Tauri command snapshot : OUI (mais retourne fake data)
- ❌ Store hydration : non utilisé
- ❌ Background polling : non — auto-refresh 60s via setInterval dans hook
- ❌ File watcher : non implémenté
- ❌ Event subscription : non
- ✅ Static fallback : **OUI — c'est LE problème** — le backend injecte un fallback fake au lieu d'une erreur
- ✅ Mixed V25 UI + V26 backend contract : OUI — titre hardcodé "V25", footer "V26"
