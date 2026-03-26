# 01 — BOOTSTRAP TRUTH

**Date** : 2026-03-15T18:13Z  
**SHA HEAD** : 24fd31fc4  

## git status --porcelain
```
?? proof_packs/ADMIN_SANTE_PROD_RUNTIME_2026-03-15_1813_24fd31f/
```
(Seul le dossier proof pack en cours — aucun fichier source modifié avant audit)

## git log -20 --oneline
```
24fd31fc4 (HEAD -> MAIN) fix(design): UIThemeProvider silent fallback + truth-chain tests
4a77788ee fix(audio): AUDIO_CERT_2026-03-15 lot-2
45ded9460 fix(audio): AUDIO_CERT_2026-03-15
3cf52967f fix(twins): TWINS_AUDIT_2026-03-15 lot-2
695ceb79e fix(twins): TWINS_AUDIT_2026-03-15
a9c11fb18 fix: correct 3 issues
bd6e1f7f9 docs(proof): RELEASE_SEAL_2026-03-15 — STABLE_RELEASE_SCOPE v28.0.0
```

## Tooling
- node : v18.19.1 (≥v20 requis par package.json — build via nvm use 20)
- pnpm : 10.30.2
- rustc : 1.94.0 (4a4ef493e 2026-03-02)
- cargo : 1.94.0 (85eff7c80 2026-01-15)
- Node ≥20 disponible via nvm : v20.19.6 / v20.20.0 / v22.22.1 / v24.11.1

## SURFACES DÉCOUVERTES

### Routes / navigation
- Route : `/admin` → `AdminPage.tsx`
- Onglet `production-health` → `ProductionHealthPanel.tsx`

### Composants clés
| Fichier | Rôle |
|---|---|
| `src/features/admin/AdminPage.tsx` | Page admin avec lazy-load des sous-onglets |
| `src/features/admin/types.ts` | Définition des onglets (label "Santé Prod (V25)") |
| `src/features/production-health/ProductionHealthPanel.tsx` | UI Ring 4 — panneau santé prod |
| `src/services/telemetry/useProductionHealthTelemetry.ts` | Hook Ring 3 — IPC + state |
| `src/types/telemetry.ts` | Types Ring 1 |
| `src-tauri/src/api/telemetry_api.rs` | Backend Ring 3 — lecture CSV + parsing |
| `src/lib/tauriClient.ts` | Client IPC (méthode `readProductionWeek1Csv`) |
| `src/lib/tauriCommands.ts` | Constante `READ_PRODUCTION_WEEK1_CSV` |

### IPC Command
- Nom Tauri : `read_production_week1_csv`
- Source CSV : `/tmp/titane_production_week1.csv`
- **Fichier CSV ABSENT** au moment de l'audit (`FILE_ABSENT` confirmé)

### Test ids stables
- `data-testid="production-health-panel"` (container principal)
- `data-testid="production-health-refresh"` (bouton actualiser)

### Spec E2E existant
- `e2e/features/production-health.spec.ts` (gated derrière `TITANE_E2E_FULL=1`)

## TOOLING STATUS
- node 18 → BLOCKED pour pnpm scripts (mais nvm use 20 disponible)
- nvm use 20 utilisé pour les runs de test
- rustc/cargo : OPÉRATIONNEL
