# 01 — RUNTIME TARGET AND FRONTEND ACTIVE TRUTH

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Artefact cible

| Clé | Valeur |
|-----|--------|
| Fichier | `TITANE-Infinity_27.2.0_amd64.AppImage` |
| Chemin complet | `/tmp/titane_v15_wt_20260311_080118/deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage` |
| Taille | 88-92 MB |
| Date de build | 2026-03-11 08:58:10 |
| SHA256 prefix | `640c11346eb7102b` |
| Version source | `27.2.0` (package.json, Cargo.toml) |
| Version embedded (asset) | `v26.3.0` (titre page HTML) |

## Fix TDZ inclus

Le build 27.2.0 contient la correction `P1_BUILD_CHUNKS_FIX` dans [vite.config.ts](../../vite.config.ts) :
```typescript
// Ligne 372 — tous les services dans un seul chunk core-runtime
if (id.includes('/services/')) {
  return 'core-runtime';
}
```
Cette correction élimine le `ReferenceError: Cannot access before initialization` (TDZ) qui bloquait le boot dans 26.4.0.

## Confirmation runtime active

Depuis le log run2 (`raw/02_run2_suite.log`) :
- `modeDecision: MODE_B_REAL_UI` (première fois MODE_B possible dans ce projet)
- `rootRendered: true`
- `whiteScreen: false`
- `reactMounted: true`
- `splashVisible: false` (pas de splash = boot réel accompli)
- `url: tauri://localhost/titane`
- `pageTitle: TITANE∞ v26.3.0 - Cognitive Operating System`
- `bodyText: TITANE∞, TITANE, TIME, STATS, ADMIN, DEV, Plus` (navigation réelle visible)
- `ipcAvailable: true`
- `backendSyncState: CONNECTED`

## Confirmation IPC

- `window.__TAURI_INTERNALS__` présent (`internalsPresent: true`)
- `window.__TAURI_INTERNALS__.invoke` disponible (`hasInvoke: true`)
- `window.__TAURI__` absent (architecture Tauri v2 confirmée)

## PASS — frontend actif, IPC connecté, MODE_B confirmé.
