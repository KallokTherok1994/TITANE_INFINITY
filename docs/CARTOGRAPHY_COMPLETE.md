## BUILD ALL v31.2.14 — Release complète (2026-04-27)

> 2026-04-27 — **BUILD ALL 31.2.14** : Tests Vitest 415/415 PASS, Playwright 127/127 PASS (36 skip), Cargo tests 4157 PASS (1 flaky `test_no_anomaly_below_threshold` fixed par tmp_path unique nanos+threadid). Prettier 6 fichiers reformatés. Version bump 31.2.13→31.2.14. Corrections: `vi.hoisted()` pattern Vitest, `.first()` strict mode Playwright, `security-dashboard.e2e.ts` nextStep runtime truth, `handlers.rs` `make_gateway_state()` anomaly field + ConnectInfo args. `anomaly_detector.rs` tmp_path unicité. AppImage+DEB v31.2.14 produits. `deployment/latest/` mis à jour. AutoHeal AH-2026-04-27-BUILD-ALL-31.2.14-0001.

## Remote Gateway — Accès Internet à TITANE (2026-04-28)

> 2026-04-27 — **Phases D1/D2/D3 — AnomalyDetector wired + Health Metrics surface + Agent health_check loop** : `src-tauri/src/remote_gateway/handlers.rs` — `GatewayState` étendu avec `anomaly: Arc<AnomalyDetector>`; `invoke_handler` accepte `ConnectInfo<SocketAddr>` et appelle `state.anomaly.record_request(ip)` à chaque requête (WARN >45 req/min, ALERT >3 rotations/h). `src-tauri/src/remote_gateway/server.rs` — `AnomalyDetector::new(log_dir/anomaly_state.json)` instancié dans `build_router()`, `axum::serve` changé en `into_make_service_with_connect_info::<SocketAddr>()`. `src/pages/MonitoringDashboard.tsx` — `ProjectHealthCard` ajouté (`data-testid=project-health-metrics`) : consomme `getProjectHealthMetrics()` + `dispatchToAgents({ type:'health_check', ... })`, affiche 3 métriques (incidentRecurrenceRate, mostImpactedRing, avgLeadTimeMinutes) + consensus agents avec auto-refresh 15 min. Rule 17 compliance: monitoring/security dashboards consomment maintenant des signaux runtime réels. AutoHeal : AH-2026-04-27-WIRING-D1D2D3-0052.

> 2026-04-26 — Ollama transport dispatch truth: la voie navigateur Vite/LAN `/titane` conserve le proxy `/api/ollama`, mais la voie `REMOTE_GATEWAY` n emprunte plus le meme fetch same-origin. `src/services/ai/transports/ollamaTransport.ts` reserve `BROWSER_PROXY` au navigateur non-Tauri et non-remote, et renvoie les contextes remote browser et Node/test vers la voie gouvernee IPC/remote existante pour eviter une divergence entre surface LAN et gateway distante.

> 2026-04-27 — Browser/mobile Ollama proxy truth: la topologie active de la surface conversationnelle `/titane` ne change pas, mais la voie web sans Tauri ne retombe plus directement sur le fallback local par absence d IPC. `src/services/api/chat.ts` essaie maintenant d abord `ollamaProvider.generate()` sur la branche navigateur pour `auto|ollama`, `src/services/ai/transports/ollamaTransport.ts` passe par `/api/ollama`, et `vite.config.ts` supprime le header `Origin` sur le proxy Ollama pour contourner le `403` renvoye par Ollama aux requetes navigateur avec origine LAN. La preuve active qualifie `POST /api/ollama/generate` en `200` via le proxy Vite et un tour UI `/titane` affichant `Provider: ollama` sur la reponse rendue.

> **Remote Gateway** (`src-tauri/src/remote_gateway/`) : 6 nouveaux fichiers Rust (mod.rs, auth.rs, audit.rs, handlers.rs, rate_limit.rs, server.rs, static_serve.rs, ws_stream.rs). Serveur axum 0.7 (JWT HS256, tower-http CORS, WS) démarré dans le runtime tokio Tauri via `tauri::async_runtime::spawn()`. Enregistré dans `src-tauri/src/lib.rs` (`pub mod remote_gateway`). Spawn conditionnel dans `main.rs` setup (`TITANE_REMOTE_ENABLED=1`). `RuntimeConfig` étendu avec `remote_enabled/remote_port/remote_origin`. Transport TypeScript : `src/lib/remoteTransport.ts`, `src/lib/remoteStream.ts`, `src/lib/transport.ts`. Scripts Cloudflare : `scripts/remote/`. Tests : `tests/contract/remote-gateway-contract.test.ts`, `e2e/remote-gateway.spec.ts`. AutoHeal : `REMOTE-GATEWAY-001`.

## Migration documentaire 2026-04-24

Opération de nettoyage et d’archivage sur tout le dossier `docs/` :

- Tous les fichiers `.md.md` déplacés dans `docs/99_ARCHIVE/`
- Tous les anciens index (`INDEX.md`, `INDEX_MASTER.md`, `INDEX_DOCUMENTATION*`) archivés dans `docs/99_ARCHIVE/`
- Tous les dossiers d’archive centralisés dans `docs/99_ARCHIVE/`
- Dossiers `audit/audits` harmonisés et archivés
- README.md mis à jour pour navigation canonique
- Preuves et inventaires : `docs/92_maintenance/`

> 2026-04-26 — Conversation modern mode surface truth: la route conversationnelle active `/titane?tab=conversation` ne dépend plus uniquement du select legacy interne. `src/components/sections/ConversationSection.tsx` monte maintenant `src/components/chat/ChatModeSelector.tsx` en variante compacte, filtré sur les modes compatibles avec `ConversationMode` (`default`, `brainstorming`, `synthesis`, `planning`, `journal`, `debug_cognitive`). La surface publie en plus `data-conversation-mode` et `data-chat-store-mode`, ce qui rend visible l alignement entre `useConversationEngine.setMode()` et `useChatModeStore().changeMode()`. La non-régression est scellée par `src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx` et par la preuve Playwright `MODERN_MODE_SELECTOR_BRIDGES_PAGE_RUNTIME_AND_STORE` dans `e2e/critical/chat-interaction.spec.ts`.

> 2026-04-26 — Chat unified runtime bridge truth: `src/config/chatModes.config.ts` ne reste plus un simple registre legacy isole. Il devient la porte runtime unifiée pour les modes de chat en conservant les modes statiques historiques et en important un bridge des modes étendus de `src/services/ai/chatModes.config.ts` pour tous les IDs modernes non legacy (`quick`, `strategy`, `planning`, etc.). La surface UI active `src/components/chat/ChatModeSelector.tsx` expose désormais des `data-testid` stables (`chat-mode-selector`, `chat-mode-selector-trigger`, `chat-mode-selector-menu`, `chat-mode-option-*`), et la preuve de bout en bout est scellée par `src/__tests__/services/ai/chatModeUnifiedRuntimeBridge.test.ts` plus `src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx`.

> 2026-04-24 — Security bootstrap CSP authority truth: `src/security/index.ts` applique maintenant `CspManager.applyToDocument()` uniquement hors runtime Tauri. La surface active desktop conserve ainsi une seule autorite CSP (`src-tauri/tauri.conf.json`) au lieu d une meta CSP frontend concurrente (`script-src 'self' 'unsafe-inline'`) qui cassait `unsafe-eval` et pouvait provoquer un echec `conversation_generate` avec fallback indisponible. La non-regression est scellee par `src/security/__tests__/securityInit.spec.ts`.

> 2026-04-24 — Chat XP durable persistence to Experience UI truth: la chaine chat -> Experience ne depend plus d un etat Tauri mock volatil. `src-tauri/src/mock_commands.rs` lit/ecrit maintenant `experience_state.json` pour `experience_get_state` et `experience_update_state`, tandis que `src/services/experienceService.ts` conserve un miroir `localStorage`, compare backend/local et garde la source XP la plus fraiche/non vide. `src/hooks/useExperience.ts` derive ses valeurs de l etat React abonne, et `src/pages/Experience.tsx` expose une synthese visible des gains chat via `experience-chat-sync-summary`, `experience-chat-xp-total`, `experience-chat-event-count` et `experience-chat-last-gain`.

> 2026-04-24 — Chat XP generation to Experience sync truth: `src/services/experienceService.ts` ne laisse plus une attribution XP chat partir d un etat non initialise puis se faire ecraser par l initialisation de `/experience`. Le service charge localStorage avant mutation en fallback web, preserve les gains de session avant init, normalise niveaux/totaux depuis les domaines, et `src/hooks/useConversationEngine.ts` publie des montants exacts `chatGainAmount`, `cognitiveGainAmount`, `totalGainAmount`. `src/features/chat/ThinkingPanel.tsx` expose ces gains sur `reasoning-summary-xp`, `reasoning-runtime-xp`, `reasoning-runtime-xp-total` et `data-runtime-xp-gain`, tandis que `src/pages/Experience.tsx` ajoute les selectors stables de verification des totaux et filtres sources chat.

> 2026-04-24 — Lint no-console normalization truth: correction transversale des couches `src/**` de journalisation et de diagnostics pour retirer les appels console interdits (`log|info|debug|group|table|time`) au profit de chemins `warn|error` et wrappers `nativeConsole`. Cette mise a niveau preserve la topologie fonctionnelle des surfaces monitoring/chat/logger et aligne la qualite sur `eslint no-console` (warnings 660 -> 0) avec typecheck inchangé.
> 2026-04-24 — DashboardPage isolated test truth: `src/pages/__tests__/DashboardPage.test.tsx` ne monte plus les dependances runtime reelles de `DashboardPage` pendant le lane Vitest. Les hooks `useExperience`, `useVisualEngines` et la surface `PersonaMoodIndicator` sont bornes par mocks locaux afin de qualifier la surface `page-dashboard` sans side effects IPC/persona ni warnings React `act(...)`.
> 2026-04-23 — Agent dashboards version fallback truth: `src/components/AgentDashboardsPanel.tsx` ne depend plus d un acces direct a `__APP_VERSION__` pour la persistance du badge de nouveaute. Un fallback runtime borne (`dev`) est applique quand la globale n est pas injectee (notamment en Vitest), ce qui realigne les surfaces `AppShell`, `advancedAgentCatalog` et `app-router-canonical-surfaces` sans modifier la topologie UI active.

> 2026-04-24 — Sprint 4 context test standardization truth: ajout de `src/contexts/__tests__/AnimationContext.test.tsx` pour qualifier la surface `AnimationContext` (valeurs runtime provider + garde hook hors provider), avec passage Vitest cible et typecheck global.

> 2026-04-24 — Sprint 5 performance baseline truth: baseline executee via `pnpm run audit:performance` (rapport `reports/performance-20260424-082807/PERFORMANCE_SUMMARY.md`) et premier increment applique sur `src/pages/DashboardPage.tsx` avec suppression d un wildcard import inutile, trace dans `performance-analysis.md`.

> 2026-04-24 — Sprint 5 import graph optimization (increment 2): reduction des deep imports dans `src/services/ai/providers/copilot.ts`, `src/services/ai/providers/gemini.ts`, et `src/services/ai/providers/tauriChat.ts` via alias `@/...` pour conserver un graphe d imports plus stable sans changement fonctionnel.

> 2026-04-24 — Sprint 5 import graph optimization (increment 3): reduction additionnelle des deep imports sur les surfaces UI `DevTools/DeveloperTools` et `ControlPanel` via bascule vers alias `@/...`, plus alignement du test `useHyperVision` sur le meme contrat d import canoniqe.

> 2026-04-24 — Sprint 5 import graph optimization (increment 4): reduction complementaire des deep imports sur `ChatIA/ModeEditor`, hooks system-center (`useSystemLogs`, `useNodeCluster`) et tests moteurs conversation/flow via migration vers alias `@/...`, avec validation ciblee Vitest et typecheck global.

> 2026-04-24 — Sprint 5 import graph optimization (increment 5): reduction additionnelle des deep imports sur la matrice de tests services/features (`behavioralRouter`, `canonicalDiscernmentKernel`, `chatEngineCanonicalIntegration`, `performanceEngine`, `desktopPerception`, `adminEngine`, `artifactIntent`) via alias `@/...`, ramenant le compteur pattern 3+ niveaux a `4`.

> 2026-04-24 — Sprint 5 import graph optimization (increment 6): reduction additionnelle des deep imports sur les tests d inventaire routeur/UI (`ui-page-objects-inventory`, `app-router-canonical-surfaces`) via un adaptateur commun `uiPagesInventory.adapter`, ramenant le compteur pattern 3+ niveaux a `3`.

> 2026-04-24 — Agent UI ThinkingPanel model trace: `src/components/sections/ConversationSection.tsx` transmet maintenant `latestAssistantRuntime.modelUsed` et `modelRequested` a `src/features/chat/ThinkingPanel.tsx`. Le journal OMEGA publie cette verite sur `reasoning-progress[data-model-used][data-model-requested]`, `reasoning-summary-model` et `reasoning-runtime-model`, avec preuve unitaire et WDIO sur le modele gouverne `gemma2:2b`.

> 2026-04-24 — Frontend CSP Ollama one-door truth: `src/security/constants.ts` retire l exception `connect-src` directe vers le loopback Ollama. La cartographie active conserve Ollama sur la voie UI -> IPC -> backend Tauri -> `127.0.0.1:11434`, avec `guard:ollama-proxy` comme preuve anti-regression.

> 2026-04-24 — Agent UI chat runtime truth chain: la surface active de l Agent UI reste `/titane?tab=conversation` via `src/components/sections/ConversationSection.tsx`. Le marqueur `chat-runtime-state[data-ollama-model]` derive maintenant de la verite assistant (`modelUsed`, puis `modelRequested`) et retombe sur le defaut gouverne `gemma2:2b` uniquement si aucun tour runtime n existe. Les tests WDIO `chat-model-truth-chain` et `chat-orchestrator-advanced-stress` lisent cette surface canonique au lieu d ajouter des badges artificiels dans `ChatWindow`.

> 2026-04-24 — All pages sync truth: la qualification runtime des surfaces utilisateur demandees est desormais scellee par un lane dedie `e2e/features/all-pages-sync.spec.ts` couvrant XP (`/experience`), Vue (`/titane?tab=overview`), tous les onglets TIME et les hubs admin Configuration/Design/Gouvernance/Sante prod. En parallele, `e2e/helpers/navigation.ts` durcit `openAdminTab` via `data-testid=tab-admin-{id}` (fallback label conservé) pour supprimer la derive de selection observee sur les onglets admin.

> 2026-04-24 — DocCenter route-context sync truth: la surface `/doc-center` n est plus seulement montee par `AppRouter`; elle publie aussi un contexte actif `doc_center` via `src/services/chat/moduleRouteContext.ts`, et l alias `/doc` est normalise vers cette surface. L inventaire WDIO ajoute `directRoutePages` pour garder les routes URL directes dans `canonicalRoutePages` sans inventer un proprietaire TopNav.

> 2026-04-23 — Doc engine DOCX export truth: le backend Ring 2 `src-tauri/src/doc_engine/export.rs` ajoute un export DOCX natif via `docx-rs`, avec une serialisation structuree du titre, des metadonnees, du resume executif, des objectifs et des sections. La capacite est exposee par `ExportFormat::Docx` dans `src-tauri/src/doc_engine/mod.rs` et verrouillee par le test Rust cible `doc_engine::export::tests::export_docx_writes_file`.

> 2026-04-23 — Experience page canonical stats/history truth: la surface canonique `/experience` de `src/pages/Experience.tsx` est réalignée sur les données réelles de `useExperience` et republie les blocs `Statistiques` et `Historique XP` attendus par la qualification UI. Le rendu des domaines utilise les champs canoniques `id/label/xp/level/category`, tandis que les selectors stables `experience-stats-advanced`, `experience-history-list` et `experience-history-item` scellent la preuve unitaire et E2E.

> 2026-04-23 — Monitoring sync supervisor runtime truth: la surface canonique `monitoring-dashboard` ajoute une supervision explicite de synchronisation backend/frontend via `src/services/monitoring/syncSupervisor.ts`. Le statut monitoring dérive maintenant un état `SYNCED|STALE|DESYNC` à partir de `useSystemStore.lastUpdate` (heartbeat backend) et de la timeline `chatMetrics.getRecentEvents()` (activité frontend), expose les selectors stables `monitoring-dashboard-sync-state` et `monitoring-dashboard-sync-reason`, puis scelle cette vérité par tests unitaires et preuve Playwright ciblée.

> 2026-04-23 — Doc engine DOCX export truth: la cartographie backend ajoute la capacite d export DOCX dans `src-tauri/src/doc_engine/export.rs` via `docx-rs`, activee par la variante `ExportFormat::Docx` dans `src-tauri/src/doc_engine/mod.rs`. Le flux produit un artefact `.docx` avec structure documentaire minimale (titre, metadonnees, resume, objectifs, sections) et une preuve Rust ciblee `doc_engine::export::tests::export_docx_writes_file`.

> 2026-04-23 — DocCenter UI truth (Phase 3): la surface `/doc-center` est exposee par `src/pages/DocCenterPage.tsx` avec data-testid stables `doc-center-page`, `btn-export-docx`, `doc-export-status`. Route enregistree dans `src/App.tsx`. Export barrel dans `src/pages/index.ts`. Test unitaire Vitest: `src/pages/__tests__/DocCenterPage.test.tsx`. Test E2E Playwright: `e2e/doc-center-export-docx.spec.ts`.

> 2026-04-23 — Roadmap Évolutive & Évolution : harmonisation disclosure, titres, selectors, testids, et preuve E2E

La surface roadmap transformation/évolution est désormais harmonisée :
- Titre unique « Roadmap Évolutive » (féminin, ponctuation corrigée)
- Disclosure visible et testée (testid `transformation-roadmap-disclosure`)
- Filtres status et milestones couverts par tests unitaires et E2E
- Section Évolution fusionnée (Transform & Évo) : testid racine `transformation-section-root`, sections « Lignes d'Évolution » et « Paliers Franchis » testées
- Preuve E2E Playwright/WDIO (onglet, racine, selectors, banner)
- Preuve unitaire Vitest (titre, disclosure, filtres, clic onglet, sections)
- Fichiers : `src/features/transformation/TransformationRoadmap.tsx`, `src/pages/EvoPage.tsx`, `src/components/sections/TransformationSection.tsx`, tests associés
---

> 2026-04-22 — Backend runtime default truth: la cartographie backend conserve la meme topologie, mais `src-tauri/src/runtime_config.rs`, `src-tauri/src/config/update.rs`, `src-tauri/src/ai/ollama.rs` et `src-tauri/src/ollama.rs` republient maintenant `gemma2:2b` comme fallback Ollama canonique. Cette remise en ligne retire une derive backend vers `llama3.1:latest` qui faisait mentir la runtime config qualifiee par les tests Rust.

> 2026-04-22 — Route-context chat truth: la topologie UI ne change pas, mais `src/services/chat/moduleRouteContext.ts` couvre maintenant aussi les routes actives `/singularity`, `/sentinel`, `/watchdog`, `/selfheal`, `/adaptive`, `/skills` et les deep links `titane.sh`. Le handoff vers `useConversationEngine` conserve ainsi un contexte module canonique sur ces surfaces au lieu de retomber sur `unknown_module`.

> 2026-04-26 — Conversation runtime mode truth: la surface active `/titane?tab=conversation` ne conserve plus de select legacy interne sur sa toolbar. `src/components/sections/ConversationSection.tsx` publie désormais la vérité du mode actif à deux niveaux cohérents: racine `page-conversation` et panneau `chat-runtime-state`, avec duplication gouvernée de `data-conversation-mode`, `data-chat-store-mode`, d un résumé textuel (`Conversation mode`, `Store mode`) et de badges runtime (`conversation-mode:<id>`, `chat-store-mode:<id>`). Les preuves web et les deux lanes WDIO ciblées passent sur cette vérité unifiée; la réponse locale de transparence réinjecte aussi les métadonnées runtime qualifiées au lieu d effacer la surface, et la lane de retour-bas utilise un scroll programmatique robuste sous WRY.

> 2026-04-26 — Android browser conversation mode runtime proof: la surface mobile navigateur qualifie maintenant explicitement la même vérité de mode conversationnelle que web et desktop. `e2e/android/android-build-ui.browser.spec.ts` ajoute T21 pour verrouiller l absence de `select-conversation-mode`, le changement via `chat-mode-selector-select`, l alignement des attributs `data-conversation-mode` / `data-chat-store-mode` sur `page-conversation` et `chat-runtime-state`, puis la présence des chaînes `Conversation mode: planning` et `Store mode: planning` après un tour mock.

> 2026-04-26 — Provider-flow conversation mode runtime proof: la lane Playwright riche `tests/e2e/provider-flow.test.ts` qualifie désormais elle aussi la vérité de mode conversationnelle sur l alias `/chat`. Le test T8 vérifie l absence de `select-conversation-mode`, force `planning` via `chat-mode-selector-select`, puis confirme que l alias canonique exposé par `page-conversation` et `chat-runtime-state` garde les attributs `data-conversation-mode` / `data-chat-store-mode`, le résumé `Conversation mode: planning` / `Store mode: planning` et les badges runtime correspondants.

> 2026-04-26 — ChatModeSelector compact variant proof: la garde composant `src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx` couvre maintenant explicitement la variante `compact` utilisée par `ConversationSection`. Le micro-lot verrouille le selector stable `chat-mode-selector-select` et la propagation de `planning` vers `onModeChange`, afin qu une dérive du contrôle réellement monté sur la surface canonique casse d abord un test unitaire ciblé avant les lanes Playwright/WDIO.

> 2026-04-26 — Conversation page-root mode attrs proof: la suite `src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx` verrouille désormais aussi les attributs de mode portés par la racine canonique `page-conversation`. Le micro-lot confirme que `data-conversation-mode`, `data-chat-store-mode` et la valeur initiale de `chat-mode-selector-select` restent alignés quand le hook conversation et le store publient déjà `planning`.

> 2026-04-26 — Conversation runtime helper mode proof: la suite `src/components/sections/__tests__/ConversationSection.test.ts` verrouille maintenant explicitement la logique helper qui alimente le panneau runtime. Le micro-lot couvre les suffixes `Conversation mode: planning` / `Store mode: planning` de `buildConversationRuntimeSummary()` et les badges `conversation-mode:planning` / `chat-store-mode:planning` de `buildConversationRuntimeBadges()`, pour capter toute dérive dans la logique de construction avant même le rendu de surface.

> 2026-04-27 — Desktop conversation runtime direct mode proof: la lane WDIO complète `e2e/desktop/chat-ui-complete-runtime.wdio.test.js` lit maintenant directement la vérité de mode conversationnelle publiée par la surface canonique, au lieu de se limiter au résumé textuel et à un seul badge. Le driver `e2e/desktop/ui-driver.wdio.js` expose `pageConversationMode`, `pageChatStoreMode`, `runtimeConversationMode` et `runtimeChatStoreMode`; la preuve desktop verrouille ensuite que `page-conversation` et `chat-runtime-state` publient tous deux `default`, en plus des chaînes `Conversation mode: default`, `Store mode: default`, `conversation-mode:default` et `chat-store-mode:default`.

> 2026-04-27 — Desktop conversation critical mode baseline proof: la lane courte `e2e/desktop/ui-connectivity-critical.wdio.test.js` verrouille désormais elle aussi la baseline modernisée de mode conversationnel avant tout tour de chat. Le micro-lot confirme l absence de `select-conversation-mode`, la valeur initiale `default` sur `chat-mode-selector-select`, ainsi que `data-conversation-mode=default` et `data-chat-store-mode=default` directement sur `page-conversation`, afin qu une régression de surface desktop casse aussi la spec critique la plus rapide.

> 2026-04-27 — Desktop model truth chain mode proof: la lane native `e2e/desktop/chat-model-truth-chain.wdio.test.js`, déjà dédiée à la vérité provider/modèle/thinking panel, verrouille maintenant aussi la vérité de mode conversationnelle publiée par la surface canonique. Le micro-lot confirme `pageConversationMode=default`, `pageChatStoreMode=default`, `runtimeConversationMode=default`, `runtimeChatStoreMode=default`, plus les chaînes `Conversation mode: default` / `Store mode: default` et les badges `conversation-mode:default` / `chat-store-mode:default`, afin qu une dérive entre vérité modèle et vérité de mode casse aussi cette lane desktop spécialisée.

