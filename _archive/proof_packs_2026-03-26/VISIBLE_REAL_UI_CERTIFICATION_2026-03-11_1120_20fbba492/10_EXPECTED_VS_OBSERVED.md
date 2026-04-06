# 10 — EXPECTED VS OBSERVED

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Tableau comparatif complet

| Attendu | Observé | Ecart | Verdict |
|---------|---------|-------|---------|
| Boot propre, pas de TDZ ReferenceError | Boot propre — `splashVisible: false`, `reactMounted: true` | Aucun | PASS |
| MODE_B_REAL_UI (UI réelle visible) | `modeDecision: MODE_B_REAL_UI` | Aucun | PASS |
| React monté | `reactMounted: true`, `rootChildren: 3` | Aucun | PASS |
| IPC Tauri disponible | `ipcAvailable: true`, `internalsPresent: true` | Aucun | PASS |
| Navigation visible (tabs) | 6 nav items: TITANE, TIME, STATS, ADMIN, DEV, Plus | Aucun | PASS |
| Hash routing fonctionnel | `tabSwitchWorked: true`, URL `#/time` confirmée | Aucun | PASS |
| Surface secondaire navigable | `secondarySurfaceOpened: true` (`/admin`) | Aucun | PASS |
| Retour surface principale | `returnedToPrimarySurface: true` | Aucun | PASS |
| Chat input présent | `inputPresent: true` (après nav `/titane`) | Visible post-nav seulement | PASS partiel |
| Send button présent | `sendPresent: true` | Présent | PASS |
| Send actif après saisie | `sendEnabledAfterTyping: false` | Send reste disabled | FRICTION |
| Reasoning progress visible | `reasoningProgressState: ABSENT` | Non rendu | FRICTION |
| Pas de blockers | `blockers: []` | Aucun | PASS |
| Backend connecté | `backendSyncState: CONNECTED` | Connecté | PASS |
| Modules chargés | `modulesState: MODULES_LOADED` | Chargés | PASS |
| Pas d'overlay bloquant | `blockingOverlays: 0` | Aucun | PASS |
| Pas d'erreur visible | `visibleErrors: 0` | Aucune | PASS |
| AppImage 27.2.0 utilisé | `actualTargetVersion: 27.2.0` | Confirmé | PASS |
| Pas de white screen | `whiteScreen: false` | Confirmé | PASS |
| TDZ régressé vs 26.4.0 | TDZ absente — vite.config.ts fix actif | Absente | PASS |

## Régression vs sessions précédentes

| Session | Mode | TDZ | Verdict |
|---------|------|-----|---------|
| V20 (26.4.0) | MODE_A | FAIL CRITICAL_BOOT_TDZ | FAIL |
| V21 (26.4.0) | MODE_A | FAIL CRITICAL_BOOT_TDZ | FAIL |
| **V22 (27.2.0)** | **MODE_B** | **ABSENT** | **PASS** |

## Ecarts documentés

| Ecart | Nature | Priorité fix |
|-------|--------|-------------|
| `SEND_DISABLED_AFTER_TYPING` | UX friction | P1 |
| `REASONING_PROGRESS_ABSENT` | Composant manquant | P2 |
| `CHAT_INPUT_NOT_VISIBLE` initial | Layout / route | P3 |
| `potentialDoubleScroll` | Layout friction | P4 |
| `runtimeVersion: null` via IPC | Observabilité | P5 |
| `entryTs: false` | Marker non exposé window | P6 |

**Résumé: 14 PASS, 2 FRICTION, 0 FAIL bloquant.**
