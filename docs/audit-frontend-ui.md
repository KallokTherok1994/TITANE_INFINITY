# Audit Frontend UI — TITANE_INFINITY

Date: 2026-05-15
Auteur: Copilot (session)

## TL;DR
Audit complet du frontend UI: inventaire des pages et composants, responsabilités fonctionnelles, mapping des `data-testid` trouvés, et checklist QA/tests requis. Ce document sert de base pour un plan de refonte, tickets sprint et preuve de conformité.

## Méthodologie
- Scan du dossier `src/pages/` et `src/components/` (résultats de recherche automatisée).
- Regroupement par surface logique (Chat, Mémoire, Config, Dashboards, DevTools, Auth, Remote, Vision, Audio, Security, Launcher, Layout).
- Pour chaque surface: responsabilités, risques, et tests minimaux requis (unit, integration, E2E).
- Extraction initiale des `data-testid` (grep), et suggestions de `data-testid` manquants pour E2E stable.

## Résumé des résultats
- Pages scannées: ~71 (liste ci‑dessous).
- Composants scannés: ~244 (liste groupée ci‑dessous).
- `data-testid` détectés (extraits de tests): `tabs-component`, `tabs-list`, `tab-dashboard`, `tab-metrics`, `tab-logs`, `tab-engines`, `tab-memory`, `tab-pipeline`, `tab-errors`, `tabs-content`, `section-dashboard`, `section-header`, `log-filters`, `status-pill`, `metric-<label>` etc.

---

## Pages (liste et responsabilités)
(Chaque entrée: chemin, but principal, responsabilités, tests requis)

- `src/pages/ChatPage.tsx`
  - But: surface conversationnelle principale (envoi/réception messages, historique, modèles)
  - Responsabilités: envoi message, retry, sélection modèle, scroll auto, actions message (copier/export/delete)
  - Tests: unit (ChatInput state), integration (store->service conversation), E2E (envoi / timeout / retry)

- `src/pages/Memory.tsx`
  - But: gestion des mémoires/contextes persistés
  - Responsabilités: CRUD mémoire, activation mémoire, import/export, recherche/filtre
  - Tests: unit CRUD, integration mémoire-chat, E2E import/export

- `src/pages/ConfigurationHub.tsx`
  - But: panneau central de configuration
  - Responsabilités: affichage/édition des paramètres, validation schéma, import/export presets, purge cache
  - Tests: validation unitaire, save/load integration, E2E save/reload

- `src/pages/MonitoringDashboard.tsx`
  - But: synthèse métriques et alertes
  - Responsabilités: rafraîchissement, filtres, navigation vers détails incidents
  - Tests: unit data parsing, integration service metrics, E2E alerte->détail

- `src/pages/DevTools.tsx` et `src/pages/DevToolsTabs.tsx`
  - But: outils dev internes (logs, metrics, engines)
  - Responsabilités: affichage logs, recherche, snapshots, panels d’engines
  - Tests: unit LogViewer, E2E navigation tabs, snapshot tests

- `src/pages/RemoteLoginPage.tsx`
  - But: login remote/OAuth
  - Responsabilités: OAuth flows, token handling, error states, session resume
  - Tests: unit auth state machine, integration provider mock, E2E login/logout

- `src/pages/CameraPage.tsx`
  - But: interface caméra / vision
  - Responsabilités: preview caméra, capture, toggles, permissions
  - Tests: unit preview wrapper, integration permissions, E2E camera flow (mocked)