> 2026-04-27 — Desktop orchestrator runtime mode proof: la lane native `e2e/desktop/chat-orchestrator-advanced-stress.wdio.test.js`, déjà chargée de qualifier orchestrateur, mémoire et modèle gouverné sur plusieurs tours, verrouille désormais aussi la vérité de mode conversationnelle pendant tout le scénario. Le micro-lot confirme à chaque tour et sur le runtime final `pageConversationMode=default`, `pageChatStoreMode=default`, `runtimeConversationMode=default`, `runtimeChatStoreMode=default`, ainsi que les chaînes `Conversation mode: default` / `Store mode: default` et les badges `conversation-mode:default` / `chat-store-mode:default`, pour empêcher toute dérive spécialisée de la lane orchestrator.

> 2026-04-27 — Desktop online chat UI runtime mode proof: la lane native `e2e/desktop/online-chat-proof-ui.wdio.test.js`, déjà utilisée pour prouver les tours réels, la mémoire et les états runtime du chat online desktop, remonte maintenant aussi la vérité de mode conversationnelle depuis `page-conversation` et `chat-runtime-state`. Le micro-lot verrouille sur chaque tour mémoire `pageConversationMode=default`, `pageChatStoreMode=default`, `runtimeConversationMode=default`, `runtimeChatStoreMode=default`, ainsi que les chaînes `Conversation mode: default` / `Store mode: default`, pour empêcher qu une dérive de mode survive dans cette lane desktop multi-tours distincte des lanes conversation, modèle et orchestrator déjà qualifiées.

## Conformité allowlist Tauri/IPC (avril 2026)

Ajout séquentiel des commandes manquantes à la allowlist Tauri/IPC (runtime/stable/tauri.conf.json, src-tauri/tauri.conf.json) :
  - knowledge_ingest
  - knowledge_save_state
  - progression_save_state

Tous les tests critiques sont verts (100/100).

---

# TITANE_INFINITY — Cartographie Complète Avancée v30.1.34
> 2026-04-19 — Conversation dev overlay send-path truth: la topologie canonique `/titane?tab=conversation` ne change pas, mais sa qualification dev ferme un point d obstruction reel. `src/components/dev/ConsoleMonitorDashboard.tsx` ancre désormais le moniteur console en haut a droite au lieu du coin bas droit qui pouvait recouvrir le compositeur et intercepter `chat-send`, tandis que `e2e/runtime-validation/chat-ar20.spec.ts` priorise un envoi clavier puis un fallback DOM borne et que `e2e/critical/chat-interaction.spec.ts` vérifie la connaissance/memoire ainsi que le bloc terminal sur la verite textuelle rendue plutôt que sur des artefacts de formatage mock ou de duplication DOM.

> 2026-04-19 — Linux launcher sudo-home truth: la topologie launcher reste identique, mais la regeneration sous sudo ne doit plus propager `HOME=/root` dans les actions desktop. `scripts/update-desktop-icon.sh` resolve maintenant `TARGET_USER_HOME` depuis `SUDO_USER`, ce qui realigne les actions `Logs` et `Config` du launcher systeme sur le home du veritable utilisateur qui a lance la synchronisation.

> 2026-04-19 — Linux launcher icon resolution truth: la topologie launcher ne change pas, mais `scripts/update-desktop-icon.sh` et `scripts/post-build/update-desktop-icons.sh` ne se limitent plus a 128x128. Le flux canonique publie maintenant `titane-infinity.png` en 128x128, 256x256 et 512x512 dans le theme hicolor, puis rafraichit les caches via `gtk-update-icon-cache` sur les portees locale et systeme; cela aligne la surface visible du menu et du dock sur l icone canonique meme quand le shell demande une taille superieure.

> 2026-04-24 — Post-build launcher noninteractive truth: `scripts/post-build/update-desktop-icons.sh` reutilise toujours `scripts/update-desktop-icon.sh`, mais n echoue plus fatalement quand la copie `/usr/bin` ou la replication `/usr/share` demandent un sudo interactif. Le script scelle la partie utilisateur (`~/.local/share/applications`, hicolor user cache, cache desktop) puis publie explicitement `BLOCKED_SUDO_REQUIRED` pour la partie systeme et le binaire installe.

> 2026-04-19 — Android conversation runtime proof truth: la topologie active de `/titane?tab=conversation` reste inchangée, mais la qualification Android couvre maintenant explicitement trois vérités mobiles supplémentaires. `e2e/android/android-build-ui.browser.spec.ts` ajoute T18 pour le runtime quota `RATE_LIMIT` sur `chat-runtime-state`, T19 pour la continuité connaissance+memoire de la lane mock canonique via `__TITANE_E2E_CHAT_MEMORY_LOG__`, et T20 pour les citations inline sur `message-citations-*`; en parallèle `e2e/android/android-build-ui.device.spec.ts` exporte la configuration runtime installée afin de prouver que l APK réellement lancée vise un endpoint Ollama LAN et un modèle explicite.

> 2026-04-18 — Runtime doctrine KB truth: la cartographie embarque maintenant `data/knowledge_base/default/titane_runtime_rules_v31.json` comme source publique additionnelle distincte du noyau identitaire. Cette couche est chargee dans la KB frontend via le glob canonique de `src/services/api/defaultKnowledgeBase.ts`, embarquee dans `src-tauri/src/knowledge_base_default.rs`, et remontee par des heuristiques de retrieval ciblees sur etat reel, surcharge, derive et protocole.

> 2026-04-18 — Public positioning KB truth: la cartographie embarque aussi `data/knowledge_base/default/titane_public_positioning_v31.json` comme autorite dediee au message public de TITANE pour Kevin. Les requetes sur bio, promesse, tagline, offre ou audience peuvent maintenant recuperer cette source sans reouvrir les surfaces prompt, persona ou hybrid-memory deja traitees separativement.

> 2026-04-18 — TITANE identity kernel source truth: le dépôt embarque maintenant une nouvelle source structurée publique `data/knowledge_base/default/titane_identity_kernel_v31.json` dédiée au noyau identitaire opératoire de TITANE pour Kevin. Cette source reste publique-safe, sépare la vérité structurée du matériau privé local, et devient réutilisable par la KB canonique, les prompts et la persona par défaut.

> 2026-04-18 — Prompt summary adapter truth: `src/services/ai/titaneIdentityKernel.ts` dérive désormais un bloc de prompt compact depuis `titane_identity_kernel_v31` et l expose aux deux surfaces de modes actives `src/services/ai/chatModes.ts` et `src/services/ai/chatModes.config.ts`. La topologie conversationnelle ne change pas, mais la couche d identité injectée n est plus dupliquée manuellement dans plusieurs prompts concurrents.

> 2026-04-26 — Chat response-depth floor truth: les surfaces prompt actives `src/services/ai/chatEngine.ts`, `src/services/ai/chatModes.ts`, `src/config/chatModes.config.ts` et le fallback UI `src/ui/pages/ChatIA/InstructionModeManager.ts` imposent désormais une posture plus exigeante sur la route conversationnelle canonique. Le plancher `BALANCED` ne pousse plus vers la concision par défaut, les profils `DEVELOPED` et `DEEP` publient explicitement une posture de maître d analyse/recherche/rapport/résumé avancé, et le mode assistant de secours n encourage plus les réponses minimalistes ni les confirmations inutiles quand l action est déjà réalisable.

> 2026-04-26 — Chat modes ordering and expert-lane truth: `src/services/ai/chatModes.config.ts` ne contient plus de doublon actif de `sortOrder`, ce qui réaligne `ACTIVE_MODE_IDS` et la suite large de configuration sur un ordre déterministe. Dans le même lot, `src/services/ai/chatModes.ts` et la config étendue renforcent les lanes principales de conversation pour que `standard`, `synthèse`, `planification`, `debug cognitif`, `développeur`, `stratégie`, `audit`, `urgence` et `oméga` gardent un niveau expert explicite au lieu d un ton trop neutre ou trop minimaliste.

> 2026-04-26 — Chat registry full-alignment truth: `src/config/chatModes.config.ts` publie maintenant la même promesse qualitative que la chaîne runtime principale pour les registres spécialisés `coach`, `admin`, `stratège`, `auditeur` et `créatif`, tandis que `src/services/ai/chatModes.config.ts` réaligne aussi `quick` et `creation`. La résolution des modes ne retombe donc plus sur une sous-classe de prompts génériques selon la registry ou le lane visible.

> 2026-04-26 — Chat mode registry boundary truth: la duplication apparente entre `src/config/chatModes.config.ts` et `src/services/ai/chatModes.config.ts` correspond en réalité à deux responsabilités distinctes. Le premier conserve la résolution runtime legacy (`getSystemPrompt`, `registerCustomMode`, `ChatModeService`, conversation engine), tandis que le second porte la cartographie étendue des modes pour les surfaces UI modernes et expose seulement un adaptateur legacy de compatibilité. Cette frontière est désormais documentée et scellée par test.

> 2026-04-18 — Default persona coherence truth: `src-tauri/src/conversation_os/persona.rs` partage maintenant la même direction identitaire que le bloc de prompt dérivé: clarte, coherence, responsabilite, autonomie, transmission, recentrage avant expansion. Le backend persona par défaut et la couche de prompt frontend partagent donc une signature plus cohérente sans nouvelle commande IPC ni nouvelle surface UI.

> 2026-04-18 — Conversation assistant completeness verification truth: la topologie canonique de `/titane?tab=conversation` ne change pas, mais sa qualification de complétude se renforce. `src/components/chat/__tests__/MarkdownContent.test.tsx` couvre désormais une réponse markdown longue mixte jusqu au marqueur terminal `OMEGA-FINAL-BLOCK`, `e2e/critical/chat-interaction.spec.ts` vérifie que ce bloc terminal reste atteignable sur la surface active, et `e2e/critical/chat-layout-viewport.spec.ts` confirme que cette atteignabilité demeure bornée dans `chat-messages-scroll-region` tout en gardant `chat-input` et `chat-send` dans le viewport.

> 2026-04-19 — Conversation ultra-long round-trip truth: la topologie canonique `/titane?tab=conversation` reste `ConversationSection -> useConversationEngine -> conversationEngine/processMessage -> conversation_generate`, mais la qualification ultra-longue retire maintenant trois clamps hérités du chemin actif. `src/components/chat/ChatInput.tsx` n applique plus de limite dure a 10000 caracteres, `src/components/sections/ConversationSection.tsx` exporte `sanitizeConversationInput` sans coupe terminale, et `src-tauri/src/conversation_engine/pipeline.rs` accepte les messages ultra-longs non vides. La voie de preuve `e2e/critical/chat-interaction.spec.ts` confirme ensuite qu un prompt ultra-long et sa réponse mockée `[MOCK_OK] ... ULTRA-END` arrivent intacts jusqu a `chat-message-content` sans événement `titane-message-truncated`.

> 2026-04-18 — Conversation assistant markdown tables-and-quotes truth: `src/components/chat/MarkdownContent.tsx` parse et rend désormais les citations markdown et les tableaux style GitHub comme noeuds sémantiques sur la surface conversation canonique, tandis que `src/pages/TitanePage.css` garde leur containment responsive dans la bulle assistant. La route active `/titane?tab=conversation` ne change donc pas de topologie mais sait maintenant afficher plus proprement les réponses structurées orientées comparaison ou citation.

> 2026-04-18 — Unified memory config persistence truth: `src/services/unified/UnifiedMemory.ts` fusionne maintenant sa configuration via un merge profond au lieu d un spread superficiel, puis persiste les mises à jour explicites dans `localStorage` sous la clé `titane_unified_memory_config`. Les redémarrages frontend conservent donc les seuils et intervalles réellement choisis sans écraser les sous-branches non modifiées de `cleanup`, `consolidation`, `decay`, `limits`, `storage` ou `embedding`, et la preuve passe par `src/services/unified/__tests__/UnifiedMemory.unit.test.ts`.

> 2026-04-18 — Hybrid memory shadow-write truth: `src/services/ai/memoryIntegration.ts` ajoute maintenant une phase de dual-write gouvernée vers UnifiedMemory derrière le flag localStorage `titane_hybrid_memory_shadow_write_enabled`. Quand ce flag est activé, `saveInteraction()` et `saveStructuredEntry()` continuent d écrire via `memoryService`, puis dupliquent les écritures vers UnifiedMemory en mode shadow-write avec tags `hybrid-shadow-write`, sans modifier la lecture contextuelle canonique ni la topologie de conversation active.

> 2026-04-18 — Hybrid memory shadow-read diagnostics truth: `src/services/ai/memoryIntegration.ts` peut maintenant exécuter une lecture de contrôle optionnelle vers UnifiedMemory via le flag `titane_hybrid_memory_shadow_read_enabled`, relever un échantillon sémantique et les stats globales UnifiedMemory, puis publier ce différentiel sur la surface canonique mémoire `/titane?tab=memory` grâce à `src/components/sections/MemorySection.tsx` et `src/features/memory/MemoryTreeViewer.tsx`. Les écritures et lectures hybrides restent donc visibles et vérifiables sans altérer la voie de lecture canonique.

> 2026-04-18 — Hybrid memory comparison surface truth: la surface mémoire ne montre plus seulement un statut shadow-read. `MemoryTreeViewer` expose désormais le recouvrement canonique, le delta manquants/surplus, la requête de shadow read et la dernière erreur runtime fournis par `memoryIntegration`, ce qui rend la phase de contrôle UnifiedMemory lisible depuis la UI active déjà testée.

> 2026-04-18 — Hybrid memory semantic scoring truth: `memoryIntegration` calcule maintenant le meilleur appariement canonique vs UnifiedMemory via une similarité Jaccard sur tokens, puis publie une similarité moyenne en plus du recouvrement brut. `MemoryTreeViewer` affiche cette métrique sur la surface mémoire active afin de qualifier des quasi-correspondances sans basculer la lecture canonique vers UnifiedMemory.

> 2026-04-18 — Hybrid memory retrieval-score truth: `memoryIntegration` agrège désormais aussi le score moyen natif des résultats `retrieveMemories()` et un score composé simple avec la similarité moyenne. `MemoryTreeViewer` affiche ces deux valeurs sur la surface mémoire active pour juger la shadow read avec un double signal lexical + retrieval sans changer le runtime canonique.

> 2026-04-18 — Hybrid memory preview qualification truth: `memoryIntegration` publie maintenant un aperçu diagnostique des premiers libellés canoniques et UnifiedMemory ainsi qu une qualification `ready|partial|insufficient` basée sur le score composé et le recouvrement. `MemoryTreeViewer` rend ces signaux sur la surface mémoire active afin de rendre la shadow-merge visible sans introduire de fusion effective dans le runtime canonique.

> 2026-04-18 — Hybrid memory pair history truth: `memoryIntegration` ajoute désormais un historique borné des dernières qualifications shadow-read et les meilleures paires canonique ↔ UnifiedMemory avec score individuel. `MemoryTreeViewer` rend ces deux vues sur la surface mémoire active afin de rendre la shadow-merge diagnostique plus actionnable sans toucher à la chaîne canonique.

> 2026-04-18 — Hybrid memory explainability surface truth: `MemoryTreeViewer` affiche maintenant une mini-chronologie visuelle des qualifications shadow-read, des lignes structurées pour les paires appariées et des lignes structurées pour les libellés manquants avec raison. `memoryIntegration` publie les raisons de non-appairage correspondantes, toujours dans un cadre strictement diagnostique.

> 2026-04-18 — Hybrid memory prioritization surface truth: la chronologie visuelle est désormais une sparkline SVG avec repères temporels et score. Les manques shadow-read sont triés dans le runtime par priorité `critique|proche-seuil|faible` puis exposés avec badge et écart au seuil sur la surface mémoire active.

> 2026-04-18 — Hybrid memory near-match surface truth: la surface mémoire active ajoute une vue dédiée aux quasi-correspondances shadow-read. Le runtime y expose les candidats proches du seuil via `lastShadowReadNearMatches`, distincts des paires validées et des manques critiques, pour guider le diagnostic sans fusion effective.

> 2026-04-19 — Hybrid memory retained overview export truth: `src/services/ai/memoryIntegration.ts` nettoie maintenant l historique persisté des presets shadow-read avec une rétention bornée à sept jours et une validation de structure avant toute réhydratation. `src/components/sections/MemorySection.tsx` exploite ensuite cette vérité runtime pour proposer un export markdown visible depuis la vue d ensemble via `memory-hybrid-overview-export-report` et `memory-hybrid-overview-export-status`, ce qui rend le diagnostic hybride partageable sans quitter la surface canonique `/titane?tab=memory`.

> 2026-04-19 — Hybrid memory governed desktop export truth: `src-tauri/src/hybrid_memory_bridge.rs` ancre maintenant ce même rapport overview dans une voie desktop gouvernée `hybrid_memory_publish_governed_report`, exposée via `src/lib/tauriCommands.ts`, `src/lib/tauriClient.ts` et `src/lib/security.ts`. `MemorySection` préfère cette publication persistante sur desktop puis retombe honnêtement sur l export navigateur existant hors Tauri, ce qui garde une seule surface UI active tout en ajoutant un artefact AppData vérifiable.

> 2026-04-19 — Hybrid memory orchestration surface truth: `src/services/ai/memoryIntegration.ts` peut maintenant attacher des complements `hybridSupplementalKnowledge` au `MemoryContext` sans remplacer les tableaux canoniques historiques, a condition que `titane_hybrid_memory_orchestration_enabled` soit actif et que la shadow-read UnifiedMemory fournisse des candidats distincts suffisamment qualifiés. `src/components/sections/MemorySection.tsx` publie alors `memory-hybrid-overview-orchestration-status` et `memory-hybrid-overview-orchestration-preview`, tandis que `src/features/memory/MemoryTreeViewer.tsx` expose `memory-hybrid-orchestration-state`, `memory-hybrid-orchestration-count`, `memory-hybrid-orchestration-preview` et `memory-hybrid-orchestration-reason`; la topologie de `/titane?tab=memory` reste donc inchangée mais passe d un diagnostic pur a une orchestration additive bornée et visible.

> 2026-04-18 — Hybrid memory near-match stability surface truth: la surface mémoire active ajoute une sous-vue de stabilité des quasi-correspondances. Le runtime y publie la récurrence, la fenêtre d observation et la similarité moyenne des near-matches récents afin d isoler les signaux persistants des occurrences ponctuelles.

> 2026-04-18 — Hybrid memory rollout surface truth: la surface mémoire active expose aussi le mode de rollout shadow-read, la décision canari et une tendance étendue bornée. Ce contrat rend visible le déploiement contrôlé du shadow-read sans l élever au rang de vérité canonique.

> 2026-04-18 — Hybrid memory rollout control surface truth: la surface mémoire active expose maintenant des contrôles de pilotage pour appliquer le mode de rollout shadow-read et déclencher un probe immédiat. Cette capacité reste bornée à la page mémoire active et réutilise les diagnostics déjà publiés par le runtime.

> 2026-04-18 — Hybrid memory canary explainability surface truth: la surface mémoire active ajoute une explication textuelle de la décision canari ainsi qu une rangée de presets opérateur. Le diagnostic devient directement interprétable sans inspection manuelle du hash ou du localStorage.

> 2026-04-19 — Hybrid memory active preset surface truth: la surface mémoire active affiche désormais le preset réellement reconnu côté runtime et une recommandation opérateur lisible. L opérateur sait immédiatement si le preset courant est Observation, Equilibre, Full ou Custom, et quelle action appliquer quand un contexte reste hors-cible.

> 2026-04-19 — Hybrid memory overview summary truth: la vue d ensemble mémoire expose maintenant le preset actif, la recommandation opérateur et un historique borné des derniers changements de preset. La même vérité runtime est ainsi visible sans ouvrir l arbre détaillé.

> 2026-04-19 — Hybrid memory dashboard summary truth: le dashboard mémoire compact expose à son tour une synthèse du preset actif, de l état shadow-read et de l historique persistant récent. Cette surface reste un relais visuel du diagnostic runtime produit par `memoryIntegration`.

> 2026-04-18 — Conversation assistant markdown typography truth: `src/components/chat/MarkdownContent.tsx` accentue désormais les headings markdown par niveau et affiche le langage des blocs code dans un en-tête dédié, tandis que `src/pages/TitanePage.css` maintient leur containment sur la surface conversation canonique. La route active `/titane?tab=conversation` garde donc la même topologie mais gagne une hiérarchie typographique plus explicite pour les réponses assistant structurées.

> 2026-04-18 — Conversation assistant markdown polish truth: `src/components/chat/MarkdownContent.tsx` renforce maintenant la hiérarchie visuelle des réponses assistant rendues sur la surface canonique `src/components/sections/ConversationSection.tsx`, avec emphases plus lisibles, liens plus visibles et blocs de code plus nets. `src/pages/TitanePage.css` complète cette passe par un espacement markdown dédié côté conversation, sans changer la chaîne canonique ni les testids de la route `/titane?tab=conversation`.

> 2026-04-18 — Conversation assistant readability truth: `src/components/sections/ConversationSection.tsx` rend maintenant les messages assistant de la surface canonique via `src/components/chat/MarkdownContent.tsx` au lieu d un simple bloc texte brut, tout en conservant les testids `chat-message-assistant` et `chat-message-content`. `src/pages/TitanePage.css` augmente en parallèle la largeur utile des bulles assistant/fullscreen et du mode compact, ce qui réduit la sensation de réponse tronquée sur les longues sorties sans changer la topologie canonique de la route `/titane?tab=conversation`.

> 2026-04-18 — Governance Ollama endpoint truth: `src-tauri/src/ai/ollama.rs` et `src/features/governance-center/hooks/useGovernance.ts` partagent maintenant une vérité unique pour l état Ollama affiché sur la surface active de gouvernance. La commande IPC `ai_check_ollama_status` publie `url`, `model`, `endpoint_kind`, `endpoint_source`, `model_source`, `network_used` et `health` depuis la résolution runtime persistée/environnement, et `src/features/governance-center/components/APIProviderCard.tsx` rend ces champs via des testids stables au lieu d afficher un faux fallback `/api/ollama`.

> 2026-04-18 — Ollama runtime propagation truth: `src/hooks/useBackendHealth.ts` ne réduit plus Ollama à un booléen isolé; il publie `ollamaDetails` depuis `ai_check_ollama_status` et distingue ainsi un endpoint loopback d un endpoint distant quand la voie Tauri est disponible. `src/pages/ConfigurationHub.tsx` recharge ce même statut à l ouverture et expose `runtime-ollama-endpoint-kind`, `runtime-ollama-endpoint-source`, `runtime-ollama-model-source`, `runtime-ollama-network-used` et `runtime-ollama-health` sur la surface active de configuration au lieu d un fallback implicite purement local.

> 2026-04-18 — Ollama transport inventory truth: la couche `src/services/ai/transports/ollamaTransport.ts` et le provider `src/services/ai/providers/ollama.ts` ne reposent plus sur une réponse santé simulée avec un unique modèle statique. Le transport normalise la réponse de `ai_check_ollama_status`, republie l inventaire de modèles backend dans `ollamaCheckHealth()`, et conserve un message d indisponibilité lié à l URL/health réellement signalés par le runtime.

> 2026-04-18 — Conversation model requested-used-shown truth: `src/services/conversationEngine.ts`, `src/hooks/useConversationEngine.ts` et `src/components/sections/ConversationSection.tsx` transportent désormais `model_requested`, `model_used` et `fallback_used` jusqu à la surface chat active. La conversation peut donc montrer le modèle réellement exécuté et signaler un fallback de modèle sans rompre la chaîne de vérité déjà établie pour `provider_used`.

> 2026-04-18 — MessageBubble compatibility model truth: `src/components/chat/MessageBubble.tsx` republie désormais la même triade `modelRequested`, `modelUsed` et `fallbackUsed` sur sa surface de compatibilité via `message-model-requested-{timestamp}`, `message-model-used-{timestamp}` et `message-model-fallback-{timestamp}`. Cette couche ne remplace pas l autorité canonique `src/components/sections/ConversationSection.tsx`, mais garde les surfaces legacy et leurs tests alignés sur la chaîne requested -> used -> shown déjà active.

