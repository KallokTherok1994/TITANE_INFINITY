# TITANE_INFINITY — Cartographie Complète Avancée v30.1.8

> 2026-04-16 — Chat E2E knowledge-memory proof truth: la lane critique Playwright `e2e/critical/chat-interaction.spec.ts` peut maintenant qualifier explicitement la disponibilité d une connaissance runtime seedee et le rappel du dernier échange sur le chemin mock frontend canonique. `src/services/conversationEngine.ts` publie alors des marqueurs visibles `[MOCK_KNOWLEDGE]` et `[MOCK_MEMORY]` sans prétendre exécuter un backend HTTP distinct, et consigne les interactions mockées dans `window.__TITANE_E2E_CHAT_MEMORY_LOG__` pour vérifier honnêtement la persistance de la lane de preuve.

> 2026-04-16 — Advanced agents readiness alignment truth: les surfaces `diagnostic-panel`, `explainability-dashboard`, `orchestrator-dashboard` et `security-dashboard` ne restent plus documentées comme `planned` dès lors que leurs services dédiés exposent déjà des signaux runtime/configuration vérifiables. Leur statut canonique est désormais `partial`, au même titre que `monitoring-dashboard`, tant que le moteur complet correspondant n est pas encore branché.

> 2026-04-16 — Chat single-door memory/knowledge alignment truth: `src/services/conversationEngine.ts` reste la porte frontend active vers `conversation_generate` via IPC Tauri, sans serveur HTTP dédié pour le chat ni pour Twins. Cette porte active précharge désormais la connaissance runtime issue du Memory Core (`memory_get_knowledge`) dans le `systemPrompt`, conserve le contexte Twins/TIME déjà présent, et persiste chaque interaction réussie via `persistent_memory_write_entry`, afin d éviter une dérive entre mémoire, base de connaissance et chemin conversationnel canonique.

> 2026-04-16 — Monitoring lazy-loader binding truth: `src/services/monitoring/index.ts` n'utilise plus une réexportation directe et un import local concurrent pour `isMonitoringLoaded`. La façade charge désormais explicitement les bindings du lazy-loader puis les réexporte, ce qui réaligne `src/services/monitoring/MonitoringDashboard.tsx` avec la vérité runtime observable sur la surface active et supprime le crash `isMonitoringLoaded is not defined` au rendu du panneau monitoring.

> 2026-04-17 — Advanced agents runtime signal truth: les dashboards avancés conservent `src/services/agents/advancedAgentCatalog.ts` comme base de qualification, mais les services dédiés enrichissent maintenant cette base avec les signaux réels déjà disponibles dans le runtime et la configuration canonique du repo. Le monitoring publie métriques/alertes, le diagnostic expose ses signaux passifs et l état Ollama, l explainability vérifie l alignement du registre champion/challenger, l orchestrateur expose les providers/timeouts actifs, et la sécurité active rappelle la voie IPC/One Door réellement en vigueur.

> 2026-04-16 — Advanced agents runtime mount truth: `src/components/layout/AppShell.tsx` monte maintenant `src/components/AgentDashboardsPanel.tsx` dans la surface applicative active. La preuve Playwright attend donc la présence réelle de `agent-dashboards-panel` et des cinq dashboards avancés sur la route de base, au lieu de s appuyer sur des exports non montés.

> 2026-04-16 — Advanced agents qualification truth: `src/services/agents/advancedAgentCatalog.ts` devient la vérité canonique des cinq agents avancés UI. Les dashboards de `src/services/monitoring/MonitoringDashboard.tsx`, `src/services/diagnostic/DiagnosticDashboard.tsx`, `src/services/explainability/ExplainabilityDashboard.tsx`, `src/services/orchestrator/OrchestratorDashboard.tsx` et `src/services/security_active/SecurityDashboard.tsx` n exposent plus des stubs opaques mais un statut gouverné (`data-readiness`), une synthèse, des preuves visibles, des blockers et une prochaine action. Les composants legacy sous `src/components/` sont désormais de simples alias vers ces surfaces canoniques pour éviter toute divergence active.