- Autres pages scannées (liste rapide):
  - `src/pages/TotalDevPage.tsx`
  - `src/pages/UltimateOptimizationDashboard.tsx`
  - `src/pages/Stats.tsx`
  - `src/pages/ProgressionPage.tsx`
  - `src/pages/DesignSystemPage.tsx`
  - `src/pages/DocCenterPage.tsx`
  - `src/pages/CloudCenter/*`
  - `src/pages/Watchdog.tsx`, `Nexus.tsx`, `ResearchPage.tsx`, `Helios.tsx`, `TimePage.tsx`, `RealityCenter.tsx`, `OrchestrationMetaCenter.tsx`, `Harmonia.tsx`, `Sentinel.tsx`, `Experience.tsx`, `DashboardPage.tsx`, `AdminPage.tsx`, `EvolutionMonitor.tsx`, `SecureSettings.tsx`, `DevPage.tsx`, `PerfectFusionDashboard.tsx`, `RemoteGatewayLayout.tsx`, `CreationStudio.tsx`, `EvolutionCenterPage.tsx`, `PerformanceTest.tsx`, `Settings.tsx`, `AgendaPage.tsx`, `TwinsPage.tsx`, `TitanePage.tsx`, `HTFPage.tsx`, `SelfHeal.tsx`, `EvoPage.tsx`, `SingularityMonitor.tsx`, `MultiProjectDashboard.tsx`, `CognitivePage.tsx`, `AdaptiveEngine.tsx`

> Remarque: chaque page ci‑dessous nécessite la même grille d'acceptation: objectifs clairs, erreurs visibles, tests unit/integration/E2E, mapping UI_SURFACE_MAP.md mis à jour si surface modifiée.

---

## Composants — groupés par domaine (sélection clé)
Pour chaque composant: chemin, rôle, responsabilités, tests requis, suggestions `data-testid`.

### UI primitives / Design system
- `src/components/shadcn/button.tsx`, `src/components/ui/button.tsx`
  - Rôle: boutons standardisés (primary/secondary/icon)
  - Tests: unit rendu, interaction click, disabled state
  - data-testid suggéré: `btn-primary`, `btn-icon-<name>`

- `src/components/ui/input.tsx`, `src/components/shadcn/input.tsx`
  - Rôle: champs texte contrôlés
  - Tests: unit value change, validation feedback
  - data-testid suggéré: `input-<name>`

- `src/components/ui/tabs.tsx`, `src/components/shadcn/tabs.tsx`
  - Rôle: navigation par onglets
  - Tests: active tab change, keyboard navigation
  - data-testid existants: `tabs-component`, `tabs-list`, `tab-...`

- `src/components/ui/dialog.tsx`
  - Rôle: modals confirmations/edits
  - Tests: open/close, focus trap, escape
  - data-testid suggéré: `dialog-<purpose>`

### Layout & Navigation
- `src/components/layout/TopNav.tsx`, `Header.tsx`, `Sidebar.tsx`, `MobileNav.tsx`
  - Rôle: navigation globale, menus, shortcuts
  - Tests: navigation to pages, overflow menu, keyboard shortcuts
  - data-testid suggéré: `topnav`, `sidebar-item-<name>`, `cmd-palette-trigger`

- `src/components/palette/CommandPalette.tsx`
  - Rôle: recherche/action globale
  - Tests: open/close, filter results, run command
  - data-testid suggéré: `command-palette-input`, `command-result-<id>`

### Chat / Conversation
- `src/components/ChatWindow.tsx`, `src/components/chat/ChatInput.tsx`, `MessageList.tsx`, `MessageBubble.tsx`, `ChatToolbar.tsx`, `ConversationsSidebar.tsx`
  - Rôle: UI conversationnelle complète
  - Tests: send message, edit, reactions, file upload, voice dictation
  - data-testid suggéré: `chat-input`, `send-button`, `message-<id>`, `conversation-list`

- `src/components/chat/ModelSelector.tsx`
  - Rôle: changer modèle IA actif
  - Tests: change model, show active model, disable when unavailable
  - data-testid suggéré: `model-selector`, `model-option-<name>`

- `src/components/chat/FileUploadButton.tsx`
  - Rôle: upload fichiers vers conversation
  - Tests: choose file, upload success/failure handling
  - data-testid suggéré: `file-upload-button`, `file-upload-status`

### Memory & Persistence
- `src/components/sections/MemorySection.tsx`, `src/components/MemoryEvolution/MemoryEvolutionCenter.tsx`
  - Rôle: CRUD mémoires, visualisation historique
  - Tests: create/edit/delete, import/export, activation
  - data-testid suggéré: `memory-create`, `memory-item-<id>`