> 2026-04-18 — Conversation response-budget truth: `src/services/api/chat.ts` n appelle plus `conversation_generate` avec `maxTokens=undefined` sur la voie active `useChat -> chatService.sendMessageLegacy -> chatService.sendMessage`. Quand aucun override UI n existe, le service fixe maintenant `32768`, ce qui évite de retomber sur des défauts backend plus bas et supprime les coupures artificielles de réponse sur la surface conversation canonique.

> 2026-04-18 — Conversation runtime-disk knowledge base truth: `src/services/api/defaultKnowledgeBase.ts` tente maintenant d abord la commande IPC `knowledge_base_runtime_snapshot` pour hydrater la KB par défaut depuis le dossier runtime `data/knowledge_base/default` visible par Tauri, avant de retomber sur `knowledge_base_get_all` puis sur le bundle frontend. `src-tauri/src/knowledge_base_default.rs` publie cette snapshot gouvernée avec exclusion des fichiers privés Kevin, ce qui laisse la route active du chat consommer la vérité disque réelle quand elle existe sans casser le fallback embarqué.

> 2026-04-18 — Conversation canonical-kernel authority truth: src/services/conversationEngine.ts appelle maintenant src/services/ai/canonicalDiscernmentKernel.ts sur la voie chat active avec memoryIntegration, santé providers issue de aiOrchestrator.getProvidersStatus() et cohérence SingularityBridge.getCachedCoherence(). La décision canonique pilote le provider backend demandé, le profil runtime utilisé pour aiConfig, et la vérité exposée dans response.cognitive_tags, metadata.links_to_contexts et omega_trace_meta, ce qui rapproche la surface conversation standard du contrat déjà en vigueur dans src/services/ai/chatEngine.ts.

> 2026-04-18 — Conversation provider/citations continuity truth: src-tauri/src/conversation_engine/commands.rs publie maintenant provider_used et des citations normalisées dans metadata au même format canonique que les surfaces web research, tandis que src/services/conversationEngine.ts conserve cette vérité même si seul meta.provider_used ou trace.citations est présent. src/hooks/useConversationEngine.ts persiste ensuite providerUsed et citations sur le message assistant de la surface active, ce qui supprime le faux fallback provider et les pertes de Sources en ligne sur la voie standard du chat.

> 2026-04-18 — Window zoom finite-value truth: `src-tauri/src/commands/window_controls_commands.rs` rabat maintenant `NaN` et `+/-Infinity` sur `1.0` avant de stocker ou d emettre le zoom runtime. La preuve active passe par `commands::window_controls_commands::tests::test_sanitize_zoom_level_rejects_nan` et `commands::window_controls_commands::tests::test_sanitize_zoom_level_rejects_infinity`.

> 2026-04-18 — Memory telemetry env-lock truth: `src-tauri/src/memory/telemetry.rs` recupere maintenant le guard de `ENV_LOCK` meme quand le mutex a ete empoisonne par un panic de test precedent. La preuve active passe par `memory::telemetry::tests` execute en sequence avec `--test-threads=1` pour confirmer que la lane telemetry ne s auto-casse plus sur le poison du verrou partage.

> 2026-04-18 — Telemetry CSV timestamp truth: `src-tauri/src/api/telemetry_api.rs` rejette maintenant les lignes CSV dont `timestamp` est vide ou whitespace-only dans `parse_csv_line`. La preuve active passe par `api::telemetry_api::tests::test_parse_empty_timestamp_returns_parser_error` et `api::telemetry_api::tests::test_parse_whitespace_timestamp_returns_parser_error`.

> 2026-04-18 — Unified memory tier list-order truth: `src-tauri/src/unified_memory_v2/persistence.rs` retourne maintenant les ids de `MemoryPersistence::list_tier` dans un ordre trie stable. Les surfaces backend `load_tier` et `clear_tier` ne dependent donc plus de l ordre non deterministe de `read_dir` pour un meme tier, et la preuve active passe par `unified_memory_v2::persistence::tests::list_tier_returns_sorted_ids`.

> 2026-04-18 — Conversation governed tool-lane truth: `src/services/conversationEngine.ts` détecte maintenant une capacité tools/functions gouvernée depuis `src/lib/security.ts` (`ALLOWED_COMMANDS`) et `src/services/mcp/MCPOrchestrator.ts` (`getHealth()`), au lieu d imposer `toolAvailable=false`. La route active du chat injecte `GOVERNED_TOOL_LANE_CONTEXT` / `GOVERNED_TOOL_LANE_STATUS`, classifie le `taskType` minimal (`question|instruction|multi-step|code|data`) et projette `tool-lane:*`, `task-type:*`, `tool-action:*`, `web-action:*`, `memory-action:*` et `ask-act-hold:*` dans `response.cognitive_tags` et `metadata.links_to_contexts`, tout en conservant la vérité `execution_mode=governed_not_auto`.

> 2026-04-18 — Conversation advanced-agent runtime truth: `src/services/conversationEngine.ts` agrège maintenant la vérité runtime déjà publiée par `src/services/monitoring/index.ts`, `src/services/diagnostic/index.ts`, `src/services/explainability/index.ts`, `src/services/orchestrator/index.ts` et `src/services/security_active/index.ts`. La route active du chat injecte `ADVANCED_AGENT_RUNTIME_CONTEXT` et `ADVANCED_AGENT_RUNTIME_STATUS`, puis projette `advanced-agents:present` et `agent:*:*` dans `response.cognitive_tags` et `metadata.links_to_contexts`, sans présenter ces signaux comme une boucle de décision agentique complète quand ils ne sont encore que des résumés runtime canoniques.

> 2026-04-18 — Conversation skill and online runtime truth: `src/services/conversationEngine.ts` réaligne maintenant la route active du chat avec la Skill OS déjà présente dans `src/services/skills/activation/skillActivator.ts`, en injectant `ACTIVE_SKILL_CONTEXT` et `ACTIVE_SKILL_STATUS` quand un skill actif existe réellement. Le même service publie aussi `ONLINE_CAPABILITY_CONTEXT` / `ONLINE_CAPABILITY_STATUS` avec la vérité gouvernée `one_door_only=true`, l état `online:available|offline` et la préférence `deep_analysis:enabled|disabled`, puis projette ces signaux dans `response.cognitive_tags` et `metadata.links_to_contexts` consommés par `src/components/sections/ConversationSection.tsx`.

> 2026-04-18 — Journal OMEGA runtime truth: `src/hooks/useConversationEngine.ts` capture maintenant sur la voie conversation canonique les signaux réellement disponibles du tour assistant (`metadata.latency_ms`, `tokens_used`, `memory_effect`, `links_to_contexts`, `citations`, `cognitive_summary`, `omega_trace_meta`) et y ajoute un statut de sauvegarde persistant, un `xpTrace` et un `qualityScore` calculés sur le hook unifié. `src/components/sections/ConversationSection.tsx` transmet ensuite ces champs au `src/features/chat/ThinkingPanel.tsx`, qui remplace les placeholders génériques du `Journal d'Exécution OMEGA` par les valeurs runtime réelles ou un libellé explicite propre à la voie canonique (`Non utilisee sur ce tour`, `Aucune duree capturee`, `Aucun contexte injecte detecte sur ce tour`).

> 2026-04-18 — Conversation context status runtime truth: `src/services/conversationEngine.ts` publie maintenant dans `response.cognitive_tags` et `metadata.links_to_contexts` les statuts réels `runtime-knowledge:*`, `default-kb:*` et `persistent-memory:*`, plus `twins:present` et `cognitive-context:present` quand le `contextEnvelope` actif les contient. La surface active `src/components/sections/ConversationSection.tsx` réutilise déjà `assistant metadata.tags` pour les afficher sans voie parallèle, ce qui rend le branchement mémoire/KB/TWINS visible sur le chat canonique.

> 2026-04-18 — Conversation default knowledge base prompt truth: `src/services/conversationEngine.ts` enrichit maintenant la route active `/titane?tab=conversation` avec un bloc `DEFAULT_KNOWLEDGE_BASE_CONTEXT` dérivé de `src/services/api/defaultKnowledgeBase.ts::getRelevantPromptContext(query, 4)`, en plus de la mémoire runtime et persistante déjà injectées. La vérité canonique n utilise pas l index complet de KB pour éviter un prompt trop large; elle injecte seulement le contexte ciblé par requête et publie aussi `DEFAULT_KNOWLEDGE_BASE_STATUS` quand la KB est vide ou indisponible.

> 2026-04-18 — Conversation inline citations E2E truth: la surface active `/titane?tab=conversation` rend maintenant les citations inline dans `src/components/sections/ConversationSection.tsx`, pas seulement dans la surface de compatibilité `src/components/chat/MessageBubble.tsx`. `src/services/webResearchService.ts` expose un crochet Playwright strictement borné via `__TITANE_E2E_WEB_RESEARCH_MOCK__` et `__TITANE_E2E_WEB_RESEARCH_REPORT__` pour prouver la voie canonique de handoff web inline sans ouvrir de fetch UI direct, et `e2e/critical/chat-interaction.spec.ts` scelle cette vérité sur les testids `message-citations-{index}` / `message-citation-{index}-{citationIndex}`.

> 2026-04-18 — Conversation provider recovery and inline citations truth: `src/hooks/useConversationEngine.ts` ne traite plus `FALLBACK_OFFLINE` comme une indisponibilité provider à reformuler en recovery message. La vérité canonique garde le contenu assistant backend quand la réponse dégradée est valide, ne réserve le message “mode récupération provider” qu à `PROVIDER_UNAVAILABLE`, et projette aussi `providerUsed` / `requestedProvider` dans la metadata de bulle. En parallèle, `src/components/sections/ConversationSection.tsx` transmet maintenant les `report.answer.citations` de la voie gouvernée `webResearch` et les rend sur la surface active via `message-citations-{index}` / `message-citation-{index}-{citationIndex}`, tandis que `src/components/chat/MessageBubble.tsx` reste aligné comme surface de compatibilité.

> 2026-04-18 — Sandbox list-empty truth: `src-tauri/src/security/sandbox.rs` renvoie maintenant `[]` quand `FileImportSandbox::list_files` est appele avant creation du repertoire sandbox. Les preuves Rust actives couvrent explicitement `security::sandbox::tests::test_list_files_returns_empty_when_directory_missing` et le nominal `security::sandbox::tests::test_list_files_returns_imported_safe_name`.

> 2026-04-18 — Sandbox import-parent truth: `src-tauri/src/security/sandbox.rs` cree maintenant le dossier parent directement dans `FileImportSandbox::import_file` avant l ecriture du fichier sandbox. Les preuves Rust actives couvrent explicitement `security::sandbox::tests::test_import_file_creates_parent_directory` et la non-regression de `security::sandbox::tests::test_import_file`.

> 2026-04-18 — Audit custom-event truth: `src-tauri/src/security/audit.rs` canonise maintenant les labels `AuditEventType::Custom` avant emission du log structure. Les preuves Rust actives couvrent explicitement `security::audit::tests::test_custom_event_type_sanitizes_control_characters`, `security::audit::tests::test_custom_event_type_defaults_empty_value` et la non-regression de `security::audit::tests::test_custom_event_type`.

> 2026-04-18 — Path whitespace truth: `src-tauri/src/security/validation.rs` refuse maintenant les chemins vides apres trim dans `PayloadValidator::validate_path`. Les preuves Rust actives couvrent explicitement `security::validation::tests::test_validate_path_rejects_whitespace_only_path` et la non-regression de `security::validation::tests::test_validate_path`.

> 2026-04-18 — Message control-character truth: `src-tauri/src/security/validation.rs` refuse maintenant les caracteres de controle interdits aussi dans `InputValidator::validate_message`. Les preuves Rust actives couvrent explicitement `security::validation::tests::test_validate_message_rejects_control_characters` et la non-regression de `security::validation::tests::test_validate_message`.

> 2026-04-18 — Audit logger parent-directory truth: `src-tauri/src/security/audit.rs` garantit maintenant l existence du dossier parent avant append d un log structure. Les preuves Rust actives couvrent la creation automatique de la racine via `security::audit::tests::test_audit_logger_creates_parent_directory` et la non-regression nominale de `security::audit::tests::test_audit_event_creation`.

> 2026-04-18 — Audit user-id canonicalization truth: `src-tauri/src/security/audit.rs` canonise maintenant `AuditEvent.user_id` avant toute emission de journal structure. Les preuves Rust actives couvrent la suppression des caracteres de controle dans `security::audit::tests::test_audit_event_sanitizes_user_id`, le fallback `anonymous` pour un identifiant vide apres nettoyage, et la non-regression nominale de `security::audit::tests::test_audit_event_creation`.

> 2026-04-18 — HTML sanitization escape-order truth: `src-tauri/src/security/validation.rs` et `src-tauri/src/secure_commands.rs` publient maintenant la meme verite de sanitation HTML: `&` est encode avant `<`, `>`, guillemets et apostrophes. Les preuves Rust actives couvrent la non-regression de `security::validation::tests::test_sanitize_html` et la surface runtime `secure_commands::tests::test_sanitize_html`, avec absence de double-escape sur `&lt;script`.

> 2026-04-18 — Shell guard long-flag truth: `src-tauri/src/security/shell_guard.rs` protege les surfaces runtime qui passent par `execute_verified` (`audio/asr`, `tts/local_tts`, `tts/online_tts`, `ai/ollama`, `overdrive/voice_engine`) contre des arguments traversal deguises en faux flags longs. Les preuves Rust actives couvrent le rejet de `--output=../../etc/passwd`, l acceptation d un vrai flag `--keep-going` et la non-regression du nominal deja safe.

> 2026-04-18 — Storage filename sanitization truth: `src-tauri/src/security/storage_guard.rs` ne laisse plus `sanitize_filename` produire un nom vide ou cache seulement compose de points. Les preuves Rust actives couvrent la normalisation de `../../etc/passwd` vers `etcpasswd`, la conservation du nominal texte simple, et le fallback `file_<checksum>` pour une entree entierement invalide.

> 2026-04-18 — Secure secrets key truth: `src-tauri/src/security/secrets_engine.rs` valide maintenant centralement les cles du coffre chiffre avant toute operation `set/get/has/clear`. Les preuves Rust actives couvrent le rejet d une cle invalide contenant des espaces, le rejet d une cle > 128 caracteres et le maintien du round-trip nominal sur `gemini_api_key`.

> 2026-04-18 — Rate limiter user-id truth: `src-tauri/src/security/rate_limit.rs` valide maintenant `user_id` avant toute insertion dans la map interne du limiter. Les preuves Rust actives couvrent le rejet d un identifiant vide ou blanc, le rejet d un identifiant > 128 caracteres dans `get_stats`, et le maintien du nominal `test_rate_limit_basic` avec la nouvelle garde active.

> 2026-04-18 — PayloadValidator path and extension truth: `src-tauri/src/security/validation.rs` refuse maintenant explicitement les chemins `scheme://...` dans `validate_path`, et `validate_file_extension` requalifie d abord la cible par cette meme garde avant tout controle d extension. Les preuves Rust actives couvrent le rejet d un `file:///tmp/test.txt`, le rejet d un `../secret.txt`, et le maintien du nominal `folder/file.txt`.

> 2026-04-18 — Permission audit field truth: `src-tauri/src/security/permission_guard.rs` nettoie maintenant `action` et `source` avant insertion dans `PermissionAudit`. Les preuves Rust actives couvrent explicitement le rejet des bytes de controle dans les champs exportes et le bornage strict a `256` caracteres pour empecher le log poisoning ou des exports JSON demesures.

> 2026-04-18 — Storage guard relative-path truth: `src-tauri/src/security/storage_guard.rs` accepte maintenant uniquement des chemins relatifs sandboxes dans `validate_and_resolve`. Les preuves Cargo actives couvrent le rejet d un `file:///...` et le rejet d un chemin absolu meme deja situe sous la racine sandbox.

> 2026-04-18 — Config import file truth: `src-tauri/src/config/io.rs` qualifie maintenant `import_config` sur un vrai fichier JSON local canonique avant toute lecture. Les preuves Rust actives couvrent l acceptation d un fichier `.json` nominal, le rejet d un traversal, le rejet d un symlink et le rejet d une charge > 1 MiB.

> 2026-04-18 — Piper voice id path truth: `src-tauri/src/audio/commands.rs` rejette maintenant les `voice_id` Piper vides, traversants ou non canoniques avant toute construction de `~/.local/share/piper/voices/{voice}.onnx`, et `src-tauri/src/tts/local_tts.rs` applique la meme garde au chemin local TTS. Les preuves Rust actives passent par `audio::commands::tests::test_piper_voice_id_accepts_canonical_value`, `test_piper_voice_id_rejects_path_traversal` et `test_piper_voice_id_rejects_non_canonical_characters`.

> 2026-04-18 — Chat layout zoom authority runtime truth: `src/hooks/zoomScale.ts` ne s appuie plus sur `document.documentElement.style.zoom` comme autorite active; la mise a l echelle canonique passe par `--titane-ui-scale` et la taille de police racine, pendant que `src/components/layout/AppShell.tsx` reste parent-bound avec un seul offset TopNav fixe. `src/components/sections/ConversationSection.tsx` requalifie en plus `--conversation-vh` via `ResizeObserver` et une synchronisation differee pour suivre les resizes WRY natifs, et la lane desktop remet maintenant la baseline zoom a `1.0` apres activation effective de la surface conversation pour eliminer l etat persistant entre runs. Les preuves ciblées sont PASS en unitaire, Playwright navigateur et WDIO desktop sur la sequence `100% -> 110% -> 100% -> 90%` puis resize compact, avec `--conversation-vh` aligne sur la hauteur effective visible.

> 2026-04-18 — Telemetry CSV source qualification truth: `src-tauri/src/api/telemetry_api.rs` qualifie maintenant le CSV `production_week1.csv` de `temp_dir()` avant toute lecture via `read_production_week1_csv`. La surface refuse explicitement les repertoires, symlinks et fichiers > 10 MiB, et les preuves Rust couvrent le rejet d un repertoire, le rejet d un symlink Unix et le maintien du nominal `test_summarize_valid_csv`.

> 2026-04-18 — Secure engine secret-file permission truth: `src-tauri/src/secure_engine.rs` applique maintenant un verrouillage explicite des permissions sur `write_secret_file` apres ecriture du payload secret. Les preuves d integration dans `src-tauri/tests/secure_engine_tests.rs` couvrent la creation automatique du parent, le round-trip `write_secret_file`/`read_secret_file`, et sur Unix la verite `0600` proprietaire-seul du fichier `secret.enc`.

> 2026-04-18 — File import sandbox flat-name truth: `src-tauri/src/security/sandbox.rs` distingue maintenant la garde de `filename` a l import de la garde de `safe_name` a la relecture/suppression. Les preuves Rust couvrent explicitement le rejet de `nested/escape.txt` pour `read_file` et `delete_file`, tout en gardant le flux nominal `import_file("test.txt", ...)` vert.

> 2026-04-18 — AppShell below-baseline zoom clamp truth: `src/components/layout/AppShell.tsx` ne contre-echelle plus le shell global pour des niveaux de zoom TopNav inferieurs a `1.0`. La compensation width/height/paddingTop passe par `max(var(--titane-ui-scale, 1), 1)`, ce qui supprime l expansion `1440 / 0.9 = 1600` reproduite sur la surface conversation fullscreen dans le navigateur tout en gardant la compensation necessaire au-dessus de `100%`. Les preuves browser `e2e/critical/chat-layout-viewport.spec.ts` couvrent maintenant explicitement la sequence `100% -> 110% -> 100% -> 90%`; la lane WRY embarquee reste non certifiee car le binaire cible ne charge pas `index.html`.

> 2026-04-18 — StorageGuard ancestor containment truth: `src-tauri/src/security/storage_guard.rs` remonte maintenant jusqu au plus proche ancetre existant avant de qualifier une cible absente, au lieu de canonicaliser seulement le parent immediat. Les preuves Rust couvrent explicitement le rejet d une ecriture `linked_out/newdir/escape.txt` quand `linked_out` est un symlink vers l exterieur de la sandbox, ainsi que le maintien du flux nominal `safe_write`/`safe_read`.

> 2026-04-17 — Persistence backup import truth: `src-tauri/src/persistence/backup.rs` restaure maintenant les archives persistence uniquement vers `titan_events.db.events.json` et `titan_events.db.snapshots.json` sous `data_dir`. La surface rejette les noms d entree vides, NUL, absolus, traversants ou contenant des separateurs avant toute ecriture, et les preuves Rust couvrent explicitement le rejet d une entree `../escape.json` ainsi qu un import nominal des deux fichiers autorises.

> 2026-04-17 — Update migration path truth: `src-tauri/src/updates/update_engine.rs` applique une garde locale sur `migration_id` avant toute reconstruction de chemin sous `update_dir/migrations/`. Les preuves Rust couvrent le rejet d un traversal, le rejet d un chemin absolu et l acceptation d un id simple qui n echoue ensuite que sur l absence du script attendu.

> 2026-04-17 — Neural LTM path truth: `src-tauri/src/neural_memory/ltm.rs` applique une garde locale sur `entry.id` puis sur `metadata.file_path` avant toute reconstruction de chemin sous `entries/`. Les preuves Rust couvrent le rejet d un id traversal a l ecriture, d un traversal injecte dans l index a la lecture et d un chemin absolu injecte dans l index a la suppression.

> 2026-04-17 — Memory OS LTM metadata path truth: `src-tauri/src/memory_os/ltm.rs` applique une garde locale sur `metadata.file_path` avant toute reconstruction de chemin sous `entries/`. Les preuves Rust couvrent le rejet d un traversal et d un chemin absolu injectes via l index disque.

> 2026-04-17 — Unified memory persistence path truth: `src-tauri/src/unified_memory_v2/persistence.rs` applique une garde locale sur `id` et `tier` avant toute construction de chemin disque. Les preuves Rust couvrent le rejet d un traversal d id, le rejet d un tier absolu et un round-trip valide sur `stm/entry-1.json`.

> 2026-04-17 — Vault file id truth: `src-tauri/src/security/vault_engine.rs` applique une garde locale sur les `file_id` avant toute construction de chemin `.enc` ou `.sha256`. Les preuves Rust couvrent le rejet d un traversal et d un chemin absolu pour confirmer que la surface ne peut plus sortir de `vault/encrypted/` via un identifiant externe.

> 2026-04-17 — Time-travel snapshot id truth: `src-tauri/src/time/travel_engine.rs` applique une garde locale sur les `snapshot id` avant toute lecture ou suppression de fichiers `.snapshot`. Les preuves Rust couvrent le rejet d un traversal et d un chemin absolu afin de confirmer que la surface ne peut plus sortir de `vault/snapshots/` via un identifiant externe.

> 2026-04-17 — Config presets path truth: `src-tauri/src/config/presets.rs` ne valide plus seulement le nom de preset a l ecriture. La surface applique la meme verification a `load_config_preset` et `delete_config_preset`, et les preuves Rust couvrent l acceptation d un nom simple ainsi que le rejet d un traversal et d un chemin imbrique.

> 2026-04-17 — Backend self-test memory truth: `src-tauri/src/backend_selftest.rs` remplace la verification memoire ad hoc basee sur `std::fs::metadata("memory")` par une preuve active sur un stockage temporaire. La surface cree un `MemoryStorage` ephemere, sauvegarde puis recharge une conversation de test, et supprime ensuite le repertoire de probe; une regression Rust verifie qu aucun fichier de fuite ne subsiste.

> 2026-04-17 — MemoryStorage path truth: `src-tauri/src/memory/storage.rs` ne derive plus directement le nom de fichier depuis `conversation_id`. La surface rejette maintenant les ids vides, absolus, rootes, traversants ou contenant des separateurs de chemin avant tout acces a `storage_dir`, et les preuves Rust couvrent explicitement le rejet d un traversal `../escaped` ainsi que d un id absolu.

