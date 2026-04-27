## 2026-04-28 : Remote Transport — Accès Internet TITANE v31.2.2

# [2026-04-28] Remote Gateway transport factory truth: `src/lib/transport.ts` expose `getTransport()` qui retourne `TauriTransport` (via `secureInvoke`) en contexte Tauri ou `RemoteTransportWrapper` (fetch HTTP `src/lib/remoteTransport.ts`) quand `window.__TITANE_REMOTE__` est actif. La détection se fait via `window.__TAURI_INTERNALS__`. Aucun composant UI ne doit accéder directement à `secureInvoke` ou `fetch` — tout passe par `getTransport().invoke()`. Streaming via `src/lib/remoteStream.ts` (WebSocket `wss://`). Singleton cachable, resetable en test via `resetTransport()`.

## 2026-04-24 : Migration documentaire

- README.md = surface documentaire canonique (tous les anciens index archivés)
- Tous les fichiers `.md.md` et dossiers d’archive centralisés dans `docs/99_ARCHIVE/`
- Inventaires et logs : `docs/92_maintenance/`

# [2026-04-26] Conversation modern mode surface truth

- Surface canonique: [src/components/sections/ConversationSection.tsx](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/components/sections/ConversationSection.tsx) expose maintenant le sélecteur moderne compact des modes via `chat-mode-selector-select` directement dans la toolbar active du chat.
- Vérité runtime visible: la surface `page-conversation` publie `data-conversation-mode` et `data-chat-store-mode`, ce qui rend lisible l alignement entre moteur conversationnel actif et store de modes gouverné.
- Bridge de surface: un choix moderne compatible comme `planning` met à jour à la fois `setMode()` du moteur de conversation et `useChatModeStore().changeMode()` sans quitter la route canonique `/titane?tab=conversation`.
- Preuves associées: [src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx) et [e2e/critical/chat-interaction.spec.ts](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/critical/chat-interaction.spec.ts).

# [2026-04-26] Chat unified runtime bridge truth

- Surface canonique UI: [src/components/chat/ChatModeSelector.tsx](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/components/chat/ChatModeSelector.tsx) publie désormais des selectors stables `chat-mode-selector`, `chat-mode-selector-trigger`, `chat-mode-selector-menu` et `chat-mode-option-*` pour les preuves gouvernées.
- Surface canonique runtime: [src/config/chatModes.config.ts](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/config/chatModes.config.ts) devient la porte unique de résolution runtime via `CHAT_MODES` unifié, qui conserve les modes legacy statiques et bridge les modes étendus issus de `src/services/ai/chatModes.config.ts`.
- Vérité scellée: une sélection UI moderne comme `quick` ou `strategy` atteint maintenant la résolution finale du prompt runtime sans fallback mensonger via `getSystemPrompt()`.
- Preuves associées: [src/__tests__/services/ai/chatModeUnifiedRuntimeBridge.test.ts](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/__tests__/services/ai/chatModeUnifiedRuntimeBridge.test.ts) et [src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx).

# [2026-04-24] Security bootstrap CSP authority truth

- Surface canonique bootstrap: `src/App.tsx` -> `src/security/index.ts::initializeSecurity()`.
- Verite runtime corrigee: en runtime Tauri, la couche frontend n injecte plus de meta `Content-Security-Policy` via `CspManager.applyToDocument()`.
- Autorite CSP unique restauree: `src-tauri/tauri.conf.json` pilote `script-src` (incluant `unsafe-eval`) pour eviter le blocage IPC `conversation_generate` et le fallback `TITANE∞ — Réponse indisponible`.
- Preuve test ajoutee: `src/security/__tests__/securityInit.spec.ts` valide `applyToDocument` hors Tauri et son bypass en Tauri.

# [2026-04-24] Chat XP durable persistence to Experience UI truth

- Surface canonique chat: `/titane?tab=conversation` via `src/hooks/useConversationEngine.ts`.
- Surface canonique XP: `/experience` via `src/pages/Experience.tsx`.
- Verite corrigee: `src-tauri/src/mock_commands.rs` persiste maintenant `experience_get_state` / `experience_update_state` dans `experience_state.json` au lieu de retourner un etat mock vide a chaque lecture.
- Synchronisation frontend: `src/services/experienceService.ts` miroir toujours l etat XP dans `localStorage`, compare backend et localStorage, puis garde la source la plus fraiche/non vide avant de notifier `useExperience`.
- Visibilite UI ajoutee: la page XP publie `experience-chat-sync-summary`, `experience-chat-xp-total`, `experience-chat-event-count` et `experience-chat-last-gain` pour rendre les XP issus du chat immediatement lisibles.
- Preuves associees: Rust `mock_commands::experience_state_tests::*`, Vitest `experienceService.chat-sync`, `useExperience`, `Experience`, et Playwright `CHAT_XP_GENERATION_SYNC` avec preuve reload/localStorage.

# [2026-04-24] Chat XP generation to Experience sync truth

- Surface canonique chat: `/titane?tab=conversation` via `src/components/sections/ConversationSection.tsx` + `src/hooks/useConversationEngine.ts`.
- Surface canonique XP: `/experience` via `src/pages/Experience.tsx`.
- Verite corrigee: `src/services/experienceService.ts` initialise ou recharge la source locale avant toute attribution XP chat, puis preserve les gains de session quand la page Experience monte apres le chat.
- Trace runtime: `ThinkingPanel` expose maintenant les gains exacts `Chat`, `Cognitif` et `Gain total du tour` via `reasoning-summary-xp`, `reasoning-runtime-xp`, `reasoning-runtime-xp-total` et `reasoning-progress[data-runtime-xp-gain]`.
- Selectors Experience ajoutes: `experience-runtime-source`, `experience-total-xp`, `experience-level`, `experience-next-level-xp`, `experience-progress`, `experience-filter-*`.
- Preuves associees: Vitest `experienceService.chat-sync`, `useConversationEngine`, `ThinkingPanel`, `Experience`; Playwright `CHAT_XP_GENERATION_SYNC` dans `e2e/critical/chat-interaction.spec.ts`.

# [2026-04-24] Lint no-console normalization truth

- Surface transversale: journalisation runtime UI sur les surfaces `chat-diagnostic`, `monitoring-dashboard`, `ui-logger` et couches utilitaires (`logger`, `structured-logger`, `performance-budget`).
- Verite appliquee: remplacement des appels `console.log|info|debug|group|table|time` par des chemins autorises `warn|error` ou par des wrappers `nativeConsole`, sans changement fonctionnel des flux de diagnostic.
- Effet qualifie: reduction des warnings lint `no-console` de 660 a 0 avec preservation des traces de debug en environnement dev.

# [2026-04-24] DashboardPage isolated test truth

- Surface canonique: `page-dashboard` dans `src/pages/DashboardPage.tsx`.
- Durcissement test: `src/pages/__tests__/DashboardPage.test.tsx` isole maintenant `useExperience`, `useVisualEngines` et `PersonaMoodIndicator` pour eviter les effets de bord IPC/persona dans le lane Vitest.
- Preuve qualifiee: `pnpm exec vitest run src/pages/__tests__/DashboardPage.test.tsx` passe proprement sans warnings React `act(...)` ni bruit de mock handler Tauri sur cette surface.

# [2026-04-23] Agent dashboards version fallback truth

- Surface canonique: `agent-dashboards-panel` dans `src/components/AgentDashboardsPanel.tsx`
- Durcissement runtime/test: le marquage de version du panneau n accede plus directement a `__APP_VERSION__` (qui peut etre absent en environnement Vitest).
- Verite appliquee: fallback determine `APP_VERSION=dev` quand la variable globale n est pas injectee, ce qui conserve le badge `Nouveau` et evite le crash test par `ReferenceError`.
- Tests impactes: `src/services/__tests__/advancedAgentCatalog.test.tsx`, `src/components/layout/__tests__/AppShell.test.tsx`, `src/__tests__/ui/app-router-canonical-surfaces.test.tsx`.

# [2026-04-24] Agent UI ThinkingPanel model trace

- Surface canonique: `reasoning-progress` dans `src/features/chat/ThinkingPanel.tsx`, alimentee par `src/components/sections/ConversationSection.tsx`.
- Verite modele visible: `reasoning-progress`, `reasoning-summary-model` et `reasoning-runtime-model` publient `data-model-used` et `data-model-requested` depuis `latestAssistantRuntime`.
- Preuve UI: `e2e/desktop/chat-model-truth-chain.wdio.test.js` verifie maintenant le modele gouverne `gemma2:2b` dans le panneau runtime chat et dans le journal OMEGA.

# [2026-04-24] Contexts standardization — AnimationContext test truth

- Surface qualifiee: `src/contexts/AnimationContext.tsx` (provider `AnimationProvider` + hook `useAnimation`).
- Verite runtime testee: `animationConfig`, `shouldReduceMotion`, `shouldThrottle` et `fps` exposes par le provider.
- Guard de contrat testee: `useAnimation must be used within AnimationProvider` hors provider.
- Preuve execution: `pnpm exec vitest run src/contexts/__tests__/AnimationContext.test.tsx src/contexts/__tests__/LoggingContext.test.tsx`.

# [2026-04-26] Conversation runtime mode truth

- Surface canonique: [src/components/sections/ConversationSection.tsx](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/components/sections/ConversationSection.tsx) retire le select legacy local et garde `chat-mode-selector-select` comme seul contrôle actif de mode sur la toolbar conversationnelle.
- Vérité runtime visible: `chat-runtime-state` publie maintenant `data-conversation-mode` et `data-chat-store-mode`, tandis que `chat-runtime-summary` et `chat-runtime-badge` exposent `Conversation mode: ...`, `Store mode: ...`, `conversation-mode:<id>` et `chat-store-mode:<id>`.
- Compatibilité réduite: `select-conversation-mode` n est plus une surface live de la route canonique.
- Qualification native: les lanes WDIO conversationnelles ciblées lisent désormais la même vérité runtime et passent sur binaire debug frais, y compris le scénario de transparence locale et le CTA de retour au bas de conversation.
- Qualification mobile navigateur: [e2e/android/android-build-ui.browser.spec.ts](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/android/android-build-ui.browser.spec.ts) couvre désormais aussi le sélecteur moderne sur mobile, l absence du contrôle legacy, l alignement `page-conversation` -> `chat-runtime-state` et les marqueurs `Conversation mode` / `Store mode` après un envoi mock.
- Qualification browser riche alias: [tests/e2e/provider-flow.test.ts](/home/titane-os/Documents/GitHub/TITANE_INFINITY/tests/e2e/provider-flow.test.ts) verrouille aussi maintenant la vérité de mode modernisée sur l alias `/chat`, avec bascule `planning`, absence du contrôle legacy et lecture des attributs/synthèse/badges depuis la surface canonique déléguée.
- Garde unitaire composant: [src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx) verrouille maintenant explicitement la variante `compact` et son selector stable `chat-mode-selector-select`, qui est la variante réellement montée sur la toolbar conversationnelle canonique.
- Garde unitaire surface canonique: [src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx) verrouille aussi désormais les attributs `data-conversation-mode` et `data-chat-store-mode` directement sur `page-conversation`, en plus du bridge `setMode` -> store.
- Garde helper runtime: [src/components/sections/__tests__/ConversationSection.test.ts](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/components/sections/__tests__/ConversationSection.test.ts) verrouille maintenant aussi les suffixes `Conversation mode` / `Store mode` dans `buildConversationRuntimeSummary()` et les badges `conversation-mode:*` / `chat-store-mode:*` dans `buildConversationRuntimeBadges()`.
- Qualification desktop directe: [e2e/desktop/ui-driver.wdio.js](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/ui-driver.wdio.js) remonte maintenant aussi `pageConversationMode`, `pageChatStoreMode`, `runtimeConversationMode` et `runtimeChatStoreMode`, et [e2e/desktop/chat-ui-complete-runtime.wdio.test.js](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/chat-ui-complete-runtime.wdio.test.js) verrouille ces quatre attributs en plus du résumé et des badges sur la lane conversationnelle desktop complète.
- Qualification desktop critique: [e2e/desktop/ui-connectivity-critical.wdio.test.js](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/ui-connectivity-critical.wdio.test.js) verrouille maintenant aussi l absence de `select-conversation-mode`, la valeur initiale `default` de `chat-mode-selector-select` et les attributs `data-conversation-mode` / `data-chat-store-mode` de `page-conversation` sur la lane de connectivité desktop la plus courte.
- Qualification desktop modèle: [e2e/desktop/chat-model-truth-chain.wdio.test.js](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/chat-model-truth-chain.wdio.test.js) verrouille maintenant aussi `pageConversationMode`, `pageChatStoreMode`, `runtimeConversationMode`, `runtimeChatStoreMode`, le résumé `Conversation mode` / `Store mode` et les badges `conversation-mode:*` / `chat-store-mode:*` dans la lane native de vérité modèle.
- Qualification desktop orchestrator: [e2e/desktop/chat-orchestrator-advanced-stress.wdio.test.js](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/chat-orchestrator-advanced-stress.wdio.test.js) verrouille maintenant aussi, à chaque tour et sur le runtime final, `pageConversationMode`, `pageChatStoreMode`, `runtimeConversationMode`, `runtimeChatStoreMode`, le résumé `Conversation mode` / `Store mode` et les badges de mode dans la lane native orchestrator/mémoire/modèle.
- Qualification desktop online chat UI: [e2e/desktop/online-chat-proof-ui.wdio.test.js](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/online-chat-proof-ui.wdio.test.js) remonte maintenant aussi `pageConversationMode`, `pageChatStoreMode`, `runtimeConversationMode` et `runtimeChatStoreMode` dans son snapshot runtime multi-tours, puis verrouille `default` ainsi que les chaînes `Conversation mode` / `Store mode` pendant la preuve mémoire réelle de la surface desktop online chat.
- Preuves associées: [src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx](/home/titane-os/Documents/GitHub/TITANE_INFINITY/src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx), [e2e/critical/chat-interaction.spec.ts](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/critical/chat-interaction.spec.ts), [e2e/desktop/chat-ui-complete-runtime.wdio.test.js](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/chat-ui-complete-runtime.wdio.test.js), [e2e/desktop/ui-connectivity-critical.wdio.test.js](/home/titane-os/Documents/GitHub/TITANE_INFINITY/e2e/desktop/ui-connectivity-critical.wdio.test.js).