### Configuration
- `src/components/config/ConfigSection.tsx`, `ConfigField.tsx`, `ConfigFieldEditable.tsx`
  - Rôle: affichage et édition des paramètres
  - Tests: validation schéma, save, revert, import/export
  - data-testid suggéré: `config-save`, `config-field-<key>`

### Auth & Identity
- `src/components/auth/OAuthProfileCard.tsx`, `FacebookLoginButton.tsx`
  - Rôle: login/logout, provider flows
  - Tests: provider callback, token refresh, error handling
  - data-testid suggéré: `oauth-login`, `facebook-login`

### Monitoring / DevTools / Dashboards
- `src/components/monitoring/*`, `src/components/devtools/*`, `src/components/MonitoringDashboard.tsx`
  - Rôle: affichage métriques, logs, filters, alertes
  - Tests: parse metrics, filters, open log detail, snapshot
  - data-testid existants (extraits): `section-header`, `log-filters`, `status-pill`, `metric-<label>`

### Security / Admin
- `src/components/security/SecurityPanel.tsx`, `AddAPIKeyModal.tsx`
  - Rôle: gestion clés API, politiques sécurité
  - Tests: add/remove key, validation, modal confirmations
  - data-testid suggéré: `security-add-api-key`, `api-key-item-<id>`

### Voice / Audio / TTS
- `src/components/voice/*`, `src/components/tts/*`
  - Rôle: interactions vocales, TTS playback
  - Tests: start/stop listening, permissions, TTS play/pause
  - data-testid suggéré: `voice-start`, `tts-play`

### Vision / Camera
- `src/components/vision/*`, `src/pages/CameraPage.tsx`
  - Rôle: preview caméra, capture, toggles
  - Tests: permission flow, preview render, capture export
  - data-testid suggéré: `camera-preview`, `camera-capture`

### Misc / Dev helpers
- `src/components/debug/*`, `MetaCenter.tsx`, `HyperCenter.tsx`, `QuantumCenter.tsx`
  - Rôle: panels admin/dev, traces, consoles
  - Tests: render panels, run debug action, export traces

---

## Mapping `data-testid` (extrait)
- Extraits trouvés dans les tests: `tabs-component`, `tabs-list`, `tab-dashboard`, `tab-metrics`, `tab-logs`, `tab-engines`, `tab-memory`, `tab-pipeline`, `tab-errors`, `tabs-content`, `section-dashboard`, `section-header`, `log-filters`, `status-pill`, `metric-<label>`.

## Recommandations `data-testid`
- Normaliser les `data-testid` pour E2E stable: `page-<name>`, `panel-<name>`, `btn-<name>`, `input-<name>`, `list-<name>`, `item-<name>`.
- Ajouter `data-testid` sur: Chat input/send, message items, conversation list, model selector, memory CRUD buttons, config save/import/export, launcher actions, auth provider buttons, critical dashboard controls.

---

## Checklist QA / Tests minimaux par surface
Pour chaque page/composant touché, ajouter:
1. Unit tests: rendu, états, transformations
2. Integration tests: store/service contract, IPC commands (tauri) mocks
3. E2E Playwright tests: flux utilisateur critique + chemins dégradés
4. Snapshot tests: pour outils/dev panels (optionnel mais utile)
5. Proof artifacts: capture logs, screenshots E2E, JSON rapport (pour agents dashboards)

---

## Critères d'acceptation (généraux)
- Décision utilisateur claire en <= 2 actions pour chaque tâche critique.
- Erreurs critiques affichées et actionnables.
- Preuve runtime (logs/metrics/tests) fournie.
- Mapping docs mis à jour si surface modifiée: `UI_SURFACE_MAP.md`, `docs/CARTOGRAPHY_COMPLETE.md`.
- AutoHeal entry créé pour chaque modification significative.

---

## Prochaines étapes (exécutables)
1. Valider si tu veux le fichier en workspace (vrai fichier) ou suffisant en mémoire de session.
2. Générer CSV/Markdown complet trié (page, component, path, suggested data-testid, tests required).
3. Générer checklist QA par composant/page (prêt à coller en GitHub Issue template).

---

## Usage
- Pour l’intégrer au repo: copier-coller le contenu dans `docs/` ou `reports/` et ouvrir PR avec tests correspondants.