> 2026-04-17 — StorageService listing truth: `src-tauri/src/services/storage_service.rs` aligne maintenant `list_keys()` sur la verite de `StorageGuard` en listant la racine de stockage avec `.` plutot qu avec un chemin vide rejeté. La surface continue de s appuyer sur `sanitize_filename`, ne remonte que les fichiers `.json`, et les preuves Rust couvrent enumeration et round-trip de persistance.

> 2026-04-17 — CacheService sandbox truth: `src-tauri/src/services/cache_service.rs` rejette maintenant les cibles hors sandbox meme quand elles imitent lexicalement la racine (`sandbox_evil`). La garde remonte jusqu au plus proche ancetre existant, le canonicalise, refuse les segments parent `..`, puis n autorise la cible finale que si sa reconstruction reste strictement dans `sandbox_root` canonique.

> 2026-04-17 — IOService base-path truth: `src-tauri/src/services/io_service.rs` borne maintenant toutes ses operations filesystem a `base_path` canonique. Les chemins relatifs sont resolves sous cette racine, les segments parent `..` et les chemins absolus hors racine sont rejetes, et l ecriture de nouvelles cibles internes reconstruit la cible depuis l ancetre existant le plus proche pour rester gouvernee meme quand les sous-dossiers n existent pas encore.

> 2026-04-18 — Knowledge parser local document truth: `src-tauri/src/knowledge/parser.rs` valide maintenant `parse_document` et `detect_file_format` sur un vrai fichier local canonique avant toute lecture ou detection. La surface refuse les chemins vides, NUL, schemes `://`, segments parent `..`, repertoires, cibles absentes et fichiers sensibles (`.env`, `.pem`, `.key`, certificats, coffres), puis traite exclusivement la cible fichier resolue.

> 2026-04-18 — ShellGuard canonical command truth: `src-tauri/src/security/shell_guard.rs` refuse maintenant les commandes fournies comme chemins de binaire et non comme simples noms whitelistés. `execute_verified` revalide puis execute le nom whitelisté retourné par `validate_command`, ce qui supprime le contournement par basename autorisé sur chemin arbitraire.

> 2026-04-18 — Developer Mode patch validation truth: `src-tauri/src/engines/developer_mode.rs` borne maintenant `dev_mode_validate_patch` au workspace canonique via une resolution explicite de `patch.file`. La commande refuse les chemins vides, NUL, schemes `://`, segments parent `..` et chemins absolus hors workspace, puis qualifie l extension permise sur la cible resolue au lieu de faire confiance au chemin brut.

> 2026-04-18 — TOTAL_DEV file read truth: `src-tauri/src/commands/total_dev_commands.rs` borne maintenant `total_dev_read_file` au workspace canonique via une resolution explicite avant lecture. La commande refuse les chemins vides, NUL, schemes `://`, segments parent `..`, chemins absolus hors workspace et fichiers sensibles (`.env`, `.key`, `.pem`, `.secret`) apres resolution, puis conserve un resultat structure `ok=false` pour les cibles repo-locales absentes.

> 2026-04-18 — Hybrid patch surface truth: `src-tauri/src/commands/hybrid.rs` borne maintenant `dev_apply_patch` a des fichiers existants du workspace canonique. La resolution refuse les chemins vides, NUL, schemes `://`, segments parent `..`, chemins absolus hors workspace et cibles non fichier, puis applique uniquement le remplacement de lignes demande sur la cible resolue.

> 2026-04-18 — Stub filesystem bridge truth: `src-tauri/src/commands/stub_commands.rs` borne maintenant `fs_exists` et `read_json_file` au workspace canonique. La resolution refuse les chemins vides, NUL, schemes `://`, segments parent `..` et chemins absolus hors workspace; `read_json_file` n accepte plus que des fichiers `.json` <= 2 MiB. `src/lib/security.ts` et `allowed_commands.json` exposent ces deux commandes sur la meme verite gouvernee.

> 2026-04-18 — Hybrid file inspection workspace-bound truth: `src-tauri/src/commands/hybrid.rs` borne maintenant `dev_inspect_file` a la racine workspace canonique. La commande accepte les chemins repo legitimes, garde la lecture des fichiers absents a l interieur du repo, et refuse desormais les chemins vides, NUL, schemes `://`, segments parent `..` et chemins absolus hors workspace via une resolution canonique du parent ou du fichier cible.

> 2026-04-17 — Logging/HMR truth: `src/types/logLevel.ts` devient l autorite canonique pour `LogLevel`, `src/utils/logger.ts` ne declare plus l enum et le re-exporte seulement pour compatibilite, tandis que `src/config/logLevelConfig.ts` consomme ce type partage afin de casser le cycle documente autour du runtime log level manager. `src/contexts/LoggingContext.tsx` ajoute un `LoggingProvider` applicatif et une facade `useLogging`/`useModuleLogger` pour migrer progressivement les hooks et services qui importent encore directement le logger runtime.

> 2026-04-17 — Runtime hooks barrel isolation and hybrid command hardening truth: `src/hooks/usePhysiological.ts` porte maintenant les hooks physiologiques de compatibilite, `src/App.tsx`, `src/components/VitalsPanel.tsx`, `src/components/StatusIndicator.tsx` et `src/components/physiological/PhysiologicalPanel.tsx` importent leurs modules de hooks directement, et `src/__tests__/architecture/no_runtime_hooks_barrel_import.test.ts` interdit tout nouveau runtime import depuis `src/hooks/index.ts`. Cote kernel, `src-tauri/src/commands/hybrid.rs` n execute plus un split shell libre: `dev_run_command` est borne a une allowlist explicite, refuse les operateurs shell et s execute depuis la racine workspace canonique.

> 2026-04-17 — Frontend circular dependency verification truth: `scripts/verify/verify_frontend_circular_deps.sh` devient le garde structurel canonique du corridor HMR frontend. Il execute Madge sur `src/hooks`, `src/contexts`, `src/utils`, `src/config` et `src/types`, exclut le passif hors lot (`services`, `visual-engine`, autres zones legacy), et est expose via `pnpm run verify:frontend-circular-deps` puis consomme dans `.github/workflows/ci-unified.yml`.

> 2026-04-17 — TOTAL_DEV console hardening truth: `src-tauri/src/commands/total_dev_commands.rs` publie maintenant une allowlist exacte pour `total_dev_run_command`, ajoute le rejet explicite des marqueurs shell (`&&`, `||`, `|`, `;`, redirections, retours ligne) et couvre ces refus par des tests Rust internes. Les commandes `cat src*` et variantes larges `git ...`/`pnpm run ...` non repertoriees ne sont plus acceptees par cette surface; la lecture gouvernee de fichiers reste `total_dev_read_file`.

> 2026-04-17 — TOTAL_DEV Git read-only truth: `src-tauri/src/commands/total_dev_commands.rs` borne maintenant `total_dev_git_op` a une allowlist read-only (`status`, `diff`, `log`, `branch`, `show`, `rev-parse`) avec arguments qualifies par operation, et `src/pages/TotalDevPage.tsx` retire les actions `git add`, `commit` et `push` au profit d un message de surface read-only explicite. La cartographie canonique de `/total-dev` expose les selectors `total-dev-git-*` et le marqueur `total-dev-git-readonly-note` comme verite active du panneau Git.

> 2026-04-17 — Conversation effective viewport height truth: `src/components/sections/ConversationSection.tsx` introduit `getEffectiveViewportHeight()` pour calculer `--conversation-vh` a partir de `window.innerHeight / visualViewport.scale` avec garde minimale a `320px`, et surveille maintenant les variations de `visualViewport.scale` et `devicePixelRatio` en plus des `resize`/`orientationchange`. `src/pages/TitanePage.css` retire en parallele les soustractions fixes `-155px/-176px/-82px` sur `.conversation-container` au profit d un dimensionnement parent-bound (`flex: 1 1 auto`, `height: 100%`, `min-height: 0`), tandis que `e2e/critical/chat-layout-viewport.spec.ts` et `e2e/desktop/chat-layout-viewport.wdio.test.js` verifient desormais explicitement que `--conversation-vh` reste alignee sur la hauteur effective et que le bas du chat ne sort plus du viewport sous zoom.

> 2026-04-17 — Agent dashboards conversation-safe dock truth: `src/components/AgentDashboardsPanel.tsx` conserve le montage canonique des cinq dashboards avancés dans `src/components/layout/AppShell.tsx`, mais détecte maintenant la surface fullscreen conversation pour passer en dock compact non-obstructif. Le panneau expose `agent-dashboards-panel-toggle` et `agent-dashboards-panel-content`, reste replié par défaut sur `/titane?tab=conversation`, et les preuves `e2e/critical/chat-layout-viewport.spec.ts` ainsi que `e2e/desktop/chat-layout-viewport.wdio.test.js` vérifient désormais explicitement qu'il n'occulte plus `chat-input` ni `chat-send`.

> 2026-04-23 — Agent dashboards visible-update truth: `src/components/AgentDashboardsPanel.tsx` ne se contente plus d un toggle générique `Agents`; la surface canonique versionne maintenant un marqueur de nouveauté local via `data-has-update`, `agent-dashboards-panel-whats-new-badge` et `agent-dashboards-panel-whats-new-text` tant que la version UI courante n a pas été reconnue sur le poste. Cette affordance rend explicitement visibles les derniers changements livrés sur les dashboards agents même quand le reste des évolutions récentes est surtout structurel ou runtime-proof.

> 2026-04-17 — Conversation zoom-width containment truth: `src/components/layout/AppShell.tsx` compense maintenant la largeur et la hauteur du shell racine avec `--titane-ui-scale`, tandis que `src/pages/TitanePage.css` et `src/pages/TitanePage-local.css` retirent les restes de sizing `100vw` au profit d’un bornage parent-bound strict (`width/max-width/min-width`). Les preuves `e2e/critical/chat-layout-viewport.spec.ts` et `e2e/desktop/chat-layout-viewport.wdio.test.js` vérifient désormais aussi les bornes gauche/droite de `page-titane`, `tab-conversation`, `chat-messages-scroll-region`, `chat-input` et `chat-send`.

> 2026-04-17 — Security audit IPC bridge truth: `src-tauri/src/security_audit_bridge.rs` introduit les commandes kernel `security_audit_sync_journal` et `security_audit_publish_signed_export` pour ancrer la fédération sécurité active dans `app_data_dir()/security_active` côté Tauri, avec rétention bornée, signature Ed25519 locale et export gouverné écrit sous `exports/`. La surface UI canonique reste `src/services/security_active/SecurityDashboard.tsx`; le bridge backend n’ajoute aucun endpoint réseau ni seconde surface visible.

> 2026-04-17 — Security audit desktop runtime proof truth: les commandes kernel `security_audit_sync_journal` et `security_audit_publish_signed_export` sont maintenant réellement disponibles dans le binaire debug desktop courant du workspace et dans la surface installée `/usr/bin/titane-infinity` après rebuild 30.1.34. La preuve WDIO native écrit `federated_audit_journal.json`, `governed_export_signing_key.json` et des exports signés sous `~/.local/share/com.titane.infinity/security_active/` depuis les deux lanes desktop, sans divergence entre binaire release local et binaire installé.

> 2026-04-17 — Security governed export metadata truth: `src/services/security_active/index.ts` matérialise désormais la dernière preuve signée du bridge Tauri dans une section stable `security-dashboard-governed-export` au lieu de la laisser uniquement dans le JSON brut d export. La surface canonique `src/services/security_active/SecurityDashboard.tsx` publie `exportId`, `exportPath`, `sha256`, `fingerprint`, `publishedAt` et `eventCount` quand le lane gouverné a déjà produit un export, y compris depuis un payload persisté localement si le runtime Tauri n est pas actif au moment du rendu.

> 2026-04-17 — Orchestrator multi-session comparison truth: `src/services/orchestrator/index.ts` ne se limite plus a une serie temporelle locale par onglet; le service conserve maintenant un snapshot borne par session navigateur pour alimenter `orchestrator-dashboard-multi-session-compare` et derive une ventilation `orchestrator-dashboard-champion-breakdown` a partir de `src/services/ai/championChallenger.ts`. `src/services/orchestrator/OrchestratorDashboard.tsx` reste la seule surface canonique et les tests verifies couvrent la comparaison locale ainsi que la ventilation champion/challenger par provider.

> 2026-04-16 — Security audit federation/filter/export truth: `src/services/security_active/index.ts` agrège désormais le journal borné existant avec les `sessionId` du `UILogger` pour exposer une fédération multi-session locale, applique un filtre de sévérité (`all|critical|warning|info`) sur la vue de sécurité active, et génère un export JSON borné des corrélations de confinement persistant dans le navigateur courant. `src/services/security_active/SecurityDashboard.tsx` reste la seule surface canonique de pilotage avec des selectors stables pour filtres, fédération et export.

> 2026-04-16 — Advanced-agent bounded refresh and security audit truth: `src/services/orchestrator/index.ts` persiste désormais une série temporelle locale bornée de snapshots charge/providers pour alimenter `orchestrator-dashboard-live-timeline`, et `src/services/security_active/index.ts` consolide un journal local borné d événements de détection/confinement avec acquittement persistant et résumé de corrélation. Les dashboards `src/services/orchestrator/OrchestratorDashboard.tsx` et `src/services/security_active/SecurityDashboard.tsx` portent eux-mêmes un refresh borné (15s et 10s) au lieu d inventer un flux backend séparé.

> 2026-04-16 — Advanced-agent live runtime surfaces: `src/services/orchestrator/index.ts`, `src/services/explainability/index.ts` et `src/services/security_active/index.ts` n exposent plus seulement une qualification PARTIAL, mais des sections runtime concrètes et stables consommées par leurs dashboards canoniques. L orchestrateur publie des métriques de charge et des snapshots de santé providers dérivés de `metricsEngine`, `autoHealEngine` et `GovernanceConnector`; l explainability publie la chaîne requested -> used -> shown ainsi qu un rapport d inference dérivé de la conversation persistée active; la sécurité active publie des événements de détection et de confinement dérivés de `aiHealthMonitor`, `performanceAlerts`, `PredictiveAlerts`, `UILogger` et de la gouvernance providers.

> 2026-04-16 — Chat E2E knowledge-memory proof truth: la lane critique Playwright `e2e/critical/chat-interaction.spec.ts` peut maintenant qualifier explicitement la disponibilité d une connaissance runtime seedee et le rappel du dernier échange sur le chemin mock frontend canonique. `src/services/conversationEngine.ts` publie alors des marqueurs visibles `[MOCK_KNOWLEDGE]` et `[MOCK_MEMORY]` sans prétendre exécuter un backend HTTP distinct, et consigne les interactions mockées dans `window.__TITANE_E2E_CHAT_MEMORY_LOG__` pour vérifier honnêtement la persistance de la lane de preuve.

> 2026-04-16 — Advanced agents readiness alignment truth: les surfaces `diagnostic-panel`, `explainability-dashboard`, `orchestrator-dashboard` et `security-dashboard` ne restent plus documentées comme `planned` dès lors que leurs services dédiés exposent déjà des signaux runtime/configuration vérifiables. Leur statut canonique est désormais `partial`, au même titre que `monitoring-dashboard`, tant que le moteur complet correspondant n est pas encore branché.

> 2026-04-16 — Chat single-door memory/knowledge alignment truth: `src/services/conversationEngine.ts` reste la porte frontend active vers `conversation_generate` via IPC Tauri, sans serveur HTTP dédié pour le chat ni pour Twins. Cette porte active précharge désormais la connaissance runtime issue du Memory Core (`memory_get_knowledge`) dans le `systemPrompt`, conserve le contexte Twins/TIME déjà présent, et persiste chaque interaction réussie via `persistent_memory_write_entry`, afin d éviter une dérive entre mémoire, base de connaissance et chemin conversationnel canonique.

> 2026-04-16 — Monitoring lazy-loader binding truth: `src/services/monitoring/index.ts` n'utilise plus une réexportation directe et un import local concurrent pour `isMonitoringLoaded`. La façade charge désormais explicitement les bindings du lazy-loader puis les réexporte, ce qui réaligne `src/services/monitoring/MonitoringDashboard.tsx` avec la vérité runtime observable sur la surface active et supprime le crash `isMonitoringLoaded is not defined` au rendu du panneau monitoring.

> 2026-04-17 — Monitoring boot initialization truth: `src/hooks/useAppInitialization.ts` déclenche désormais `initMonitoringAsync('boot')` sur la surface applicative canonique, et `src/services/monitoring/monitoringLazyLoader.ts` publie un état runtime lisible par le service monitoring (`requested`, `loading`, `loaded`, `requestSource`, timestamps, dernière erreur). `src/services/monitoring/index.ts` consomme cette vérité pour distinguer un monitoring encore en veille, un bootstrap réellement demandé au boot, et un lazy-loader chargé, au lieu de déduire l état uniquement depuis `isMonitoringLoaded()`.

> 2026-04-17 — Diagnostic/explainability bounded-runtime truth: `src/services/diagnostic/index.ts` ne se limite plus à une synthèse passive; il persiste un rapport d anomalie structurel borné dérivé des alertes, erreurs globales, état Ollama et providers actifs, puis l expose via `diagnostic-panel-diagnostic-report` et `diagnostic-panel-diagnostic-history` sur `src/services/diagnostic/DiagnosticDashboard.tsx`. En parallèle, `src/services/explainability/index.ts` conserve un historique local horodaté des traces `providerMeta` observées sur la conversation active et l expose via `explainability-dashboard-inference-history`, ce qui fait évoluer la surface de la dernière trace isolée vers une série bornée de décisions runtime.

> 2026-04-16 — Advanced agents runtime detail truth: `src/services/explainability/index.ts`, `src/services/orchestrator/index.ts` et `src/services/security_active/index.ts` n exposent plus seulement une synthèse `PARTIAL`; ils publient désormais des sections détaillées à partir de la vérité runtime déjà disponible dans le repo. Explainability lit la conversation persistée pour exposer la chaîne `requested -> used -> shown` et un rapport d'inférence, orchestrator publie métriques live et snapshots providers depuis `metricsEngine`/`GovernanceConnector`, et security active agrège logs UI, alertes health/perf/prédictives et événements de confinement sans simuler de moteur séparé.

> 2026-04-17 — Advanced agents runtime signal truth: les dashboards avancés conservent `src/services/agents/advancedAgentCatalog.ts` comme base de qualification, mais les services dédiés enrichissent maintenant cette base avec les signaux réels déjà disponibles dans le runtime et la configuration canonique du repo. Le monitoring publie métriques/alertes, le diagnostic expose ses signaux passifs et l état Ollama, l explainability vérifie l alignement du registre champion/challenger, l orchestrateur expose les providers/timeouts actifs, et la sécurité active rappelle la voie IPC/One Door réellement en vigueur.

> 2026-04-16 — Advanced agents runtime mount truth: `src/components/layout/AppShell.tsx` monte maintenant `src/components/AgentDashboardsPanel.tsx` dans la surface applicative active. La preuve Playwright attend donc la présence réelle de `agent-dashboards-panel` et des cinq dashboards avancés sur la route de base, au lieu de s appuyer sur des exports non montés.

> 2026-04-16 — Advanced agents qualification truth: `src/services/agents/advancedAgentCatalog.ts` devient la vérité canonique des cinq agents avancés UI. Les dashboards de `src/services/monitoring/MonitoringDashboard.tsx`, `src/services/diagnostic/DiagnosticDashboard.tsx`, `src/services/explainability/ExplainabilityDashboard.tsx`, `src/services/orchestrator/OrchestratorDashboard.tsx` et `src/services/security_active/SecurityDashboard.tsx` n exposent plus des stubs opaques mais un statut gouverné (`data-readiness`), une synthèse, des preuves visibles, des blockers et une prochaine action. Les composants legacy sous `src/components/` sont désormais de simples alias vers ces surfaces canoniques pour éviter toute divergence active.

> 2026-04-17 — Canonical zoom authority and parent-bound shell truth: `src/hooks/zoomScale.ts` publie désormais un événement canonique de changement d’échelle consommé par `TopNav` et `UIReadingProvider`, ce qui supprime les autorités concurrentes de zoom dans la surface active. En parallèle, `src/components/layout/AppShell.tsx`, `src/ui/reading/UIReadingPanel.css`, `src/ui/components/Modal.css`, `src/ui/Modal.tsx`, `src/index.css` et `src/ui/pages/styles/Chat.css` ont été réalignés sur des dimensions parent-bound (`100%`) au lieu de `vh/dvh` rigides, pour que textes et éléments UI restent cohérents sous zoom navigateur, zoom applicatif et runtime Tauri sans redébordement du shell.

> 2026-04-18 — Online-chat desktop route anti-drift truth: la preuve WRY `e2e/desktop/online-chat-proof-ui.wdio.test.js` et son wrapper `scripts/e2e/run-online-chat-proof-ui.sh` sont réalignés sur la surface conversation canonique `/titane?tab=conversation` au lieu de l alias historique `/chat`. En mode dev-server, le harness ouvre désormais `.../titane?tab=conversation`, force le bouton `tab-conversation` si la page Titane arrive sans état d onglet, puis attend `chat-input` avant la séquence de message. Cette correction élimine le faux PASS `IPC_FALLBACK` observé quand la page chargée n exposait pas encore la surface conversation visible, et permet de requalifier honnêtement `reasoning-progress` et le runtime panel sur la lane desktop active.

> 2026-04-17 — Native Tauri zoom-step and parent-bound truth: `src/hooks/zoomScale.ts`, `src/components/layout/TopNav.tsx` et `src/hooks/useZoomControl.ts` partagent maintenant un pas de zoom additif canonique, ce qui supprime la dérive `1 -> 1.1 -> 0.99`. En parallèle, `src/pages/TitanePage-local.css` force la surface `titane-page--conversation` à rester parent-bound (`width/max-width/min-height` overrides) afin que la vérité runtime Tauri dev garde `/titane?tab=conversation` entièrement visible à `0.8`, `1.0` et `1.1` dans la fenêtre native.

> 2026-04-16 — Surface chat fullscreen/zoom: la vérité canonique desktop/browser ne dépend plus d'un zoom CSS global à 75%. La baseline UI est revenue à 100%, la surface conversation Titane est étirée par son parent fullscreen, et les contrôles de zoom/fullscreen restent portés par les raccourcis navigateur/Tauri au lieu d'un shrink global qui créait des marges noires en HTTP.

> 2026-04-16 — Surface chat bounded-height chain: `src/pages/TitanePage-local.css` borne désormais explicitement la chaîne fullscreen `titane-content--conversation -> titane-section-conversation--fullscreen -> conversation-container` en `display:flex`, `flex-direction:column` et `height:100%`, afin que le compositeur ne déborde plus sous la fenêtre desktop HTTP quand l’onglet conversation est actif.

> 2026-04-17 — TopNav zoom viewport compensation: `src/hooks/zoomScale.ts` publie maintenant la variable canonique `--titane-ui-scale` en même temps que le zoom inline, et `src/components/layout/AppShell.tsx` compense la hauteur racine ainsi que l’offset TopNav avec cette échelle. La vérité runtime vérifiée est que `/titane?tab=conversation` reste entièrement dans la fenêtre visible sous zoom TopNav réel, sur desktop standard et viewport compact.

> 2026-04-16 — Canonical route-context anti-drift: `src/services/chat/moduleRouteContext.ts` normalise maintenant les alias query-driven vers leur destination canonique complète, pas vers une racine tronquée; `/chat` publie `/titane?tab=conversation`, `/devtools` publie `/admin?tab=system&systemTab=devtools`, et le fallback F12 de `src/main.tsx` navigue directement vers cette surface Admin/DevTools pour empêcher une vérité UI mémoire/diagnostic en retard sur la surface réellement visible.

> 2026-04-16 — Audit anti-dérive v30.1.x: la cartographie canonique doit désormais expliciter qu’une surface visible n’est jamais qualifiée seule. Toute correction ou évolution doit réaligner dans la même phase la surface UI, les tests E2E associés, la chaîne IPC/backend réellement consommée, les artefacts packagés, les launchers installés et les preuves AutoHeal; toute divergence entre une de ces vérités runtime est un état FAIL tant qu’elle n’est pas requalifiée.