# [2026-04-24] Sprint 5 — Dashboard import optimization

- Surface impactee: `src/pages/DashboardPage.tsx`.
- Changement: suppression d un wildcard import non utilise (`@themes/tokens`) pour reduire le bruit bundle et le compteur wildcard imports du baseline performance.
- Preuve execution: `pnpm run check` + baseline `pnpm run audit:performance` documente dans `performance-analysis.md`.

# [2026-04-24] Agent UI chat runtime truth chain

- Surface canonique: `/titane?tab=conversation`, composant actif `src/components/sections/ConversationSection.tsx`.
- Verite modele: `chat-runtime-state[data-ollama-model]` derive maintenant du runtime assistant (`modelUsed`, puis `modelRequested`) et retombe seulement ensuite sur le defaut gouverne `gemma2:2b`.
- Anti-fake UI: les badges temporaires ajoutes dans `ChatWindow` ont ete retires; la preuve E2E lit uniquement `chat-runtime-state`, `chat-runtime-summary` et `chat-runtime-badge`.
- Driver desktop: `e2e/desktop/ui-driver.wdio.js` expose `openChat`, `sendMessage`, `getChatRuntimeTruth` et `getModelBadges` pour qualifier provider, orchestrateur, memoire et modele depuis la surface active.
- Preuves ajoutees: `e2e/desktop/chat-model-truth-chain.wdio.test.js` et `e2e/desktop/chat-orchestrator-advanced-stress.wdio.test.js`.

# [2026-04-24] Sprint 5 — Deep imports reduction on tabs and control panel

- Surfaces impactees: `src/pages/tabs/DevTools/*`, `src/pages/tabs/DeveloperTools/*`, `src/ui/pages/ControlPanel/*`.
- Changement: remplacement des imports relatifs profonds (`../../../...`, `../../../../...`) par des alias canoniques `@/...` pour les types et utilitaires partages.
- Test associe: `src/features/system-center/hooks/__tests__/useHyperVision.test.ts` aligne aussi le mock `tauriClient` sur alias canonique.
- Preuve execution: `pnpm run check` + `pnpm exec vitest run src/features/system-center/hooks/__tests__/useHyperVision.test.ts` + gates AutoHeal/instructions.

# [2026-04-24] Sprint 5 — Deep imports reduction on ChatIA and system-center tests

- Surfaces impactees: `src/ui/pages/ChatIA/ModeEditor.tsx`, `src/features/system-center/hooks/__tests__/useSystemLogs.test.ts`, `src/features/system-center/hooks/__tests__/useNodeCluster.test.ts`.
- Changement: bascule des imports relatifs profonds vers alias canoniques `@/...` (dont mocks Vitest sur `tauriClient`).
- Surface moteur test impactee: `src/engines/conversation/__tests__/conversationLifecycleEngine.test.ts` et `src/engines/flow/__tests__/FlowEngine.test.ts` alignes aussi sur alias types partages.
- Preuve execution: `pnpm run check` + `pnpm exec vitest run` (4 fichiers cibles) + gates AutoHeal/instructions.

# [2026-04-24] Sprint 5 — Deep imports reduction on service test matrix

- Surfaces impactees: `src/__tests__/services/**` + `src/__tests__/features/chat/artifactIntent.test.ts`.
- Changement: migration de references `../../../services/...` et `../../../features/...` vers alias canoniques `@/services/...` et `@/features/...`.
- Surface UI complementaire: `src/ui/pages/ChatIA/ModeEditor.tsx` deja alignee sur `@/stores/uiStore.selectors` dans l increment precedent, conservee conforme dans ce lot.
- Preuve execution: `pnpm run check` + `pnpm exec vitest run` (8 fichiers cibles) + metrique deep imports `4`.

# [2026-04-24] Sprint 5 — Deep imports reduction on UI route inventory tests

- Surfaces impactees: `src/__tests__/ui/ui-page-objects-inventory.test.ts`, `src/__tests__/ui/app-router-canonical-surfaces.test.tsx`.
- Changement: extraction d un adaptateur de test commun `src/__tests__/ui/uiPagesInventory.adapter.ts` pour centraliser l import WDIO `uiPages.po.js` et reduire les occurrences deep imports.
- Preuve execution: `pnpm run check` + `pnpm exec vitest run` (2 fichiers UI) + metrique deep imports `3`.

# [2026-04-24] Desktop UI driver complete page audit truth

- Surface canonique de preuve: `e2e/desktop/canonical-ui-pages.wdio.test.js`.
- Driver canonique: `e2e/desktop/ui-driver.wdio.js` publie maintenant `auditCanonicalDesktopPage`, `clickDeclaredTabs` et `writeDesktopPageAuditReport`.
- Verite verrouillee par page: route courante, root visible, ownership TopNav/More ou route directe, puis activation stricte de chaque onglet declare dans `e2e/desktop/page-objects/uiPages.po.js`.
- Artefact runtime attendu: `reports/e2e-desktop/canonical-ui-pages-audit.json`, avec un enregistrement par page canonique et le detail des onglets actives.
- Test source anti-derive: `src/__tests__/ui/ui-page-objects-inventory.test.ts` exige que les pages tabbees (`titane`, `time`, `admin`, `dev`) declarent des selectors `data-testid="tab-..."` stables.
- Preuve native obtenue: WDIO/Tauri `1 passing (2m 48.1s)` sur `FRESH_RELEASE_BINARY`, rapport JSON `pageCount=28`, `tabbedPageCount=4`, `totalTabs=22`.

# [2026-04-24] All pages sync truth (XP, Vue, TIME, Admin hubs)

- Surface canonique de synchronisation ajoutee: `e2e/features/all-pages-sync.spec.ts`.
- Verite UI verrouillee sur les surfaces demandees:
  - XP: route `/experience` et indicateurs `experience-stats-advanced` + `experience-history-list`
  - Vue: onglet TITANE `tab-overview` sur `/titane?tab=overview`
  - TIME: onglets `tab-time-now`, `tab-time-agenda`, `tab-time-timeline`, `tab-time-snapshots`, `tab-time-cognitive`
  - ADMIN hubs: `tab-admin-config`, `tab-admin-design`, `tab-admin-governance`, `tab-admin-production-health`
- Durcissement anti-derive E2E: `openAdminTab` privilegie maintenant les testids canoniques `tab-admin-{id}` (avec fallback label) dans `e2e/helpers/navigation.ts`, ce qui supprime la fragilite regex/locale sur la nav admin.

# [2026-04-23] DocCenter — Export DOCX natif (Phase 3)

- Surface canonique: `/doc-center`
- Composant: `src/pages/DocCenterPage.tsx`
- Alias: `/doc` redirige vers `/doc-center`
- Contexte route/orchestrateur: `src/services/chat/moduleRouteContext.ts` publie `moduleId=doc_center` pour `/doc-center` et normalise `/doc` vers cette surface.
- Inventaire page: `e2e/desktop/page-objects/uiPages.po.js` classe `doc-center` dans `directRoutePages` car la surface est accessible par URL directe sans propriétaire TopNav.
- Selectors stables:
  - `doc-center-page` — conteneur principal de la page
  - `btn-export-docx` — bouton déclenchant l'export IPC
  - `doc-export-status` — zone de feedback résultat/erreur
  - `input-doc-title` — champ titre du document
  - `input-output-dir` — champ répertoire de sortie
- IPC: `export_docx_file` via `TAURI_COMMANDS.EXPORT_DOCX_FILE` (doc_engine/commands.rs)
- Tests: Vitest `src/pages/__tests__/DocCenterPage.test.tsx` (12 tests), E2E `e2e/doc-center-export-docx.spec.ts` (4 scénarios), route/context `src/__tests__/ui/app-router-canonical-surfaces.test.tsx`, inventaire `src/__tests__/ui/ui-page-objects-inventory.test.ts`

# [2026-04-23] Experience page canonical stats/history truth

- Surface canonique: `/experience`
- Composant: `src/pages/Experience.tsx`
- La page Experience republie une vérité runtime cohérente avec `useExperience`:
  - bloc `Statistiques` avec métriques globales (`totalXp`, `level`, `xpForNextLevel`, `progress`)
  - bloc `Historique XP` filtrable par source et rendu déterministe même sans événements
  - domaines mappés sur les champs canoniques (`id`, `label`, `xp`, `level`, `category`)
- Selectors/tests stables:
  - `page-experience`
  - `experience-stats-advanced`
  - `experience-history-list`
  - `experience-history-item`
- Preuve associée: Vitest `src/pages/__tests__/Experience.test.tsx` + Playwright `e2e/desktop/xp-history-stats.e2e.spec.ts`

# [2026-04-23] Monitoring sync supervisor runtime truth

- Surface canonique: `monitoring-dashboard`
- Service dédié: `src/services/monitoring/syncSupervisor.ts`
- Le statut monitoring publie maintenant un état de synchronisation runtime dérivé de signaux réels backend/frontend:
  - backend: `useSystemStore.lastUpdate`
  - frontend: timeline `chatMetrics.getRecentEvents()`
  - drift détecté: comparaison temporelle backend/frontend
- Nouveaux selectors stables:
  - `monitoring-dashboard-sync-state`
  - `monitoring-dashboard-sync-reason`
- Preuve associée: tests unitaires monitoring + test Playwright `e2e/agents/monitoring-dashboard.e2e.ts`

# [2026-04-23] Roadmap Évolutive & Évolution — mapping harmonisé

## Roadmap Évolutive (Transformation/Evo)