> 2026-04-17 — Canonical zoom authority and parent-bound shell truth: `src/hooks/zoomScale.ts` publie désormais un événement canonique de changement d’échelle consommé par `TopNav` et `UIReadingProvider`, ce qui supprime les autorités concurrentes de zoom dans la surface active. En parallèle, `src/components/layout/AppShell.tsx`, `src/ui/reading/UIReadingPanel.css`, `src/ui/components/Modal.css`, `src/ui/Modal.tsx`, `src/index.css` et `src/ui/pages/styles/Chat.css` ont été réalignés sur des dimensions parent-bound (`100%`) au lieu de `vh/dvh` rigides, pour que textes et éléments UI restent cohérents sous zoom navigateur, zoom applicatif et runtime Tauri sans redébordement du shell.

> 2026-04-17 — Native Tauri zoom-step and parent-bound truth: `src/hooks/zoomScale.ts`, `src/components/layout/TopNav.tsx` et `src/hooks/useZoomControl.ts` partagent maintenant un pas de zoom additif canonique, ce qui supprime la dérive `1 -> 1.1 -> 0.99`. En parallèle, `src/pages/TitanePage-local.css` force la surface `titane-page--conversation` à rester parent-bound (`width/max-width/min-height` overrides) afin que la vérité runtime Tauri dev garde `/titane?tab=conversation` entièrement visible à `0.8`, `1.0` et `1.1` dans la fenêtre native.

> 2026-04-16 — Surface chat fullscreen/zoom: la vérité canonique desktop/browser ne dépend plus d'un zoom CSS global à 75%. La baseline UI est revenue à 100%, la surface conversation Titane est étirée par son parent fullscreen, et les contrôles de zoom/fullscreen restent portés par les raccourcis navigateur/Tauri au lieu d'un shrink global qui créait des marges noires en HTTP.

> 2026-04-16 — Surface chat bounded-height chain: `src/pages/TitanePage-local.css` borne désormais explicitement la chaîne fullscreen `titane-content--conversation -> titane-section-conversation--fullscreen -> conversation-container` en `display:flex`, `flex-direction:column` et `height:100%`, afin que le compositeur ne déborde plus sous la fenêtre desktop HTTP quand l’onglet conversation est actif.

> 2026-04-17 — TopNav zoom viewport compensation: `src/hooks/zoomScale.ts` publie maintenant la variable canonique `--titane-ui-scale` en même temps que le zoom inline, et `src/components/layout/AppShell.tsx` compense la hauteur racine ainsi que l’offset TopNav avec cette échelle. La vérité runtime vérifiée est que `/titane?tab=conversation` reste entièrement dans la fenêtre visible sous zoom TopNav réel, sur desktop standard et viewport compact.

> 2026-04-16 — Canonical route-context anti-drift: `src/services/chat/moduleRouteContext.ts` normalise maintenant les alias query-driven vers leur destination canonique complète, pas vers une racine tronquée; `/chat` publie `/titane?tab=conversation`, `/devtools` publie `/admin?tab=system&systemTab=devtools`, et le fallback F12 de `src/main.tsx` navigue directement vers cette surface Admin/DevTools pour empêcher une vérité UI mémoire/diagnostic en retard sur la surface réellement visible.

> 2026-04-16 — Audit anti-dérive v30.1.x: la cartographie canonique doit désormais expliciter qu’une surface visible n’est jamais qualifiée seule. Toute correction ou évolution doit réaligner dans la même phase la surface UI, les tests E2E associés, la chaîne IPC/backend réellement consommée, les artefacts packagés, les launchers installés et les preuves AutoHeal; toute divergence entre une de ces vérités runtime est un état FAIL tant qu’elle n’est pas requalifiée.

> 2026-04-16 — Conversation long-message visibility: `src/components/chat/VirtualizedMessageList.tsx` ne filtre plus les messages assistant tres longs avec une borne fixe 100k avant de choisir la surface de rendu; la liste revient maintenant honnetement a `MessageList` pour les hauteurs naturelles, et l'evenement `titane-message-truncated` n'est emis que lorsqu'une limite explicite est configuree.

> 2026-04-16 — Conversation runtime transparency reply: `src/components/sections/ConversationSection.tsx` detecte maintenant les prompts purement descriptifs demandant le provider reel, l'usage reseau et les capacites d'export de l'UI, puis repond localement a partir de la derniere verite runtime instrumentee au lieu de laisser le modele improviser ou rebasculer vers une voie artefact.

