# TITANE_INFINITY — Cartographie Complète Avancée v30.1.8

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
| `/cognitive` | CognitivePage | ✓ |
| `/experience` | Experience | ✓ |
| `/time` | TimePage | ✓ |
| `/admin` | AdminPage | ✓ |
| `/system-center` | SystemGovernancePage | ✓ |
| `/diagnostics` | DiagnosticsPage | ✓ |
| `/devtools` | DevToolsPage | ✓ |
| `/cluster` | ClusterPage | ✓ |
| `/introspection` | IntrospectionPage | ✓ |
| `/hypervision` | HypervisionPage | ✓ |
| `/configuration` | ConfigurationHub | ✓ |
| `/design-center` | DesignCenterPage | ✓ |
| `/design-system` | DesignSystemPage | ✓ |
| `/governance-center` | GovernancePage | ✓ |
| `/governance` | GovernancePage | ✓ |
| `/secure` | SecureSettings | ✓ |
| `/audio-center` | AudioCenterPage | ✓ |
| `/fusion` | FusionPage | ✓ |
| `/optimization` | OptimizationPage | ✓ |
| `/orchestration-intelligence` | OrchestrationIntelligenceCenter | ✓ |
| `/orchestration-center` | OrchestrationMetaCenter | ✓ |
| `/meta-center` | MetaCenterPage | ✓ |
| `/multi-ai-dashboard` | MultiAIDashboard | ✓ |
| `/nexus-engine` | NexusEngine | ✓ |
| `/harmonia-engine` | HarmoniaEngine | ✓ |
| `/cognitive-state` | CognitiveStatePage | ✓ |
| `/dev` | DevPage | ✓ |
| `/total-dev` | TotalDevPage | ✓ |
| `/command-center` | CommandCenter | ✓ |
| `/qa-monitoring` | QAMonitoring | ✓ |
| `/monitoring` | MonitoringDashboard | ✓ |
| `/developer-mode` | DeveloperMode | ✓ |
| `/dev-mode` | DeveloperMode | ✓ |
| `/devmode` | DeveloperMode | ✓ |
| `/orchestration` | Orchestration | ✓ |
| `/reality-center` | RealityCenter | ✓ |
| `/hyper-center` | HyperCenter | ✓ |
| `/quantum-center` | QuantumCenter | ✓ |
| `/identity-center` | IdentityCenter | ✓ |
| `/memory-evolution` | MemoryEvolution | ✓ |
| `/memory-evo` | MemoryEvo | ✓ |
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
| `/chat` | `/titane` |
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
| `/identity` | `/titane?tab=twins` |
| `/persona` | `/titane?tab=twins` |
| `/twins` | `/titane?tab=twins` |
| `/twin` | `/titane?tab=twins` |
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