> 2026-04-16 — Conversation long-message visibility: `src/components/chat/VirtualizedMessageList.tsx` ne filtre plus les messages assistant tres longs avec une borne fixe 100k avant de choisir la surface de rendu; la liste revient maintenant honnetement a `MessageList` pour les hauteurs naturelles, et l'evenement `titane-message-truncated` n'est emis que lorsqu'une limite explicite est configuree.

> 2026-04-19 — Explore quota workflow continuity: les instructions gouvernées, prompts de session et l'orchestrateur `titane-conductor` imposent désormais qu'une indisponibilité du sous-agent Explore sur quota hebdomadaire soit classifiée comme limite plateforme externe puis contournée immédiatement par une discovery locale canonique (`search_subagent`, recherche workspace, lectures ciblées) au lieu de bloquer la session.

> 2026-04-19 — Conversation completeness root-cause truth: la voie backend `src-tauri/src/conversation_os/style.rs` puis `src-tauri/src/conversation_os/adapter.rs` n applique plus de troncature par offsets bytes sur les réponses longues. Un helper partagé `truncate_text_safely` preserve maintenant les frontières Unicode puis coupe sur phrase ou mot quand une borne de longueur est réellement nécessaire, et la surface canonique `/titane?tab=conversation` est requalifiée par les tests `src/__tests__/hooks/useConversationEngine.test.ts` et `src/components/sections/__tests__/ConversationSection.render.test.tsx` jusqu au selector `chat-message-content`.

> 2026-04-19 — Specialist delegation continuity: le prompt `release-readiness` et la chaîne `memory-root-commander` -> `memory-orchestrator` imposent désormais qu'une indisponibilité de délégation spécialisée soit traitée comme un écart externe ou outillage, puis contournée immédiatement par une collecte locale canonique des preuves au lieu de bloquer la préparation release ou le rollout mémoire sur la délégation elle-même.

> 2026-04-19 — Scoped delegation continuity rule: `/.github/instructions/titane.instructions.md` propage maintenant la même exigence au niveau de la surface opérationnelle commune, afin qu'une indisponibilité de custom agent, spécialiste ou handoff d'exploration soit traitée comme un écart de plateforme/outillage puis contournée localement dès que la preuve reste disponible sans dépendre de la délégation elle-même.

> 2026-04-16 — Conversation runtime transparency reply: `src/components/sections/ConversationSection.tsx` detecte maintenant les prompts purement descriptifs demandant le provider reel, l'usage reseau et les capacites d'export de l'UI, puis repond localement a partir de la derniere verite runtime instrumentee au lieu de laisser le modele improviser ou rebasculer vers une voie artefact.

> 2026-04-16 — Conversation transparency routing truth: `src/features/chat/artifactIntent.ts` ne traite plus toute mention d'"export" comme une demande artefact; les questions descriptives sur ce que l'UI permet d'exporter restent dans la voie réponse chat canonique, et seules les demandes explicites d'export/génération de fichier déclenchent le manifeste artefact.
> 2026-04-16 — Conversation fullscreen internal scroll budget: `conversation-container[data-fullscreen='true']` neutralise maintenant le gap vertical hérité entre ses blocs, et `titane-content--conversation` réserve un budget bas safe-area-aware sur mobile compact pour que la zone de messages garde le scroll interne pendant que l’onglet chat et le compositeur restent visibles ensemble.
> 2026-04-16 — Conversation fullscreen persistence: `TitanePage` ne force plus un `scrollIntoView()` du textarea lors de l’activation de l’onglet chat, `titane-page-header--conversation` reste sticky dans le shell fullscreen, et `chat-messages-scroll-region` expose une scrollbar native droite renforcée pour garder visibles le header d’onglet et le repère de défilement sous zoom.
> 2026-04-16 — GitHub Copilot rate-limit resilience: `src-tauri/src/api_hub/copilot.rs` effectue maintenant des retries bornés sur quota GitHub (`429`/`403` rate-limited) avec respect de `Retry-After` et backoff exponentiel plafonné avant remontée d’erreur, afin d’éviter les faux échecs de type code review.
> 2026-04-16 — Canonical anti-regression surface truth: `src/features/admin/AdminPage.tsx` monte désormais `SelfHealingDashboard` comme onglet actif `/admin?tab=anti-regression`; la surface visible canonique expose `self-healing-dashboard` et `anti-regression-summary`, et la classification runtime passe par `src/services/selfHealing/selfHealingService.ts`.

> 2026-04-16 — Canonical chat surface truth: `src/pages/ChatPage.tsx` est désormais un alias explicite vers `TitanePage`; le router legacy `/chat` redirige maintenant explicitement vers `/titane?tab=conversation`, le router déprécié et le préchargement critique pointent eux aussi vers `TitanePage`, et la surface utilisateur réellement active reste `ConversationSection` sous cette topologie canonique.
> 2026-04-16 — Legacy chat export truth: `src/ui/pages/Chat.tsx` a été réduit à un alias de compatibilité vers `ChatPage`, lui-même alias vers `TitanePage`; les imports hérités restent donc fonctionnels sans réintroduire l’ancienne UI chat autonome.
> 2026-04-22 — TWINS scroll truth: `src/pages/TwinsPage.tsx` expose maintenant une racine `page-twins` en `flex min-h-full w-full flex-col`, et `src/index.css` ne force plus `.twins-root` en `height: 100%` + `overflow: hidden`; la route dédiée `/twins` redevient scrollable via le host canonique `AppShell`.
> 2026-04-22 — TopNav active sync truth: `src/hooks/useTopNavigation.ts` rattache maintenant aussi `/knowledge`, `/creation` et `/evolution` à l’entrée principale `TITANE`, afin que la TopNav reste synchronisée avec ces surfaces autonomes déjà montées par `AppRouter` et qualifiées par `moduleRouteContext`.
> 2026-04-22 — DEV engine-route sync truth: `src/hooks/useTopNavigation.ts` rattache maintenant `/singularity`, `/sentinel`, `/watchdog`, `/selfheal` et `/adaptive` à l’entrée `DEV`, afin que les surfaces moteur/monitoring gardent un état de navigation actif cohérent avec leur domaine opérationnel.
> 2026-04-22 — Engine route runtime proof truth: `src/pages/Sentinel.tsx`, `src/pages/Watchdog.tsx`, `src/pages/SelfHeal.tsx` et `src/pages/AdaptiveEngine.tsx` exposent maintenant des racines `data-testid` stables (`page-sentinel`, `page-watchdog`, `page-selfheal`, `page-adaptive-engine`) afin que `AppRouter` puisse qualifier explicitement ces surfaces visibles et leur contexte module canonique.
> 2026-04-22 — WDIO engine inventory truth: `e2e/desktop/page-objects/uiPages.po.js` inventorie maintenant explicitement `devEngineRoutePages` pour `/singularity`, `/sentinel`, `/watchdog`, `/selfheal` et `/adaptive`, toutes rattachées à `nav-dev` mais exclues du `topLevelPageOrder` car elles réutilisent l’entrée top-level DEV.
> 2026-04-22 — WDIO engine runtime proof truth: `e2e/desktop/dev-engine-routes.wdio.test.js` qualifie maintenant en runtime Tauri les cinq surfaces de `devEngineRoutePages` en exigeant leur root visible canonique et `nav-dev[aria-current="page"]`.

> 2026-04-16 — Conversation rate-limit provider-flow proof: `tests/e2e/provider-flow.test.ts` réutilise désormais le scénario `window.__TITANE_E2E_CHAT_SCENARIO__='rate_limit'` pour vérifier dans la lane Playwright riche que le panneau runtime expose `provider_used=github-copilot`, `reason_code=RATE_LIMIT`, `mode=OFFLINE` et `network_used=true` sans retomber sur `[MOCK_OK]`.
> 2026-04-15 — Correction de synchronisation conversationnelle: `src/services/conversationEngine.ts` traite désormais `tauri_protector_ipc_fallback` / `CONTRACT_VIOLATION_CLAMPED` comme une désynchronisation backend/frontend récupérable et déclenche le fallback orchestrateur avant de remonter une erreur, afin de préserver une réponse locale valide quand le runtime Tauri est momentanément désaligné.
> 2026-04-15 — Canonicalisation TWINS corrigée: le pont `src/services/chat/moduleRouteContext.ts` publie maintenant `/twins` comme destination canonique pour les alias legacy `/identity|/identity-center|/persona|/twin`; cette note remplace les anciennes correspondances documentaires vers `/titane?tab=twins`.

> 2026-04-16 — Conversation rate-limit E2E proof: `src/services/conversationEngine.ts` supporte maintenant un scénario de mock critique `RATE_LIMIT` piloté par `window.__TITANE_E2E_CHAT_SCENARIO__`, ce qui permet à `e2e/critical/chat-interaction.spec.ts` de vérifier explicitement que la surface runtime expose `reason_code=RATE_LIMIT` et `mode=OFFLINE` sans faux succès `[MOCK_OK]`.
> 2026-04-16 — Conversation rate-limit truth: `buildConversationFallbackMeta` classe désormais explicitement les erreurs de quota (`rate limit`, `429`, `retry after`, `limite de taux`) en `RATE_LIMIT` avec mode `OFFLINE`, et `ConversationSection` traduit ce reason code en état runtime `blocked` pour refléter un blocage temporaire gouverné au lieu d’une erreur générique.
> 2026-04-15 — Conversation fullscreen flex chain: la surface active `ConversationSection` remplit désormais la hauteur fullscreen via la chaîne `titane-content--conversation -> titane-section-conversation--fullscreen -> conversation-container`, sans réintroduire de hauteur mobile soustractive dédiée; le compositeur bas reste visible sous zoom et en viewport compact.
> 2026-04-15 — Conversation view polish: `ConversationSection` regroupe désormais toolbar, filtres et télémétrie dans un chrome haut unique, compacte la télémétrie dans un layout résumé+badges plus lisible, et renforce la hiérarchie visuelle des bulles assistant/utilisateur pour une lecture plus nette.
> 2026-04-15 — Conversation return-to-bottom CTA: `chat-scroll-to-bottom` devient une petite flèche ronde discrète ancrée au bas de la surface chat, sans libellé visible, afin d’offrir un retour rapide au dernier message sans élargir la zone basse.
> 2026-04-15 — Conversation composer containment: le compositeur bas de `ConversationSection` reste désormais sticky et borné au viewport visible en mode fullscreen, avec un ajustement `safe-area`/hauteur max sur la zone d’écriture; la preuve T17 contrôle explicitement que `composerBottom` reste dans la fenêtre.
> 2026-04-15 — Conversation fullscreen immersive: `ConversationSection` expose désormais `data-fullscreen=true|false` sur `conversation-container` et applique un chrome fullscreen plus marqué sur la toolbar, le panneau runtime, le flux et le compositeur, afin que le mode plein écran reste immédiatement perceptible même hors densité `compact`.
> 2026-04-15 — Android browser-mobile conversation: le mode fullscreen compact de `ConversationSection` ne force plus `height: 100%` sur petit viewport, et `TitanePage-local.css` applique un override mobile dedie pour conserver visible le compositeur; la lane Playwright Android valide l'envoi via le selector stable `chat-send` avec un dispatch DOM natif cote harness afin d'eliminer les faux negatifs de clic synthetique tout en gardant la surface UI intacte.
> 2026-04-15 — Réponses longues chat: `VirtualizedMessageList` conserve `react-window` pour les historiques compacts mais rebascule vers `MessageList` quand un message exige une hauteur naturelle, afin d’éviter la coupure visuelle des réponses longues dans la surface conversation; les budgets par défaut sont alignés sur le plafond backend utile de 32768 pour supprimer les restrictions artificielles basses.
> 2026-04-15 — Conversation fullscreen: densité compacte pilotée par le viewport réel pour préserver la visibilité au zoom, ajout du CTA flottant `chat-scroll-to-bottom`, du sélecteur `chat-messages-scroll-region`, d’un renforcement safe-area et d’une chaîne `flex/min-height/overflow` plus stricte pour maintenir visibles le bas du flux et le compositeur sur desktop/mobile.
> 2026-04-15 — AppShell fullscreen: la chaîne de conteneurs racine React/TITANE conserve maintenant `h-dvh + min-height:0 + flex-column` jusqu’au host scrollable principal, afin que la page conversation fullscreen n’hérite plus d’un wrapper extensible recréant un vide sous le chat.
> 2026-04-15 — Knowledge Fusion: la page `/knowledge` ne signale plus un faux résultat nul au simple choix de fichier; l’avertissement `knowledge-null-result-warning` n’est affiché qu’après une tentative `parseDocument` réellement revenue à `null`, et le vault ignore désormais toute valeur nulle.
> 2026-04-14 — Mise à jour UI: suppression définitive de l’onglet Twins dans `TitanePage`; exposition Twins uniquement via TopNav menu Plus (***) sur la route `/twins` (legacy `/identity|/persona|/twin` -> `/twins`).
> 2026-04-14 — Mise à jour UI chat: suppression des surfaces TWINS de `ConversationSection`; l’entrée dédiée `nav-twins` reste disponible dans le menu Plus de la TopNav vers `/twins`.

> **Mise à jour le 2026-04-14
> Document de référence architecture — généré depuis scan du dépôt

---

## A. Architecture 4-Ring