- Titre harmonisé : « Roadmap Évolutive » (féminin, ponctuation corrigée)
- Disclosure visible : « Roadmap statique, curée manuellement. Aucune connexion IPC live. Dernière synchronisation avec le code qualifié : 2026-04-20. »
- Testid disclosure : `transformation-roadmap-disclosure`
- Testid stats : `roadmap-stats`
- Titre section : `<h3>Roadmap Évolutive</h3>`
- Filtres status : boutons avec aria-labels stables (Tous, Complété, En cours, Planifié, Futur)
- Preuve E2E : selectors stables, test Playwright (grep roadmap|évolut|transform), testid disclosure, testid stats
- Preuve unitaire : test Vitest sur disclosure, titre, filtres, milestones
- Fichier : `src/features/transformation/TransformationRoadmap.tsx`, test : `src/features/transformation/__tests__/TransformationRoadmap.test.tsx`

## Section Évolution (Transform & Évo)

- Titre harmonisé : « Transform & Évolution »
- Testid racine : `transformation-section-root`
- Onglet : bouton `[data-testid="tab-transformation"]`
- Section Lignes d'Évolution : `<h3>🌱 Lignes d'Évolution par Thème</h3>`
- Section Paliers Franchis : `<h3>🎯 Paliers Franchis (Changements Incarnés)</h3>`
- Preuve E2E : test Playwright/WDIO (activation onglet, racine visible, selectors)
- Preuve unitaire : test Vitest (clic onglet, sections visibles)
- Fichier : `src/pages/EvoPage.tsx`, test : `src/pages/__tests__/EvoPage.test.tsx`

## Memory Evolution Center (mode Tauri)

- Testid banner : `memory-evolution-truth-banner`
- Testid persistent count : `persistent-entry-count`
- Preuve E2E : test Playwright/WDIO (mode Tauri, banner, state)
- Fichier : `src/components/MemoryEvolution/MemoryEvolutionCenter.tsx`

# [2026-04-19] Conversation dev overlay send-path truth: sur la voie dev de la surface canonique `/titane?tab=conversation`, `src/components/dev/ConsoleMonitorDashboard.tsx` n occupe plus le coin bas droit qui pouvait intercepter `chat-send` au-dessus du compositeur. Le panneau reste visible en dev mais se docke maintenant en haut a droite, tandis que `e2e/runtime-validation/chat-ar20.spec.ts` privilegie Enter puis un clic DOM borne en fallback et `e2e/critical/chat-interaction.spec.ts` verrouille la verite metier du message assistant sans dependre du formatage exact des badges mock ni d un locator terminal duplique.

# [2026-04-19] Linux launcher sudo-home truth: la regeneration du launcher TITANE∞ sous sudo ne doit plus faire deriver les actions `Logs` et `Config` vers `/root/.titane`. `scripts/update-desktop-icon.sh` resolve maintenant `TARGET_USER_HOME` depuis `SUDO_USER` via `getent passwd`, puis publie `DESKTOP_INSTALL_DIR`, `LOCAL_ICON_ROOT` et `TARGET_CONFIG_DIR` sur ce home canonique afin que les entrees `.desktop` systeme et utilisateur restent coherentes apres `sudo bash scripts/post-build/update-desktop-icons.sh`.

# [2026-04-24] App footer version marker truth: la surface footer canonique dans `AppRouter` affiche désormais `TITANE∞ V{__APP_VERSION__}` (V majuscule) pour rester alignée avec le marquage version visible de publication.

# [2026-04-19] Linux menu and dock icon refresh truth: le launcher canonique titane-infinity publie maintenant les icones utilisateur et systeme en 128x128, 256x256 et 512x512 via scripts/update-desktop-icon.sh et scripts/post-build/update-desktop-icons.sh, au lieu de ne synchroniser que 128x128. La surface utilisateur effectivement reappliquee reste ~/.local/share/applications/titane-infinity.desktop avec Icon=titane-infinity et des assets hicolor multi-resolutions sous ~/.local/share/icons/hicolor/\*/apps/titane-infinity.png, ce qui ferme le delta menu/dock quand le shell choisit une taille superieure a 128.

# [2026-04-24] Post-build launcher noninteractive truth: `scripts/post-build/update-desktop-icons.sh` complete maintenant la synchronisation launcher/icones utilisateur meme si la replication systeme requiert un sudo interactif. Le script retourne exit 0 avec `sync système=BLOCKED_SUDO_REQUIRED` et `sync binaire=BLOCKED_SUDO_REQUIRED` au lieu de masquer la preuve utilisateur derriere un echec sudo fatal.

# [2026-04-19] Android conversation qualification truth: la surface canonique /titane?tab=conversation est maintenant qualifiee sur lane Android mobile par trois preuves additionnelles dans e2e/android/android-build-ui.browser.spec.ts: T18 verrouille la verite quota via chat-runtime-state/chat-runtime-summary, T19 prouve la continuite connaissance+memoire sur la lane mock canonique via le dernier message assistant et **TITANE_E2E_CHAT_MEMORY_LOG**, et T20 verrouille les citations inline via message-citations-{index} / message-citation-{index}-{citationIndex}. La lane device e2e/android/android-build-ui.device.spec.ts capture aussi runtime_settings_v1.json et runtime_config.json pour prouver que l application installee cible un ollamaUrl LAN non-loopback avec un ollamaModel explicite.

# [2026-04-19] Memory hybrid orchestration truth: la surface canonique `/titane?tab=memory` expose maintenant l etat d orchestration additive via `memory-hybrid-overview-orchestration-status`, `memory-hybrid-overview-orchestration-preview`, `memory-hybrid-orchestration-state`, `memory-hybrid-orchestration-count`, `memory-hybrid-orchestration-preview` et `memory-hybrid-orchestration-reason`. `src/services/ai/memoryIntegration.ts` publie des complements `hybridSupplementalKnowledge` distincts de la mémoire canonique, puis `src/components/sections/MemorySection.tsx` et `src/features/memory/MemoryTreeViewer.tsx` rendent cette vérité sans ouvrir une nouvelle route ni fusion silencieuse de `relevantKnowledge`.

# [2026-04-18] Conversation identity-kernel prompt truth: la surface canonique `/titane?tab=conversation` reçoit maintenant un noyau identitaire dérivé d une source structurée versionnée `data/knowledge_base/default/titane_identity_kernel_v31.json`. Les modes actifs `src/services/ai/chatModes.ts` et `src/services/ai/chatModes.config.ts` injectent ce résumé partagé via `src/services/ai/titaneIdentityKernel.ts`, ce qui aligne signature, mission, garde-fous mémoire et promesse publique sans changer la topologie visuelle ni les testids conversationnels existants.

# [2026-04-26] Conversation response-depth truth: la surface canonique `/titane?tab=conversation` relève maintenant explicitement son plancher de qualité sur les chemins par défaut et les fallbacks d instructions. `src/services/ai/chatEngine.ts` durcit les profils `BALANCED`, `DEVELOPED` et `DEEP` pour imposer une sortie plus substantielle, `src/services/ai/chatModes.ts` et `src/config/chatModes.config.ts` injectent un positionnement "maître d analyse, de recherche, de rédaction de rapports et de résumés avancés", et `src/ui/pages/ChatIA/InstructionModeManager.ts` aligne le mode assistant par défaut pour éviter les réponses trop courtes ou les confirmations inutiles quand la demande est déjà exploitable.

# [2026-04-26] Conversation mode-order and expert-lanes truth: le registre canonique des modes ne publie plus de doublon d ordre d affichage côté sélecteur, et les voies principales `standard`, `synthèse`, `planification`, `debug cognitif`, `développeur`, `stratégie`, `audit`, `urgence` et `oméga` portent maintenant explicitement un niveau expert de formulation. `src/services/ai/chatModes.config.ts` corrige le doublon `sortOrder` qui perturbait la suite large de configuration, tandis que `src/services/ai/chatModes.ts` et la config étendue homogénéisent la promesse de sortie sur les lanes conversationnelles principales.

# [2026-04-26] Conversation registry full-alignment truth: la seconde registry de prompts `src/config/chatModes.config.ts` et les derniers modes étendus `quick` et `creation` ne restent plus en retrait par rapport au plancher expert global. Les surfaces de sélection et de résolution de modes conservent désormais un message cohérent sur les voies coaching, stratégie, audit, créativité, rapidité et création, sans retomber sur des formulations trop génériques.

# [2026-04-26] Chat mode registry boundary truth: les deux registries de modes ne décrivent pas la même surface active. `src/config/chatModes.config.ts` reste la voie canonique de résolution runtime legacy des prompts et des modes personnalisés pour le moteur historique, tandis que `src/services/ai/chatModes.config.ts` pilote les métadonnées étendues et les surfaces UI modernes des modes. Un test dédié verrouille cette séparation pour éviter un faux merge destructeur.

# [2026-04-18] Conversation assistant completeness verification truth: la surface canonique `/titane?tab=conversation` est maintenant scellée par une preuve supplémentaire de complétude côté tests. `src/components/chat/__tests__/MarkdownContent.test.tsx` couvre une réponse markdown longue mixte jusqu au marqueur terminal `OMEGA-FINAL-BLOCK`, `e2e/critical/chat-interaction.spec.ts` prouve que ce bloc terminal reste atteignable sur la surface active, et `e2e/critical/chat-layout-viewport.spec.ts` verrouille que cette atteignabilité reste bornée dans `chat-messages-scroll-region` sans faire sortir `chat-input` ni `chat-send` du viewport.

# [2026-04-19] Conversation backend truncation truth: la surface canonique `/titane?tab=conversation` ne depend plus d une troncature backend basee sur des offsets bytes dans `src-tauri/src/conversation_os/style.rs` et `src-tauri/src/conversation_os/adapter.rs`. La borne de longueur Conversation OS utilise maintenant `truncate_text_safely`, preserve les frontieres Unicode et les coupures sur phrase ou mot, tandis que `src/__tests__/hooks/useConversationEngine.test.ts` et `src/components/sections/__tests__/ConversationSection.render.test.tsx` verrouillent qu un bloc terminal long reste intact jusqu a `chat-message-content` sur la surface active.

# [2026-04-19] Conversation ultra-long prompt/response truth: la surface canonique `/titane?tab=conversation` n impose plus de coupe dure a 10000 caracteres sur la voie utilisateur ni sur la sanitisation de `ConversationSection`, et la voie de preuve mockee garde un aller-retour ultra-long complet jusqu au marqueur terminal `ULTRA-END`. `src/components/chat/ChatInput.tsx` retire la borne de saisie dure au profit d un avertissement souple, `src/components/sections/ConversationSection.tsx` preserve l entrée complete sans `.slice(0, 10000)`, `src-tauri/src/conversation_engine/pipeline.rs` n ecarte plus les messages ultra-longs non vides, et `e2e/critical/chat-interaction.spec.ts` scelle l intégrité exacte du texte utilisateur et assistant sur `chat-message-content` sans alerte `titane-message-truncated`.

# [2026-04-18] Memory hybrid diagnostics truth: la surface canonique mémoire de `/titane?tab=memory` publie maintenant un panneau visible `memory-hybrid-diagnostics` dans `src/features/memory/MemoryTreeViewer.tsx`. `src/components/sections/MemorySection.tsx` y relaie l état runtime exporté par `src/services/ai/memoryIntegration.ts`, avec testids stables pour `memory-hybrid-shadow-write-state`, `memory-hybrid-shadow-read-state`, `memory-hybrid-shadow-write-count`, `memory-hybrid-shadow-read-count`, `memory-hybrid-shadow-read-rollout-mode`, `memory-hybrid-shadow-read-active-preset`, `memory-hybrid-shadow-read-canary-state`, `memory-hybrid-shadow-read-canary-reason`, `memory-hybrid-shadow-read-canary-operator-hint`, `memory-hybrid-shadow-read-canary-query-preview`, `memory-hybrid-shadow-read-preset-history`, `memory-hybrid-shadow-read-rollout-controls`, `memory-hybrid-shadow-read-rollout-presets`, `memory-hybrid-shadow-read-rollout-preset-observe`, `memory-hybrid-shadow-read-rollout-preset-balanced`, `memory-hybrid-shadow-read-rollout-preset-full`, `memory-hybrid-shadow-read-rollout-mode-select`, `memory-hybrid-shadow-read-canary-percentage-select`, `memory-hybrid-shadow-read-trend-window-select`, `memory-hybrid-shadow-read-rollout-apply`, `memory-hybrid-shadow-read-rollout-probe`, `memory-hybrid-shadow-read-sample`, `memory-hybrid-shadow-read-total`, `memory-hybrid-shadow-read-coverage`, `memory-hybrid-shadow-read-average-similarity`, `memory-hybrid-shadow-read-average-score`, `memory-hybrid-shadow-read-composite-score`, `memory-hybrid-shadow-read-qualification`, `memory-hybrid-shadow-read-canonical-preview`, `memory-hybrid-shadow-read-unified-preview`, `memory-hybrid-shadow-read-matched-pairs`, `memory-hybrid-shadow-read-history`, `memory-hybrid-shadow-read-trend-summary`, `memory-hybrid-shadow-read-extended-trend`, `memory-hybrid-shadow-read-history-chart`, `memory-hybrid-shadow-read-history-sparkline`, `memory-hybrid-shadow-read-history-axis`, `memory-hybrid-shadow-read-pairs-list`, `memory-hybrid-shadow-read-near-matches`, `memory-hybrid-shadow-read-near-stability`, `memory-hybrid-shadow-read-missing-list`, `memory-hybrid-shadow-read-delta`, `memory-hybrid-shadow-read-query`, `memory-hybrid-shadow-read-error`, `memory-hybrid-shadow-read-missing-labels` et `memory-hybrid-shadow-read-extra-labels`.

# [2026-04-19] Memory hybrid report export truth: la vue d ensemble de `src/components/sections/MemorySection.tsx` expose maintenant un export utilisateur du diagnostic hybride via `memory-hybrid-overview-export-report` et un retour visible `memory-hybrid-overview-export-status`. Le rapport exporté condense preset actif, statut shadow-read, qualification, guidance opérateur et historique récent sans créer de nouvelle route ni de logique parallèle hors `memoryIntegration`.

# [2026-04-19] Memory hybrid governed desktop export truth: le même contrôle `memory-hybrid-overview-export-report` préfère maintenant une publication Tauri gouvernée quand le runtime desktop est disponible. `memory-hybrid-overview-export-status` peut donc refléter un artefact persistant `app_data_dir()/hybrid_memory/exports/*.md` au lieu d un simple téléchargement Blob, sans changer la surface canonique `/titane?tab=memory`.

# [2026-04-19] Memory hybrid overview truth: la vue d ensemble de `src/components/sections/MemorySection.tsx` publie aussi un résumé runtime léger avec `memory-hybrid-overview-summary`, `memory-hybrid-overview-active-preset`, `memory-hybrid-overview-operator-hint` et `memory-hybrid-overview-preset-history`, afin d exposer le preset actif et l historique récent sans ouvrir l arbre.

# [2026-04-19] Memory dashboard hybrid truth: `src/components/chat/MemoryDashboard.tsx` expose désormais une synthèse hybride avec `memory-dashboard-hybrid-summary`, `memory-dashboard-hybrid-active-preset`, `memory-dashboard-hybrid-status`, `memory-dashboard-hybrid-operator-hint` et `memory-dashboard-hybrid-preset-history`, relayée depuis `src/components/sections/MemorySection.tsx` sans créer de nouvelle route.

# [2026-04-18] Conversation assistant markdown tables-and-quotes truth: la surface canonique `/titane?tab=conversation` rend maintenant aussi les citations markdown `>` et les tableaux style GitHub via `src/components/chat/MarkdownContent.tsx`, avec containment horizontal maintenu dans `src/pages/TitanePage.css`, sans changer les testids `chat-message-assistant` et `chat-message-content`.

# [2026-04-18] Conversation response-budget truth: la surface canonique `/titane?tab=conversation` envoie maintenant explicitement un plafond de sortie `32768` via `src/services/api/chat.ts::sendMessage()` quand aucun `maxTokens` n est fourni par la UI. La voie active `useChat -> chatService.sendMessageLegacy -> chatService.sendMessage -> conversation_generate` ne retombe donc plus sur des défauts backend bas qui coupaient artificiellement les réponses Titane.

# [2026-04-18] Governance Ollama endpoint truth: la surface canonique de gouvernance `provider-card-ollama` n affiche plus le faux fallback `/api/ollama` quand le backend est opt-in ou partiellement indisponible. `src-tauri/src/ai/ollama.rs` résout maintenant l endpoint et le modèle effectifs depuis la config runtime persistée puis l environnement, et `src/features/governance-center/components/APIProviderCard.tsx` publie `ollama-provider-url`, `ollama-provider-model`, `ollama-provider-endpoint-kind`, `ollama-provider-endpoint-source`, `ollama-provider-health`, `ollama-provider-network-used` et `ollama-provider-model-list` à partir de cette vérité Tauri unique.

# [2026-04-18] Ollama runtime propagation truth: la vérité enrichie Ollama ne reste plus confinée à la gouvernance. `src/hooks/useBackendHealth.ts` publie maintenant `ollamaDetails` depuis `ai_check_ollama_status` avec fallback provider honnête si Tauri est indisponible, tandis que `src/pages/ConfigurationHub.tsx` expose `runtime-ollama-endpoint-kind`, `runtime-ollama-endpoint-source`, `runtime-ollama-model-source`, `runtime-ollama-network-used` et `runtime-ollama-health` à partir du même contrat backend.

# [2026-04-24] Configuration hub audio truth: la surface canonique `src/pages/ConfigurationHub.tsx` réaligne son onglet audio sur un unique état local `audioConfig`, utilisé à la fois au chargement, à l affichage (`audio-input-device-*`, `audio-output-device-*`, `audio-volume`) et aux actions `audio-config-reload` / `audio-config-save`, évitant un blocage TypeScript sur une paire d identifiants divergente.

# [2026-04-18] Conversation runtime-disk knowledge base truth: la surface canonique `/titane?tab=conversation` ne dépend plus uniquement de la KB par défaut embarquée au build. `src/services/api/defaultKnowledgeBase.ts` tente maintenant d abord la commande IPC gouvernée `knowledge_base_runtime_snapshot`, ce qui permet au chat actif de consommer en priorité le contenu réel de `/data/knowledge_base/default` quand le runtime Tauri le voit, tout en gardant le fallback embarqué `knowledge_base_get_all` puis le fallback bundle frontend si la voie disque est indisponible.

# [2026-04-18] Conversation assistant markdown typography truth: la surface canonique `/titane?tab=conversation` accentue maintenant davantage les titres markdown et habille les blocs code avec une barre d en-tête de langage sur `src/components/chat/MarkdownContent.tsx`, sans changer la route active ni les testids `chat-message-assistant` et `chat-message-content`.

# [2026-04-18] Conversation assistant markdown polish truth: la surface canonique `/titane?tab=conversation` garde le renderer markdown assistant introduit sur `ConversationSection`, mais affine désormais la hiérarchie visuelle des titres, emphases, liens et blocs de code via `src/components/chat/MarkdownContent.tsx` et `src/pages/TitanePage.css`. La lecture des réponses structurées reste donc plus claire sans changer les testids `chat-message-assistant` et `chat-message-content`.

# [2026-04-18] Conversation assistant readability truth: la surface canonique `/titane?tab=conversation` ne rend plus les réponses assistant comme un simple bloc texte étroit. `src/components/sections/ConversationSection.tsx` délègue maintenant le rendu assistant à `src/components/chat/MarkdownContent.tsx` tout en conservant `chat-message-content`, et `src/pages/TitanePage.css` relâche la largeur utile des bulles assistant/fullscreen pour que les réponses longues restent lisibles et perçues comme complètes sur la surface active.

# [2026-04-18] Conversation canonical-kernel authority truth: la surface canonique /titane?tab=conversation ne se contente plus d un stub local pour le profil et le provider. conversationEngine.processMessage appelle maintenant canonicalDiscernmentKernel.discern() avec mémoire intégrée, préférences durables, santé provider et cohérence Singularity, puis laisse cette décision piloter le provider envoyé, le profil runtime et la vérité exposée via CANONICAL*DISCERNMENT_CONTEXT, kernel-profile:*, kernel-provider:\_ et kernel-truth:\*.

# [2026-04-18] Conversation provider-and-citations truth: la surface canonique /titane?tab=conversation conserve maintenant le provider réel même quand seul meta.provider_used est présent, et transporte aussi les citations online sur le format canonique Citation jusqu à la metadata assistant utilisée par la UI active. La voie standard du chat ne perd donc plus ni provider_used ni Sources en ligne lorsque conversation_generate publie ces vérités via metadata ou trace.

# [2026-04-18] Conversation governed tool-lane truth: la surface canonique `/titane?tab=conversation` ne force plus `toolAvailable=false` dans son discernment frontend. `conversationEngine.processMessage` publie désormais `GOVERNED_TOOL_LANE_CONTEXT` et `GOVERNED_TOOL_LANE_STATUS` depuis la whitelist IPC canonique et la santé MCP, expose `tool-lane:*`, `task-type:*`, `tool-action:*`, `web-action:*`, `memory-action:*` et `ask-act-hold:*`, mais rappelle implicitement via `execution_mode=governed_not_auto` qu il s agit d une capacité gouvernée disponible, pas d une exécution automatique déjà branchée.

# [2026-04-18] Conversation advanced-agent runtime truth: la surface canonique `/titane?tab=conversation` reçoit maintenant un résumé honnête des services runtime déjà utilisés par les dashboards avancés. `conversationEngine.processMessage` injecte `ADVANCED_AGENT_RUNTIME_CONTEXT` et `ADVANCED_AGENT_RUNTIME_STATUS` à partir des statuts monitoring, diagnostic, explainability, orchestrator et security_active, puis publie `advanced-agents:present` et `agent:*:*` dans les tags runtime au lieu de prétendre qu un nouvel orchestrateur agentique a été branché.

# [2026-04-18] Conversation skill and online runtime truth: la surface canonique `/titane?tab=conversation` consomme désormais la Skill OS déjà existante et publie aussi un état online gouverné honnête. `conversationEngine.processMessage` injecte `ACTIVE_SKILL_CONTEXT` quand un skill actif existe, publie `ACTIVE_SKILL_STATUS`, et expose en tags `skill:active|inactive` ainsi que `skill-id:*`. La même voie publie aussi `ONLINE_CAPABILITY_CONTEXT` / `ONLINE_CAPABILITY_STATUS` avec `online:available|offline` et `deep-analysis:enabled|disabled`, sans créer de seconde source d état hors de la réponse conversationnelle.

# [2026-04-18] Conversation context status runtime truth: la surface canonique `/titane?tab=conversation` n expose plus seulement le provider et les citations. Les réponses assistant publient aussi des tags runtime honnêtes sur `runtime-knowledge:*`, `default-kb:*`, `persistent-memory:*`, ainsi que `twins:present` et `cognitive-context:present` quand le context envelope actif les transporte réellement. Ces tags utilisent la même voie canonique `response.cognitive_tags -> assistant metadata.tags -> chat-runtime-tag`.

# [2026-04-18] Conversation default knowledge base prompt truth: la surface canonique `/titane?tab=conversation` n injecte plus seulement la mémoire runtime et persistante. La chaîne active `ConversationSection -> useConversationEngine -> conversationEngine.processMessage` ajoute désormais un bloc `DEFAULT_KNOWLEDGE_BASE_CONTEXT` ciblé par requête depuis la base de connaissance par défaut, avec statut explicite `DEFAULT_KNOWLEDGE_BASE_STATUS` pour éviter tout faux silence quand la KB frontend est indisponible.

# [2026-04-18] Journal OMEGA runtime truth: la surface canonique `/titane?tab=conversation` n affiche plus dans `ThinkingPanel` des placeholders génériques `NON DISPONIBLE`, `NON CAPTURÉ`, `NON INSTRUMENTÉ` ou `Inconnu` pour les champs runtime principaux. `src/hooks/useConversationEngine.ts` projette désormais `latencyMs`, `qualityScore`, `xpTrace`, `saveStatus`, `systemPromptSources`, `webSearchStatus`, `cognitiveSummary` et `actionsPerformed` dans la metadata assistant, puis `src/components/sections/ConversationSection.tsx` les transmet au `Journal d'Exécution OMEGA` actif pour rendre les valeurs réelles de mode, durée, XP, score qualité, sauvegarde, recherche inline et sources contexte.

# [2026-04-18] Conversation requested-used-shown model truth: la surface canonique `/titane?tab=conversation` ne s arrête plus au seul provider_used. `src/services/conversationEngine.ts` normalise désormais `model_requested`, `model_used` et `fallback_used`, `src/hooks/useConversationEngine.ts` les persiste sur la metadata du message assistant, puis `src/components/sections/ConversationSection.tsx` les affiche dans `chat-runtime-summary` et `chat-runtime-badges` pour fermer la chaîne requested -> used -> shown sur le modèle réellement exécuté.

# [2026-04-18] MessageBubble compatibility model truth: la surface de compatibilité `src/components/chat/MessageBubble.tsx` republie maintenant aussi `modelRequested`, `modelUsed` et `fallbackUsed` dans l en-tête assistant via `message-model-requested-{timestamp}`, `message-model-used-{timestamp}` et `message-model-fallback-{timestamp}`. Cette voie n est pas l autorité runtime de `/titane?tab=conversation`, qui reste `ConversationSection`, mais elle évite une divergence de lecture quand des surfaces legacy ou tests ciblent encore `MessageBubble`.

# [2026-04-18] Conversation inline web citations E2E truth: la surface conversation canonique active de `/titane?tab=conversation` rend désormais les citations inline directement dans `ConversationSection`, avec une preuve Playwright bornée sur `webResearch` et les sélecteurs `message-citations-{index}` / `message-citation-{index}-{citationIndex}`. `MessageBubble` conserve le même rendu comme surface de compatibilité, mais l autorité runtime de cette route reste `ConversationSection`.

# [2026-04-18] Conversation provider recovery and inline citations truth: la surface canonique `/titane?tab=conversation` ne remplace plus une réponse assistant valide marquée `FALLBACK_OFFLINE` par un faux message “mode récupération provider”. Seules les indisponibilités runtime `PROVIDER_UNAVAILABLE` gardent ce message de récupération, tandis que les réponses de recherche web inline exposent désormais leurs sources directement dans `message-citations-{index}` et `message-citation-{index}-{citationIndex}` sur la surface active `ConversationSection`, avec `MessageBubble` maintenu en compatibilité.

# [2026-04-17] Security governed export metadata truth: `security-dashboard` ne se contente plus d afficher le JSON brut d export. La surface canonique publie maintenant `security-dashboard-governed-export` avec les métadonnées stables `exportId`, `exportPath`, `sha256`, `fingerprint`, `publishedAt` et `eventCount` dérivées du lane Tauri signé quand elles existent déjà, ou du dernier payload gouverné persisté sans créer de seconde voie de rendu.

# [2026-04-18] Chat layout zoom authority runtime truth: la surface canonique `AppShell -> /titane?tab=conversation` n applique plus de contre-echelle geometrique sur le shell racine. `src/hooks/zoomScale.ts` pilote le zoom via `--titane-ui-scale` et la taille de police racine, `src/components/layout/AppShell.tsx` reste strictement parent-bound avec un offset TopNav fixe, et `src/components/sections/ConversationSection.tsx` resynchronise `--conversation-vh` via `ResizeObserver` + sync differee pour suivre les resizes WRY natifs. La preuve ciblee est PASS sur navigateur et desktop WRY pour `100% -> 110% -> 100% -> 90%` puis resize compact, avec `page-titane`, `tab-conversation`, `chat-messages-scroll-region`, `chat-input`, `chat-send` et `--conversation-vh` aligns a la hauteur effective visible.

# [2026-04-17] Monitoring boot runtime truth: le dashboard canonique `monitoring-dashboard` ne se contente plus d exposer que le lazy-loader existe; `src/hooks/useAppInitialization.ts` demande maintenant explicitement `initMonitoringAsync('boot')` sur le boot canonique, et `src/services/monitoring/monitoringLazyLoader.ts` publie un etat observable (`requested`, `loading`, `loaded`, `requestSource`, `lastAttemptAt`, `lastLoadedAt`, `lastError`) consommé par `src/services/monitoring/index.ts`. La preuve UI attend donc au minimum un item `Runtime: lazy-loader ... via boot|demand`, sans supposer que l initialisation asynchrone est déjà terminée au premier rendu.

# [2026-04-17] Diagnostic and explainability runtime report truth: `diagnostic-panel` publie maintenant un rapport d anomalie structurel borné via `diagnostic-panel-diagnostic-report` et `diagnostic-panel-diagnostic-history`, dérivé des alertes actives, erreurs globales, état Ollama et providers déclarés déjà présents dans le repo. `explainability-dashboard` conserve la chaîne `requested -> used -> shown`, mais ajoute aussi `explainability-dashboard-inference-history`, un historique local horodaté des traces providerMeta persistées sur la conversation active.

# [2026-04-17] Logging context and HMR stability truth: la surface applicative canonique est maintenant enveloppee par `LoggingProvider` dans `App`, ce qui pose une facade de migration pour le logging frontend sans fusion brutale des implementations existantes. La verite anti-cycle est egalement explicite: `LogLevel` vit dans `src/types/logLevel.ts`, `src/utils/logger.ts` le re-exporte seulement pour compatibilite, et `src/config/logLevelConfig.ts` depend du type partage au lieu d importer le logger runtime.

# [2026-04-17] Runtime hooks barrel isolation truth: la surface runtime canonique n importe plus le barrel racine `src/hooks/index.ts` pour `App`, `VitalsPanel`, `StatusIndicator` et `PhysiologicalPanel`. Les hooks physiologiques de compatibilite vivent maintenant dans `src/hooks/usePhysiological.ts`, tandis qu un garde d architecture interdit les nouveaux imports runtime depuis `@/hooks` hors tests, afin de reduire le blast radius HMR sans casser la surface publique du barrel pour les tests et migrations progressives.

# [2026-04-17] Conversation effective viewport height truth: la surface chat canonique `/titane?tab=conversation` derive maintenant `--conversation-vh` depuis une hauteur effective calculee a partir de `window.innerHeight / visualViewport.scale`, avec borne minimale a `320px`, au lieu de se fier a un offset fixe `-155px/-176px/-82px`. `conversation-container`, `chat-messages-scroll-region`, `chat-input` et `chat-send` restent ainsi dans le viewport visible sous zoom navigateur, zoom TopNav et resize compact, et les preuves Playwright/WDIO verifient en plus la valeur runtime de `--conversation-vh`.

# [2026-04-17] Agent dashboards conversation-safe dock truth: `agent-dashboards-panel` conserve son montage canonique dans `AppShell`, mais la surface conversation fullscreen ne l'affiche plus comme une pile fixe collée au coin bas. Le panneau passe désormais en dock compact non-obstructif avec `agent-dashboards-panel-toggle` et `agent-dashboards-panel-content`, ancré hors du compositeur chat pour éviter toute occultation de `chat-input` et `chat-send` sous zoom et viewport compact.

# [2026-04-23] Agent dashboards visibility affordance truth: `agent-dashboards-panel-toggle` expose maintenant un état visible `data-has-update` et les marqueurs `agent-dashboards-panel-whats-new-badge` + `agent-dashboards-panel-whats-new-text` tant que la version UI courante n a pas encore été reconnue sur le poste. La vérité de surface devient donc explicitement perceptible même quand les dernières évolutions vivent surtout dans le panneau Agents ou dans ses dashboards runtime.

# [2026-04-17] Conversation zoom-width containment truth: la surface chat canonique `/titane?tab=conversation` ne sort plus de la fenêtre sur la lane navigateur quand le zoom TopNav passe à `1.1`. `AppShell` compense désormais largeur et hauteur via `--titane-ui-scale`, `TitanePage` supprime les restes de `100vw`, et l’onglet `tab-conversation`, le flux, l’input et le bouton d’envoi restent tous bornés horizontalement et verticalement dans le viewport actif.

# [2026-04-17] Orchestrator multi-session comparison truth: `orchestrator-dashboard` publie maintenant `orchestrator-dashboard-multi-session-compare` et `orchestrator-dashboard-champion-breakdown` en plus des métriques live existantes. La surface canonique expose ainsi une comparaison locale bornée entre sessions navigateur et une ventilation champion/challenger par provider dérivée du registre canonique, sans créer de second écran ni de faux backend partagé.

# [2026-04-17] Security audit governed bridge truth: `security-dashboard` conserve les selectors `security-dashboard-severity-filters`, `security-dashboard-filter-all|critical|warning|info`, `security-dashboard-multi-session-federation`, `security-dashboard-export-correlations` et `security-dashboard-containment-correlation-export`, mais la surface canonique publie désormais un export gouverné signé quand le runtime Tauri est disponible. Le journal fédéré reste rendu sur la même surface UI, sans second écran ni chemin réseau direct.

# [2026-04-16] Security audit federation/filter/export truth: `security-dashboard` publie maintenant `security-dashboard-severity-filters`, `security-dashboard-filter-all|critical|warning|info`, `security-dashboard-severity-filter-summary`, `security-dashboard-multi-session-federation`, `security-dashboard-export-correlations` et `security-dashboard-containment-correlation-export`. La surface canonique permet ainsi de fédérer localement plusieurs sessions issues du journal UI, de filtrer les événements par sévérité et d’exporter un JSON borné des corrélations de confinement sans quitter le panneau fixe.

# [2026-04-16] Advanced-agent timeline and security audit surfaces: `orchestrator-dashboard` publie maintenant `orchestrator-dashboard-refresh` et `orchestrator-dashboard-live-timeline` pour suivre une série temporelle locale bornée de la charge providers avec refresh à 15s sur la surface canonique. `security-dashboard` publie `security-dashboard-refresh`, des boutons `security-dashboard-ack-*`, `security-dashboard-event-history` et `security-dashboard-correlation-summary`, afin d exposer l acquittement persistant, l historique borné et la corrélation croisée des événements de détection/confinement sans quitter le panneau fixe canonique.

# [2026-04-16] Advanced-agent live runtime surfaces: `orchestrator-dashboard`, `explainability-dashboard` et `security-dashboard` publient maintenant des sections live stables au lieu de se limiter à un statut synthétique. L orchestrateur expose `orchestrator-dashboard-live-metrics` et `orchestrator-dashboard-provider-snapshots` depuis la télémétrie locale et la gouvernance providers, l explainability expose `explainability-dashboard-inference-chain` et `explainability-dashboard-inference-report` depuis la conversation persistée active, et la sécurité active expose `security-dashboard-detection-events` et `security-dashboard-containment-events` à partir des alertes, logs UI et politiques de confinement déjà disponibles.

# [2026-04-16] Advanced agents runtime detail truth: `explainability-dashboard`, `orchestrator-dashboard` et `security-dashboard` publient maintenant des sections runtime détaillées issues de la vérité déjà disponible dans le repo, au lieu de s arrêter à un statut `partial` générique. Explainability expose la chaîne `requested -> used -> shown` et un mini rapport d'inférence, orchestrator publie des métriques live et snapshots providers, et security active affiche des événements de détection/confinement dérivés du runtime canonique.

# [2026-04-16] Conversation E2E knowledge-memory proof truth: la lane critique Playwright du chat peut maintenant injecter une connaissance runtime seedee dans le mock conversationnel actif et vérifier deux marqueurs visibles, `[MOCK_KNOWLEDGE]` et `[MOCK_MEMORY]`, tout en traçant les échanges persistés dans `window.__TITANE_E2E_CHAT_MEMORY_LOG__`. Cette preuve reste explicitement une lane mock du chemin frontend canonique, pas une simulation de backend HTTP séparé.

# [2026-04-16] Monitoring lazy-loader runtime fix: le dashboard canonique `monitoring-dashboard` continue de passer par `src/services/monitoring/index.ts`, mais la façade monitoring importe désormais explicitement les bindings du lazy-loader avant de les réexporter. La vérité runtime corrigée est que `getMonitoringAgentStatus()` peut être appelée depuis `MonitoringDashboard.tsx` sans `ReferenceError`, même avant l'initialisation paresseuse complète du monitoring.

# [2026-04-17] Canonical zoom authority truth: le zoom global TITANE passe maintenant par une seule autorité canonique (`src/hooks/zoomScale.ts`) partagée entre TopNav, raccourcis clavier et panneau UIReading. Le shell applicatif, les panneaux modaux et la surface chat legacy ont été réalignés sur des dimensions parent-bound (`100%`) au lieu de `vh/dvh` rigides, afin que textes et éléments grandissent/rétrécissent de façon cohérente sans réintroduire de débordement sous zoom navigateur et Tauri.

# [2026-04-17] Advanced agents runtime truth: les dashboards `monitoring-dashboard`, `diagnostic-panel`, `explainability-dashboard`, `orchestrator-dashboard` et `security-dashboard` ne lisent plus seulement le catalogue de qualification; ils passent par leurs services dédiés pour afficher des signaux runtime/configuration réels déjà présents dans le repo (métriques/alertes monitoring, providers actifs, timeouts, registre champion/challenger, transport IPC, statut Ollama).

# [2026-04-17] Native zoom-step truth: la surface conversation TITANE conserve maintenant un cycle de zoom symétrique dans TopNav et au clavier. Un aller-retour `zoom in` puis `zoom out` revient exactement à 100% au lieu de dériver vers `0.99`, et la page fullscreen force désormais un bornage parent-bound (`width/max-width/min-height` overrides) pour rester visible dans la fenêtre Tauri dev à `0.8`, `1.0` et `1.1`.

# [2026-04-16] Canonical route-context truth: les alias query-driven ne sont plus résumés à leurs seuls chemins racine dans `moduleRouteContext`; `/chat`, `/devtools`, `/monitoring`, `/stats`, `/evolution-center` et les alias Admin/Dev conservent désormais leur destination canonique complète (`tab=...`, `systemTab=...`) afin que la mémoire contextuelle, les raccourcis et les diagnostics reflètent la surface réellement visible au lieu d'une racine générique pouvant donner une impression de rollback UI.

# [2026-04-16] Canonical desktop/browser zoom truth: la surface conversation TITANE n'est plus rétrécie par un `html { zoom: 75%; }` global en desktop. La baseline revient à 100%, les raccourcis zoom/fullscreen restent l'autorité canonique, et la page conversation conserve désormais un étirement `width: 100%` parent-bound pour rester entièrement visible en HTTP, en Tauri, en plein écran et sous zoom +/-.

# [2026-04-16] Conversation fullscreen bounded-height truth: la surface conversation fullscreen est maintenant contrainte par une chaîne `titane-content--conversation -> titane-section-conversation--fullscreen -> conversation-container` entièrement flex et bornée en hauteur, ce qui garde l’onglet Chat, le flux et le compositeur dans la fenêtre sans débordement bas en HTTP desktop.

# [2026-04-17] TopNav zoom viewport truth: les contrôles de zoom du TopNav ne laissent plus la surface TITANE sortir de la fenêtre visible. Le shell applicatif compense désormais le zoom global via une hauteur et un offset top normalisés par `--titane-ui-scale`, ce qui garde le chat, les tabs et le compositeur entièrement visibles sous zoom avant/arrière, resize et viewport compact.

# [2026-04-16] Conversation long-message visibility: la surface chat canonique ne jette plus les messages assistant tres longs dans le chemin de virtualisation; elle repasse sur le rendu naturel et ne declenche l'alerte `titane-message-truncated` que si une limite explicite a ete configuree via `window.TITANE_MAX_MESSAGE_LENGTH`.

# [2026-04-16] Conversation runtime transparency reply: quand l'utilisateur demande explicitement, sans creer de fichier, le provider reel utilise, l'usage reseau et ce que l'UI peut exporter, la surface conversation repond maintenant localement en 3 points a partir de la derniere verite runtime instrumentee; elle cite JSON, Markdown et copie presse-papiers, et rappelle que les demandes de fichier passent par la voie artefact canonique.

# [2026-04-16] Conversation transparency prompt guard: la surface conversation ne bascule plus vers la voie artefact sur une question descriptive mentionnant simplement ce que l'UI peut exporter; seuls les prompts demandant réellement un export/génération de fichier déclenchent désormais le manifeste artefact.

# [2026-04-22] TWINS scroll contract: la page dédiée `/twins` expose maintenant `page-twins` sur une racine `twins-root` en `flex min-h-full w-full flex-col`; la page ne doit plus imposer `height:100%` + `overflow:hidden` sur sa racine, car le défilement est assuré par le scroll host canonique de `AppShell`.

# [2026-04-22] TopNav canonical active-state truth: les routes autonomes `/knowledge`, `/creation` et `/evolution` restent rattachées à l’entrée principale `nav-titane`; ces surfaces ne doivent pas apparaître comme des pages “sans onglet actif” tant qu’elles appartiennent au domaine TITANE.

# [2026-04-22] DEV engine-route sync truth: les pages moteur `/singularity`, `/sentinel`, `/watchdog`, `/selfheal` et `/adaptive` restent rattachées à `nav-dev`; ce sont des surfaces opérationnelles/monitoring et elles ne doivent plus apparaître sans état actif de navigation.

# [2026-04-22] Engine route runtime-proof selectors: les surfaces `/sentinel`, `/watchdog`, `/selfheal` et `/adaptive` exposent maintenant des racines stables `page-sentinel`, `page-watchdog`, `page-selfheal`, `page-adaptive-engine` pour la qualification `AppRouter` et les preuves de routage canonique.

# [2026-04-22] WDIO page inventory truth: l’inventaire `e2e/desktop/page-objects/uiPages.po.js` référence maintenant explicitement `/singularity`, `/sentinel`, `/watchdog`, `/selfheal` et `/adaptive` dans `devEngineRoutePages`, toutes rattachées à `nav-dev` sans les promouvoir au `topLevelPageOrder`.

# [2026-04-22] WDIO engine-route runtime proof: la lane `e2e/desktop/dev-engine-routes.wdio.test.js` ouvre maintenant chaque surface de `devEngineRoutePages`, vérifie son root canonique visible et exige `aria-current=page` sur `nav-dev`.

# [2026-04-16] Conversation fullscreen internal scroll budget: en viewport compact, le shell fullscreen supprime son gap vertical hérité et réserve un budget bas safe-area-aware afin que `chat-messages-scroll-region` garde le scroll interne pendant que l’onglet chat et le compositeur restent visibles simultanément.

# [2026-04-16] Conversation fullscreen persistent header: la surface conversation conserve maintenant son header d’onglet visible sous zoom et en viewport compact, car `TitanePage` ne force plus le scroll vers le textarea et `titane-page-header--conversation` reste collé en haut du shell fullscreen.

# [2026-04-16] Conversation visible native scrollbar: `chat-messages-scroll-region` conserve une scrollbar native droite explicitement visible, avec piste/thumb renforcées et un gutter stable, afin de garder un repère de défilement cliquable sans créer un rail parallèle.

# [2026-04-16] Canonical chat surface truth: `src/pages/ChatPage.tsx` n'expose plus une UI chat parallèle, le router déprécié et le préchargement critique sont réalignés sur `TitanePage`, et la surface interactive réelle reste `ConversationSection` via `/titane?tab=conversation`.

# [2026-04-16] Legacy chat export truth: `src/ui/pages/Chat.tsx` ne porte plus sa propre implémentation OMEGA; il agit désormais comme alias fin vers `ChatPage` puis `TitanePage`, ce qui garde les anciens imports compatibles sans réintroduire une surface chat divergente.

# [2026-04-15] Conversation IPC recovery truth: la surface chat canonique conserve maintenant une génération valide même quand `conversation_generate` tombe sur un clamp IPC du `tauriProtector`; `ConversationEngine` tente alors explicitement le fallback orchestrateur au lieu d'exposer directement l'erreur technique `tauri_protector_ipc_fallback`.

# [2026-04-15] TWINS canonical route context: les alias legacy `/identity`, `/identity-center`, `/persona` et `/twin` sont normalisés vers la route publique dédiée `/twins` aussi dans le contexte module-route utilisé par le chat, pour garder la navigation et la mémoire contextuelle alignées avec la surface UI réelle.

# [2026-04-16] Conversation rate-limit provider-flow proof: la lane Playwright riche `tests/e2e/provider-flow.test.ts` sait maintenant injecter le scénario gouverné `RATE_LIMIT` via le mock conversationnel et exige la même vérité runtime `chat-runtime-state[data-provider-reason="RATE_LIMIT"][data-provider-mode="OFFLINE"][data-network-used="true"]` sans faux succès `[MOCK_OK]`.

# [2026-04-16] Conversation rate-limit E2E proof: le harness critique Playwright peut désormais injecter un scénario gouverné `RATE_LIMIT` via le mock conversationnel, et la surface chat doit alors exposer `chat-runtime-state[data-provider-reason="RATE_LIMIT"][data-provider-mode="OFFLINE"]` avec un résumé runtime cohérent au lieu d’un faux succès mock.

# [2026-04-16] Conversation rate-limit truth: les dégradations d’exploration et de fallback conversationnel marquées `RATE_LIMIT` sont désormais exposées comme un blocage gouverné temporaire, pas comme une erreur générique, afin que la surface chat affiche honnêtement une indisponibilité de quota GitHub/Copilot.

# [2026-04-15] Conversation fullscreen flex chain: la surface active `ConversationSection` ne repose plus sur une hauteur fullscreen soustractive sur mobile/zoom; le conteneur plein écran remplit maintenant la hauteur disponible via la chaîne `titane-content--conversation -> titane-section-conversation--fullscreen -> conversation-container`, ce qui garde la zone d'écriture visible dans la fenêtre.

# [2026-04-15] Android browser-mobile conversation: la surface chat fullscreen compacte conserve maintenant un compositeur visible sur mobile via un override de hauteur dedie dans `TitanePage-local.css`; la validation E2E Android continue de passer par les selectors stables `chat-input`, `chat-send` et `chat-message-user`, avec un dispatch DOM natif cote harness pour eviter les faux negatifs de clic synthetique sans changer la surface exposee.

# [2026-04-15] Conversation composer containment: en fullscreen, la zone d'écriture du bas reste maintenant collée et bornée au viewport visible via un compositeur sticky/safe-area-aware; la preuve T17 vérifie explicitement que le bas du compositeur (`composerBottom`) ne sort pas de la fenêtre.

# [2026-04-15] Conversation return-to-bottom CTA: `chat-scroll-to-bottom` est maintenant rendu comme une petite flèche ronde discrète ancrée au bas de la surface chat, sans libellé visible, pour revenir rapidement au dernier message sans alourdir le bas de page.

# [2026-04-15] Conversation view polish: la surface chat regroupe maintenant toolbar, filtres et télémétrie dans un chrome haut cohérent; le panneau runtime passe en layout compact lisible et les bulles utilisateur/assistant gagnent une hiérarchie visuelle plus nette.

# [2026-04-15] Conversation fullscreen immersive: `conversation-container` expose maintenant `data-fullscreen=true|false`; le mode fullscreen applique un chrome plus affirmé sur la toolbar, le panneau runtime, le flux et le compositeur pour que le basculement soit immédiatement visible, même avant l'entrée en densité `compact`.

# [2026-04-15] Réponses longues chat: la surface conversation repasse automatiquement sur le rendu non virtualisé dès qu’un message dépasse la hauteur fixe compatible `react-window`, et les budgets par défaut de génération sont alignés sur le plafond backend utile de 32768 pour éviter les coupures de sortie côté runtime.

# [2026-04-15] Conversation fullscreen: la surface chat compacte automatiquement son chrome quand le zoom réduit la hauteur utile; ajout du raccourci flottant `chat-scroll-to-bottom`, du sélecteur stable `chat-messages-scroll-region`, d’un traitement safe-area renforcé et d’un verrouillage `flex/min-height/overflow` plus strict pour garder le dernier message, le CTA et l’input visibles sur desktop et mobile.

# [2026-04-15] AppShell fullscreen chain: le shell racine verrouille désormais `h-dvh/min-height:0/flex-col` jusqu’au conteneur scroll principal pour éviter qu’un wrapper intermédiaire recrée un gap sous la conversation fullscreen après zoom ou rebuild.

# [2026-04-15] Knowledge Fusion: l’alerte de résultat nul n’apparaît plus dès la simple détection du format; elle n’est rendue qu’après une vraie tentative `parseDocument` renvoyant `null`, via le sélecteur stable `knowledge-null-result-warning`, sans injecter de document nul dans le vault.

# [2026-04-14] L’onglet « Twins » a été supprimé de la barre d’onglets de la page Titane. L’accès à la page Twins est désormais possible uniquement via le menu Plus (\*\*\*) de la TopNav vers la route /twins. Aucun testid «tab-twins» ne doit subsister dans l’UI.

# [2026-04-14] Nettoyage UI chat: suppression complète des surfaces TWINS de la page chat (`conversation-twins-card`, `chat-twins-status`, `chat-twins-meta`, `chat-open-twins`) tout en conservant l’entrée dédiée `nav-twins` dans le menu Plus de la TopNav.

# UI_SURFACE_MAP

## TopNav — Navigation & Global Controls (top-right)

- TopNav zoom controls container test id: `topnav-zoom-controls`
- TopNav zoom-out button test id: `topnav-zoom-out`
- TopNav zoom-in button test id: `topnav-zoom-in`
- TopNav brand container test id: `topnav-brand`
- TopNav more-menu panel test id: `topnav-more-menu`
- TopNav AI status badge test id: `topnav-ai-status` with `data-state=online|offline`
- File: `src/components/layout/TopNav.tsx`
- Critical proof lane: `e2e/critical/engine-navigation.spec.ts` valide `topnav-brand`, `topnav-ai-status` et `topnav-more-menu`
- Zoom range: 50% – 200%, persisted to localStorage key `titane_zoom_level`
- Zoom step truth: TopNav and keyboard shortcuts use the same canonical additive step, so one zoom-in followed by one zoom-out returns exactly to 100%.
- Zoom authority truth: TopNav listens to canonical zoom-change events, so its indicator stays aligned with keyboard, Tauri window controls, and UIReading adjustments instead of keeping a stale local value.
- Keyboard equivalents: Ctrl+- (zoom out), Ctrl++ (zoom in), Ctrl+0 (reset)
- Item menu Plus: `nav-twins` (route `/twins`, accès unique TWINS côté UI)
- TITANE active-route extensions: `nav-titane` reste actif aussi pour `/experience`, `/memory`, `/research`, `/skills`, `/knowledge`, `/creation`, `/evolution`
- DEV active-route extensions: `nav-dev` reste actif aussi pour `/orchestration-center`, `/orchestration-intelligence`, `/singularity`, `/sentinel`, `/watchdog`, `/selfheal`, `/adaptive`
- Engine route page roots: `page-singularity-monitor`, `page-sentinel`, `page-watchdog`, `page-selfheal`, `page-adaptive-engine`
- WDIO engine inventory: `devEngineRoutePages` = `/singularity`, `/sentinel`, `/watchdog`, `/selfheal`, `/adaptive` ; toutes ces surfaces héritent de `nav-dev`
- WDIO engine proof lane: `e2e/desktop/dev-engine-routes.wdio.test.js`

## TWINS Dedicated Surface (`/twins`)

- Page root test id: `page-twins`
- Page root class contract: `twins-root flex min-h-full w-full flex-col`
- Scroll contract: la page `/twins` laisse le défilement vertical au host scrollable canonique de `AppShell`; ne pas réintroduire `overflow: hidden` + `height: 100%` sur `.twins-root`

## Primary Chat Surface (ConversationSection)

- Runtime config fallback truth: the active frontend defaults in `src/main.tsx` and `src/pages/ConfigurationHub.tsx` align on `http://127.0.0.1:11434` + `gemma2:2b`; no active UI fallback should regress to `/api/ollama` or `qwen2.5:latest` when the runtime payload is partial.

- Input textarea test id: `chat-input`
- Send button test id: `chat-send`
- Messages scroll region test id: `chat-messages-scroll-region`
- Scroll-to-bottom button test id: `chat-scroll-to-bottom`
- Scroll-to-bottom visual form: petite flèche ronde discrète, sans texte visible, ancrée en bas à droite de la surface conversation
- Scroll region native scrollbar: la scrollbar droite du flux reste visible en permanence avec piste/thumb contrastées; ne pas la masquer ni la remplacer par un rail séparé.
- Assistant message container test id: `chat-message-assistant`
- Assistant content test id: `chat-message-content`
- Inline assistant citations container test id: `message-citations-{timestamp}`
- Inline assistant citation item test id: `message-citation-{timestamp}-{index}`
- Runtime panel test id: `chat-runtime-state`
- Runtime summary test id: `chat-runtime-summary`
- Conversation top chrome: toolbar, filtres et runtime sont visuellement regroupés dans `conversation-top-chrome`
- Runtime panel visual contract: résumé + manifest alignés dans `conversation-runtime-copy`, badges sur une colonne d’appoint plus compacte
- Ready marker test id: `chat-ready`
- Loading marker test id: `chat-loading`
- Error marker test id: `chat-error`
- Fullscreen visual state: `data-fullscreen=true|false` on `conversation-container`
- Density state: `data-density=comfortable|compact` on `conversation-container`
- Fullscreen visual contract: le mode `data-fullscreen=true` renforce visiblement le shell conversationnel avant même l'éventuel resserrement `compact`
- Fullscreen composer contract: `.conversation-input-container` reste contenu dans le viewport visible et ne doit jamais sortir sous la fenêtre active
- Fullscreen containment contract: la hauteur fullscreen active est pilotée par la chaîne flex du shell conversation, pas par une soustraction fixe spécifique mobile
- Native fullscreen parent-bound contract: `.titane-page--conversation` force `width: 100% !important`, `max-width: 100% !important` et `min-height: 0 !important` pour ne pas réhériter des dimensions `100vw/100vh` quand le runtime Tauri applique un zoom inférieur à 100%.
- Long assistant replies: fixed-height virtualization is bypassed automatically when a message requires natural height rendering; selectors above remain unchanged.
- Long response proof: la combinaison `chat-input` → `chat-send` → `chat-message-assistant`/`chat-message-content` est couverte en E2E mock pour vérifier qu’une réponse longue complète reste visible.
- Legacy route truth: `/chat` reste un alias de navigation mais redirige explicitement vers `/titane?tab=conversation`; sa vérité UI reste `page-titane[data-layout="chat-fullscreen"]` et `page-conversation[data-layout="fullscreen"]`.
- Legacy import truth: `src/ui/pages/Chat.tsx` conserve les exports `Chat` et `default`, mais ils rendent désormais la même surface canonique `page-titane` / `page-conversation`.

## Runtime Telemetry Attributes on Assistant Row

- `data-provider-used`
- `data-network-used`
- `data-provider-reason`
- `data-provider-mode`
- `data-memory-state`
- `data-provider-cache-hit`

## Runtime Telemetry Attributes on Runtime Panel

- `data-provider-used`
- `data-network-used`
- `data-provider-reason`
- `data-orchestrator-state`
- `data-memory-state`

## Fallback/Legacy Surfaces Covered by Tests

- Chat bubble selectors (`chat-bubble-*`)
- Legacy selectors (`#chat-window-textarea`, `#chat-input-textarea`, `.send-button`, `.chat-send-btn.chat-send-omega`)

## Observed Active Surface in latest desktop proof

## Agents avancés — UI Dashboards (v30.1.34)

- **Monitoring Agent** : `monitoring-dashboard`
- **Auto-Diagnostic Agent** : `diagnostic-panel`
- **Explainability Agent** : `explainability-dashboard`
- **Orchestrateur Dynamique Agent** : `orchestrator-dashboard`
- **Agent de Sécurité Active** : `security-dashboard`
- **Agent Anti-Régression canonique** : `self-healing-dashboard` + `anti-regression-summary` via `/admin?tab=anti-regression`
- **Panel canonique** : `agent-dashboards-panel` regroupe les 5 dashboards avancés visibles sur la surface active.
- **Dock compact conversation-safe** : sur la surface chat fullscreen ou un viewport très contraint, `agent-dashboards-panel` passe en `data-mode=compact`, expose `agent-dashboards-panel-toggle` et garde `agent-dashboards-panel-content` replié par défaut pour ne pas recouvrir `chat-input` ni `chat-send`.
- **Affordance de nouveauté** : `agent-dashboards-panel-toggle` publie `data-has-update=true|false` et peut rendre `agent-dashboards-panel-whats-new-badge` ainsi que `agent-dashboards-panel-whats-new-text` jusqu à première ouverture sur la version courante, afin de rendre visibles les dernières modifications UI livrées sur cette surface.
- **Montage canonique** : `agent-dashboards-panel` est monté depuis `src/components/layout/AppShell.tsx`, donc la vérité runtime attendue est sa présence sur la surface applicative active et pas seulement dans des exports dormants.
- **Contrat canonique commun** : chaque dashboard expose `data-readiness` sur sa racine et les selectors enfants `-status`, `-summary`, `-proof-list`, `-blockers`, `-next-step`.
- **Runtime detail truth** : `explainability-dashboard` publie `-inference-chain`, `-inference-report` et `-inference-history`, `orchestrator-dashboard` publie `-live-metrics`, `-provider-snapshots`, `-live-timeline`, `-multi-session-compare` et `-champion-breakdown`, `security-dashboard` publie `-detection-events`, `-containment-events` et `-governed-export`; ces sections doivent rester alimentées par des signaux runtime/configuration réellement présents dans le repo.
- **Diagnostic detail truth** : `diagnostic-panel` publie `-diagnostic-report` et `-diagnostic-history` pour exposer un rapport structurel borné et ses snapshots horodatés sur la surface canonique.
- **Explainability history truth** : `explainability-dashboard` publie aussi `-inference-history` en plus de `-inference-chain` et `-inference-report`, afin d exposer plusieurs traces providerMeta successives au lieu d une seule vue courante.
- **Readiness truth** : `monitoring-dashboard`, `diagnostic-panel`, `explainability-dashboard`, `orchestrator-dashboard` et `security-dashboard` = `partial` tant que leurs services publient déjà des signaux runtime/configuration vérifiables mais qu aucun moteur complet n est encore branché.
- **Chat single-door truth** : la surface conversation active continue d utiliser `conversation_generate` via IPC Tauri, pas un backend HTTP direct. Depuis le correctif 2026-04-16, ce chemin actif enrichit aussi le system prompt avec la connaissance runtime issue de `memory_get_knowledge` et persiste chaque échange réussi dans le Memory Core via `persistent_memory_write_entry`, ce qui réaligne mémoire, base de connaissance et contexte Twins sur la même porte d entrée.

Chaque dashboard doit disposer de selectors stables (`data-testid`) pour E2E, logs et alerting UI.

## DevPage Surface

- Route canonique: `/dev`
- Root shell test id: `page-dev`
- Shell state contract: `data-dev-state=loading|error|ready`
- Runtime truth: la route `/dev` expose désormais son marqueur de surface immédiatement, y compris pendant le préchargement et en état d'erreur, pour éviter que la lane desktop WRY attende des chargements secondaires avant de qualifier la page.

## TOTAL_DEV Git Surface

- Route canonique: `/total-dev` onglet `git`
- Root shell test id: `total-dev-tab-git`
- Action selectors stables: `total-dev-git-status`, `total-dev-git-diff-stat`, `total-dev-git-log`, `total-dev-git-branch`, `total-dev-git-head-sha`
- Read-only truth marker: `total-dev-git-readonly-note`
- Runtime truth: le panneau Git TOTAL_DEV n expose plus d actions d ecriture et documente explicitement une surface d inspection locale seulement. La voie canonique backend `total_dev_git_op` accepte maintenant uniquement les operations read-only qualifiees et leurs arguments exacts.

## Conversation Fullscreen Shell

- Root shell contract: la chaîne fullscreen `AppShell -> titane-page--conversation -> titane-content--conversation -> conversation-container` doit rester parent-bound (`flex/min-height:0/max-height:100%`) et non pilotée par un double offset ou une hauteur viewport forcée.
- AppShell structural selectors: `app-shell-root`, `app-shell-main`, `app-shell-scroll-host`
- Header persistence truth: `titane-page-header--conversation` reste collé en haut du shell fullscreen pour garder l’onglet chat visible quand la hauteur utile se compacte.
- App shell offset truth: la compensation TopNav reste portée uniquement par `paddingTop: calc(4rem + env(safe-area-inset-top, 0px))` dans `AppShell`.
- Parent-bound shell truth: `AppShell` ne contre-echelle plus largeur/hauteur contre `--titane-ui-scale`; le shell racine reste en `h-full/w-full/min-h-0/max-w-full`, et la mise a l echelle canonique passe par `src/hooks/zoomScale.ts` via la taille de police racine et `--titane-ui-scale`.
- Desktop proof helper truth: le helper WDIO `inspectConversationScrollRegion()` borne désormais son overflow artificiel au budget vertical réel entre `.chat-toolbar` et `.conversation-input-container`.

- 2026-04-18 — Online-chat desktop canonical surface truth: la lane WDIO `e2e/desktop/online-chat-proof-ui.wdio.test.js` et son wrapper `scripts/e2e/run-online-chat-proof-ui.sh` n utilisent plus `/chat` comme surface active par défaut pour la preuve conversationnelle. Le harness cible désormais `/titane?tab=conversation`, force explicitement `tab-conversation` quand la page Titane se charge sans l état d onglet attendu, puis qualifie la surface visible via `chat-input`, `chat-send`, `chat-message-assistant`, `chat-runtime-state`, `chat-runtime-summary` et `reasoning-progress` avant tout fallback IPC.
- 2026-04-19 — Chat response budget truth: la surface conversation canonique `/titane?tab=conversation` propage désormais explicitement `maxTokens` et `temperature` au contrat `conversation_generate` depuis `src/services/conversationEngine.ts`, tout en gardant le payload `aiConfig` hérité pour compatibilité. Le backend OMEGA lit aussi ce payload hérité si le frontend vivant ne fournit pas encore les champs de contrat, et le bridge local/Ollama ne retombe plus sur un budget implicite court qui tronquait les réponses longues.
- 2026-04-20 — Voice input cleanup truth: `src/hooks/useVoiceInput.ts` ferme maintenant toujours le `MediaStream` micro local, y compris quand `voiceService.stopRecording()` échoue. La surface hook ne laisse donc plus une capture navigateur ouverte après un échec backend de stop.
- 2026-04-20 — Voice input start cleanup truth: le même hook `src/hooks/useVoiceInput.ts` ferme aussi désormais le `MediaStream` local si `getUserMedia()` réussit mais que `voiceService.startRecording()` échoue ensuite. La voie start n abandonne donc plus un micro navigateur actif sur échec backend tardif.
- 2026-04-20 — Voice input cancel cleanup truth: `src/hooks/useVoiceInput.ts` ferme maintenant aussi le `MediaStream` micro local et remet l état d écoute à plat si `voiceService.cancelRecording()` échoue. La voie cancel reste donc idempotente au lieu de laisser un micro navigateur actif caché.
- 2026-04-24 — DocCenter route-context sync truth: `/doc-center` est maintenant branche au contexte actif par `moduleRouteContext` avec `moduleId=doc_center`, et `/doc` est normalise vers cette surface. L inventaire partage WDIO ajoute `directRoutePages` pour qualifier les routes URL directes sans propriétaire TopNav tout en les gardant dans `canonicalRoutePages`.
- 2026-04-23 — Canonical page seal truth: toutes les routes canoniques montées par `AppRouter` exposent désormais une racine stable qualifiable, directement ou via leur état de chargement, pour `/experience`, `/fusion`, `/optimization`, `/orchestration-intelligence`, `/orchestration-center`, `/reality-center`, `/hyper-center`, `/quantum-center`, `/twins`, `/total-dev`, `/knowledge`, `/creation`, `/evolution`, `/memory`, `/skills`, `/doc-center` en plus des surfaces déjà qualifiées. L’inventaire partagé WDIO expose aussi maintenant ces routes canoniques et leurs groupes d’ownership (`titaneOwnedRoutePages`, `directRoutePages`, `devOwnedRoutePages`, `fusionOwnedRoutePages`, `moreMenuRoutePages`, `canonicalRoutePages`) afin que route, sélecteur racine et item de navigation restent alignés sur une même vérité.
- 2026-04-24 — Canonical desktop proof lane truth: la lane WDIO dédiée `e2e/desktop/canonical-ui-pages.wdio.test.js` a été rejouée après `pnpm run build:tauri:e2e` sur le binaire release frais `src-tauri/target/release/titane-infinity` (`FRESH_RELEASE_BINARY`). Résultat natif: 1 spec passée, 1 test passé, `1 passing (2m 34.2s)`, avec route, root visible et ownership nav vérifiés sur `canonicalRoutePages`.
- 2026-04-24 — Desktop UI driver complete page audit truth: la meme lane WDIO ne s arrete plus a route/root/nav; elle appelle maintenant `auditCanonicalDesktopPage` pour activer strictement les onglets declares et produire `reports/e2e-desktop/canonical-ui-pages-audit.json` comme preuve structuree page par page. Preuve native: `1 passing (2m 48.1s)`, 28 pages, 4 pages tabbees, 22 onglets.

## Session Security Surface

- Surface canonique: `src/security/SessionGuard.ts`.
- Lifecycle truth: `initialize()` nettoie les timeouts precedents (`clearTimeouts()`) avant reconfiguration et reinitialise `warningShown=false` pour eviter une derive d etat de session lors des re-initialisations.
- Test truth: `src/security/__tests__/SessionGuard.spec.ts` qualifie la sequence warning/timeout via timers virtuels, sans dependre d un appel manuel `recordActivity()`.
- Version-sync context truth: le lot de continuation aligne les surfaces de version sur `31.2.0` dans `package.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src-tauri/tauri.conf.json`, `src-tauri/tauri.base.json`, `tauri.base.json`, `runtime/stable/tauri.conf.json` et `runtime/stable/manifest.json`.

# [2026-04-24] Web Vitals Analytics IPC truth

- Surface canonique : analytics web-vitals via IPC sécurisé (One Door)
- Frontend : `src/utils/webVitals.ts` (remplace fetch direct par `secureInvoke('web_vitals_report', ...)`)
- Backend : `src-tauri/src/commands/web_vitals_commands.rs` (commande Tauri `web_vitals_report`)
- Mapping main.rs : commande exposée dans `generate_handler!`
- Preuve : log `data/web_vitals_report.jsonl` (append), artefact runtime, test E2E à venir
- Doctrine : plus de fetch direct, analytics = UI → IPC → backend (preuve runtime, rollback documenté)

# [2025-HTF] Module HTF — L'Humain à tout faire

- Surface canonique: `/htf`
- Composant principal: `src/pages/HTFPage.tsx`
- data-testid principal: `htf-module-page`
- Tabs internes: dashboard | soumission | crm | historique | connaissance
- Composants:
  - `src/components/htf/HTFDashboard.tsx` — `data-testid="htf-dashboard"`
  - `src/components/htf/HTFSubmissionWizard.tsx` — `data-testid="htf-submission-wizard"`
  - `src/components/htf/HTFClientPanel.tsx` — `data-testid="htf-client-panel"`
  - `src/components/htf/HTFEstimationResult.tsx` — `data-testid="htf-estimation-result"`
- Services: `src/services/htf/` (htfKnowledgeService, htfEstimationService, htfCrmService, htfSubmissionService, htfLearningService, htfSkillDefinition, installHtfSkill)
- Store Zustand: `src/stores/useHTFStore.ts`
- Chat mode: `htf_soumission` (ajouté dans `src/services/ai/chatModes.config.ts`)
- KB JSON (data/knowledge_base/default/): htf_module_identity, htf_formation_manuel, htf_estimation_rules, htf_services_catalogue, htf_soumission_template
- KB Rust: `src-tauri/src/knowledge_base_default.rs` — 5 consts HTF + 5 entrées SOURCES
- Skill OS: `titane-skill-htf-estimateur` (category: custom, state: ACTIVE)
- Persistance: localStorage (`titane_htf_clients`, `titane_htf_submissions`, `titane_htf_learning`) — zéro IPC Rust
- Tests: `tests/unit/htf/htfEstimationService.test.ts` (5 tests), `tests/unit/htf/htfCrmService.test.ts` (9 tests), `e2e/htf.spec.ts` (7 scénarios)
- Qualification web baseline conversation: `tests/e2e/chat.spec.ts` verrouille désormais sur la lane Playwright web générique l absence de `select-conversation-mode`, la valeur initiale `default` de `chat-mode-selector-select`, ainsi que `data-conversation-mode=default` et `data-chat-store-mode=default` directement sur `page-conversation` avant toute interaction enrichie.
- Garde unitaire canonique conversation: `src/__tests__/e2e-automated-validation.test.tsx` monte désormais `TitanePage` sous `MemoryRouter`, verrouille l absence de `select-conversation-mode`, la valeur initiale `default` de `chat-mode-selector-select` et les attributs `data-conversation-mode=default` / `data-chat-store-mode=default` sur `page-conversation` dans la preuve unitaire de surface active.
- Qualification web intent document: `tests/e2e/chat.spec.ts` verrouille désormais dans le scénario ModeBuilder document la même baseline modernisée de `page-conversation` avant le routage d intention, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification web intent code bloqué: `tests/e2e/chat.spec.ts` verrouille désormais dans le scénario de blocage code-intent la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`, puis preuve que `ModeBuilder` ne s ouvre pas.
- Qualification critique new conversation: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario mock d entrée la baseline modernisée de `page-conversation` avant le premier envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique send-message: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario mock à deux messages la même baseline modernisée de `page-conversation` avant le premier envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique réponse longue: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario mock de réponse longue la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique markdown assistant: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario de rendu markdown assistant la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique markdown tableaux et citations: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario de rendu markdown tableaux/citations la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique bloc terminal atteignable: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario de réponse longue avec bloc terminal atteignable la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique ultra-long sans troncature: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario ultra-long sans troncature la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique persistance SPA: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario de persistance d URL en SPA la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique rate-limit runtime: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario de vérité runtime RATE_LIMIT la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique mémoire et connaissance: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario de vérité runtime mémoire/connaissance la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
- Qualification critique synchronisation XP: `e2e/critical/chat-interaction.spec.ts` verrouille désormais dans le scénario de synchronisation XP chat -> Experience la même baseline modernisée de `page-conversation` avant l envoi, avec absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `data-conversation-mode=default` / `data-chat-store-mode=default`.