> 2026-04-16 — Conversation transparency routing truth: `src/features/chat/artifactIntent.ts` ne traite plus toute mention d'"export" comme une demande artefact; les questions descriptives sur ce que l'UI permet d'exporter restent dans la voie réponse chat canonique, et seules les demandes explicites d'export/génération de fichier déclenchent le manifeste artefact.
> 2026-04-16 — Conversation fullscreen internal scroll budget: `conversation-container[data-fullscreen='true']` neutralise maintenant le gap vertical hérité entre ses blocs, et `titane-content--conversation` réserve un budget bas safe-area-aware sur mobile compact pour que la zone de messages garde le scroll interne pendant que l’onglet chat et le compositeur restent visibles ensemble.
> 2026-04-16 — Conversation fullscreen persistence: `TitanePage` ne force plus un `scrollIntoView()` du textarea lors de l’activation de l’onglet chat, `titane-page-header--conversation` reste sticky dans le shell fullscreen, et `chat-messages-scroll-region` expose une scrollbar native droite renforcée pour garder visibles le header d’onglet et le repère de défilement sous zoom.
> 2026-04-16 — GitHub Copilot rate-limit resilience: `src-tauri/src/api_hub/copilot.rs` effectue maintenant des retries bornés sur quota GitHub (`429`/`403` rate-limited) avec respect de `Retry-After` et backoff exponentiel plafonné avant remontée d’erreur, afin d’éviter les faux échecs de type code review.
> 2026-04-16 — Canonical anti-regression surface truth: `src/features/admin/AdminPage.tsx` monte désormais `SelfHealingDashboard` comme onglet actif `/admin?tab=anti-regression`; la surface visible canonique expose `self-healing-dashboard` et `anti-regression-summary`, et la classification runtime passe par `src/services/selfHealing/selfHealingService.ts`.

> 2026-04-16 — Canonical chat surface truth: `src/pages/ChatPage.tsx` est désormais un alias explicite vers `TitanePage`; le router legacy `/chat` redirige maintenant explicitement vers `/titane?tab=conversation`, le router déprécié et le préchargement critique pointent eux aussi vers `TitanePage`, et la surface utilisateur réellement active reste `ConversationSection` sous cette topologie canonique.
> 2026-04-16 — Legacy chat export truth: `src/ui/pages/Chat.tsx` a été réduit à un alias de compatibilité vers `ChatPage`, lui-même alias vers `TitanePage`; les imports hérités restent donc fonctionnels sans réintroduire l’ancienne UI chat autonome.

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
| In-Flight Requests | `useRequestInFlightStore.ts` | Requêtes en cours |
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
| Cycle Engine | 7 | Semantic Skills | 10 |
| Dashboard | 3 | Singularity | 37 |
| Database | 8 | Snapshots | 5 |
| Desktop Agent | 11 | State Management | 14 |
| DevTools | 24 | System Center | 22 |
| Digital Twin | 8 | TITAN Core | 33 |
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
| Tauri Client | `tauriClient.ts` (3456L) | Client IPC complet | `TauriClientService` |
| Chat Engine | `ai/chatEngine.ts` (3356L) | Moteur chat AI | `ChatEngine`, `sendMessage`, `streamResponse` |
| AI Orchestrator | `ai/orchestrator.ts` (2133L) | Orchestrateur multi-AI | `AIOrchestrator`, `selectProvider` |
| RAG | `ragService.ts` | Recherche sémantique | `safeInvokeCanonical`, `ragSearch` |
| Evolution Engine | `evolutionEngine/` | Évolution continue | `EvolutionEngine`, `runEvolution` |
| Singularity Bridge | `singularityBridge.ts` | Pont singularité v1 | `SingularityBridge` |
| Singularity vΩ | `singularityBridgeVInfinity.ts` | Pont singularité vΩ | `SingularityBridgeVInfinity` |
| Conversation | `conversationEngine.ts` | Moteur conversation | `ConversationEngine` |
| Agenda | `agendaService.ts` | Agenda/timeline | `AgendaService` |
| Auto Audit | `autoAuditEngine.ts` | Audit automatisé | `AutoAuditEngine` |
| Web Research | `webResearchService.ts` | Recherche web | `WebResearchService` |
| User Prefs | `userPreferencesEngine.ts` | Préférences | `UserPreferencesEngine` |
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
