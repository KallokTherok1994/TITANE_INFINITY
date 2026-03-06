# UI COVERAGE MAP — TITANE∞ Desktop
Generated: 2026-03-04T23:27:00Z

## Mapping pages/sections interactives

| Page ID (route) | Sections principales | Interactifs couverts | `data-testid` requis |
|---|---|---|---|
| `/titane` | Tabs TITANE + contenu | clic tabs, input chat, send, toggles chat | `page-titane`, `tab-*`, `chat-input`, `chat-send`, `chat-ready`, `chat-message-*`, `chat-error` |
| `/time` | Tabs temporels | clic tabs time, inputs/textarea visibles | `page-time`, `tab-time-now/agenda/timeline/snapshots/intelligence/flow` |
| `/stats` | Dashboard stats | navigation + visibilité page | `page-stats` |
| `/admin` | Système/config/audio/design/gouvernance/prod-health | clic tabs admin, toggles/inputs visibles | `page-admin`, `tab-admin-*`, `page-admin-content` |
| `/dev` | sections DEV | clic tabs dev, actions/inputs visibles | `page-dev`, `tab-dev-*`, `btn-dev-refresh` |
| `/fusion` | Perfect Fusion Dashboard | actions d’alertes | `page-fusion`, `btn-fusion-resolve-*`, `btn-fusion-autorecover-*` |
| `/optimization` | Dashboard optimisation | tests GPU/WASM, cache, compaction DB | `page-optimization`, `btn-optimization-test-*`, `btn-optimization-clear-cache`, `btn-optimization-compact-db` |

## Alias/routes redirigées
- `/chat`, `/camera`, `/evo`, `/dashboard`, `/evolution-center`, `/progression`, `/xp` → `/titane`
- `/settings`, `/governance`, `/audio`, `/voice`, `/tts`, `/design-system`, etc. → `/admin`
- `/temporal-center`, `/agenda`, `/time-navigator` → `/time`
- `/system-center`, `/diagnostics`, `/devtools`, etc. → `/admin`

## Sélecteurs ajoutés (run UI_DESKTOP_E2E_ULTRA)
- `src/App.tsx`: `app-ready`, `ipc-ready`
- `src/components/sections/ConversationSection.tsx`: `chat-ready`, `chat-message-*`, `chat-message-content`, `chat-loading`, `chat-error`
- `src/components/fusion/PerfectFusionDashboard.tsx`: `page-fusion`, actions alertes
- `src/components/optimization/UltimateOptimizationDashboard.tsx`: `page-optimization`, boutons actions/tests

## Note couverture stricte
Cette map couvre la surface top-nav + alias. Une passe dédiée reste nécessaire pour toutes les routes hors top-nav en assertions métier profondes (`/research`, `/knowledge`, `/creation`, `/evolution`, `/cloud`, `/performance`, etc.).
