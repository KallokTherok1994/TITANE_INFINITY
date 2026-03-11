# 11 — FAIL CLASSIFICATION

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Classification dominante

**`FAIL_LAYOUT_OR_REFLOW`** — frictions de layout et interaction chat.
Pas de bloqueur critique. MODE_B_REAL_UI confirmé.

## Grille de classification (15 catégories)

| Code | Libellé | Présent | Détail |
|------|---------|---------|--------|
| `FAIL_CRITICAL_BOOT_TDZ` | TDZ ReferenceError au boot | NON | Corrigé via 27.2.0 |
| `FAIL_CRITICAL_BOOT_CRASH` | Crash fatal au démarrage | NON | Boot propre |
| `FAIL_WHITE_SCREEN` | Écran blanc persistant | NON | `whiteScreen: false` |
| `FAIL_SPLASH_STUCK` | Splash non disparue | NON | `splashVisible: false` |
| `FAIL_REACT_NOT_MOUNTED` | React non rendu | NON | `reactMounted: true` |
| `FAIL_IPC_DISCONNECTED` | IPC Tauri non disponible | NON | `ipcAvailable: true` |
| `FAIL_BACKEND_DISCONNECTED` | Backend non connecté | NON | `backendSyncState: CONNECTED` |
| `FAIL_NAVIGATION_BROKEN` | Navigation non fonctionnelle | NON | 6 surfaces accessibles |
| `FAIL_CHAT_UNRESPONSIVE` | Chat totalement inactif | NON | Input présent, typing OK |
| `FAIL_CHAT_INTERACTION` | Interaction chat dégradée | **OUI — friction** | Send disabled, reasoning absent |
| `FAIL_LAYOUT_OR_REFLOW` | Layout/reflow défectueux | **OUI — dominant** | Double scroll, chat hors vue initiale |
| `FAIL_MODULES_NOT_LOADED` | Modules JS non chargés | NON | `modulesState: MODULES_LOADED` |
| `FAIL_HARNESS_RISK` | Risque de faux positif harness | NON | `harnessRisks: []` |
| `FAIL_SECONDARY_SURFACE` | Surfaces secondaires inaccessibles | NON | `/admin` accessible |
| `FAIL_PROVIDER_SYNC` | Providers de sync défaillants | NON (partiel) | Non instrumentés DOM — non détectables |

## Frictions finales (non bloquantes)

```
frictions: [
  "CHAT_INPUT_NOT_VISIBLE",      → hors vue à la route initiale
  "SEND_BUTTON_NOT_VISIBLE",     → hors vue à la route initiale
  "REASONING_PROGRESS_ABSENT",   → composant non présent
  "SEND_DISABLED_AFTER_TYPING"   → saisie JS ne réactive pas le send
]
blockers: []
```

## Verdict de classification

**FAIL_LAYOUT_OR_REFLOW** avec frictions UX chat. Aucun bloqueur critique.
La certification passe au niveau MODE_B avec 4 frictions à corriger pour atteindre MODE_B_FULL_PASS.

**FAIL (non bloquant) — frictions documentées, plan fix disponible (doc 07).**