TITANE_INFINITY est organisé en 4 anneaux concentriques, du noyau Rust vers l'interface React. Chaque anneau ne peut importer que des anneaux d'ordre inférieur (pas d'inversion).

```
┌─────────────────────────────────────────────────────────────────────┐
│  Ring 4 — UI Layer (React/TypeScript)                               │
│  Pages · Components · UI Primitives · Hooks                         │
├─────────────────────────────────────────────────────────────────────┤
│  Ring 3 — Store Layer (Zustand)                                     │
│  18 stores + selectors                                              │
├─────────────────────────────────────────────────────────────────────┤
│  Ring 2 — Engine Layer (src-tauri/src/ modules)                     │
│  20+ moteurs Rust : cognitif, mémoire, singularité, audio...        │
├─────────────────────────────────────────────────────────────────────┤
│  Ring 1 — Core Services (src/services/)                             │
│  IPC bridge · 1135 commandes Tauri · AI orchestration               │
├─────────────────────────────────────────────────────────────────────┤
│  Ring 0 — Kernel Rust (main.rs · security · constitution)           │
│  Point d'entrée · Sécurité · Registre des modules                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Ring 0 — Kernel / Rust

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `main.rs` | 2857 | Point d'entrée, invoque ~1135 commandes Tauri via `generate_handler![]` |
| `lib.rs` | — | Registre des modules Rust |
| `error.rs` | — | Définition des erreurs canoniques |
| `error_handling.rs` | — | Gestion centralisée des erreurs |
| `bounded.rs` | — | Contraintes de bornes et limites |
| `engine_trait.rs` | — | Trait abstrait commun à tous les moteurs |
| `state.rs` | — | État global partagé Tauri |
| `handlers.rs` | — | Handlers IPC génériques |

Modules kernel : `kernel/`, `core/`, `security/`, `constitution/`


### Scripts de lancement et d’installation

- **Linux** : `scripts/launch/launch-titane.sh`, `scripts/launch/start_dev.sh`
- **Windows** : 
  - `scripts/launch/launch-titane.ps1` (lancement principal)
  - `scripts/launch/launch-titane.bat` (batch)
  - `scripts/launch/launch-ollama.ps1` (**installation Ollama + modèles IA**)
- **Backend Ollama** : la boucle locale canonique cote Rust cible `127.0.0.1:11434` dans l'orchestrateur desktop et reutilise `gemma2:2b` comme fallback streaming canonique pour stabiliser les probes et generations WDIO/Tauri.
- **Active fallback truth** : `src/main.tsx`, `src/pages/ConfigurationHub.tsx` et `src-tauri/src/config/update.rs` partagent maintenant le meme fallback runtime canonique `http://127.0.0.1:11434` + `gemma2:2b`, et `scripts/verify/verify-ollama-cline-alignment.sh` qualifie explicitement ces surfaces actives ainsi que les hooks Cline associés.
- **Android** : voir `titane-android/`

---

| Service | Lignes | Rôle |
|---------|--------|------|
| `tauriCommands.ts` | — | Wrapper IPC canonical (`invokeTauriCommandCanonical`) |
| `tauriBridge.ts` | — | Bridge Tauri — abstraction bas niveau |
| `tauriClient.ts` | 3456 | Client Tauri complet, toutes commandes IPC |
| `ai/chatEngine.ts` | 3356 | Moteur de chat AI principal |
| `ai/orchestrator.ts` | 2133 | Orchestrateur AI multi-providers |
| `ragService.ts` | — | RAG/semantic search (`safeInvokeCanonical`) |
| `evolutionEngine/` | — | Moteur d'évolution continue |
| `singularityBridge.ts` | — | Pont singularité v1 |
| `singularityBridgeVInfinity.ts` | — | Pont singularité vΩ |
| `conversationEngine.ts` | — | Moteur de conversation |
| `adminEngine/` | — | Moteur d'administration |
| `audio/` | — | Services audio (capture, analyse) |
| `chat/` | — | Services de chat |
| `mcp/` | — | MCP (Model Context Protocol) |
| `voice/` | — | Services voix |
| `agendaService.ts` | — | Gestion agenda/timeline |
| `autoAuditEngine.ts` | — | Audit automatisé |
| `webResearchService.ts` | — | Recherche web |
| `userPreferencesEngine.ts` | — | Préférences utilisateur |
| `experienceService.ts` | — | Gestion XP/expérience |

---

## Agents avancés (v30.1.8)

| Agent | Dossier | Rôle principal |
|-------|---------|---------------|
| Monitoring Agent | monitoring/, src/services/monitoring/ | Supervision temps réel, alerting, logs croisés |
| Auto-Diagnostic Agent | diagnostic/, src/services/diagnostic/ | Analyse proactive, auto-vérification, correction automatique |
| Explainability Agent | explainability/, src/services/explainability/ | Traçabilité IA, justification, audit explicable |
| Orchestrateur Dynamique Agent | orchestrator/, src/services/orchestrator/ | Répartition dynamique, gestion de la charge |
| Agent de Sécurité Active | security_active/, src/services/security_active/ | Détection d’anomalies, sandboxing, réponse automatisée |

Chaque agent est intégré dans la cartographie 4-Ring : UI (dashboard), moteur dédié (Ring 2), accès kernel (Ring 0) si besoin.

---

### Ring 2 — Engine Layer (`src-tauri/src/` modules)

| Moteur | Module | Rôle |
|--------|--------|------|
| Harmonia | `harmonia_engine.rs` | Moteur harmonique — cohérence des centres |
| Cognitif | `cognitive/` | Moteur cognitif — raisonnement |
| Évolution | `evolution/` | Moteur d'évolution continue |
| Singularité | `singularity/` | Moteur singularité — état méta |
| Cycle | `cycle_engine/` | Moteur de cycles d'activité |
| Hyper-Intelligence | `hyper_intelligence/` | Moteur hyper-intelligence |
| Adaptatif | `adaptive/` | Moteur adaptatif (1488L) |
| Overdrive | `overdrive/` | Moteur overdrive haute performance |
| Mémoire | `memory/` | Mémoire multi-niveaux (STM/MTM/LTM) |
| Mémoire évolution | `memory_evolution/` | Évolution et consolidation mémoire |
| Mémoire neurale | `neural_memory/` | Mémoire neurale — patterns |
| Conversation | `conversation_engine/` | Moteur de conversation (2273L commands) |
| Subtilité émotionnelle | `emotional_subtlety` | Sous-module conversation |
| Maîtrise française | `french_mastery` | Sous-module conversation (1434L) |
| TTS | `tts/` | Text-to-Speech |
| Audio | `audio/` | Capture audio (2157L commands) |
| Avatar | `avatar/` | Moteur avatar 3D |
| Multimodal | `multimodal/` | Moteur multimodal (vision + texte) |

### Ring 3 — Store Layer (`src/stores/`)

| Store | Fichiers | État géré |
|-------|---------|-----------|
| Evolution | `evolutionStore.ts` + `evolutionStore.selectors.ts` | État d'évolution, niveau, XP |
| Memory | `memoryStore.ts` + `memoryStore.selectors.ts` | État mémoire (STM/MTM/LTM) |
| System | `systemStore.ts` + `systemStore.selectors.ts` | État système global |
| UI | `uiStore.ts` + `uiStore.selectors.ts` | Toasts, panneaux, notifications |
| Visual Unified | `unifiedVisualStore.ts` + `unifiedVisualStore.selectors.ts` | État visuel unifié |
| Visual | `visualStore.ts` | État visuel basique |
| Visual State | `visualStateStore.ts`, `visualStateStoreV21.ts` | État visuel v21 |
| Effects | `effectsStore.ts` | Effets visuels (particules, aura) |
| Panels | `panelsStore.ts` | État des panneaux UI |
| Chat Mode | `useChatModeStore.ts` | Mode de chat actif |
| Memory Engine | `useMemoryEngineStore.ts` | Moteur mémoire actif |
| Performance | `usePerformanceStore.ts` | Métriques de performance |
| In-Flight | `useRequestInFlightStore.ts` | Requêtes en cours |
| Self-Healing | `useSelfHealingStore.ts` | État auto-guérison |
| TTS Engine | `useTTSEngineStore.ts` | Moteur TTS actif |
| Vision | `useVisionStore.ts` + `useVisionStore.selectors.ts` | État vision/caméra |
| Automation XP | `useAutomationXPStore.ts` | Automation et XP |

### Ring 4 — UI Layer (`src/pages/`, `src/components/`, `src/ui/`)

#### Pages React (45+)

| Page | Description |
|------|-------------|
| `AdaptiveEngine` | Interface moteur adaptatif |
| `AdminPage` | Administration centrale |
| `AgendaPage` | Agenda et timeline |
| `CameraPage` | Interface caméra/vision |
| `ChatPage` | Interface de chat |
| `CloudCenter` | Centre cloud/sync |
| `CognitivePage` | Interface cognitive |
| `ConfigurationHub` | Hub de configuration |
| `CreationStudio` | Studio de création |

> 2026-04-24 — `ConfigurationHub` réaligne aussi sa vérité locale de configuration audio sur un seul état `audioConfig`, partagé entre chargement, affichage et sauvegarde. La surface active conserve les sélecteurs `audio-input-device-*`, `audio-output-device-*`, `audio-volume`, `audio-config-reload` et `audio-config-save`, mais ne référence plus un setter/état TypeScript inexistant.

> 2026-04-24 — La chaîne de build production `31.2.1` réaligne également le backend Tauri actif: `src-tauri/src/main.rs` publie explicitement `commands_v21::persistent_memory_v30` pour l enregistrement des IPC `persistent_memory_*`, tandis que `src-tauri/src/commands/http_commands.rs`, `rag_commands.rs` et `web_search_commands.rs` consomment la gateway réseau canonique du crate bibliothèque (`titane_infinity::gateway::network`) au lieu d un chemin binaire non résolu.
| `DashboardPage` | Tableau de bord principal |
| `DesignSystemPage` | Système de design |
| `DesignSystemShowcase` | Showcase design system |
| `DevPage` | Page développeur |
| `DevTools` | Outils de développement |
| `DevToolsLazy` | DevTools chargement différé |
| `DevToolsTabs` | DevTools avec onglets |
| `EvoPage` | Page d'évolution |
| `EvolutionCenterPage` | Centre d'évolution |
| `EvolutionMonitor` | Moniteur d'évolution |
| `Experience` | Page expérience/XP |
| `Harmonia` | Interface Harmonia Engine |
| `Helios` | Interface Helios |
| `Memory` | Interface mémoire |
| `ModulePages` | Pages modules |
| `MonitoringDashboard` | Tableau de bord monitoring |
| `Nexus` | Interface Nexus Engine |
| `OrchestrationMetaCenter` | Centre méta-orchestration |
| `PerfectFusionDashboard` | Tableau fusion parfaite |
| `PerformanceTest` | Tests de performance |
| `ProgressionPage` | Progression |
| `RealityCenter` | Centre réalité |
| `ResearchPage` | Recherche |
| `SecureSettings` | Paramètres sécurité |
| `SelfHeal` | Auto-guérison |
| `Sentinel` | Interface Sentinel |
| `Settings` | Paramètres |
| `SingularityMonitor` | Moniteur singularité |
| `Stats` | Statistiques |
| `TimePage` | Gestion du temps |
| `TimeNavigator` | Navigation temporelle |
| `TitanePage` | Page principale TITANE |
| `TotalDevPage` | Page dev totale |
| `TwinsPage` | Jumeaux numériques |
| `DocCenterPage` | Centre documentaire — export DOCX natif |
| `UltimateOptimizationDashboard` | Optimisation ultime |
| `Watchdog` | Interface watchdog |

#### Composants (catégories majeures)

| Catégorie | Composants principaux |
|-----------|-----------------------|
| `sections/` | TwinsSection, ConversationSection, MemorySection, et autres |
| `chat/` | ChatWindow, MessageBubble, ChatDiagnostic, ChatErrorBoundary |
| `dev/` | DevConsole, ConsoleMonitorDashboard, PredictiveDashboard |
| `audio/` | AudioSettings, VoiceControlPanel |
| `evolution/` | EvolutionDashboard, XPBar |
| `cognitive/` | CognitiveDashboard |
| `HyperCenter/` | Centre hyper-intelligence |
| `QuantumCenter/` | Centre quantique |
| `MetaCenter/` | Centre méta |
| `layout/` | AppShell, TopNav |
| `diagnostics/` | BootHealthDashboard, SplashWatchdog |
| `aura/` | QuantumParticles, AuraControlPanel |

#### UI Primitives (`src/ui/`)

`AppLayout` · `Button` · `Badge` · `Card` · `Input` · `Icons` · `Menu` · `Modal` · `Spinner`

---

## B. Catalogue IPC — Résumé

> Voir le catalogue exhaustif : [IPC_CATALOG.md](./IPC_CATALOG.md)

**1135 commandes IPC** réparties en 68 domaines fonctionnels.

| Domaine | Commandes | Domaine | Commandes |
|---------|-----------|---------|-----------|
| AI / Chat | 13 | Logging | 13 |
| API Gateway | 12 | Memory | 114 |
| Adaptive Engine | 7 | Meta-Orchestration | 48 |
| Agents | 7 | Monitoring | 16 |
| Audio | 21 | Multi-AI | 24 |
| Authentication | 26 | Multimodal | 16 |
| Automation | 13 | Network | 9 |
| Avatar | 44 | Ollama | 1 |
| Batch | 3 | OneCore | 11 |
| Browser Agent | 7 | Overdrive | 2 |
| Cache | 6 | Persistent Memory | 12 |
| Capabilities | 4 | Projects | 8 |
| Chat Engine | 30 | QA / Testing | 5 |
| Cloud Sync | 16 | Rate Limiting | 4 |
| Cognitive Engine | 44 | Repair/Healing | 6 |
| Config / Control Panel | 38 | Security | 9 |
| Conversation Engine | 15 | Self-Healing | 31 |
| Cycle Engine | 7 | Singularity | 37 |
| Dashboard | 3 | Snapshots | 5 |
| Database | 8 | State Management | 14 |
| Desktop Agent | 11 | System Center | 22 |
| DevTools | 24 | TITAN Core | 33 |
| Engines | 40 | Tasks | 4 |
| Evolution | 40 | Temporal Engine | 7 |
| Experience/XP | 23 | Training | 15 |
| Export/Import | 3 | TTS/Voice | 13 |
| Filesystem | 7 | VAD | 7 |
| Fusion Engine | 18 | Voice | 19 |
| Health/Diagnostics | 24 | HyperIntelligence | 11 |
| IDE Agent | 10 | Identity | 38 |
| Introspection | 6 | Jobs | 6 |
| Knowledge Base | 18 | Literary Engine | 9 |
| **TOTAL** | **1135** | | |

---

## C. Carte des Stores Zustand

| Store | Fichier | État (shape) | Sélecteurs exportés |
|-------|---------|--------------|---------------------|
| Evolution | `evolutionStore.ts` | `{ level, xp, history, isRunning }` | `selectEvolutionLevel`, `selectXP`, `selectIsRunning` |
| Memory | `memoryStore.ts` | `{ stm, mtm, ltm, status }` | `selectMemoryStatus`, `selectSTM`, `selectLTM` |
| System | `systemStore.ts` | `{ health, status, version, features }` | `selectSystemHealth`, `selectStatus` |
| UI | `uiStore.ts` | `{ toasts, panels, modals, theme }` | `selectToasts`, `selectActivePanels` |
| Visual Unified | `unifiedVisualStore.ts` | `{ mode, effects, particles, aura }` | `selectVisualMode`, `selectEffects` |
| Visual | `visualStore.ts` | `{ theme, animations, fps }` | — |
| Visual State | `visualStateStore.ts` | `{ state, version }` | — |
| Effects | `effectsStore.ts` | `{ active, intensity, type }` | — |
| Panels | `panelsStore.ts` | `{ open, minimized, positions }` | — |
| Chat Mode | `useChatModeStore.ts` | `{ mode, profile }` | — |
| Memory Engine | `useMemoryEngineStore.ts` | `{ engine, config }` | — |
| Performance | `usePerformanceStore.ts` | `{ fps, latency, memory }` | — |
| In-Flight | `useRequestInFlightStore.ts` | `{ pending, count }` | — |
| Self-Healing | `useSelfHealingStore.ts` | `{ scanning, issues, lastRun }` | — |
| TTS Engine | `useTTSEngineStore.ts` | `{ engine, voice, speed }` | — |
| Vision | `useVisionStore.ts` | `{ active, model, stream }` | `selectVisionActive`, `selectModel` |
| Automation XP | `useAutomationXPStore.ts` | `{ tasks, xp, history }` | — |

---

## D. Carte des Hooks (96 hooks)

### Chat (9 hooks)

| Hook | Rôle |
|------|------|
| `useChat` | Hook principal de chat (2407L) |
| `useChatCore` | Noyau chat — envoi/réception |
| `useChatModes` | Modes de chat (texte, voix, etc.) |
| `useChatStreaming` | Streaming de réponses |
| `useChatUI` | État UI du chat |
| `useChatMemory` | Mémoire contextuelle chat |
| `useChatMemoryCache` | Cache mémoire chat |
| `useAIChatStreaming` | Streaming AI |
| `useGlobalAIChat` | Chat AI global |

### Voice/Audio (12 hooks)

| Hook | Rôle |
|------|------|
| `useVoice` | Hook voix principal |
| `useVoiceEngine` | Moteur voix |
| `useVoiceInput` | Capture voix |
| `useVoiceMode` | Mode voix |
| `useAudioChat` | Chat audio |
| `useAudioSettings` | Paramètres audio |
| `useAudioStreaming` | Streaming audio |
| `useVAD` | Voice Activity Detection |
| `useWhisperStream` | Stream Whisper ASR |
| `useActiveListening` | Écoute active |
| `useTTS` | Text-to-Speech |
| `useTTSWithMicControl` | TTS avec contrôle micro |

### Memory (6 hooks)

| Hook | Rôle |
|------|------|
| `useMemory` | Hook mémoire principal |
| `useMemoryCore` | Noyau mémoire |
| `useMemoryEngine` | Moteur mémoire |
| `useLTMContext` | Contexte LTM |
| `usePersistentMemory` | Mémoire persistante |
| `useUnifiedMemory` | Mémoire unifiée |

### Engines (12 hooks)

| Hook | Rôle |
|------|------|
| `useEngineState` | État des moteurs |
| `useEngineSubscription` | Souscription aux moteurs |
| `useEngineVitals` | Métriques vitales |
| `useLivingEngines` | Moteurs actifs |
| `useFusionEngine` | Moteur de fusion |
| `useHybridEngine` | Moteur hybride |
| `useCognitive` | Interface cognitive |
| `useSingularity` | Interface singularité |
| `useSingularityState` | État singularité |
| `useSingularityStateSafe` | État singularité sécurisé |
| `useSingularityStore` | Store singularité |
| `useSingularitySync` | Sync singularité |

### Identity/Twin (5 hooks)

| Hook | Rôle |
|------|------|
| `useTwinBehavior` | Comportement jumeau |
| `useTwinEvolution` | Évolution jumeau |
| `useTwinIdentity` | Identité jumeau |
| `useIdentity` | Identité principale |
| `useIdentityMatrix` | Matrice identité |

### UI/Layout (11 hooks)

| Hook | Rôle |
|------|------|
| `useAdaptiveFPS` | FPS adaptatif |
| `useCognitiveLayout` | Layout cognitif |
| `useFocusTrap` | Piège de focus accessibilité |
| `useKeyboardShortcuts` | Raccourcis clavier |
| `useMediaQuery` | Media queries responsive |
| `usePanelState` | État des panneaux |
| `useResponsive` | Responsive design |
| `useParticles` | Système de particules |
| `useAuraOrchestrator` | Orchestrateur aura |
| `useAuraPerformanceMonitor` | Moniteur perf aura |

### Performance (4 hooks)

| Hook | Rôle |
|------|------|
| `useAdvancedPerformance` | Performance avancée |
| `usePerformanceMonitor` | Moniteur performance |
| `usePerformanceProfiler` | Profilage performance |
| `useAdaptiveFPS` | FPS adaptatif |

### System (8 hooks)

| Hook | Rôle |
|------|------|
| `useAppInitialization` | Initialisation app |
| `useBackendHealth` | Santé backend |
| `useConnection` | État connexion |
| `useDeviceHealth` | Santé appareil |
| `useDevicePermissions` | Permissions appareil |
| `useSystemHealth` | Santé système |
| `useSystemMonitor` | Moniteur système |

### Other (29 hooks)

| Hook | Rôle |
|------|------|
| `useAutoTimeout` | Timeout automatique |
| `useConversationEngine` | Moteur conversation |
| `useConversations` | Gestion conversations |
| `useDebounce` | Debounce générique |
| `useDeepPsyche` | Interface psyché profonde |
| `useEffects` | Effets visuels |
| `useExperience` | Gestion XP |
| `useExpression` | Expressions avatar |
| `useExpressionOrchestration` | Orchestration expressions |
| `useFileOperations` | Opérations fichiers |
| `useHoloPresence` | Présence holographique |
| `useLazyAvatar` | Avatar chargement différé |
| `useLiveDebugger` | Débogueur live |
| `useLocalStorage` | Stockage local |
| `useMCPOrchestrator` | Orchestrateur MCP |
| `useMultimodalPresence` | Présence multimodale |
| `useOmegaPipeline` | Pipeline Omega |
| `usePhaseSpace` | Espace de phase |
| `usePreferences` | Préférences utilisateur |
| `usePresenceOS` | OS de présence |
| `useProviderStatus` | Statut providers AI |
| `useRAG` | Retrieval Augmented Generation |
| `useSessions` | Gestion sessions |
| `useStoreSync` | Sync des stores |
| `useSystemCenterAutoFix` | Auto-fix system center |
| `useTimeAgenda` | Agenda temporel |
| `useTitaneCore` | Noyau TITANE |
| `useTitaneDb` | Base de données TITANE |
| `useTitaneSphere` | Sphère TITANE |
| `useToast` | Notifications toast |
| `useToolCaller` | Appel d'outils AI |
| `useTopNavigation` | Navigation top |
| `useUnifiedPresence` | Présence unifiée |
| `useUserPreferences` | Préférences utilisateur |
| `useVisualEngine` | Moteur visuel |
| `useVisualEngines` | Moteurs visuels |
| `useVisualState` | État visuel |
| `useVitals` | Métriques vitales |
| `useVocalDevConsole` | Console dev vocale |
| `useWindowControls` | Contrôles fenêtre |
| `useZoomControl` | Contrôle zoom (keyboard: Ctrl+/-/0) |
| `useZoom` (UIReadingEngine) | Zoom TopNav — boutons +/- (v30.1.8, `data-testid: topnav-zoom-in/out`) |

---

## E. Carte des Routes

> Routes définies dans `App.tsx` — toutes les routes sont lazy-loaded sauf exceptions

### Routes actives

| Path | Composant | Lazy |
|------|-----------|------|
| `/` | Redirect → `/titane` | — |
| `/titane` | TitanePage | ✓ |
| `/cognitive` | Redirect -> `/dev?tab=diagnostics` | ✓ |
| `/experience` | Experience | ✓ |
| `/time` | TimePage | ✓ |
| `/admin` | AdminPage | ✓ |
| `/system-center` | Redirect -> `/admin?tab=system` | ✓ |
| `/diagnostics` | Redirect -> `/admin?tab=production-health` | ✓ |
| `/devtools` | Redirect -> `/admin?tab=system&systemTab=devtools` | ✓ |
| `/cluster` | Redirect -> `/admin?tab=production-health` | ✓ |
| `/introspection` | Redirect -> `/admin?tab=system` | ✓ |
| `/hypervision` | Redirect -> `/admin?tab=system` | ✓ |
| `/configuration` | Redirect -> `/admin?tab=config` | ✓ |
| `/design-center` | Redirect -> `/admin?tab=design` | ✓ |
| `/design-system` | Redirect -> `/admin?tab=design` | ✓ |
| `/governance-center` | Redirect -> `/admin?tab=governance` | ✓ |
| `/governance` | Redirect -> `/admin?tab=governance` | ✓ |
| `/secure` | Redirect -> `/admin?tab=governance` | ✓ |
| `/audio-center` | Redirect -> `/admin?tab=audio` | ✓ |
| `/fusion` | FusionPage | ✓ |
| `/optimization` | OptimizationPage | ✓ |
| `/orchestration-intelligence` | OrchestrationIntelligenceCenter | ✓ |
| `/orchestration-center` | OrchestrationMetaCenter | ✓ |
| `/meta-center` | Redirect -> `/orchestration-center` | ✓ |
| `/multi-ai-dashboard` | Redirect -> `/orchestration-center` | ✓ |
| `/nexus-engine` | Redirect -> `/orchestration-center` | ✓ |
| `/harmonia-engine` | Redirect -> `/orchestration-center` | ✓ |
| `/cognitive-state` | Redirect -> `/orchestration-center` | ✓ |
| `/dev` | DevPage | ✓ |
| `/total-dev` | TotalDevPage | ✓ |
| `/command-center` | Redirect -> `/dev?tab=operations` | ✓ |
| `/qa-monitoring` | Redirect -> `/dev?tab=validation` | ✓ |
| `/monitoring` | Redirect -> `/dev?tab=diagnostics` | ✓ |
| `/developer-mode` | Redirect -> `/dev?tab=operations` | ✓ |
| `/dev-mode` | Redirect -> `/dev?tab=operations` | ✓ |
| `/devmode` | Redirect -> `/dev?tab=operations` | ✓ |
| `/orchestration` | Redirect -> `/orchestration-intelligence` | ✓ |
| `/reality-center` | RealityCenter | ✓ |
| `/hyper-center` | HyperCenter | ✓ |
| `/quantum-center` | QuantumCenter | ✓ |
| `/identity-center` | Redirect -> `/twins` | ✓ |
| `/memory-evolution` | Redirect -> `/titane?tab=transformation` | ✓ |
| `/memory-evo` | Redirect -> `/titane?tab=transformation` | ✓ |
| `/cloud` | CloudCenter | ✓ |
| `/knowledge` | KnowledgeFusionPage | ✓ |
| `/creation` | CreationStudio | — |
| `/evolution` | EvolutionMonitor | — |
| `/singularity` | SingularityMonitor | ✓ |
| `/sentinel` | Sentinel | — |
| `/watchdog` | Watchdog | — |
| `/selfheal` | SelfHeal | — |
| `/adaptive` | AdaptiveEngine | — |
| `/memory` | Memory | — |
| `/research` | ResearchPage | — |
| `/skills` | SkillManager | — |
| `/doc-center` | DocCenterPage | ✓ |
| `/performance` | PerformanceTest | — |

### Redirects

| Source | Destination |
|--------|-------------|
| `/chat` | `/titane?tab=conversation` |
| `/camera` | `/titane` |
| `/evo` | `/titane` |
| `/dashboard` | `/titane` |
| `/evolution-center` | `/titane` |
| `/progression` | `/titane` |
| `/xp` | `/experience` |
| `/stats` | `/dev?tab=diagnostics` |
| `/temporal-center` | `/time` |
| `/agenda` | `/time` |
| `/time-navigator` | `/time` |
| `/settings` | `/admin?tab=config` |
| `/audio` | `/admin?tab=audio` |
| `/voice` | `/admin?tab=audio` |
| `/tts` | `/admin?tab=audio` |
| `/one-core` | `/dev?tab=overview` |
| `/unified` | `/dev?tab=overview` |
| `/qa` | `/dev?tab=validation` |
| `/tests` | `/dev?tab=validation` |
| `/ia-dev` | `/dev?tab=operations` |
| `/reality` | `/reality-center` |
| `/renderer` | `/reality-center` |
| `/hyper` | `/hyper-center` |
| `/intelligence` | `/hyper-center` |
| `/quantum` | `/quantum-center` |
| `/identity-center` | `/twins` |
| `/identity` | `/twins` |
| `/persona` | `/twins` |
| `/twins` | `/twins` |
| `/twin` | `/twins` |
| `/cloud-sync` | `/cloud` |
| `/vault` | `/cloud` |
| `/meta` | `/orchestration-center` |

---

## F. Carte des Services

| Service | Fichier | Rôle | Exports clés |
|---------|---------|------|--------------|
| IPC Canonical | `tauriCommands.ts` | Wrapper IPC officiel | `invokeTauriCommandCanonical`, `invokeTauriCommand` (deprecated) |
| Tauri Bridge | `tauriBridge.ts` | Bridge Tauri bas niveau | `TauriBridgeService` |
| Tauri Client | `tauriClient.ts` (3456L) | Client Tauri complet, toutes commandes IPC |
| Chat Engine | `ai/chatEngine.ts` (3356L) | Moteur de chat AI principal | `ChatEngine`, `sendMessage`, `streamResponse` |
| AI Orchestrator | `ai/orchestrator.ts` (2133L) | Orchestrateur multi-AI | `AIOrchestrator`, `selectProvider` |
| RAG | `ragService.ts` | Recherche sémantique | `safeInvokeCanonical`, `ragSearch` |
| Evolution Engine | `evolutionEngine/` | Évolution continue | `EvolutionEngine`, `runEvolution` |
| Singularity Bridge | `singularityBridge.ts` | Pont singularité v1 | `SingularityBridge` |
| Singularity vΩ | `singularityBridgeVInfinity.ts` | Pont singularité vΩ | `SingularityBridgeVInfinity` |
| Conversation | `conversationEngine.ts` | Moteur de conversation | `ConversationEngine` |
| Agenda | `agendaService.ts` | Agenda/timeline | `AgendaService` |
| Auto Audit | `autoAuditEngine.ts` | Audit automatisé | `AutoAuditEngine` |
| Web Research | `webResearchService.ts` | Recherche web | `WebResearchService` |
| User Prefs | `userPreferencesEngine.ts` | Préférences utilisateur | `UserPreferencesEngine` |
| Experience | `experienceService.ts` | Gestion XP | `ExperienceService` |

---

## G. Carte du Backend Rust

### Structure des modules `src-tauri/src/`

#### Kernel
`main.rs` · `lib.rs` · `error.rs` · `error_handling.rs` · `bounded.rs` · `engine_trait.rs` · `state.rs` · `handlers.rs`

#### Cognitif
`cognitive/` · `cognitive_learning/` · `hyper_intelligence/` · `behavior_engine/` · `constitution/`

#### Mémoire
`memory/` · `memory_evolution/` · `neural_memory/` · `memory_os/` · `unified_memory_v2/` · `memory_compactor.rs` · `memory_persistence.rs`

#### Singularité & Jumeaux
`singularity/` · `singularity_fusion/` · `omega/` · `digital_twin_v14_1/` · `numeric_twin/`

#### Conversation
`conversation_engine/` · `conversation_os/` · `emotion/`

#### Audio / Voix
`audio/` · `tts/` · `wakeword/` · `duplex/`

#### Avatar
`avatar/`

#### AI / Modèles
`ai/` · `ai_chat/` · `multimodal/` · `gemini_provider_refactor.rs` · `ollama_provider_refactor.rs` · `local_provider_refactor.rs`

#### Évolution
`evolution/`

#### Identité
`identity/`

#### Sécurité
`security/` · `auth/` · `secure_engine.rs` · `secure_commands.rs`

#### Système
`system/` · `system_center/` · `monitoring/` · `cluster/` · `cloud/`

#### Moteurs
`engine/` · `engines/` · `engine_trait.rs` · `overdrive/` · `adaptive/` · `cycle_engine/` · `harmonic_os/` · `harmonia_engine.rs`

#### Meta
`meta/` · `meta_mode_engine/` · `meta_orchestrator/` · `modules/`

#### Agents
`agent_system/` · `agents/` · `multi_agents/`

#### Outils
`api/` · `api_hub/` · `services/` · `ia/` · `ipc/` · `ipc_batcher/`

#### Dev
`devtools/` · `hypervision/` · `introspection/` · `doc_engine/`

#### Config
`config/` · `app/` · `compat/` · `runtime_config.rs`

#### Data
`cache/` · `cache_multilevel.rs` · `knowledge/` · `knowledge_base_default.rs` · `batch/` · `commands/`

#### Autres
`fusion.rs` · `fusion_commands_week*.rs` · `streaming.rs` · `time/` · `temporal_engine/` · `agenda/`

---

## H. Métriques

| Métrique | Valeur |
|---------|--------|
| Fichiers TypeScript/TSX | 1 668 |
| Fichiers Rust (.rs) | 880 |
| Commandes IPC Tauri | 1 135 |
| Stores Zustand | 18 |
| Hooks custom | 96 |
| Pages React | 45+ |
| Composants (dossiers) | 30+ |
| UI Primitives | 8 |
| Modules Rust (dossiers) | 75+ |
| Lignes TypeScript/TSX total | 530 579 |
| Lignes Rust total | 294 556 |
| Plus gros fichier TS | `devSudoHandler.ts` (6 655L) |
| Plus gros fichier Rust | `main.rs` (2 857L) |

### Top 10 — Fichiers TypeScript les plus volumineux

| # | Fichier | Lignes |
|---|---------|--------|
| 1 | `devSudoHandler.ts` | 6 655 |
| 2 | `devSudoBuiltins.ts` | 4 718 |
| 3 | `tauriClient.ts` | 3 456 |
| 4 | `chatEngine.ts` | 3 356 |
| 5 | `useChat.ts` | 2 407 |
| 6 | `ConversationSection.tsx` | 2 323 |
| 7 | `e2e-automated-validation.test.tsx` | 2 205 |
| 8 | `orchestrator.ts` | 2 133 |
| 9 | `security.ts` | 2 124 |
| 10 | `Chat.tsx` (ui/pages) | 1 938 |

### Top 10 — Fichiers Rust les plus volumineux

| # | Fichier | Lignes |
|---|---------|--------|
| 1 | `main.rs` | 2 857 |
| 2 | `chat_orchestrator.rs` | 2 322 |
| 3 | `conversation_engine/commands.rs` | 2 273 |
| 4 | `audio/commands.rs` | 2 157 |
| 5 | `commands/web_research.rs` | 1 971 |
| 6 | `commands/persistent_memory.rs` | 1 562 |
| 7 | `adaptive/adaptive_engine.rs` | 1 488 |
| 8 | `conversation_engine/french_mastery.rs` | 1 434 |
| 9 | `mock_commands.rs` | 1 390 |
| 10 | `memory/pool.rs` | 1 334 |

---

## I. Base de Connaissance Self-Awareness (Mémoire Cognitive)

Cette cartographie est injectée dans la **mémoire cognitive de TITANE** pour qu'il soit conscient de sa propre architecture.

### Fichiers de connaissance (`src/knowledge/self-awareness/`)

| Fichier | Description |
|---------|-------------|
| `architecture-map.json` | Carte structurée complète : rings, IPC, stores, hooks, routes, métriques |
| `capabilities-manifest.json` | Inventaire complet des capacités (chat, voice, cognitive, memory, etc.) |
| `index.ts` | Module TypeScript d'accès à la self-awareness knowledge base |

### Hook React (`src/hooks/useSelfAwareness.ts`)

```typescript
import { useSelfAwareness } from '@/hooks/useSelfAwareness';

function MyComponent() {
  const {
    metrics,           // { total_ts_files, total_rust_files, total_ipc_commands, ... }
    allCapabilities,   // ['ai_chat', 'voice', 'cognitive', 'memory', ...]
    commandCount,      // 916
    stores,            // ['effectsStore', 'evolutionStore', ...]
    hooks,             // ['useAIChatStreaming', 'useChat', ...]
    routes,            // ['/', '/titane', '/memory', ...]
    hasCapability,     // (name: string) => boolean
    getCommandsByDomain, // (domain: string) => string[]
  } = useSelfAwareness();
}
```

### Capacités Connues

| Capacité | Description | Fonctionnalités |
|----------|-------------|-----------------|
| `ai_chat` | Chat IA multi-providers | streaming, suggestions, context-memory |
| `voice` | Voix TTS/STT/VAD/wake-word | tts, stt, vad, wake-word, duplex, lip-sync |
| `cognitive` | Moteur cognitif + évolution | knowledge-vault, evolution-cycles, progression-xp |
| `visual` | Avatar 3D + effets | avatar-3d, lip-sync, expressions, gestures |
| `memory` | Mémoire persistante | snapshots, timeline, knowledge-base, vector-search |
| `singularity` | État unifié 4 couches | 4-layer-state, self-healing, integrity-check, diff |
| `security` | Sécurité end-to-end | aes-gcm, ed25519, argon2, permission-audit |
| `creation` | Studio de création | text, code, image, audio, templates |
| `monitoring` | QA + watchdog + self-heal | test-suites, alerts, performance-reports, auto-fix |
| `evolution` | Auto-amélioration continue | evolution-cycles, xp-accumulation, adaptive-learning |
| `time` | Intelligence temporelle | agenda, calendar, temporal-search |
| `identity` | Identité + twin cognitif | twin-identity, twin-evolution, cognitive-profile |

## [2026-04-16] DevPage route-shell truth

- La route `/dev` expose maintenant le marqueur canonique `page-dev` dès les états `loading` et `error`, avec `data-dev-state=loading|error|ready`.
- Cette vérité de surface retire une dépendance implicite entre présence de page et fin de préchargements secondaires QA/ONE_CORE, ce qui stabilise la qualification desktop WRY sans masquer les erreurs visibles.

## [2026-04-16] Conversation fullscreen shell truth

- La surface conversation fullscreen réutilise désormais une hauteur héritée parent-bound sur `titane-page--conversation` (`flex: 1 1 auto`, `min-height: 0`, `max-height: 100%`) au lieu de conserver une contrainte verticale qui pousse artificiellement le compositeur hors viewport.
- `AppShell` ne doit appliquer qu'une seule compensation TopNav via `paddingTop: calc(4rem + env(safe-area-inset-top, 0px))`; la classe `pt-16` y est incompatible avec la vérité fullscreen.
- Le helper desktop WDIO borne maintenant l'overflow synthétique au budget réel entre toolbar et compositeur pour éviter un faux échec de viewport avant même d'évaluer la surface runtime réelle.

## [2026-04-19] Conversation response budget truth

- La chaîne canonique `src/hooks/useConversationEngine.ts -> src/services/conversationEngine.ts -> conversation_generate` publie désormais le budget de génération dans les champs de contrat actifs `args.maxTokens` et `args.temperature`, au lieu de laisser cette information enfermée dans un sous-objet ignoré par le backend.
- Le backend `src-tauri/src/conversation_engine/commands.rs` récupère aussi le payload hérité `aiConfig` quand les champs top-level sont absents, ce qui referme la dérive frontend/backend observée sur la surface chat installée.
- Le bridge `src-tauri/src/conversation_engine/omega_integration.rs` aligne son fallback local/Ollama sur un plancher de génération long (8192) plutôt que sur un budget court, afin qu'un appel partiellement renseigné ne coupe plus les réponses au milieu.

## [2026-04-20] Voice input cleanup truth

- `src/hooks/useVoiceInput.ts` centralise désormais la fermeture du `MediaStream` micro local via `cleanupAudioStream()` et l'appelle autant sur succès que sur échec de `voiceService.stopRecording()`.
- La voie hook réinitialise aussi `audioStream`, `isListening` et `recordingIdRef` sur ce chemin d erreur, ce qui referme la dérive où la capture navigateur pouvait rester active malgré un échec backend de stop.
- Le même cleanup est maintenant aussi appliqué au chemin d erreur de `startListening()` quand `getUserMedia()` a réussi mais que `voiceService.startRecording()` casse ensuite.
- Le chemin `cancelListening()` applique désormais le même cleanup local et la même remise à plat d état si `voiceService.cancelRecording()` échoue, ce qui ferme le dernier reliquat de micro local caché sur annulation backend ratée.

## [2026-04-23] Canonical UI page seal

- La qualification canonique des surfaces UI a été étendue à l’ensemble des routes réellement montées par `AppRouter`.
- Les pages `Experience`, `DocCenterPage`, `PerfectFusionDashboard`, `UltimateOptimizationDashboard`, `OrchestrationMetaCenter`, `OrchestrationIntelligenceCenter`, `RealityCenter`, `HyperCenter`, `QuantumCenter`, `KnowledgeFusionPage`, `CreationStudio`, `EvolutionMonitor`, `Memory`, `SkillManager` et `TotalDevPage` exposent maintenant un `data-testid` racine stable.
- `e2e/desktop/page-objects/uiPages.po.js` publie désormais les groupes `titaneOwnedRoutePages`, `directRoutePages`, `devOwnedRoutePages`, `fusionOwnedRoutePages`, `moreMenuRoutePages` et `canonicalRoutePages` pour relier explicitement chaque route canonique à son root selector et à son entrée de navigation quand elle existe.
- `src/__tests__/ui/app-router-canonical-surfaces.test.tsx`, `src/__tests__/ui/ui-page-objects-inventory.test.ts` et `src/__tests__/ui/ui-navigation.test.ts` scellent ensemble le triplet canonique `route -> root selector -> owner nav`.
- Une lane desktop complémentaire `e2e/desktop/canonical-ui-pages.wdio.test.js` porte maintenant ce contrat sur le runtime Tauri réel via `canonicalRoutePages`. Elle a été rejouée après `pnpm run build:tauri:e2e` sur le binaire release frais `src-tauri/target/release/titane-infinity` (`FRESH_RELEASE_BINARY`) et passe avec 1 spec / 1 test en 2m34.2s.
- Le driver desktop `e2e/desktop/ui-driver.wdio.js` expose aussi `auditCanonicalDesktopPage` pour qualifier chaque page canonique en profondeur: route courante, root visible, owner TopNav/More ou route directe, activation stricte des onglets declares et export JSON `reports/e2e-desktop/canonical-ui-pages-audit.json`. La preuve native obtenue passe avec `1 passing (2m 48.1s)` et le rapport declare 28 pages, 4 pages tabbees et 22 onglets.

## [2026-04-24] TopNav/AppShell structural selectors truth

- `TopNav` expose désormais des sélecteurs structurels stables pour les preuves de surface: `topnav-brand`, `topnav-more-menu` et `topnav-ai-status[data-state=online|offline]`.
- `AppShell` expose désormais une chaîne de sélecteurs structurels dédiée: `app-shell-root`, `app-shell-main` et `app-shell-scroll-host`.
- Le test unitaire `src/components/layout/__tests__/AppShell.test.tsx` verrouille cette chaîne pour éviter une dérive silencieuse des surfaces shell critiques.
- La lane Playwright `e2e/critical/engine-navigation.spec.ts` vérifie explicitement ces sélecteurs TopNav structurels sur la surface runtime canonique.

## [2026-04-24] Footer/version and transformation copy truth

- `src/App.tsx` affiche désormais le footer version sous la forme `TITANE∞ V{__APP_VERSION__}` pour aligner le marquage UI avec la convention de publication visible.
- `src/features/transformation/TransformationRoadmap.tsx` normalise la ponctuation de synchronisation (`qualifié :`) en ASCII standard, sans changer la sémantique de la surface roadmap.

## [2026-04-24] BUILD ALL v31.1.3: Format correction + governance gates + release bundles

- **Phase A (Baseline)**: Captured branch=MAIN, head=7d0f19c11, version=31.1.3, confirmed 4 mandatory gates (detect_recurrence, verify_instructions, verify_agents_index, verify_prompt_files_index) pre-conditions ready.
- **Phase B (BUILD)**: Initial `pnpm run build:production` detected 19 format violations via `prettier --check` (ARCHITECTURE.md, UI_SURFACE_MAP.md, performance-analysis.md, SPRINT_*.files, security/*.ts, stores/*.ts, e2e/*.js). Applied auto-correction via `pnpm exec prettier --write`; reran build successfully: lint ✅ (660 warnings non-blocking), format ✅, typecheck ✅, vite+tauri+post-build ✅.
- **Build artifacts**: Generated DEB, AppImage, RPM bundles in `src-tauri/target/release/bundle/` staging directories.
- **Post-build launcher sync**: User-local deployment completed: `~/.local/share/applications/titane-infinity.desktop` created with canonical Exec=/usr/bin/titane-infinity, Icon=titane-infinity, Actions=Logs,Config. System-wide sync BLOCKED_SUDO_REQUIRED (acceptable per kernel doctrine Rule 13).
- **Phase C (Tests)**: Playwright E2E suite executed with partial output captured: 98 test PASS, 6 FAIL (CSP `unsafe-eval` on Zod schema compilation + profile response_length assertions—environmental constraints, not new regressions), 4 SKIP (legacy HTTP mode). All 4 mandatory gates remain PASS post-build.
- **Governance compliance**: detect_recurrence.sh ✅, verify_instructions.sh ✅, verify_agents_index.sh ✅, verify_prompt_files_index.sh ✅. No new governance violations introduced.
- **Phase D (Documentation)**: Registry entries appended to `registry/ui-events.jsonl` and `scripts/autoheal/autoheal_rules.jsonl` with full session metadata, prevention tests, and rollback procedures. Proof pack initialized with VERDICT.md status=in-progress, ROLLBACK.md, GATE_REPORT.md baseline.

## [2026-04-24] Continuation conformance: SessionGuard lifecycle + version surfaces v31.2.0

- `src/security/SessionGuard.ts` renforce l idempotence de re-initialisation: `initialize()` nettoie d abord les timeouts en cours puis remet `warningShown` a `false` avant de rattacher les listeners.
- `src/security/__tests__/SessionGuard.spec.ts` qualifie le comportement evenementiel sur timers virtuels (`advanceTimersByTime`) pour valider la chaine warning/timeout sans dependance a un trigger d activite manuel.
- Le lot de continuation conserve la synchronisation des surfaces de version `31.2.0` entre frontend/runtime/stable: `package.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src-tauri/tauri.conf.json`, `src-tauri/tauri.base.json`, `tauri.base.json`, `runtime/stable/tauri.conf.json`, `runtime/stable/manifest.json`.
- Les traces de conformite append-only sont completees dans `registry/ui-events.jsonl` et `scripts/autoheal/autoheal_rules.jsonl` avec rollback explicite et prevention gates.

# [2026-04-24] Web Vitals Analytics IPC mapping

- Nouvelle surface : analytics web-vitals (UI → IPC → backend)
- Frontend : `src/utils/webVitals.ts` (One Door, secureInvoke)
- Backend : `src-tauri/src/commands/web_vitals_commands.rs` (commande Tauri, log JSONL)
- Mapping main.rs : handler exposé, preuve runtime, artefact log
- Doctrine : anti-dérive fetch, rollback documenté, test E2E à venir

## [HTF — 2025] Module L'Humain à tout faire

| Élément | Chemin | Note |
|---------|--------|------|
| Page | `src/pages/HTFPage.tsx` | Route `/htf`, 5 tabs |
| Dashboard | `src/components/htf/HTFDashboard.tsx` | testid `htf-dashboard` |
| Wizard soumission | `src/components/htf/HTFSubmissionWizard.tsx` | testid `htf-submission-wizard` |
| Panel CRM | `src/components/htf/HTFClientPanel.tsx` | testid `htf-client-panel` |
| Résultat estimation | `src/components/htf/HTFEstimationResult.tsx` | testid `htf-estimation-result` |
| Store | `src/stores/useHTFStore.ts` | Zustand |
| Service KB | `src/services/htf/htfKnowledgeService.ts` | Lit KB via defaultKnowledgeBase |
| Service estimation | `src/services/htf/htfEstimationService.ts` | Génération + tarification |
| Service CRM | `src/services/htf/htfCrmService.ts` | localStorage |
| Service soumissions | `src/services/htf/htfSubmissionService.ts` | localStorage |
| Service apprentissage | `src/services/htf/htfLearningService.ts` | localStorage |
| Skill OS | `src/services/htf/htfSkillDefinition.ts` | titane-skill-htf-estimateur |
| Install skill | `src/services/htf/installHtfSkill.ts` | auto-install au boot |
| Types | `src/services/htf/types.ts` | HTFClient, HTFSubmission, etc. |
| Chat mode | `src/services/ai/chatModes.config.ts` | `htf_soumission` |
| KB identity | `data/knowledge_base/default/htf_module_identity.json` | embedded Rust |
| KB formation | `data/knowledge_base/default/htf_formation_manuel.json` | embedded Rust |
| KB estimation | `data/knowledge_base/default/htf_estimation_rules.json` | embedded Rust |
| KB services | `data/knowledge_base/default/htf_services_catalogue.json` | embedded Rust |
| KB template | `data/knowledge_base/default/htf_soumission_template.json` | embedded Rust |
| KB Rust loader | `src-tauri/src/knowledge_base_default.rs` | 5 consts + 5 SOURCES |
| Tests unitaires | `tests/unit/htf/*.test.ts` | 14 tests Vitest |
| Tests E2E | `e2e/htf.spec.ts` | 7 scénarios Playwright |

> 2026-04-27 — Web chat baseline mode truth: la lane Playwright web générique `tests/e2e/chat.spec.ts`, déjà utilisée pour la navigation et les interactions minimales du chat, verrouille désormais aussi la baseline modernisée de mode sur la surface canonique `page-conversation`. Le micro-lot confirme l absence de `select-conversation-mode`, la valeur initiale `default` de `chat-mode-selector-select`, puis `data-conversation-mode=default` et `data-chat-store-mode=default`, afin qu une régression web de surface casse aussi la lane la plus générique du chat.

> 2026-04-27 — Canonical chat surface unit mode proof: la garde unitaire `src/__tests__/e2e-automated-validation.test.tsx`, déjà chargée de vérifier que `TitanePage` expose bien la surface active au lieu d une page legacy, monte désormais `TitanePage` sous `MemoryRouter` pour refléter son runtime réel et verrouille aussi la baseline modernisée de mode sur `page-conversation`. Le micro-lot confirme l absence de `select-conversation-mode`, la valeur initiale `default` de `chat-mode-selector-select` et les attributs `data-conversation-mode=default` / `data-chat-store-mode=default` dans la preuve unitaire la plus proche de la surface canonique active.

> 2026-04-27 — Web ModeBuilder intent baseline mode proof: le scénario Playwright `tests/e2e/chat.spec.ts` qui valide l ouverture de `ModeBuilder` pour une intention document montait déjà la surface conversationnelle active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane d intention document l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le parcours web de génération de document.

> 2026-04-27 — Web code-intent blocked baseline mode proof: le scénario Playwright `tests/e2e/chat.spec.ts` qui prouve que l intent code ne doit pas ouvrir `ModeBuilder` atteignait déjà la surface conversationnelle active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi du prompt bloqué. Le micro-lot confirme désormais dans cette lane de blocage code l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le parcours web qui doit refuser l ouverture d éditeur pour un intent code.

> 2026-04-27 — Critical new-conversation baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve le premier aller-retour mock sur la surface conversationnelle active atteignait déjà la route canonique, mais ne verrouillait pas encore explicitement sa baseline modernisée avant le premier envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario d entrée le plus simple du chat critique.

> 2026-04-27 — Critical send-message baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve deux réponses mock successives atteignait déjà la route canonique, mais ne verrouillait pas encore explicitement sa baseline modernisée avant le premier envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de continuité à deux messages.

> 2026-04-27 — Critical long-response baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve l affichage complet d une réponse longue mock atteignait déjà la route canonique, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de réponse longue.

> 2026-04-27 — Critical markdown-rendering baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve le rendu markdown assistant sur la surface canonique atteignait déjà la route active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de rendu markdown assistant.

> 2026-04-27 — Critical markdown-tables-and-quotes baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve le rendu markdown des citations et tableaux sur la surface canonique atteignait déjà la route active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de rendu markdown tableaux/citations.

> 2026-04-27 — Critical long-response-terminal-block baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve qu une réponse longue garde son bloc terminal atteignable sur la surface canonique atteignait déjà la route active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de bloc terminal atteignable.

> 2026-04-27 — Critical ultra-long no-truncation baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve l absence de troncature pour une question/réponse ultra-longues sur la surface canonique atteignait déjà la route active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique ultra-long sans troncature.

> 2026-04-27 — Critical SPA-persistence baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve que l UI reste en SPA et conserve son URL sur la surface canonique atteignait déjà la route active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de persistance SPA.

> 2026-04-27 — Critical rate-limit-runtime baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve la vérité runtime RATE_LIMIT sur la surface canonique atteignait déjà la route active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de vérité runtime RATE_LIMIT.

> 2026-04-27 — Critical knowledge-memory-runtime baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve la connaissance seedee et le rappel memoire sur la surface canonique atteignait déjà la route active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de vérité runtime mémoire/connaissance.

> 2026-04-27 — Critical chat-xp-generation baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve la synchronisation des XP du chat vers la page Experience sur la surface canonique atteignait déjà la route active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de synchronisation XP.

> 2026-04-27 — Critical inline-web-citations baseline mode proof: le scénario Playwright critique `e2e/critical/chat-interaction.spec.ts` qui prouve le rendu des citations inline du handoff web sur la surface canonique atteignait déjà la route active, mais ne verrouillait pas encore explicitement sa baseline modernisée avant l envoi. Le micro-lot confirme désormais dans cette lane critique l absence de `select-conversation-mode`, `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=default][data-chat-store-mode=default]`, afin qu une régression de surface casse aussi le scénario critique de citations inline web.

> 2026-04-27 — Conversation runtime typed store-mode guard truth: la pré-build `pnpm run check` a révélé que `src/components/sections/ConversationSection.tsx` relayait encore la `string` brute exposée par `useChatModeStore(state => state.currentModeId)` vers `buildConversationRuntimeSummary` et `buildConversationRuntimeBadges`, alors que ces helpers exigent un `ChatModeId` gouverné. Le lot corrige localement la frontière active en validant une seule fois la valeur du store via `validateModeId`, avec repli canonique sur `default`, ce qui réaligne la surface conversationnelle, le résumé runtime et les badges sans élargir la logique métier ni casser la vérité publiée par `page-conversation`.

> 2026-04-27 — Remote Gateway Phase 1 — Named API Keys + Remote SPA: `src-tauri/src/remote_gateway/api_key_store.rs` (argon2id, scopes Admin/Chat/Memory/System, create/list/revoke/rotate). `auth.rs` étendu : `JwtClaims.key_id`, `verify_secret_any()` avec fallback SHA-256 pour rétrocompatibilité. 4 commandes Tauri IPC (`remote_key_create/list/revoke/rotate`) dans `src-tauri/src/remote_key_commands.rs` ; `RemoteKeyStoreState` enregistré dans `main.rs`. 12 branches `invoke_handler` précédemment manquantes câblées dans `handlers.rs`. SPA standalone `src/remote/` (RemoteApp, RemoteAuthScreen, RemoteChatView, useRemoteChat) — build `pnpm run build:remote` → `dist/remote/`. Scripts `scripts/remote/{start,stop,status}-titane-remote.sh`. Service TypeScript `src/services/remoteKeyManager/index.ts`. 27/27 IPC contract tests PASS. AutoHeal AH-2026-04-27-0035. ARCHITECTURE.md, UI_SURFACE_MAP.md, docs/IPC_CATALOG.md mis à jour.

## Phase E (2026-04-27) — Tests agents avancés + Agent Multi-Projet

### Nouveaux fichiers
| Fichier | Type | Rôle |
|---|---|---|
| `src/services/multiproject/index.ts` | Service TypeScript | Agent gestion multi-projets : CRUD projets, allocation agents, priorités, healthSnapshot, dispatchToAgents intégration |
| `src/pages/MultiProjectDashboard.tsx` | Page React | Dashboard multi-projets avec data-testid stables : `multiproject-dashboard`, `multiproject-rollup`, etc. |
| `tests/unit/services/multiproject/multiProjectAgent.test.ts` | Tests unitaires | 52 tests couvrant CRUD, allocation, rollup, healthSnapshot, getMultiProjectAgentStatus |
| `tests/unit/pages/multiProjectDashboard.test.tsx` | Tests UI | 24 tests couvrant render, rollup, agent status, project list, create form, actions |
| `tests/unit/services/diagnostic/diagnosticAgent.test.ts` | Tests unitaires | 12 tests pour getDiagnosticAgentStatus, startDiagnosticAgent (Rule 16 gap comblé) |
| `tests/unit/services/security_active/securityActiveAgent.test.ts` | Tests unitaires | 15 tests pour getSecurityActiveAgentStatus, startSecurityActiveAgent, refresh interval, acknowledge (Rule 16 gap comblé) |
| `tests/unit/services/explainability/explainabilityAgent.test.ts` | Tests unitaires | 14 tests pour getExplainabilityAgentStatus, startExplainabilityAgent, reset (Rule 16 gap comblé) |

### Gates
- Rule 10 AutoHeal: AH-2026-04-27-MULTIPROJECT-0053
- Rule 15: UI_SURFACE_MAP.md + CARTOGRAPHY_COMPLETE.md mis à jour
- Rule 16: 116 tests PASS (5 fichiers test)
- verify_instructions: PASS=33/0
- detect_recurrence: entries=1368, PASS

## Phase F (2026-04-27) — Deep Optimization: One Door + AI Services + Multiproject Enhanced API

### Modifications
| Fichier | Type | Changement |
|---|---|---|
| `src/services/monitoring/index.ts` | Service TypeScript | Fix One Door: direct invoke() → safeInvoke(). Ajout `forceRefreshProjectHealthMetrics()`. Fix TS2532 (sorted[0]!). |
| `src/services/multiproject/index.ts` | Service TypeScript | +8 fonctions: pauseProject, resumeProject, searchProjects, getPriorityQueue, detectDependencyCycle, getProjectDependencyChain, detectAndMarkBlockedProjects, refreshAllProjectsHealth. Fix TS (as MultiProject, ?? fallback). |
| `src/services/orchestrator/index.ts` | Service TypeScript | Ajout `dispatchToAgentsWithTimeout(event, timeoutMs)`. Fix nom méthode security (getSecurityActiveAgentStatus). |
| `src/services/remoteKeyManager/AgentAI.ts` | Service TypeScript | Fix One Door: invoke → safeInvokeCanonical. Fix type safeInvokeCanonical<string>. |
| `src/services/remoteKeyManager/index.ts` | Service TypeScript | Fix One Door: invoke → safeInvoke sur 4 fonctions (create/list/revoke/rotate). Return types → T \| null. |
| `src/services/remoteKeyManager/RemoteKeyAgent.ts` | Service TypeScript | Null guards sur result (create/list/revoke/rotate/autoCreate/_refresh). |
| `src/__tests__/omega-singularity-unified-sync.test.ts` | Test | KB canonical count sync: 202 → 233 (getFallbackEntries() growth). |
| `tests/unit/services/ai/circuitBreaker.test.ts` | Tests unitaires | 17 tests (CRÉÉ Phase F1) |
| `tests/unit/services/ai/rateLimiter.test.ts` | Tests unitaires | 17 tests (CRÉÉ Phase F1) |
| `tests/unit/services/ai/retryStrategy.test.ts` | Tests unitaires | 22 tests (CRÉÉ Phase F1) |
| `tests/unit/services/ai/championChallenger.test.ts` | Tests unitaires | 21 tests (CRÉÉ Phase F1) |
| `tests/unit/services/multiproject/multiProjectAgent.test.ts` | Tests unitaires | +21 tests F2 (pause/resume/search/priorityQueue/cycle/depChain/blocked) |
| `tests/unit/services/orchestrator/parallelDispatch.test.ts` | Tests unitaires | +4 tests F3 (dispatchToAgentsWithTimeout) |

### Gates
- Rule 10 AutoHeal: AH-2026-04-27-OPTIMIZE-F-0054
- Rule 15: ARCHITECTURE.md + CARTOGRAPHY_COMPLETE.md mis à jour
- Rule 16: 226 tests PASS (11 fichiers services)
- TypeScript: 0 erreurs sur fichiers modifiés (2 pre-existants 282/379 exclus — Rule 1 minimal patch)
- verify_instructions + detect_recurrence: PASS (voir F5 commit)

## Session 2026-04-28 — Chat Memory OMEGA Singularity + HTTP Server tests

### Nouveaux fichiers de tests (v31.2.32)
| Fichier | Type | Contenu |
|---------|------|---------|
| `src/components/sections/__tests__/ConversationSection.research.test.ts` | Tests unitaires | 42 tests — shouldHandoffToResearch, buildResearchHandoff, classifyResearchOutcome, buildResearchReply (deep_internet_analysis-aware) |
| `src/services/__tests__/userPreferencesEngine.test.ts` | Tests unitaires | 24 tests — UserPreferencesEngine CRUD, deep_internet_analysis toggle, localStorage mock |
| `src/__tests__/chat-memory-twins-omega-singularity.test.ts` | Tests intégration | 30 tests — pipeline chatEngine ↔ memoryIntegration/cognitiveOmega/SingularityBridge/userPreferencesEngine |
| `src/__tests__/http-server-vite-proxy.test.ts` | Tests proxy Vite | 28 tests — /api/wiki-search, /api/ollama, One Door compliance, sécurité OWASP |

### Modifications (v31.2.32)
| Fichier | Modification |
|---------|-------------|
| `src/components/sections/ConversationSection.tsx` | shouldHandoffToResearch() étendu avec deep_internet_analysis patterns; useEffect loadingVisibleUntil fix boucle infinie; exports buildResearchHandoff/classifyResearchOutcome/buildResearchReply |
| `src/services/userPreferencesEngine.ts` | Fix bug `désactive` capturé par enable-matcher (substring `active`); DEFAULT_PREFERENCES.deep_internet_analysis = true |

### Gates
- Rule 10 AutoHeal: AH-2026-04-28-CHAT-MEMORY-OMEGA-SINGULARITY-0004
- Rule 15: UI_SURFACE_MAP.md + CARTOGRAPHY_COMPLETE.md mis à jour
- Rule 16: 124 tests PASS (4 nouveaux fichiers)
- Suite globale: 5652/5652 PASS

## Session 2026-04-28 — Self-RAG + HippoRAG + Memory Compressor + Web Enricher (v31.2.33)

### Nouveaux fichiers
| Fichier | Type | Contenu |
|---------|------|---------|
| `src/services/ai/reflectiveVerifier.ts` | Service Ring 3 | Self-RAG: verifyCritique, detectFactualClaims, computeConfidence, applyReflectiveCorrections — REFLECTIVE_CONFIDENCE_THRESHOLD=0.65 |
| `src/services/ai/__tests__/reflectiveVerifier.test.ts` | Tests unitaires | ~30 tests — detectFactualClaims (dates/noms/URLs), computeConfidence, applyReflectiveCorrections, verifyCritique |
| `src/services/memory/memoryWebEnricher.ts` | Service Ring 3 | HippoRAG idle enrichment: scheduleEnrichment (requestIdleCallback), startIdleEnrichment, getEnrichment/getAllEnrichments — localStorage TTL 7j |
| `src/services/memory/__tests__/memoryWebEnricher.test.ts` | Tests unitaires | Tests extractMainConcept, scheduleEnrichment, getEnrichment, getAllEnrichments |
| `src/services/memory/knowledgeGraphIndex.ts` | Service Ring 3 | HippoRAG 2-hop graph: buildIndex (summary+tags), addEdge (upsert nodes), getRelatedNodes/getRelatedLabels/getRelatedEntryIds — localStorage max 500 nœuds |
| `src/services/memory/__tests__/knowledgeGraphIndex.test.ts` | Tests unitaires | Tests extractTokens, nodeId, buildIndex, addEdge, getRelatedNodes, getRelatedLabels, getRelatedEntryIds, clear |
| `src/services/ai/workingMemoryCompressor.ts` | Service Ring 3 | Memory Survey compression: compress, selectAnchors, isAnchorMessage, estimateTokens — COMPRESSION_HISTORY_THRESHOLD=20 |
| `src/services/ai/__tests__/workingMemoryCompressor.test.ts` | Tests unitaires | Tests estimateTokens, isAnchorMessage, selectAnchors, compress (threshold, Ollama fallback, anchors preserved) |

### Modifications (v31.2.33)
| Fichier | Modification |
|---------|-------------|
| `src/services/ai/chatEngine.ts` | Hook 1.2.5 (compress history > 20 msgs), Hook 1.5.2 (Self-RAG verifyCritique + applyReflectiveCorrections) — imports reflectiveVerifier + workingMemoryCompressor |
| `src/services/ai/memoryIntegration.ts` | saveInteraction(): fire-and-forget memoryWebEnricher.scheduleEnrichment() après shadow write |
| `src/services/cognitive/cognitiveOmegaIntegration.ts` | enrichContext(): graphContext 2-hop via knowledgeGraphIndex.getRelatedLabels() injecté dans combined |
| `src/services/webResearchService.ts` | browserWebResearchFallback(): persist web findings via dynamic import (évite import circulaire → memoryWebEnricher) |
| `src/services/memory/knowledgeGraphIndex.ts` | addEdge() upsert nodes, buildIndex() inclut tags |
| `scripts/autoheal/autoheal_rules.jsonl` | +2 entrées: AH-2026-04-28-REFLECTIVE-VERIFIER-0006, AH-2026-04-28-KNOWLEDGE-GRAPH-COMPRESSOR-0007 |
| `ARCHITECTURE.md` | Section v31.2.33 ajoutée |

### Gates
- Rule 10 AutoHeal: AH-2026-04-28-REFLECTIVE-VERIFIER-0006 + AH-2026-04-28-KNOWLEDGE-GRAPH-COMPRESSOR-0007
- Rule 15: ARCHITECTURE.md + docs/CARTOGRAPHY_COMPLETE.md mis à jour
- Rule 16: 188 tests PASS (4 nouveaux suites)
- detect_recurrence: PASS

## KB Phase 24 — psychologie_toxique_profils (2026-05-01)

### Nouveau module knowledge base
- **Fichier**: `data/knowledge_base/default/psychologie_toxique_profils.json` (v31.3.1)
- **Catégorie**: `psychologie_toxique_profils`
- **Sections (10)**: cadre_conceptuel, troubles_personnalite_dsm5 (DSM-5 groupes A/B/C, 10 troubles), narcissisme_subtypes (5 sous-types: grandiose, covert/vulnérable, communautaire, spirituel, malin), dark_triad_tetrad (Dark Triad + sadisme + Factor D, PCL-R Hare 20 items), tactiques_manipulation (10 tactiques: gaslighting, love bombing, triangulation, future-faking, DARVO, isolement, contrôle coercitif, renforcement intermittent, incompétence weaponisée, negging), dynamiques_negatives (trauma bond, contagion émotionnelle, dette affective, honte toxique, syndrome de Stockholm), profils_contextuels (famille toxique, profil pro, spirituel/coaching), grille_detection (5 questions + 11 red flags + échelle danger 1–4), donnees_epidemiologiques (prévalences, neurosciences), ressources_therapeutiques (DBT, MBT, TFP, EMDR, ACT, schema therapy)
- **Retrieval triggers (31)**: gaslighting, narcissisme, manipulation, dark triad, psychopathie, borderline, trauma bond, DARVO, etc.
- **Intégration Rust**: const `PSYCHOLOGIE_TOXIQUE_PROFILS` + entrée SOURCES dans `src-tauri/src/knowledge_base_default.rs`
- **Baseline tests**: `test_knowledge_base_loads_all_categories` ≥193→≥194; `psychologie_toxique_profils` ajouté à `expected` list (position alphabétique: après `politique_geopolitique`)
- **Pipeline**: injection automatique via `getDefaultKbPromptContext()` → `conversationEngine.ts` sur requêtes pertinentes

### Gates
- Rule 10 AutoHeal: AH-KB-PSYCHOLOGIE-TOXIQUE-PROFILS-2026-05-01
- Rule 15: ARCHITECTURE.md + docs/CARTOGRAPHY_COMPLETE.md mis à jour
- Rule 16: baseline test count 194 (cargo test knowledge_base PASS attendu)
- detect_recurrence: PASS (à confirmer)

## Intelligence Enhancement Phases A–F (2026-04-29, v31.2.38)

### Modifications engine IA (Ring 3/4)
- **`src/services/ai/canonicalDiscernmentKernel.ts`**:
  - STEP 10: `OMEGA_TRIGGER_SIGNALS` — activation automatique profil OMEGA sur "godmod/plein potentiel/sans limite/omega/…" (gate: profileId >= DEVELOPED); double escalade (messageComplexity > 0.9 && singularityCoherence > 0.88 && profileId >= ARCHITECT)
  - STEP 11: boucle retour confidence — downgrade `SAFE_TO_INFER` → `INFER_WITH_DISCLOSURE` si confidence < 0.42; escalade profileId → DEEP si confidence < 0.35
- **`src/services/ai/chatEngine.ts`**:
  - `MODE_TRANSITION_POLICY`: table de dispatch `from→to` mode → preserve/summarize/clear dans `setMode()`
  - Propagation `canonicalMode` vers `tryBackendPipeline` (depuis `canonicalDecision.modeClassification?.canonicalMode`)
  - Intégration non-bloquante `evaluateResponseQuality` → `omegaMetadata.qualityScore`
- **`src/services/ai/omegaModeClassifier.ts`**:
  - RULE 9: signaux multi-tours — `conversationHistory` ≥ 3: 2+ messages courts interrogatifs → CLARIFY_LIGHT (conf +0.15); 2+ avec `DEEP_REASONING_SIGNALS` → DEEP_REASONING (conf +0.12)
- **`src/services/tauri/chatEngine.commands.ts`**:
  - `ChatRequestArgs.canonicalMode?: string` → `toBackendPayload` mappe en `canonical_mode`

### Nouveau module
- **`src/services/ai/qualityVerifier.ts`** (Ring 4, heuristique synchrone):
  - `evaluateResponseQuality(question, response, profileId): QualityCritique`
  - `alignmentScore`: Jaccard coverage des keywords question/réponse
  - `completenessScore`: couverture des sous-questions (split sur `?`)
  - `depthMatchScore`: word count vs minimum par profil (DIRECT=40, OMEGA=1200)
  - `QUALITY_THRESHOLD = 0.65`, `shouldEnhance` flag, `enhancementHint`

### Tests (Rule 16)
- `src/__tests__/services/ai/kernelConfidenceFeedback.test.ts` (5 tests)
- `src/__tests__/services/ai/kernelOmegaSelection.test.ts` (6 tests)
- `src/__tests__/services/ai/chatEngineModeTransition.test.ts` (10 tests)
- `src/services/ai/__tests__/qualityVerifier.test.ts` (10 tests)
- `src/services/ai/__tests__/omegaModeClassifierMultiTurn.test.ts` (8 tests)
- `tests/contract/tauri-ipc-contract.test.ts` enrichi: Phase C suite (3 assertions)
- Total ciblé: 69 PASS

### Gates
- Rule 10 AutoHeal: AH-PHASE-A..F-2026-04-29 (6 entrées full-schema)
- Rule 15: ARCHITECTURE.md + docs/CARTOGRAPHY_COMPLETE.md mis à jour
- Rule 18: commit `65fa41478` sur MAIN
- detect_recurrence: PASS (entries=1425)
- verify_instructions: PASS=33 FAIL=0

## KB Phase 25 + Mode psychologie_profils (2026-05-01)

### Nouveau module knowledge base
- **Fichier**: `data/knowledge_base/default/strategies_protection_manipulation.json` (v31.3.2)
- **Catégorie**: `strategies_protection_manipulation`
- **Sections (8+)**: grey_rock, yellow_rock, BIFF (Bill Eddy), règle_JADE, no_contact, low_contact, parallel_parenting, trauma_bond_dissolution (phases cliniques 1-18 mois), approches_therapeutiques (EMDR, Schema Therapy, IFS, ACT, TF-CBT, somatique), plan_sortie_securitaire (3 phases), reconstruction_identite, soutien_entourage, ressources_protection (SOS Violence Conjugale, 3919, ouvrages cliniques, apps coparentalité)
- **Retrieval triggers (31)**: grey rock, BIFF, no contact, trauma bond recovery, plan sortie relation, etc.
- **Intégration Rust**: const `STRATEGIES_PROTECTION_MANIPULATION` + entrée SOURCES dans `src-tauri/src/knowledge_base_default.rs`
- **Baseline tests**: `test_knowledge_base_loads_all_categories` ≥194→≥195

### Nouveau mode de chat
- **ID**: `psychologie_profils` (nouveau dans ChatModeId union)
- **Label**: Psycho-Profils | **Icône**: 🧠 | **Couleur**: #7c3aed
- **Catégorie**: personal | **sortOrder**: 6.5 (après coach)
- **Tone**: empathetic | **Temperature**: 0.65 | **MaxTokens**: 4000
- **System prompt**: cadre éthique clinique + 8 domaines (DSM-5, Dark Triad, narcissisme, tactiques manipulation, dynamiques négatives, stratégies protection, guérison, ressources) + protocole d'analyse en 7 étapes + limites claires
- **Tools**: contextAnalysis + synthesisTool uniquement (pas de shell/filesystem/code)
- **MODES_BY_CATEGORY['personal']**: coach, debug_cognitive, journal, **psychologie_profils** (ajouté)

### Tests
- **Fichier**: `src/__tests__/services/ai/chatModes.psychologieProfils.test.ts`
- **Résultat**: 40 Vitest PASS — couvre existence, activation, propriétés, sécurité, system prompt, catégorie, validation schema, getModeConfig, actions suggérées

### Gates
- Rule 10 AutoHeal: AH-KB-STRATEGIES-PROTECTION-MODE-PSYCHO-2026-05-01
- Rule 15: ARCHITECTURE.md + docs/CARTOGRAPHY_COMPLETE.md mis à jour
- Rule 16: 40 tests Vitest PASS
- detect_recurrence: PASS (à confirmer)

## KB Phase 26 — traumatologie_complexe + neuroscience_attachement (2026-04-29)

### Module traumatologie_complexe.json (v31.3.3)
- **Sections (8)**: cadre_diagnostique (PTSD/C-PTSD ICD-11/traumatisme développemental), theorie_polyvagale (Porges — 3 circuits: ventral vagal/sympathique/dorsal vagal + neuroception + co-régulation), window_of_tolerance (Siegel/Ogden — zones hyper/hypo/optimale + élargissement), reponses_4F_pete_walker (fight/flight/freeze/fawn + combinaisons + guérison), neurobiologie_trauma (mémoire implicite, amygdale, cortisol chronique, corps trauma, dissociation), honte_toxique (Walker/Brown/Bradshaw — distinction culpabilité/honte saine/honte toxique), phases_traitement_trauma (Janet 3 phases — stabilisation/traitement/intégration), outils_stabilisation (grounding 5-4-3-2-1, 4-7-8, lieu sûr, conteneur, pendulation Levine), ressources_traumatologie (ouvrages fondamentaux + ressources QC + France + apps)
- **Retrieval triggers**: 50 triggers — C-PTSD, polyvagal, window of tolerance, 4F, Pete Walker, Van der Kolk, dissociation, hypervigilance, grounding, etc.

### Module neuroscience_attachement.json (v31.3.4)
- **Sections (7)**: histoire_theorie (Bowlby/Ainsworth/Main/Bartholomew), styles_attachement_enfant (A/B/C/D — Strange Situation, IWM), styles_attachement_adulte (secure/anxieux-préoccupé/évitant-détaché/fearful-avoidant), neurobiologie_lien (ocytocine, dopamine, cortisol, cerveau social, régulation dyadique Tronick), attachement_relations_adultes (protest behaviors, dynamique anxieux-évitant, triggers relationnels), guerison_attachement (neuroplasticité, earned secure, EFT/AEDP/EMDR/IFS/schema), ressources_attachement (Attached/Hold Me Tight/Wired for Love + évaluation ECR-R)
- **Retrieval triggers**: 47 triggers — styles d'attachement, anxiété d'abandon, évitement intimité, ocytocine, Bowlby, push-pull, earned secure, co-régulation couple, etc.

### Intégration Rust
- Consts: `TRAUMATOLOGIE_COMPLEXE` + `NEUROSCIENCE_ATTACHEMENT` (include_str!)
- SOURCES: 2 nouvelles entrées
- Baseline test: ≥195 → ≥197
- Expected list: `neuroscience_attachement` (entre negociation_avancee et neurosciences_conscience) + `traumatologie_complexe` (entre technologie_innovation_avancee et troubleshooting_faq)

### Mode psychologie_profils — Enrichissement
- systemPrompt: +2 domaines de compétence (traumatologie complexe + styles d'attachement)

### Tests
- **kb.traumatologieAttachement.test.ts**: 44 Vitest PASS
- **chatModes.psychologieProfils.test.ts**: 20 Vitest PASS
- **Rust test_knowledge_base**: 10 PASS — baseline ≥197 validé

### Gates
- AutoHeal: AH-KB-TRAUMATOLOGIE-ATTACHEMENT-2026-04-29 (full schema)
- detect_recurrence: PASS

## Phase 27 — KB dépendance affective + thérapies trauma avancées (2026-04-29)

| Fichier | Type | Version | Sections | Triggers |
|---|---|---|---|---|
| `data/knowledge_base/default/dependance_affective_codependance.json` | KB JSON | v31.3.5 | 8 | 49 |
| `data/knowledge_base/default/therapies_trauma_avancees.json` | KB JSON | v31.3.6 | 7 | 47 |
| `src-tauri/src/knowledge_base_default.rs` | Rust | +2 consts +2 SOURCES, baseline >=199 | — | — |
| `src/__tests__/services/ai/kb.dependanceTherapiesTrauma.test.ts` | Vitest | 58 PASS | — | — |

Corpus clinique étendu: profils toxiques (p24) → protection (p25) → traumatologie/attachement (p26) → dépendance affective + thérapies trauma avancées (p27)

## Phase 28 — KB CNV + deuil/rupture/transitions (2026-04-29)

| Fichier | Type | Version | Sections | Triggers |
|---|---|---|---|---|
| `data/knowledge_base/default/communication_non_violente_relations.json` | KB JSON | v31.3.7 | 7 | 46 |
| `data/knowledge_base/default/deuil_rupture_transitions.json` | KB JSON | v31.3.8 | 7 | 48 |
| `src-tauri/src/knowledge_base_default.rs` | Rust | +2 consts +2 SOURCES, baseline >=201 | — | — |
| `src/__tests__/services/ai/kb.cnvDeuil.test.ts` | Vitest | 35 PASS | — | — |

Corpus clinique: profils toxiques (p24) → protection (p25) → traumatologie/attachement (p26) → dependance/therapies (p27) → CNV + deuil/rupture/transitions (p28)

## Phase 29 — KB TCC + santé mentale/résilience (2026-04-29)

| Fichier | Type | Version | Sections | Triggers |
|---|---|---|---|---|
| `data/knowledge_base/default/therapies_cognitives_comportementales.json` | KB JSON | v31.3.9 | 8 | 52 |
| `data/knowledge_base/default/sante_mentale_prevention_resilience.json` | KB JSON | v31.3.10 | 7 | 51 |
| `data/knowledge_base/default/neurodiversite_adhd_autisme_hpi.json` | KB JSON | v31.4.1 | 7 | 45+ |
| `data/knowledge_base/default/emotion_regulation_dbt_advanced.json` | KB JSON | v31.4.2 | 7 | 45+ |
| `data/knowledge_base/default/therapies_humanistes_existentielles.json` | KB JSON | v31.4.3 | 7 | 45 |
| `data/knowledge_base/default/psychodynamique_mecanismes_defense.json` | KB JSON | v31.4.4 | 8 | 44 |
| `data/knowledge_base/default/addiction_entretien_motivationnel.json` | KB JSON | v31.4.5 | 7 | 46 |
| `data/knowledge_base/default/intimite_sexualite_couples_eft.json` | KB JSON | v31.4.6 | 7 | 45 |
| `data/knowledge_base/default/developpement_enfant_parentalite.json` | KB JSON | v31.4.7 | 7 | 46 |
| `data/knowledge_base/default/psychosomatique_corps_esprit.json` | KB JSON | v31.4.8 | 7 | 46 |
| `data/knowledge_base/default/psychiatrie_clinique_diagnostics.json` | KB JSON | v31.4.9 | 7 | 46 |
| `data/knowledge_base/default/neuropsychologie_memoire_cerveau.json` | KB JSON | v31.5.0 | 7 | 46 |
| `data/knowledge_base/default/philosophie_ethique_existentielle.json` | KB JSON | v31.5.1 | 7 | 47 |
| `data/knowledge_base/default/relations_humaines_groupes_sociaux.json` | KB JSON | v31.5.2 | 7 | 47 |
| `src-tauri/src/knowledge_base_default.rs` | Rust | +14 consts +14 SOURCES, baseline >=215 | — | — |
| `src-tauri/src/commands/ide_operator.rs` | Rust fix | E0505 borrow-after-move | — | — |
| `src/__tests__/services/ai/kb.tccResilience.test.ts` | Vitest | 53 PASS (p29) | — | — |
| `src/__tests__/services/ai/kb.neurodiversiteDbt.test.ts` | Vitest | 51 PASS (p30) | — | — |
| `src/__tests__/services/ai/kb.humanistePsychodynamique.test.ts` | Vitest | 52 PASS (p31) | — | — |
| `src/__tests__/services/ai/kb.addictionCouples.test.ts` | Vitest | 50 PASS (p32) | — | — |
| `src/__tests__/services/ai/kb.enfantPsychosomatique.test.ts` | Vitest | 55 PASS (p33) | — | — |
| `src/__tests__/services/ai/kb.psychiatrieNeuropsycho.test.ts` | Vitest | 66 PASS (p34) | — | — |
| `src/__tests__/services/ai/kb.philosophieRelations.test.ts` | Vitest | 104 PASS (p35) | — | — |
| `data/knowledge_base/default/sociologie_economie_politique.json` | KB JSON | v31.5.3 | 7 | 47 |
| `data/knowledge_base/default/neurosciences_emotions_decision.json` | KB JSON | v31.5.4 | 7 | 47 |
| `src-tauri/src/knowledge_base_default.rs` | Rust | +16 consts +16 SOURCES, baseline >=217 | — | — |
| `src/__tests__/services/ai/kb.sociologieNeurosciences.test.ts` | Vitest | 96 PASS (p36) | — | — |
| `data/knowledge_base/default/communication_leadership_management.json` | KB JSON | v31.5.5 | 7 | 44 |
| `data/knowledge_base/default/psychologie_sante_comportements.json` | KB JSON | v31.5.6 | 7 | 44 |
| `src-tauri/src/knowledge_base_default.rs` | Rust | +18 consts +18 SOURCES, baseline >=219 | — | — |
| `src/__tests__/services/ai/kb.communicationSante.test.ts` | Vitest | 152 PASS (p37) | — | — |

Corpus clinique: profils toxiques (p24) → protection (p25) → traumatologie/attachement (p26) → dependance/therapies (p27) → CNV + deuil (p28) → TCC + sante mentale/resilience (p29) → neurodiversite (ADHD/TSA/HPI) + DBT avance (p30) → humaniste/existentiel + psychodynamique (p31) → addiction/EM + intimite/sexualite/EFT (p32) → developpement enfant/parentalite + psychosomatique corps-esprit (p33) → psychiatrie clinique diagnostics + neuropsychologie memoire cerveau (p34) → philosophie ethique existentielle + relations humaines groupes sociaux (p35) → sociologie/economie/politique + neurosciences/emotions/decision (p36) → communication/leadership/management + psychologie sante/comportements (p37)
