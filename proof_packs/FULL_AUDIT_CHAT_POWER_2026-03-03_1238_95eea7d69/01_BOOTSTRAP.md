# 01_BOOTSTRAP

Timestamp: 2026-03-03T12:38:27-05:00
Proof-Pack: proof_packs/FULL_AUDIT_CHAT_POWER_2026-03-03_1238_95eea7d69

## A) Repo state
### git status
Sur la branche MAIN
Votre branche est à jour avec 'origin/MAIN'.

Modifications qui ne seront pas validées :
  (utilisez "git add <fichier>..." pour mettre à jour ce qui sera validé)
  (utilisez "git restore <fichier>..." pour annuler les modifications dans le répertoire de travail)
	modifié :         registry/ui-events.jsonl
	modifié :         src-tauri/src/chat_engine/config.rs
	modifié :         src-tauri/src/chat_engine/memory.rs
	modifié :         src-tauri/src/chat_engine/mod.rs
	modifié :         src-tauri/src/chat_engine/streaming.rs
	modifié :         src-tauri/src/commands/security.rs
	modifié :         src-tauri/src/config/mod.rs
	modifié :         src-tauri/src/config/update.rs
	modifié :         src-tauri/src/main.rs
	modifié :         src/lib/security.ts
	modifié :         src/lib/tauriClient.ts
	modifié :         src/lib/tauriCommands.ts
	modifié :         src/pages/ConfigurationHub.tsx
	modifié :         src/services/ai/chatEngine.ts
	modifié :         src/services/api/chat.ts
	modifié :         src/services/tauri/chatEngine.commands.ts
	modifié :         src/services/tauriClient.ts
	modifié :         titane-infinity.desktop

Fichiers non suivis:
  (utilisez "git add <fichier>..." pour inclure dans ce qui sera validé)
	proof_packs/CHAT_FULL_POWER_2026-03-03_0808_95eea7d69/
	proof_packs/FULL_AUDIT_CHAT_POWER_2026-03-03_1238_95eea7d69/

aucune modification n'a été ajoutée à la validation (utilisez "git add" ou "git commit -a")

### git rev-parse --short HEAD
95eea7d69

### git log -20 --oneline
95eea7d69 Merge pull request #163 from KallokTherok1994/auto/exec-p0-p16-20260302-2034-cbc8f61
34046ca98 feat(hardline): add G0-G18 gate scripts for RC certification
53168e759 feat(hardline): add FINAL+++ runner and final audit orchestration
cbc8f617a docs(release): add GitHub release notes for v27.2.0-prod-release-20260302
76ea68401 release(prod): stabilize startup path and publish qualification proof packs
57e48984f docs(proof): seal online prod start x3 pass
5889560f3 docs(release): add short note for PROD_START_FIX_AUTH
6d4c8efc7 fix(boot): qualify PROD start and seal watchdog proof x3
4e17a79e8 docs(proof): finalize PROD isolation pack with strict x3 same-context closure
6c47b0253 test(e2e): harden Playwright webServer node path
9383521a1 docs(registry): append structure reorg seal event
760e75bd3 docs(structure): canonical rules, target and migration plan
846e05b38 docs(registry): append structure audit seal event
f1b5eb378 docs(evidence): add seal tag trace to structure verdict
c83f07f75 docs(structure): audit gouvernance + gate anti-drift
429d6b457 docs: canonical markdown reorg (inventory + index + evidence)
d43248367 chore: quarantine working tree before docs reorg
8d4d43e10 docs(governance): seal V3 mapping canon and proof-pack sync
c1a781b2a docs(seal): append cleanup addendum and include remaining map docs
81ccac554 docs(map): add generated architecture/network indexes

## B) Structure
### tree/find src-tauri/src
src-tauri/src
src-tauri/src/modules
src-tauri/src/chat_engine
src-tauri/src/types
src-tauri/src/omega
src-tauri/src/control_panel_commands
src-tauri/src/emotion
src-tauri/src/avatar
src-tauri/src/avatar/fullbody
src-tauri/src/compat
src-tauri/src/singularity_state
src-tauri/src/time
src-tauri/src/batch
src-tauri/src/api_hub
src-tauri/src/engines
src-tauri/src/engines/behavior
src-tauri/src/engines/unified_memory
src-tauri/src/engines/temporal
src-tauri/src/engines/conversation_os
src-tauri/src/engines/quantum
src-tauri/src/singularity
src-tauri/src/audio
src-tauri/src/narrative
src-tauri/src/hyper_evolution
src-tauri/src/harmonic_os
src-tauri/src/tts
src-tauri/src/singularity_cortex
src-tauri/src/system
src-tauri/src/system/watchdog
src-tauri/src/system/persona_engine
src-tauri/src/system/adaptive_engine
src-tauri/src/core
src-tauri/src/core/modules
src-tauri/src/meta_energy
src-tauri/src/meta_orchestrator
src-tauri/src/devtools
src-tauri/src/doc_engine
src-tauri/src/knowledge
src-tauri/src/temporal_engine
src-tauri/src/temporal_engine/integrations
src-tauri/src/creation
src-tauri/src/semantic
src-tauri/src/singularity_fusion
src-tauri/src/singularity_os
src-tauri/src/updates
src-tauri/src/watchdog
src-tauri/src/design_center
src-tauri/src/evolution
src-tauri/src/agents
src-tauri/src/profiling
src-tauri/src/utils
src-tauri/src/ipc
src-tauri/src/self_repair
src-tauri/src/performance
src-tauri/src/behavior_engine
src-tauri/src/kernel
src-tauri/src/kernel/integrations
src-tauri/src/numeric_twin
src-tauri/src/meta
src-tauri/src/introspection
src-tauri/src/meta_mode_engine
src-tauri/src/agent_system
src-tauri/src/duplex
src-tauri/src/memory_os
src-tauri/src/identity
src-tauri/src/cognitive_gravity
src-tauri/src/qa
src-tauri/src/ipc_batcher
src-tauri/src/cognitive_learning
src-tauri/src/monitoring
src-tauri/src/monitoring/metrics
src-tauri/src/monitoring/performance
src-tauri/src/monitoring/telemetry
src-tauri/src/monitoring/health
src-tauri/src/constitution
src-tauri/src/memory_evolution
src-tauri/src/neuro_symbolic
src-tauri/src/styles
src-tauri/src/cluster
src-tauri/src/conversation_engine
src-tauri/src/selfheal
src-tauri/src/agenda
src-tauri/src/conversation_os
src-tauri/src/cognitive
src-tauri/src/cache
src-tauri/src/wakeword
src-tauri/src/healing
src-tauri/src/hyper_intelligence
src-tauri/src/engine
src-tauri/src/master_guide
src-tauri/src/ia
src-tauri/src/overdrive
src-tauri/src/persistence
src-tauri/src/shared
src-tauri/src/neural_memory
src-tauri/src/multimodal
src-tauri/src/memory
src-tauri/src/services
src-tauri/src/ai
src-tauri/src/ai/providers
src-tauri/src/digital_twin_v14_1
src-tauri/src/digital_twin_v14_1/behavior_engine
src-tauri/src/digital_twin_v14_1/auto_evolution
src-tauri/src/digital_twin_v14_1/emotion_engine
src-tauri/src/system_center
src-tauri/src/security
src-tauri/src/unified_memory_v2
src-tauri/src/cycle_engine
src-tauri/src/config
src-tauri/src/ai_chat
src-tauri/src/reality_renderer
src-tauri/src/cloud
src-tauri/src/resilience
src-tauri/src/hypervision
src-tauri/src/onboarding
src-tauri/src/auth
src-tauri/src/multi_agents
src-tauri/src/adaptive
src-tauri/src/meta_creation
src-tauri/src/app
src-tauri/src/commands
src-tauri/src/errors
src-tauri/src/agi_core
src-tauri/src/api

### tree/find src-tauri/src/chat_engine
src-tauri/src/chat_engine/memory.rs
src-tauri/src/chat_engine/streaming.rs
src-tauri/src/chat_engine/mod.rs
src-tauri/src/chat_engine/config.rs
src-tauri/src/chat_engine/errors.rs
src-tauri/src/chat_engine/commands.rs
src-tauri/src/chat_engine/types.rs
src-tauri/src/chat_engine/providers.rs
src-tauri/src/chat_engine/speech.rs

### tree/find src
src/modules/IdentityMemoryEvolutionCenter.tsx
src/modules/OrchestrationIntelligenceCenter.tsx
src/modules/TemporalFlowCenter.tsx
src/types/three-ambient.d.ts
src/types/memoryEngine.ts
src/types/multimodalFusion.ts
src/types/experience.ts
src/types/providerDecisionMeta.ts
src/types/logger.ts
src/types/telemetry.ts
src/types/web-speech-api.d.ts
src/types/remediationPermissions.ts
src/types/flow.ts
src/types/conversationEvaluation.ts
src/types/conversation.ts
src/types/test-utils-alias.d.ts
src/types/tauri.ts
src/types/stressRegulation.ts
src/types/logLevel.ts
src/types/system.d.ts
src/types/env.d.ts
src/types/devops.ts
src/types/cognitiveKernel.ts
src/types/react-chrono.d.ts
src/types/predictiveState.ts
src/types/devtools.ts
src/types/ttsEngine.ts
src/types/visionAffect.ts
src/types/presence.d.ts
src/types/research.ts
src/types/conversation_os.ts
src/types/ai.d.ts
src/types/voice.ts
src/types/backend.d.ts
src/types/index.ts
src/types/humanRhythm.ts
src/types/performanceEngine.ts
src/types/trainingBaseline.ts
src/types/chatModes.ts
src/types/css.d.ts
src/types/ui-layout-contract.ts
src/types/global.d.ts
src/types/selfHealing.ts
src/types/audio.d.ts
src/types/aiModel.ts
src/types/singularityState.ts
src/types/providerMeta.ts
src/types/automationXP.ts
src/types/numericTwin.ts
src/particles/Particle.ts
src/particles/ParticleSystem.ts
src/particles/index.ts
src/mocks/events.ts
src/boot-diagnostics.ts
src/tauri-init-fix.ts
src/dev/index.ts
src/context/TitanStateContext.tsx
src/design-system/visual-states.ts
src/design-system/responsive-utilities.css
src/design-system/responsive-tokens.css
src/design-system/motion.ts
src/design-system/titane-fusion.css
src/design-system/index.ts
src/design-system/tokens.ts
src/engines/index.ts
src/entry.ts
src/layouts/AppLayout.css
src/layouts/ResponsiveChatLayout.tsx
src/layouts/AppLayout.tsx
src/main.tsx
src/i18n/index.ts
src/i18n/i18nLazyLoader.ts
src/core/engine.rs:87:36
src/core/STATE_ARCHITECTURE.ts
src/core/engine.rs:89:13
src/core/engine.rs:48:9
src/core/engine.rs:48:31
src/core/engine.rs:87:13
src/core/engine.rs:57:34
src/core/engine.rs:54:34
src/core/engine.rs:88:13
src/core/engine.rs:54:9
src/core/engine.rs:86:35
src/core/ARCHITECTURE_TYPES_v24-v∞.ts
src/core/engine.rs:51:9
src/core/engine.rs:51:32
src/core/index.ts
src/core/engine.rs:89:38
src/core/engine.rs:88:38
src/core/engine.rs:86:13
src/core/engine.rs:57:9
src/core/ARCHITECTURE_TYPES_v∞.ts
src/_deprecated/router.tsx
src/index.css
src/utils/lazyComponentLoader.tsx
src/utils/ollama.ts
src/utils/cn.ts
src/utils/advancedBootMonitor.ts
src/utils/logger.ts
src/utils/lazyEngineLoader.tsx
src/utils/imageOptimization.tsx
src/utils/advancedTelemetry.ts
src/utils/ollamaFallback.ts
src/utils/aiPredictiveEngine.ts
src/utils/performanceGuards.ts
src/utils/LRUCache.ts
src/utils/selfHealingSystem.ts
src/utils/performanceOptimizer.ts
src/utils/chatLogger.ts
src/utils/secureSecrets.ts
src/utils/bootSafetyLock.ts
src/utils/tauriCommandMapper.ts
src/utils/adaptivePolling.ts
src/utils/PerformanceProfiler.tsx
src/utils/bootRecoverySystem.ts
src/utils/tauriProtector.ts
src/utils/webVitals.ts
src/utils/quantumOrchestrator.ts
src/utils/performanceProfiler.ts
src/utils/enhancedLazySystem.ts
src/utils/lazyImportDiagnostic.ts
src/utils/telemetryEngine.ts
src/utils/streamingDebounce.ts
src/utils/dataUtils.ts
src/utils/routePreloading.ts
src/utils/dynamicImports.ts
src/utils/index.ts
src/utils/safeLazyImport.ts
src/utils/clearMenuCache.ts
src/utils/autoHealClient.ts
src/utils/cloudAPIConfirmation.ts
src/utils/debouncedStorage.ts
src/utils/tauriFsAdapter.ts
src/utils/browserModeAdapter.ts
src/utils/quantumIntelligence.ts
src/utils/APISupport.ts
src/utils/invoke.ts
src/CARTE_POINTS_CRITIQUES.ts
src/a11y/useFocusTrap.tsx
src/a11y/Modal.tsx
src/a11y/index.ts
src/a11y/KeyboardShortcuts.tsx
src/a11y/ScreenReader.tsx
src/a11y/FocusManager.ts
src/App.tsx
src/lib/UILogger.ts
src/lib/logger.ts
src/lib/serviceInvoker.ts
src/lib/metricsTypes.ts
src/lib/ipc.ts
src/lib/errorClassification.ts
src/lib/serviceMetrics.ts
src/lib/performanceBudget.ts
src/lib/anomalyDetector.ts
src/lib/tauriClient.ts
src/lib/security.ts
src/lib/metricsHistory.ts
src/lib/metricsCache.ts
src/lib/accessibility.ts
src/lib/utils.ts
src/lib/tauriCommands.ts
src/lib/predictiveAlerts.ts
src/lib/notificationSystem.ts
src/lib/errorHandler.ts
src/lib/ipcContract.ts
src/omnis-final-validation.ts
src/hooks/useLocalStorage.ts
src/hooks/useAudioSettings.ts
src/hooks/useTimeAgenda.ts
src/hooks/usePreferences.ts
src/hooks/useRAG.ts
src/hooks/useVocalDevConsole.ts
src/hooks/useVoiceInput.ts
src/hooks/useChat.loaders.ts
src/hooks/useParticles.ts
src/hooks/useToolCaller.ts
src/hooks/useDeviceHealth.ts
src/hooks/useConnection.ts
src/hooks/useLivingEngines.ts
src/hooks/useEngineState.ts
src/hooks/useMemory.ts
src/hooks/useBackendHealth.ts
src/hooks/usePhaseSpace.ts
src/hooks/useTTSWithMicControl.ts
src/hooks/useConversationEngine.ts
src/hooks/useSingularityStateSafe.ts
src/hooks/useAudioStreaming.ts
src/hooks/useChatMemory.ts
src/hooks/useCognitive.ts
src/hooks/useDebounce.ts
src/hooks/useSingularitySync.ts
src/hooks/useSingularityStore.ts
src/hooks/usePerformanceProfiler.ts
src/hooks/useChatMemoryCache.ts
src/hooks/useMediaQuery.ts
src/hooks/useConversations.ts
src/hooks/useControlPanelSection.ts
src/hooks/useEffects.ts
src/hooks/useEngineSubscription.ts
src/hooks/useTwinIdentity.ts
src/hooks/useEngineVitals.ts
src/hooks/useGlobalAIChat.ts
src/hooks/useTTS.ts
src/hooks/useWindowControls.ts
src/hooks/useKeyboardShortcuts.ts
src/hooks/useLazyAvatar.ts
src/hooks/useAIChatStreaming.ts
src/hooks/useAdvancedPerformance.ts
src/hooks/useSystemMonitor.ts
src/hooks/useUnifiedPresence.ts
src/hooks/useVisualEngines.ts
src/hooks/useCognitiveLayout.ts
src/hooks/useDevicePermissions.ts
src/hooks/useAuraPerformanceMonitor.tsx
src/hooks/useFileOperations.ts
src/hooks/useExperience.ts
src/hooks/useFusionEngine.ts
src/hooks/useProviderStatus.ts
src/hooks/useHoloPresence.ts
src/hooks/useFocusTrap.ts
src/hooks/useSingularityState.ts
src/hooks/useIdentity.ts
src/hooks/useAdaptiveFPS.ts
src/hooks/useAuraOrchestrator.ts
src/hooks/useChatStreaming.ts
src/hooks/useUserPreferences.ts
src/hooks/useLiveDebugger.ts
src/hooks/useChat.ts
src/hooks/useChat.utils.ts
src/hooks/useZoomControl.ts
src/hooks/useVisualState.ts
src/hooks/useChatUI.ts
src/hooks/useOmegaPipeline.ts
src/hooks/usePanelState.ts
src/hooks/useAutoTimeout.ts
src/hooks/useResponsive.ts
src/hooks/usePresenceOS.ts
src/hooks/useTitaneCore.ts
src/hooks/useThrottle.ts
src/hooks/useSystemCenterAutoFix.ts
src/hooks/useSystemHealth.ts
src/hooks/index.ts
src/hooks/useMCPOrchestrator.ts
src/hooks/usePerformanceMonitor.ts
src/hooks/useTwinEvolution.ts
src/hooks/useVisualEngine.ts
src/hooks/useIdentityMatrix.ts
src/hooks/useUnifiedMemory.ts
src/hooks/useExpressionOrchestration.ts
src/hooks/useToast.ts
src/hooks/usePersistentMemory.ts
src/hooks/useHybridEngine.ts
src/hooks/useVoiceEngine.ts
src/hooks/useChatCore.ts
src/hooks/useVoiceMode.ts
src/hooks/useChatModes.ts
src/hooks/useVitals.ts
src/hooks/useTwinBehavior.ts
src/hooks/useMemoryEngine.ts
src/hooks/useVAD.ts
src/hooks/useExpression.ts
src/hooks/useVoice.ts
src/hooks/useTitaneSphere.ts
src/hooks/useWhisperStream.ts
src/hooks/useMemoryCore.ts
src/hooks/useMultimodalPresence.ts
src/hooks/useSingularity.ts
src/hooks/useSessions.ts
src/hooks/useDeepPsyche.ts
src/hooks/useActiveListening.ts
src/hooks/useAudioChat.tsx
src/setupTests.ts
src/stores/systemStore.selectors.ts
src/stores/uiStore.ts
src/stores/evolutionStore.ts
src/stores/useChatModeStore.ts
src/stores/evolutionStore.selectors.ts
src/stores/panelsStore.ts
src/stores/useMemoryEngineStore.ts
src/stores/uiStore.selectors.ts
src/stores/effectsStore.ts
src/stores/useTTSEngineStore.ts
src/stores/visualStateStore.ts
src/stores/useVisionStore.ts
src/stores/systemStore.ts
src/stores/index.ts
src/stores/visualStateStoreV21.ts
src/stores/usePerformanceStore.ts
src/stores/visualStore.ts
src/stores/useAutomationXPStore.ts
src/stores/useVisionStore.selectors.ts
src/stores/memoryStore.selectors.ts
src/stores/useSelfHealingStore.ts
src/stores/memoryStore.ts
src/stores/useRequestInFlightStore.ts
src/monitoring/Analytics.ts
src/monitoring/index.ts
src/styles/optimization.css
src/styles/local-fonts.css
src/styles/experience.css
src/styles/titanium-dark-tokens.css
src/styles/animations.css
src/styles/unified-tokens.css
src/styles/motion.ts
src/styles/aura-effects.css
src/styles/tech-effects.css
src/styles/css-vars.css
src/styles/critical.css
src/styles/tech-fonts.css
src/styles/a11y.css
src/styles/aura-advanced.css
src/styles/tokens.ts
src/styles/exp-fusion.css
src/styles/fonts.css
src/test-utils/TestProviders.tsx
src/test-utils/renderHook.tsx
src/test-utils/index.d.ts
src/test-utils/setup.ts
src/test-utils/ambient.d.ts
src/test-utils/index.tsx
src/pages/ProgressionPage.tsx
src/pages/CameraPage.css
src/pages/DesignSystemPage.tsx
src/pages/Stats.tsx
src/pages/styles.css
src/pages/SystemGovernance.css
src/pages/Memory.tsx
src/pages/Experience.tsx
src/pages/Sentinel.tsx
src/pages/Harmonia.tsx
src/pages/OrchestrationMetaCenter.tsx
src/pages/DevToolsLazy.tsx
src/pages/TitanePage-local.css
src/pages/Helios.tsx
src/pages/ResearchPage.tsx
src/pages/Nexus.tsx
src/pages/Watchdog.tsx
src/pages/MonitoringDashboard.tsx
src/pages/TimePage.tsx
src/pages/DesignSystemPage.css
src/pages/ModulePages.css
src/pages/DevToolsTabs.tsx
src/pages/DevPage.tsx
src/pages/SecureSettings.tsx
src/pages/TimePage.css
src/pages/ConfigurationHub.tsx
src/pages/DashboardPage.tsx
src/pages/DesignSystemShowcase.tsx
src/pages/AgendaPage.tsx
src/pages/Settings.tsx
src/pages/PerformanceTest.tsx
src/pages/EvolutionCenterPage.tsx
src/pages/AgendaPage.css
src/pages/TitanePage.tsx
src/pages/DevTools.tsx
src/pages/ChatPage.tsx
src/pages/OrchestrationMetaCenter.css
src/pages/EvoPage.tsx
src/pages/index.ts
src/pages/TitanePage.css
src/pages/TimeNavigator.css
src/pages/SelfHeal.tsx
src/pages/DevPage.css
src/pages/CognitivePage.tsx
src/pages/AdaptiveEngine.tsx
src/pages/TimeNavigator.tsx
src/pages/CameraPage.tsx
src/test/useEngineSubscription.test.ts
src/test/tauriBridge.test.ts
src/test/singularityStore.test.ts
src/test/serviceInvoker.test.ts
src/test/setup.ts
src/test/integration.test.ts
src/components/ModuleCard.css
src/components/SystemIntegrationHub.tsx
src/components/AutoHealErrorBoundary.css
src/components/BootHealthDashboard.tsx
src/components/LanguageSwitcher.tsx
src/components/PerformanceDashboard.tsx
src/components/ConsciousnessDashboard.tsx
src/components/StatusIndicator.css
src/components/AudioSettings.tsx
src/components/ErrorBoundary.tsx
src/components/VitalsPanel.tsx
src/components/AutoHealErrorBoundary.tsx
src/components/ChatWindow.tsx
src/components/PersonaMoodIndicator.tsx
src/components/VoiceControlPanel.css
src/components/VoiceConversation.tsx
src/components/HybridBubble.tsx
src/components/SingularityMonitor.tsx
src/components/BootErrorFallback.tsx
src/components/VoiceControlPanel.tsx
src/components/StatusIndicator.tsx
src/components/ChatInput.css
src/components/MessageBubble.css
src/components/ChatDiagnostic.tsx
src/components/ChatErrorBoundary.tsx
src/components/ChatWindow.css
src/components/VocalDevConsole.css
src/components/Message.tsx
src/components/ModuleCard.tsx
src/components/VocalDevConsole.tsx
src/cognitive/types.ts
src/cognitive/index.ts
src/tests/activeListeningIntegration.test.ts
src/tests/chat-ia-interface.test.tsx
src/tests/tauri-invoke-fix-validator.ts
src/tests/chat-ia-real.test.ts
src/tests/presenceOS.test.ts
src/tests/security.test.ts
src/visual-engine/UIIntegrityChecker.ts
src/visual-engine/EffectsOrchestrator.ts
src/visual-engine/StateManager.ts
src/visual-engine/INTEGRATION_GUIDE_V21.ts
src/visual-engine/index.ts
src/visual-engine/TitaneVisualEngine.ts
src/visual-engine/TitaneVisualEngineV21.ts
src/visual-engine/OSIntegrationBridge.ts
src/visual-engine/LivingUISystem.ts
src/contexts/AnimationContext.tsx
src/effects/GlitchEffect.tsx
src/effects/EnergyArcs.tsx
src/effects/SpiralPattern.tsx
src/effects/HealingWaves.tsx
src/effects/index.ts
src/effects/AudioWaveform.tsx
src/themes/ThemeProvider.tsx
src/themes/index.ts
src/themes/tokens.ts
src/services/tauriAutoRepair.ts
src/services/adaptiveBridgeV21.ts
src/services/conversationEngine.test.ts
src/services/chatMemoryCompactor.ts
src/services/autoAuditEngine.ts
src/services/tauriBridge.ts
src/services/experienceService.ts
src/services/chatMemory.ts
src/services/aiChatClient.ts
src/services/singularityBridge.ts
src/services/tauriClient.ts
src/services/userPreferencesEngine.ts
src/services/webResearchService.ts
src/services/lazy.ts
src/services/chatValidator.ts
src/services/personaTauriBridge.ts
src/services/singularityConnections.ts
src/services/singularityBridgeVInfinity.ts
src/services/tauriCommands.ts
src/services/agendaService.ts
src/services/ragService.ts
src/services/conversationEngine.ts
src/services/audioTranscriptionService.ts
src/assets/titane-reactor-awen.svg
src/assets/titane-arc-emerald.svg
src/ui/Button.tsx
src/ui/Badge.tsx
src/ui/Spinner.tsx
src/ui/Menu.tsx
src/ui/Icons.tsx
src/ui/Modal.tsx
src/ui/index.ts
src/ui/Card.tsx
src/ui/AppLayout.tsx
src/ui/Input.tsx
src/stories/Button.tsx
src/stories/SingularityMonitor.stories.ts
src/stories/Button.stories.ts
src/stories/Header.stories.ts
src/stories/LazyImage.stories.tsx
src/stories/DesignSystem.mdx
src/stories/Page.tsx
src/stories/page.css
src/stories/header.css
src/stories/Configure.mdx
src/stories/Header.tsx
src/stories/Page.stories.ts
src/stories/button.css
src/tauri-protection-patch.ts
src/security/Sanitizer.ts
src/config/aiTimeouts.config.ts
src/config/automationXP.config.ts
src/config/offline-first.ts
src/config/memoryEngine.config.ts
src/config/index.ts
src/config/chatModes.config.ts
src/config/logLevelConfig.ts
src/config/featureFlags.ts
src/os/types.ts
src/os/TitaneOS.ts
src/os/index.ts
src/data/memory_clusters.json
src/data/memory_mt.json
src/data/tone_settings.json
src/data/modes.json
src/data/personality.json
src/data/memory_ct.json
src/data/memory_lt.json
src/data/memory_patterns.json
src/data/memory_evolution_config.json
src/data/identity_matrix.json
src/data/voice_profiles.json
src/data/rules.json
src/AppMinimal.tsx
src/quantum/quantum_renderer.ts
src/quantum/quantum_rules.json
src/quantum/anti_jitter.ts
src/quantum/text_stability.ts
src/quantum/motion_frame_engine.ts
src/quantum/component_cache.ts
src/quantum/frame_harmonizer.ts
src/quantum/gpu_acceleration.ts
src/quantum/index.ts
src/quantum/vsync_orchestrator.ts
src/__tests__/opus-engines.test.ts
src/__tests__/e2e-test-utils.ts
src/__tests__/c4-memory.test.ts
src/__tests__/singularity-fusion-mocked.test.ts
src/__tests__/cognitive-kernel-v22omega.test.ts
src/__tests__/xpExtended.config.test.ts
src/__tests__/c6-baseline.test.ts
src/__tests__/chat-fallback-display.test.ts
src/__tests__/useAudioStreaming.test.ts
src/__tests__/c3-latency.test.ts
src/__tests__/chatEngine-memory-integration.test.ts
src/__tests__/e2e-api-integration.test.ts
src/__tests__/persistentMemory.test.ts
src/__tests__/secure-secrets-utils.test.ts
src/__tests__/cloud-agent-timeout-config.test.ts
src/__tests__/unifiedMemory.test.ts
src/__tests__/c5-observability.test.ts
src/__tests__/e2e-automated-validation.test.tsx
src/__tests__/provider-decision-invariants.test.ts
src/__tests__/e2e-setup.ts
src/__tests__/boot-smoke.test.ts
src/__tests__/performance-optimizations.test.ts
src/__tests__/test-helpers.tsx
src/__tests__/stub-engines-safety.test.ts
src/__tests__/useVAD.test.ts
src/__tests__/singularity-fusion-integration.test.ts
src/__tests__/setup.ts
src/__tests__/vitest-env.d.ts
src/__tests__/ai-subsystem-validation-v20omega.test.ts
src/__tests__/constitution-integration.test.ts
src/__tests__/test-globals.d.ts
src/__tests__/chatEngine.test.ts
src/__tests__/audioStateMachine.test.ts
src/__tests__/chat-ia-diagnostic.test.ts
src/__tests__/useTTSWithMicControl.test.ts
src/__tests__/chat-ia-critical-fixes.test.ts
src/__tests__/omega-provider-tests.test.ts
src/__tests__/evolutionIA.config.test.ts
src/__tests__/ui-first-10-responses.test.tsx
src/__tests__/omega-e2e-validation.test.ts
src/__tests__/multimodal-fusion.test.ts
src/__tests__/c1-contracts.test.ts
src/__tests__/memoryComponents.test.tsx
src/__tests__/ai-orchestrator-neural-fixed.test.ts
src/__tests__/c2-anti-silence.test.tsx
src/__tests__/e2e-performance.test.ts
src/__tests__/chat-ia-stability.test.ts
src/__tests__/ollama-proxy.test.ts
src/__tests__/automations.config.test.ts
src/__tests__/chatModes.config.test.ts
src/__tests__/useChat-streaming.test.ts
src/__tests__/e2e-ui-integration.test.tsx
src/__tests__/online-availability.test.ts
src/vite-env.d.ts
src/constants/timeouts.ts
src/api/tauriClient.ts

## C) Scans
### network surfaces in src
src/__tests__/apps/devtools/__snapshots__/DevToolsApp.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/stories/Page.stories.ts:9:    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
src/__tests__/apps/devtools/sections/__snapshots__/Dashboard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Engines.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Logs.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Errors.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Metrics.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/Memory.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/devtools/sections/__snapshots__/OmegaPipeline.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/apps/Settings/__snapshots__/Settings.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/stories/assets/youtube.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path fill="#ED1D24" d="M31.3313 8.44657C30.9633 7.08998 29.8791 6.02172 28.5022 5.65916C26.0067 5.00026 16 5.00026 16 5.00026C16 5.00026 5.99333 5.00026 3.4978 5.65916C2.12102 6.02172 1.03665 7.08998 0.668678 8.44657C0 10.9053 0 16.0353 0 16.0353C0 16.0353 0 21.1652 0.668678 23.6242C1.03665 24.9806 2.12102 26.0489 3.4978 26.4116C5.99333 27.0703 16 27.0703 16 27.0703C16 27.0703 26.0067 27.0703 28.5022 26.4116C29.8791 26.0489 30.9633 24.9806 31.3313 23.6242C32 21.1652 32 16.0353 32 16.0353C32 16.0353 32 10.9053 31.3313 8.44657Z"/><path fill="#fff" d="M12.7266 20.6934L21.0902 16.036L12.7266 11.3781V20.6934Z"/></svg>
src/stories/assets/accessibility.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 48 48"><title>Accessibility</title><circle cx="24.334" cy="24" r="24" fill="#A849FF" fill-opacity=".3"/><path fill="#A470D5" fill-rule="evenodd" d="M27.8609 11.585C27.8609 9.59506 26.2497 7.99023 24.2519 7.99023C22.254 7.99023 20.6429 9.65925 20.6429 11.585C20.6429 13.575 22.254 15.1799 24.2519 15.1799C26.2497 15.1799 27.8609 13.575 27.8609 11.585ZM21.8922 22.6473C21.8467 23.9096 21.7901 25.4788 21.5897 26.2771C20.9853 29.0462 17.7348 36.3314 17.3325 37.2275C17.1891 37.4923 17.1077 37.7955 17.1077 38.1178C17.1077 39.1519 17.946 39.9902 18.9802 39.9902C19.6587 39.9902 20.253 39.6293 20.5814 39.0889L20.6429 38.9874L24.2841 31.22C24.2841 31.22 27.5529 37.9214 27.9238 38.6591C28.2948 39.3967 28.8709 39.9902 29.7168 39.9902C30.751 39.9902 31.5893 39.1519 31.5893 38.1178C31.5893 37.7951 31.3639 37.2265 31.3639 37.2265C30.9581 36.3258 27.698 29.0452 27.0938 26.2771C26.8975 25.4948 26.847 23.9722 26.8056 22.7236C26.7927 22.333 26.7806 21.9693 26.7653 21.6634C26.7008 21.214 27.0231 20.8289 27.4097 20.7005L35.3366 18.3253C36.3033 18.0685 36.8834 16.9773 36.6256 16.0144C36.3678 15.0515 35.2722 14.4737 34.3055 14.7305C34.3055 14.7305 26.8619 17.1057 24.2841 17.1057C21.7062 17.1057 14.456 14.7947 14.456 14.7947C13.4893 14.5379 12.3937 14.9873 12.0715 15.9502C11.7493 16.9131 12.3293 18.0044 13.3604 18.3253L21.2873 20.7005C21.674 20.8289 21.9318 21.214 21.9318 21.6634C21.9174 21.9493 21.9053 22.2857 21.8922 22.6473Z" clip-rule="evenodd"/></svg>
src/stories/assets/github.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path fill="#161614" d="M16.0001 0C7.16466 0 0 7.17472 0 16.0256C0 23.1061 4.58452 29.1131 10.9419 31.2322C11.7415 31.3805 12.0351 30.8845 12.0351 30.4613C12.0351 30.0791 12.0202 28.8167 12.0133 27.4776C7.56209 28.447 6.62283 25.5868 6.62283 25.5868C5.89499 23.7345 4.8463 23.2419 4.8463 23.2419C3.39461 22.2473 4.95573 22.2678 4.95573 22.2678C6.56242 22.3808 7.40842 23.9192 7.40842 23.9192C8.83547 26.3691 11.1514 25.6609 12.0645 25.2514C12.2081 24.2156 12.6227 23.5087 13.0803 23.1085C9.52648 22.7032 5.7906 21.3291 5.7906 15.1886C5.7906 13.4389 6.41563 12.0094 7.43916 10.8871C7.27303 10.4834 6.72537 8.85349 7.59415 6.64609C7.59415 6.64609 8.93774 6.21539 11.9953 8.28877C13.2716 7.9337 14.6404 7.75563 16.0001 7.74953C17.3599 7.75563 18.7297 7.9337 20.0084 8.28877C23.0623 6.21539 24.404 6.64609 24.404 6.64609C25.2749 8.85349 24.727 10.4834 24.5608 10.8871C25.5868 12.0094 26.2075 13.4389 26.2075 15.1886C26.2075 21.3437 22.4645 22.699 18.9017 23.0957C19.4756 23.593 19.9869 24.5683 19.9869 26.0634C19.9869 28.2077 19.9684 29.9334 19.9684 30.4613C19.9684 30.8877 20.2564 31.3874 21.0674 31.2301C27.4213 29.1086 32 23.1037 32 16.0256C32 7.17472 24.8364 0 16.0001 0ZM5.99257 22.8288C5.95733 22.9084 5.83227 22.9322 5.71834 22.8776C5.60229 22.8253 5.53711 22.7168 5.57474 22.6369C5.60918 22.5549 5.7345 22.5321 5.85029 22.587C5.9666 22.6393 6.03284 22.7489 5.99257 22.8288ZM6.7796 23.5321C6.70329 23.603 6.55412 23.5701 6.45291 23.4581C6.34825 23.3464 6.32864 23.197 6.40601 23.125C6.4847 23.0542 6.62937 23.0874 6.73429 23.1991C6.83895 23.3121 6.85935 23.4605 6.7796 23.5321ZM7.31953 24.4321C7.2215 24.5003 7.0612 24.4363 6.96211 24.2938C6.86407 24.1513 6.86407 23.9804 6.96422 23.9119C7.06358 23.8435 7.2215 23.905 7.32191 24.0465C7.41968 24.1914 7.41968 24.3623 7.31953 24.4321ZM8.23267 25.4743C8.14497 25.5712 7.95818 25.5452 7.82146 25.413C7.68156 25.2838 7.64261 25.1004 7.73058 25.0035C7.81934 24.9064 8.00719 24.9337 8.14497 25.0648C8.28381 25.1938 8.3262 25.3785 8.23267 25.4743ZM9.41281 25.8262C9.37413 25.9517 9.19423 26.0088 9.013 25.9554C8.83203 25.9005 8.7136 25.7535 8.75016 25.6266C8.78778 25.5003 8.96848 25.4408 9.15104 25.4979C9.33174 25.5526 9.45044 25.6985 9.41281 25.8262ZM10.7559 25.9754C10.7604 26.1076 10.6067 26.2172 10.4165 26.2196C10.2252 26.2238 10.0704 26.1169 10.0683 25.9868C10.0683 25.8534 10.2185 25.7448 10.4098 25.7416C10.6001 25.7379 10.7559 25.8441 10.7559 25.9754ZM12.0753 25.9248C12.0981 26.0537 11.9658 26.1862 11.7769 26.2215C11.5912 26.2554 11.4192 26.1758 11.3957 26.0479C11.3726 25.9157 11.5072 25.7833 11.6927 25.7491C11.8819 25.7162 12.0512 25.7937 12.0753 25.9248Z"/></svg>
src/__tests__/components/ui/__snapshots__/Toast.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/stories/Page.tsx:26:          <a href="https://componentdriven.org" target="_blank" rel="noopener noreferrer">
src/stories/Page.tsx:49:            href="https://storybook.js.org/tutorials/"
src/stories/Page.tsx:57:            href="https://storybook.js.org/docs"
src/stories/Page.tsx:71:            xmlns="http://www.w3.org/2000/svg"
src/__tests__/components/ui/__snapshots__/Alert.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/stories/LazyImage.stories.tsx:144:      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"%3E%3Crect width="320" height="180" fill="%230A0A0A"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-family="Arial" font-size="14"%3ELoading...%3C/text%3E%3C/svg%3E',
src/stories/Header.stories.ts:12:  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
src/stories/Header.stories.ts:15:    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
src/assets/titane-arc-emerald.svg:5:  xmlns="http://www.w3.org/2000/svg"
src/__tests__/components/ui/__snapshots__/Switch.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/stories/Button.stories.ts:9:// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
src/stories/Button.stories.ts:14:    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
src/stories/Button.stories.ts:17:  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
src/stories/Button.stories.ts:19:  // More on argTypes: https://storybook.js.org/docs/api/argtypes
src/stories/Button.stories.ts:23:  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
src/stories/Button.stories.ts:30:// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
src/assets/titane-reactor-awen.svg:5:  xmlns="http://www.w3.org/2000/svg"
src/__tests__/components/ui/__snapshots__/Input.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/architecture/engine-isolation.test.ts:109:      /axios\./,
src/__tests__/components/ui/__snapshots__/Button.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Dialog.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/panels/__snapshots__/ChatPanel.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Tabs.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/panels/__snapshots__/CommandPalette.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Badge.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/ui/__snapshots__/Card.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/TypingIndicator.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/VirtualMessageList.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:58:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:87:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:145:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:187:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:221:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:269:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:308:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:344:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:392:              xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/chat/__snapshots__/ChatToolbar.test.tsx.snap:421:              xmlns="http://www.w3.org/2000/svg"
src/components/ui/LazyImage.tsx:47:  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%231a1a1a'/%3E%3C/svg%3E",
src/__tests__/features/chat/__snapshots__/ChatMessage.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/components/ui/button.tsx:77:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/components/devtools/__snapshots__/EventStream.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/EngineCard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/monitoring/__snapshots__/SystemHealthMonitor.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/MetricCard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/LogLine.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/LogFilters.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/MetricsDisplay.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/StatusPill.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/components/devtools/__snapshots__/SectionHeader.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/voice/__snapshots__/VoiceControl.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:21:      xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:104:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:133:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:161:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:204:            xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemorySearch.test.tsx.snap:266:            xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:24:        xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:83:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:118:          xmlns="http://www.w3.org/2000/svg"
src/__tests__/features/memory/__snapshots__/MemoryVisualization.test.tsx.snap:159:          xmlns="http://www.w3.org/2000/svg"
src/stories/assets/discord.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177575)"><mask id="mask0_10031_177575" style="mask-type:luminance" width="33" height="25" x="0" y="4" maskUnits="userSpaceOnUse"><path fill="#fff" d="M32.5034 4.00195H0.503906V28.7758H32.5034V4.00195Z"/></mask><g mask="url(#mask0_10031_177575)"><path fill="#5865F2" d="M27.5928 6.20817C25.5533 5.27289 23.3662 4.58382 21.0794 4.18916C21.0378 4.18154 20.9962 4.20057 20.9747 4.23864C20.6935 4.73863 20.3819 5.3909 20.1637 5.90358C17.7042 5.53558 15.2573 5.53558 12.8481 5.90358C12.6299 5.37951 12.307 4.73863 12.0245 4.23864C12.003 4.20184 11.9614 4.18281 11.9198 4.18916C9.63431 4.58255 7.44721 5.27163 5.40641 6.20817C5.38874 6.21578 5.3736 6.22848 5.36355 6.24497C1.21508 12.439 0.078646 18.4809 0.636144 24.4478C0.638667 24.477 0.655064 24.5049 0.677768 24.5227C3.41481 26.5315 6.06609 27.7511 8.66815 28.5594C8.70979 28.5721 8.75392 28.5569 8.78042 28.5226C9.39594 27.6826 9.94461 26.7968 10.4151 25.8653C10.4428 25.8107 10.4163 25.746 10.3596 25.7244C9.48927 25.3945 8.66058 24.9922 7.86343 24.5354C7.80038 24.4986 7.79533 24.4084 7.85333 24.3653C8.02108 24.2397 8.18888 24.109 8.34906 23.977C8.37804 23.9529 8.41842 23.9478 8.45249 23.963C13.6894 26.3526 19.359 26.3526 24.5341 23.963C24.5682 23.9465 24.6086 23.9516 24.6388 23.9757C24.799 24.1077 24.9668 24.2397 25.1358 24.3653C25.1938 24.4084 25.19 24.4986 25.127 24.5354C24.3298 25.0011 23.5011 25.3945 22.6296 25.7232C22.5728 25.7447 22.5476 25.8107 22.5754 25.8653C23.0559 26.7955 23.6046 27.6812 24.2087 28.5213C24.234 28.5569 24.2794 28.5721 24.321 28.5594C26.9357 27.7511 29.5869 26.5315 32.324 24.5227C32.348 24.5049 32.3631 24.4783 32.3656 24.4491C33.0328 17.5506 31.2481 11.5584 27.6344 6.24623C27.6256 6.22848 27.6105 6.21578 27.5928 6.20817ZM11.1971 20.8146C9.62043 20.8146 8.32129 19.3679 8.32129 17.5913C8.32129 15.8146 9.59523 14.368 11.1971 14.368C12.8115 14.368 14.0981 15.8273 14.0729 17.5913C14.0729 19.3679 12.7989 20.8146 11.1971 20.8146ZM21.8299 20.8146C20.2533 20.8146 18.9541 19.3679 18.9541 17.5913C18.9541 15.8146 20.228 14.368 21.8299 14.368C23.4444 14.368 24.7309 15.8273 24.7057 17.5913C24.7057 19.3679 23.4444 20.8146 21.8299 20.8146Z"/></g></g><defs><clipPath id="clip0_10031_177575"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
src/services/ai/providers/glm46v.ts:30:  baseUrl: 'http://127.0.0.1:8000/v1',
src/stories/assets/tutorials.svg:1:<svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" fill="none" viewBox="0 0 33 32"><g clip-path="url(#clip0_10031_177597)"><path fill="#B7F0EF" fill-rule="evenodd" d="M17 7.87059C17 6.48214 17.9812 5.28722 19.3431 5.01709L29.5249 2.99755C31.3238 2.64076 33 4.01717 33 5.85105V22.1344C33 23.5229 32.0188 24.7178 30.6569 24.9879L20.4751 27.0074C18.6762 27.3642 17 25.9878 17 24.1539L17 7.87059Z" clip-rule="evenodd" opacity=".7"/><path fill="#87E6E5" fill-rule="evenodd" d="M1 5.85245C1 4.01857 2.67623 2.64215 4.47507 2.99895L14.6569 5.01848C16.0188 5.28861 17 6.48354 17 7.87198V24.1553C17 25.9892 15.3238 27.3656 13.5249 27.0088L3.34311 24.9893C1.98119 24.7192 1 23.5242 1 22.1358V5.85245Z" clip-rule="evenodd"/><path fill="#61C1FD" fill-rule="evenodd" d="M15.543 5.71289C15.543 5.71289 16.8157 5.96289 17.4002 6.57653C17.9847 7.19016 18.4521 9.03107 18.4521 9.03107C18.4521 9.03107 18.4521 25.1106 18.4521 26.9629C18.4521 28.8152 19.3775 31.4174 19.3775 31.4174L17.4002 28.8947L16.2575 31.4174C16.2575 31.4174 15.543 29.0765 15.543 27.122C15.543 25.1674 15.543 5.71289 15.543 5.71289Z" clip-rule="evenodd"/></g><defs><clipPath id="clip0_10031_177597"><rect width="32" height="32" fill="#fff" transform="translate(0.5)"/></clipPath></defs></svg>
src/stories/Header.tsx:25:          xmlns="http://www.w3.org/2000/svg"
src/stories/Configure.mdx:54:        href="https://storybook.js.org/docs/configure/styling-and-css/?renderer=react&ref=configure"
src/stories/Configure.mdx:66:        href="https://storybook.js.org/docs/writing-stories/decorators/?renderer=react&ref=configure#context-for-mocking"
src/stories/Configure.mdx:78:          href="https://storybook.js.org/docs/configure/images-and-assets/?renderer=react&ref=configure"
src/stories/Configure.mdx:101:          href="https://storybook.js.org/docs/writing-docs/autodocs/?renderer=react&ref=configure"
src/stories/Configure.mdx:110:          href="https://storybook.js.org/docs/sharing/publish-storybook/?renderer=react&ref=configure#publish-storybook-with-chromatic"
src/stories/Configure.mdx:120:          href="https://storybook.js.org/docs/sharing/design-integrations/?renderer=react&ref=configure#embed-storybook-in-figma-with-the-plugin"
src/stories/Configure.mdx:130:          href="https://storybook.js.org/docs/writing-tests/?renderer=react&ref=configure"
src/stories/Configure.mdx:139:          href="https://storybook.js.org/docs/writing-tests/accessibility-testing/?renderer=react&ref=configure"
src/stories/Configure.mdx:148:          href="https://storybook.js.org/docs/configure/theming/?renderer=react&ref=configure"
src/stories/Configure.mdx:160:        href="https://storybook.js.org/addons/?ref=configure"
src/stories/Configure.mdx:175:        href="https://github.com/storybookjs/storybook"
src/stories/Configure.mdx:185:          href="https://discord.gg/storybook"
src/stories/Configure.mdx:196:          href="https://www.youtube.com/@chromaticui"
src/stories/Configure.mdx:206:          href="https://storybook.js.org/tutorials/?ref=configure"
src/services/monitoring/sentry.ts:44:    // Obtenir à : https://sentry.io/settings/projects/
src/services/tts/hybridTTS.ts:236:      console.log(`📡 Mode: Local API (http://localhost:8765)`);
src/config/offline-first.ts:34:  localLLM: 'http://localhost:8000',
src/config/offline-first.ts:37:  gemini: 'https://generativelanguage.googleapis.com/v1beta',
src/config/offline-first.ts:38:  openai: 'https://api.openai.com/v1',
src/config/offline-first.ts:77:    await httpClient.head('https://www.google.com/favicon.ico', {
src/config/index.ts:26:      if (env.isBrowser && env.isDev) return 'http://localhost:1420';
src/features/governance-center/components/APIProviderCard.tsx:28:    helpUrl: 'https://makersuite.google.com/app/apikey',
src/features/governance-center/components/APIProviderCard.tsx:36:    helpUrl: 'https://platform.openai.com/api-keys',
src/features/governance-center/components/APIProviderCard.tsx:44:    helpUrl: 'https://console.anthropic.com/settings/keys',
src/features/governance-center/components/APIProviderCard.tsx:52:    helpUrl: 'https://ollama.com/download',
src/features/governance-center/components/APIProviderCard.tsx:167:                  curl -fsSL https://ollama.com/install.sh | sh
src/features/governance-center/types.ts:135:      'GitHub Copilot / GitHub Models API (https://github.com/marketplace/models)',
src/components/chat/ChatModeSelector.css:267:  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
src/features/governance-center/tabs/SecretsTab.tsx:588:              href="https://github.com/settings/tokens"
src/tests/security.test.ts:29:      expect(Sanitizer.validateUrl('https://example.com')).toBe(true);
src/tests/security.test.ts:30:      expect(Sanitizer.validateUrl('http://example.com')).toBe(true);
src/components/chat/ConversationsButton.tsx:39:        xmlns="http://www.w3.org/2000/svg"
src/components/sections/ConversationSection.tsx:227:    `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:228:    `https://fr.wikipedia.org/w/index.php?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:229:    `https://fr.wiktionary.org/wiki/${topicSlug}`,
src/components/sections/ConversationSection.tsx:230:    `https://www.wikidata.org/wiki/Special:Search?search=${topicQuery}`,
src/components/sections/ConversationSection.tsx:236:    target_url: seeds[0] ?? `https://fr.wikipedia.org/wiki/${topicSlug}`,
src/types/aiModel.ts:67:    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
src/types/aiModel.ts:81:    endpoint: 'https://api.openai.com/v1/chat/completions',
src/types/aiModel.ts:110:    endpoint: 'https://api.anthropic.com/v1/messages',
src/tests/activeListeningIntegration.test.ts:125:    origin: 'http://localhost',
src/tests/e2e/titane_e2e.test.ts:359:        { title: 'Cognitive Architecture Overview', url: 'https://example.com/1' },
src/tests/e2e/titane_e2e.test.ts:360:        { title: 'TITANE Systems Design', url: 'https://example.com/2' },
src/pages/ResearchPage.tsx:83:    `https://fr.wikipedia.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:84:    `https://fr.wikipedia.org/w/index.php?search=${query}`,
src/pages/ResearchPage.tsx:85:    `https://fr.wiktionary.org/wiki/${slug}`,
src/pages/ResearchPage.tsx:86:    `https://www.wikidata.org/wiki/Special:Search?search=${query}`,
src/__tests__/features/memory/__snapshots__/MemoryCard.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
src/core/holography/HOLOMESH_ENGINE.ts:215:    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="holomesh">`;
src/modules/fusion/DatasetBuilder.ts:340:    echo "   curl -fsSL https://ollama.com/install.sh | sh"
src/CARTE_POINTS_CRITIQUES.ts:137: *     "devUrl": "http://localhost:5173",
src/CARTE_POINTS_CRITIQUES.ts:142: *   "devUrl": "http://localhost:1420"  ❌ (mode HTTP obsolète)
src/CARTE_POINTS_CRITIQUES.ts:240: *      → "devUrl": "http://localhost:5173" ✅ (dev server encapsulé par Tauri)
src/entry.ts:107:    const response = await fetch('./main-entry.json', { cache: 'no-store' });
src/utils/__tests__/webVitals.test.ts:131:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:149:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:169:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:189:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:209:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:231:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:248:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:278:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:305:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:316:        url: 'http://localhost',
src/utils/__tests__/webVitals.test.ts:433:      url: 'http://localhost',
src/hooks/useChat.ts:1806:   curl -fsSL https://ollama.com/install.sh | sh
src/modules/devSudo/devSudoHandler.ts:2609:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoHandler.ts:2662:3. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoHandler.ts:2847:2. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoHandler.ts:2886:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoHandler.ts:2947:3. Tester proxy: \`curl http://localhost:11434/api/tags\`
src/lib/accessibility.ts:119: * https://www.w3.org/WAI/GL/wiki/Relative_luminance
src/lib/accessibility.ts:132: * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
src/lib/security/__tests__/policyFirewallV2.test.ts:11:    const result = evaluateAttackModelV2('send all data to https://evil.example/exfil');
src/lib/security/__tests__/policyFirewallV2.test.ts:18:    const decision = evaluatePolicyFirewallV2('please post to https://evil.example', {
src/modules/devSudo/devSudoBuiltins.ts:525:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:579:3. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoBuiltins.ts:648:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:765:2. Le proxy répond-il ? → \`curl http://localhost:11434/api/tags\`
src/modules/devSudo/devSudoBuiltins.ts:804:curl http://localhost:11434/api/tags
src/modules/devSudo/devSudoBuiltins.ts:865:3. Tester proxy: \`curl http://localhost:11434/api/tags\`
src/modules/dataCollector/DataCollectorEngine.ts:553:    echo "❌ Ollama not installed. Install: https://ollama.ai"

### invoke surfaces in src
src/modules/devSudo/talkHandlersStubs.ts:14:1. Update imports: Use @tauri-apps/plugin-fs instead of @tauri-apps/api/fs
src/modules/devSudo/devSudoBackendHandlers.ts:125:   invoke('memory_scan') → #[tauri::command] memory_scan()
src/modules/devSudo/devSudoBackendHandlers.ts:126:   invoke('secure_store_key') → #[tauri::command] secure_store_key()
src/modules/devSudo/devSudoBackendHandlers.ts:127:   invoke('camera_start') → #[tauri::command] camera_start()
src/modules/devSudo/devSudoBackendHandlers.ts:298:   invoke('${handlerName}').then(console.log).catch(console.error)
src/modules/devSudo/devSudoSingularityHandlers.ts:948:  await invoke('command');
src/context/TitanStateContext.tsx:25:import { listen } from '@tauri-apps/api/event';
src/components/ErrorBoundary.tsx:85:    // 4. Tauri command: invoke('watchdog:report_ui_error', { errorReport })
src/core/commands/TAURI_COMMANDS.ts:222: * Helper pour invoke() avec validation et protection robuste
src/core/commands/TAURI_COMMANDS.ts:234:    const tauriCore = await import('@tauri-apps/api/core');
src/__tests__/core/commands/TAURI_COMMANDS.test.ts:17:  it('invokeTauri() devrait appeler @tauri-apps/api/core.invoke', async () => {
src/__tests__/core/commands/TAURI_COMMANDS.test.ts:20:    vi.doMock('@tauri-apps/api/core', () => ({ invoke }));
src/__tests__/core/commands/TAURI_COMMANDS.test.ts:45:    vi.doMock('@tauri-apps/api/core', () => ({ invoke }));
src/__tests__/core/commands/TAURI_COMMANDS.test.ts:64:    vi.doMock('@tauri-apps/api/core', () => ({ invoke: undefined }));
src/__tests__/singularity-fusion-mocked.test.ts:11:vi.mock('@tauri-apps/api/core', () => ({
src/__tests__/singularity-fusion-mocked.test.ts:82:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:83:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-mocked.test.ts:94:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:95:      const score = await invoke('singularity_perform_sync');
src/__tests__/singularity-fusion-mocked.test.ts:103:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:104:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-mocked.test.ts:113:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:114:      const intention = await invoke('pipeline_analyze_intention', {
src/__tests__/singularity-fusion-mocked.test.ts:125:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:126:      const response = await invoke('pipeline_generate_cognitive_response', {
src/__tests__/singularity-fusion-mocked.test.ts:139:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:140:      const warnings = await invoke('autofix_detect_rust_warnings');
src/__tests__/singularity-fusion-mocked.test.ts:148:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:149:      const modules = await invoke('autoheal_detect_broken_modules');
src/__tests__/singularity-fusion-mocked.test.ts:157:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:158:      const metrics = await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-mocked.test.ts:170:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:171:      const threats = await invoke('crashguard_detect_threats');
src/__tests__/singularity-fusion-mocked.test.ts:179:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:182:      const intention = await invoke('pipeline_analyze_intention', {
src/__tests__/singularity-fusion-mocked.test.ts:188:      const response = await invoke('pipeline_generate_cognitive_response', {
src/__tests__/singularity-fusion-mocked.test.ts:195:      const metrics = await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-mocked.test.ts:199:      const threats = await invoke('crashguard_detect_threats');
src/__tests__/singularity-fusion-mocked.test.ts:204:      const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/singularity-fusion-mocked.test.ts:206:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-mocked.test.ts:207:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-mocked.test.ts:208:      const metrics = await invoke('performance_get_metrics');
src/components/ChatErrorBoundary.tsx:358:      // await invoke('report_chat_error', {
src/__tests__/services/ai/ollamaTransportAbort.test.ts:5:vi.mock('@tauri-apps/api/core', () => ({
src/test/integration.test.ts:20:import * as tauriCore from '@tauri-apps/api/core';
src/test/integration.test.ts:23:vi.mock('@tauri-apps/api/core');
src/test/setup.ts:649:// Mock @tauri-apps/api
src/test/setup.ts:650:vi.mock('@tauri-apps/api/core', () => ({
src/test/setup.ts:654:vi.mock('@tauri-apps/api/event', () => ({
src/__tests__/services/performanceEngine/performanceEngine.test.ts:541:    expect(snapshot.frontend.tauri.invokeLatency).toBeGreaterThanOrEqual(0);
src/components/__tests__/evolutionEngine.test.ts:48:vi.mock('@tauri-apps/api/core', () => ({
src/components/performance/MetricsGraph.tsx:601:      return snapshot.frontend.tauri.invokeLatency;
src/__tests__/omega-provider-tests.test.ts:22:import * as tauriCore from '@tauri-apps/api/core';
src/apps/devtools/hooks/useDevToolsEvents.ts:8:import { listen, UnlistenFn } from '@tauri-apps/api/event';
src/apps/devtools/utils/mockEvents.ts:8:import { emit } from '@tauri-apps/api/event';
src/__tests__/integration/TauriIntegration.test.tsx:7:import { invoke } from '@tauri-apps/api/core';
src/__tests__/integration/TauriIntegration.test.tsx:8:import { Window } from '@tauri-apps/api/window';
src/__tests__/integration/TauriIntegration.test.tsx:11:vi.mock('@tauri-apps/api/core', () => ({
src/__tests__/integration/TauriIntegration.test.tsx:15:vi.mock('@tauri-apps/api/window', () => ({
src/__tests__/integration/TauriIntegration.test.tsx:33:      const result = await invoke('get_system_info');
src/__tests__/integration/TauriIntegration.test.tsx:42:      await invoke('save_settings', { theme: 'dark', language: 'fr' });
src/__tests__/integration/TauriIntegration.test.tsx:53:      await expect(invoke('invalid_command')).rejects.toThrow('Backend error');
src/__tests__/integration/TauriIntegration.test.tsx:144:      const result = await invoke('store_memory', {
src/__tests__/integration/TauriIntegration.test.tsx:158:      const memories = await invoke('get_memories', { tier: 'STM' });
src/__tests__/integration/TauriIntegration.test.tsx:166:      await invoke('delete_memory', { id: '123' });
src/__tests__/integration/TauriIntegration.test.tsx:180:      const metrics = await invoke('get_performance_metrics');
src/__tests__/integration/TauriIntegration.test.tsx:199:      const metrics1 = await invoke('get_performance_metrics');
src/__tests__/integration/TauriIntegration.test.tsx:200:      const metrics2 = await invoke('get_performance_metrics');
src/modules/avatar/floating/appearanceFloatingIntegration.test.ts:31:vi.mock('@tauri-apps/api/core', () => ({
src/core/identity/defaultIdentityMatrix.ts:286:    const { invoke } = await import('@tauri-apps/api/core');
src/__tests__/hooks/useSingularity.test.tsx:10:vi.mock('@tauri-apps/api/core', () => ({
src/__tests__/hooks/useChat.test.tsx:11:vi.mock('@tauri-apps/api/core', () => ({
src/hooks/__tests__/fusion-hooks.test.ts:20:// Mock @tauri-apps/api avec invoke simplifié
src/hooks/__tests__/fusion-hooks.test.ts:21:vi.mock('@tauri-apps/api/core', () => ({
src/hooks/__tests__/fusion-hooks.test.ts:54:import { invoke } from '@tauri-apps/api/core';
src/__tests__/hooks/useWindowControls.test.tsx:10:vi.mock('@tauri-apps/api/event', () => ({
src/hooks/useMultimodalPresence.ts:285:    // 1. Engine call: multimodalPresenceEngine.activateMirroring() or invoke('presence:activate_mirroring')
src/hooks/useMultimodalPresence.ts:296:    // 1. Engine call: multimodalPresenceEngine.deactivateMirroring() or invoke('presence:deactivate_mirroring')
src/hooks/useWhisperStream.ts:27:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/__tests__/e2e-automated-validation.test.tsx:1770:vi.mock('@tauri-apps/api/core', () => ({
src/__tests__/e2e-automated-validation.test.tsx:1942:  const { invoke } = vi.mocked(await import('@tauri-apps/api/core'));
src/__tests__/e2e-automated-validation.test.tsx:1949:        const intention = (await invoke('pipeline_analyze_intention', {
src/__tests__/e2e-automated-validation.test.tsx:1953:        const response = (await invoke('pipeline_generate_cognitive_response', {
src/__tests__/e2e-automated-validation.test.tsx:1986:        const rustWarnings = await invoke('autofix_detect_rust_warnings');
src/__tests__/e2e-automated-validation.test.tsx:1987:        const tsErrors = await invoke('autofix_detect_typescript_errors');
src/__tests__/e2e-automated-validation.test.tsx:1988:        const brokenModules = await invoke('autoheal_detect_broken_modules');
src/__tests__/e2e-automated-validation.test.tsx:1995:          await invoke('autofix_fix_all');
src/__tests__/e2e-automated-validation.test.tsx:2000:            await invoke('autoheal_heal_cognitive_module', {
src/__tests__/e2e-automated-validation.test.tsx:2007:        const integrity = await invoke('singularity_check_integrity');
src/__tests__/e2e-automated-validation.test.tsx:2025:        const tts = await invoke('pipeline_prepare_tts', {
src/__tests__/e2e-automated-validation.test.tsx:2029:        const animation = await invoke('pipeline_prepare_avatar_animation', {
src/__tests__/e2e-automated-validation.test.tsx:2049:        const state = await invoke('singularity_get_fusion_state');
src/__tests__/e2e-automated-validation.test.tsx:2050:        const metrics = await invoke('performance_get_metrics');
src/__tests__/e2e-automated-validation.test.tsx:2066:      const intention = (await invoke('pipeline_analyze_intention', {
src/__tests__/e2e-automated-validation.test.tsx:2070:      const response = (await invoke('pipeline_generate_cognitive_response', {
src/__tests__/e2e-automated-validation.test.tsx:2086:        const metrics = await invoke('performance_get_metrics');
src/__tests__/e2e-automated-validation.test.tsx:2102:            invoke('singularity_get_fusion_state'),
src/__tests__/e2e-automated-validation.test.tsx:2103:            invoke('performance_get_metrics'),
src/__tests__/e2e-automated-validation.test.tsx:2104:            invoke('pipeline_get_stats'),
src/__tests__/e2e-automated-validation.test.tsx:2127:        void (await invoke('crashguard_detect_threats'));
src/__tests__/e2e-automated-validation.test.tsx:2128:        const broken = await invoke('autoheal_detect_broken_modules');
src/__tests__/e2e-automated-validation.test.tsx:2132:          const healed = await invoke('autoheal_heal_cognitive_module', {
src/__tests__/e2e-automated-validation.test.tsx:2140:        const integrity = await invoke('singularity_check_integrity');
src/__tests__/e2e-automated-validation.test.tsx:2151:      const state = (await invoke('singularity_get_fusion_state')) as FusionStateResponse;
src/__tests__/e2e-automated-validation.test.tsx:2152:      const integrity = (await invoke('singularity_check_integrity')) as number;
src/__tests__/e2e-automated-validation.test.tsx:2153:      const metrics = (await invoke('performance_get_metrics')) as PerformanceMetrics;
src/__tests__/e2e-automated-validation.test.tsx:2154:      const stats = (await invoke('autofix_get_stats')) as AutoFixStats;
src/__tests__/e2e-automated-validation.test.tsx:2167:        const metrics = (await invoke('performance_get_metrics')) as {
src/__tests__/e2e-automated-validation.test.tsx:2183:      const fusionState = (await invoke(
src/__tests__/e2e-automated-validation.test.tsx:2189:      const pipelineStats = (await invoke('pipeline_get_stats')) as PipelineStats;
src/__tests__/e2e-automated-validation.test.tsx:2193:      const perfMetrics = (await invoke('performance_get_metrics')) as PerformanceMetrics;
src/__tests__/e2e-automated-validation.test.tsx:2197:      const threats = (await invoke('crashguard_detect_threats')) as unknown[];
src/__tests__/e2e-automated-validation.test.tsx:2201:      const autofixStats = (await invoke('autofix_get_stats')) as AutoFixStats;
src/__tests__/lib/security/secureInvokeAbort.test.ts:5:vi.mock('@tauri-apps/api/core', () => ({
src/tests/e2e/titane_e2e.test.ts:116:      const health = await invoke('get_system_health');
src/tests/e2e/titane_e2e.test.ts:125:      const state = await invoke('singularity_get_full_state');
src/tests/e2e/titane_e2e.test.ts:134:      const response = await invoke('conversation_generate', {
src/tests/e2e/titane_e2e.test.ts:154:      const result = await invoke('memory_save_chat_interaction', {
src/tests/e2e/titane_e2e.test.ts:168:      const stats = await invoke('memory_get_stats');
src/tests/e2e/titane_e2e.test.ts:177:      const event = await invoke('add_timeline_event', {
src/tests/e2e/titane_e2e.test.ts:191:      const coherence = await invoke('singularity_get_global_coherence');
src/tests/e2e/titane_e2e.test.ts:236:      const files = await invoke('secure_list_files');
src/tests/e2e/titane_e2e.test.ts:245:      const parsed = await invoke('parse_document', {
src/tests/e2e/titane_e2e.test.ts:257:      const analysis = await invoke('conversation_generate', {
src/tests/e2e/titane_e2e.test.ts:276:      const result = await invoke('store_file', {
src/tests/e2e/titane_e2e.test.ts:290:      const event = await invoke('add_timeline_event', {
src/tests/e2e/titane_e2e.test.ts:304:      const files = await invoke('get_files_by_category', { category: 'legal' });
src/tests/e2e/titane_e2e.test.ts:369:      const synthesis = await invoke('conversation_generate', {
src/tests/e2e/titane_e2e.test.ts:388:      const stored = await invoke('memory_store', {
src/tests/e2e/titane_e2e.test.ts:399:      const event = await invoke('add_timeline_event', {
src/tests/e2e/titane_e2e.test.ts:448:      const state = await invoke('meta_get_state');
src/tests/e2e/titane_e2e.test.ts:457:      const sync = await invoke('meta_trigger_sync');
src/tests/e2e/titane_e2e.test.ts:466:      const alignment = await invoke('meta_get_alignment');
src/tests/e2e/titane_e2e.test.ts:475:      const report = await invoke('meta_get_report');
src/tests/e2e/titane_e2e.test.ts:484:      const coherence = await invoke('singularity_check_coherence');
src/tests/e2e/titane_e2e.test.ts:493:      const selftest = await invoke('meta_selftest_all');
src/tests/e2e/titane_e2e.test.ts:502:      const metrics = await invoke('meta_get_monitoring_metrics');
src/tests/e2e/titane_e2e.test.ts:547:      const message = await invoke('conversation_generate', {
src/tests/e2e/titane_e2e.test.ts:554:      await invoke('memory_save_chat_interaction', {
src/tests/e2e/titane_e2e.test.ts:567:      const projects = await invoke('memory_get_active_projects');
src/tests/e2e/titane_e2e.test.ts:576:      const parsed = await invoke('parse_document', {
src/tests/e2e/titane_e2e.test.ts:587:      const snapshot = await invoke('write_snapshot', {
src/tests/e2e/titane_e2e.test.ts:600:      const sync = await invoke('meta_trigger_sync');
src/tests/e2e/titane_e2e.test.ts:608:      const state = await invoke('singularity_get_full_state');
src/tests/e2e/titane_e2e.test.ts:617:      const coherence = await invoke('singularity_get_global_coherence');
src/tests/regression/titane_regression.test.ts:67:          await invoke('memory_get_stats');
src/tests/regression/titane_regression.test.ts:69:          await invoke('singularity_get_full_state');
src/tests/regression/titane_regression.test.ts:71:          await invoke('cognitive_get_map');
src/tests/regression/titane_regression.test.ts:73:          await invoke('meta_get_state');
src/tests/regression/titane_regression.test.ts:75:          await invoke('get_timeline');
src/tests/regression/titane_regression.test.ts:77:          await invoke('chat_get_providers_status');
src/tests/regression/titane_regression.test.ts:117:        await invoke(command, {}).catch(() => {
src/tests/regression/titane_regression.test.ts:150:      const stats = await invoke('memory_get_stats');
src/tests/regression/titane_regression.test.ts:179:      const timeline = await invoke('get_timeline');
src/tests/regression/titane_regression.test.ts:213:      const state = await invoke('singularity_get_full_state');
src/tests/regression/titane_regression.test.ts:251:      await invoke('parse_document', {
src/tests/regression/titane_regression.test.ts:281:      const timeline = await invoke('get_timeline');
src/tests/regression/titane_regression.test.ts:331:      const response = await invoke('conversation_generate', {
src/tests/regression/titane_regression.test.ts:382:      const status = await invoke('chat_get_providers_status');
src/tests/regression/titane_regression.test.ts:419:      const state = await invoke('singularity_get_full_state');
src/tests/regression/titane_regression.test.ts:420:      const coherence = await invoke('singularity_get_global_coherence');
src/tests/regression/titane_regression.test.ts:483:      const stateBefore = await invoke('meta_get_state');
src/tests/regression/titane_regression.test.ts:484:      await invoke('meta_trigger_sync');
src/tests/regression/titane_regression.test.ts:485:      const stateAfter = await invoke('meta_get_state');
src/tests/regression/titane_regression.test.ts:499:      const alignment = await invoke('meta_get_alignment');
src/core/devops/LocalAgentEngine.ts:960:      // 1. Tauri: invoke('fs_exists', {path}) - requires Tauri command registration
src/core/devops/LocalAgentEngine.ts:972:      // 1. Tauri: invoke('read_json_file', {path}) - type-safe, sandboxed
src/main.tsx:180:  void import('@tauri-apps/api/event')
src/main.tsx:643:    const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
src/core/devops/VisualDevOpsEngine.ts:816:    // 2. Tauri filesystem: Use invoke('fs:write_file', { path, content }) to save
src/entry.ts:16:      await invoke('boot_marker_log', { marker });
src/services/api/index.ts:15: * Remplace les `invoke()` dispersés par une API cohérente + cache + validation.
src/services/api/index.ts:126: * Phase 2 (Semaine 2): Refactor tous les invoke() existants
src/services/api/index.ts:130: * grep -r "invoke(" src/ --include="*.ts" --include="*.tsx"
src/services/api/index.ts:136: *    `invoke('memory_get_active_projects')`
src/services/api/index.ts:140: *    `invoke('conversation_generate', { args: { message, conversationId, mode } })`
src/services/api/index.ts:144: *    `invoke('speak', { text })`
src/services/api/index.ts:148: *    `invoke('persona_get_multipliers')`
src/services/api/index.ts:152: *    `invoke('system_get_status')`
src/__tests__/singularity-fusion-integration.test.ts:11:import { invoke } from '@tauri-apps/api/core';
src/__tests__/singularity-fusion-integration.test.ts:16:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-integration.test.ts:24:      const score = await invoke('singularity_perform_sync');
src/__tests__/singularity-fusion-integration.test.ts:31:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-integration.test.ts:38:      const snapshotId = await invoke('singularity_create_snapshot', {
src/__tests__/singularity-fusion-integration.test.ts:46:      const metrics = await invoke('singularity_get_metrics');
src/__tests__/singularity-fusion-integration.test.ts:53:      const diagnostics = await invoke('singularity_get_diagnostics');
src/__tests__/singularity-fusion-integration.test.ts:62:      const intention = await invoke('pipeline_analyze_intention', {
src/__tests__/singularity-fusion-integration.test.ts:71:      const response = await invoke('pipeline_generate_cognitive_response', {
src/__tests__/singularity-fusion-integration.test.ts:81:      const tts = await invoke('pipeline_prepare_tts', {
src/__tests__/singularity-fusion-integration.test.ts:90:      const stats = await invoke('pipeline_get_stats');
src/__tests__/singularity-fusion-integration.test.ts:97:      const valid = await invoke('pipeline_validate');
src/__tests__/singularity-fusion-integration.test.ts:104:      const issues = await invoke('autofix_detect_rust_warnings');
src/__tests__/singularity-fusion-integration.test.ts:109:      const issues = await invoke('autofix_detect_typescript_errors');
src/__tests__/singularity-fusion-integration.test.ts:114:      const stats = await invoke('autofix_get_stats');
src/__tests__/singularity-fusion-integration.test.ts:122:      const history = await invoke('autofix_get_history');
src/__tests__/singularity-fusion-integration.test.ts:129:      const modules = await invoke('autoheal_detect_broken_modules');
src/__tests__/singularity-fusion-integration.test.ts:134:      const result = await invoke('autoheal_heal_cognitive_module');
src/__tests__/singularity-fusion-integration.test.ts:142:      const result = await invoke('autoheal_heal_avatar_module');
src/__tests__/singularity-fusion-integration.test.ts:148:      const history = await invoke('autoheal_get_history');
src/__tests__/singularity-fusion-integration.test.ts:155:      const metrics = await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-integration.test.ts:164:      await expect(invoke('performance_throttle_cpu')).resolves.toBeUndefined();
src/__tests__/singularity-fusion-integration.test.ts:168:      await expect(invoke('performance_optimize_gpu')).resolves.toBeUndefined();
src/__tests__/singularity-fusion-integration.test.ts:172:      await expect(invoke('performance_compress_memory')).resolves.toBeUndefined();
src/__tests__/singularity-fusion-integration.test.ts:178:      const threats = await invoke('crashguard_detect_threats');
src/__tests__/singularity-fusion-integration.test.ts:183:      const threats = await invoke('crashguard_get_active_threats');
src/__tests__/singularity-fusion-integration.test.ts:188:      const stats = await invoke('crashguard_get_stats');
src/__tests__/singularity-fusion-integration.test.ts:196:      const intention = await invoke('pipeline_analyze_intention', {
src/__tests__/singularity-fusion-integration.test.ts:202:      const response = await invoke('pipeline_generate_cognitive_response', {
src/__tests__/singularity-fusion-integration.test.ts:209:      const tts = await invoke('pipeline_prepare_tts', {
src/__tests__/singularity-fusion-integration.test.ts:215:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-integration.test.ts:219:      const metrics = await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-integration.test.ts:225:      const broken = await invoke('autoheal_detect_broken_modules');
src/__tests__/singularity-fusion-integration.test.ts:229:      const healResult = await invoke('autoheal_heal_cognitive_module');
src/__tests__/singularity-fusion-integration.test.ts:233:      await invoke('autoheal_resync_state');
src/__tests__/singularity-fusion-integration.test.ts:236:      const integrity = await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-integration.test.ts:243:        await invoke('singularity_perform_sync');
src/__tests__/singularity-fusion-integration.test.ts:244:        await invoke('singularity_check_integrity');
src/__tests__/singularity-fusion-integration.test.ts:245:        await invoke('performance_get_metrics');
src/__tests__/singularity-fusion-integration.test.ts:249:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-integration.test.ts:258:      await invoke('singularity_reset');
src/__tests__/singularity-fusion-integration.test.ts:259:      await invoke('autofix_reset');
src/__tests__/singularity-fusion-integration.test.ts:260:      await invoke('autoheal_reset');
src/__tests__/singularity-fusion-integration.test.ts:261:      await invoke('performance_reset_optimizations');
src/__tests__/singularity-fusion-integration.test.ts:264:      const state = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-integration.test.ts:267:      const fixStats = await invoke('autofix_get_stats');
src/__tests__/singularity-fusion-integration.test.ts:272:      const baselineState = await invoke('singularity_get_fusion_state');
src/__tests__/singularity-fusion-integration.test.ts:274:      const snapshotId = await invoke('singularity_create_snapshot', {
src/__tests__/singularity-fusion-integration.test.ts:280:      await invoke('singularity_perform_sync');
src/__tests__/singularity-fusion-integration.test.ts:283:      await invoke('singularity_restore_snapshot', { snapshotId });
src/__tests__/singularity-fusion-integration.test.ts:286:      const state = await invoke('singularity_get_fusion_state');
src/services/api/chat.ts:9:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/hooks/useWindowControls.ts:6:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/hooks/useDevicePermissions.ts:266:  // - API: await invoke('plugin:screenshots|capture', {monitor: 0})
src/services/ai/__tests__/ConversationManager.test.ts:64:vi.mock('@tauri-apps/api/event', () => ({
src/services/tauri/chatEngine.commands.ts:14:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/lib/security.ts:1901:      const tauriCore = await import('@tauri-apps/api/core');
src/services/autoAuditEngine.ts:451:      //   import { writeTextFile } from '@tauri-apps/api/fs';
src/services/evolutionEngine/index.ts:254:      // await invoke('sync_evolution_state', { snapshot });
src/lib/logger.ts:285:      // await invoke('log_to_file', { entry: this.formatEntry(_entry) });
src/services/ai/providers/tauriChat.ts:9: *   PHASE 4Ω: Protection invoke() • Timeout handling • Error isolation
src/lib/tauriClient.ts:5: * - `invoke()` autorisé uniquement dans ce fichier
src/lib/tauriClient.ts:53: * **RÈGLE CRITIQUE:** Aucun appel `invoke()` direct autorisé hors de ce fichier
src/lib/tauriClient.ts:108:    return await this.invoke(
src/lib/tauriClient.ts:115:    return await this.invoke(
src/lib/tauriClient.ts:122:    return await this.invoke(
src/lib/tauriClient.ts:129:    return await this.invoke(
src/lib/tauriClient.ts:136:    return await this.invoke(
src/lib/tauriClient.ts:143:    return await this.invoke(
src/lib/tauriClient.ts:150:    return await this.invoke(
src/lib/tauriClient.ts:157:    return await this.invoke(
src/lib/tauriClient.ts:164:    return await this.invoke(
src/lib/tauriClient.ts:171:    return await this.invoke(
src/lib/tauriClient.ts:178:    return await this.invoke(
src/lib/tauriClient.ts:185:    return await this.invoke(
src/lib/tauriClient.ts:192:    return await this.invoke(
src/lib/tauriClient.ts:199:    return await this.invoke(
src/lib/tauriClient.ts:206:    return await this.invoke(
src/lib/tauriClient.ts:213:    return await this.invoke(
src/lib/tauriClient.ts:220:    return await this.invoke(
src/lib/tauriClient.ts:227:    return await this.invoke(
src/lib/tauriClient.ts:234:    return await this.invoke(
src/lib/tauriClient.ts:241:    return await this.invoke(
src/lib/tauriClient.ts:248:    return await this.invoke(
src/lib/tauriClient.ts:255:    return await this.invoke(
src/lib/tauriClient.ts:262:    return await this.invoke(
src/lib/tauriClient.ts:269:    return await this.invoke(
src/lib/tauriClient.ts:276:    return await this.invoke(
src/lib/tauriClient.ts:283:    return await this.invoke(
src/lib/tauriClient.ts:290:    return await this.invoke(
src/lib/tauriClient.ts:297:    return await this.invoke(
src/lib/tauriClient.ts:304:    return await this.invoke(
src/lib/tauriClient.ts:311:    return await this.invoke(
src/lib/tauriClient.ts:318:    return await this.invoke(
src/lib/tauriClient.ts:325:    return await this.invoke(
src/lib/tauriClient.ts:332:    return await this.invoke(
src/lib/tauriClient.ts:339:    return await this.invoke(
src/lib/tauriClient.ts:346:    return await this.invoke(
src/lib/tauriClient.ts:353:    return await this.invoke(
src/lib/tauriClient.ts:360:    return await this.invoke(
src/lib/tauriClient.ts:367:    return await this.invoke(
src/lib/tauriClient.ts:374:    return await this.invoke(
src/lib/tauriClient.ts:381:    return await this.invoke(
src/lib/tauriClient.ts:388:    return await this.invoke(
src/lib/tauriClient.ts:395:    return await this.invoke(
src/lib/tauriClient.ts:402:    return await this.invoke(
src/lib/tauriClient.ts:409:    return await this.invoke(
src/lib/tauriClient.ts:416:    return await this.invoke(
src/lib/tauriClient.ts:423:    return await this.invoke(
src/lib/tauriClient.ts:430:    return await this.invoke(
src/lib/tauriClient.ts:439:    return await this.invoke(
src/lib/tauriClient.ts:446:    return await this.invoke(
src/lib/tauriClient.ts:453:    return await this.invoke(
src/lib/tauriClient.ts:460:    return await this.invoke(
src/lib/tauriClient.ts:467:    return await this.invoke(
src/lib/tauriClient.ts:474:    return await this.invoke(
src/lib/tauriClient.ts:481:    return await this.invoke(
src/lib/tauriClient.ts:488:    return await this.invoke(
src/lib/tauriClient.ts:495:    return await this.invoke(
src/lib/tauriClient.ts:502:    return await this.invoke(
src/lib/tauriClient.ts:509:    return await this.invoke(
src/lib/tauriClient.ts:516:    return await this.invoke(
src/lib/tauriClient.ts:523:    return await this.invoke(
src/lib/tauriClient.ts:530:    return await this.invoke(
src/lib/tauriClient.ts:537:    return await this.invoke(
src/lib/tauriClient.ts:544:    return await this.invoke(
src/lib/tauriClient.ts:551:    return await this.invoke(
src/lib/tauriClient.ts:558:    return await this.invoke(
src/lib/tauriClient.ts:565:    return await this.invoke(
src/lib/tauriClient.ts:572:    return await this.invoke(
src/lib/tauriClient.ts:579:    return await this.invoke(
src/lib/tauriClient.ts:586:    return await this.invoke(
src/lib/tauriClient.ts:593:    return await this.invoke(
src/lib/tauriClient.ts:600:    return await this.invoke(
src/lib/tauriClient.ts:607:    return await this.invoke(
src/lib/tauriClient.ts:614:    return await this.invoke(
src/lib/tauriClient.ts:621:    return await this.invoke(
src/lib/tauriClient.ts:628:    return await this.invoke(
src/lib/tauriClient.ts:635:    return await this.invoke(
src/lib/tauriClient.ts:642:    return await this.invoke(
src/lib/tauriClient.ts:649:    return await this.invoke(
src/lib/tauriClient.ts:656:    return await this.invoke(
src/lib/tauriClient.ts:663:    return await this.invoke(
src/lib/tauriClient.ts:670:    return await this.invoke(
src/lib/tauriClient.ts:677:    return await this.invoke(
src/lib/tauriClient.ts:684:    return await this.invoke(
src/lib/tauriClient.ts:691:    return await this.invoke(
src/lib/tauriClient.ts:698:    return await this.invoke(
src/lib/tauriClient.ts:705:    return await this.invoke(
src/lib/tauriClient.ts:712:    return await this.invoke(
src/lib/tauriClient.ts:719:    return await this.invoke(
src/lib/tauriClient.ts:726:    return await this.invoke(
src/lib/tauriClient.ts:733:    return await this.invoke(
src/lib/tauriClient.ts:740:    return await this.invoke(
src/lib/tauriClient.ts:747:    return await this.invoke(
src/lib/tauriClient.ts:754:    return await this.invoke(
src/lib/tauriClient.ts:761:    return await this.invoke(
src/lib/tauriClient.ts:768:    return await this.invoke(
src/lib/tauriClient.ts:775:    return await this.invoke(
src/lib/tauriClient.ts:782:    return await this.invoke(
src/lib/tauriClient.ts:789:    return await this.invoke(
src/lib/tauriClient.ts:796:    return await this.invoke(
src/lib/tauriClient.ts:803:    return await this.invoke(
src/lib/tauriClient.ts:810:    return await this.invoke(
src/lib/tauriClient.ts:817:    return await this.invoke(
src/lib/tauriClient.ts:824:    return await this.invoke(
src/lib/tauriClient.ts:831:    return await this.invoke(
src/lib/tauriClient.ts:838:    return await this.invoke(
src/lib/tauriClient.ts:845:    return await this.invoke(
src/lib/tauriClient.ts:852:    return await this.invoke(
src/lib/tauriClient.ts:859:    return await this.invoke(
src/lib/tauriClient.ts:866:    return await this.invoke(
src/lib/tauriClient.ts:873:    return await this.invoke(
src/lib/tauriClient.ts:880:    return await this.invoke(
src/lib/tauriClient.ts:887:    return await this.invoke(
src/lib/tauriClient.ts:894:    return await this.invoke(
src/lib/tauriClient.ts:901:    return await this.invoke(
src/lib/tauriClient.ts:908:    return await this.invoke(
src/lib/tauriClient.ts:915:    return await this.invoke(
src/lib/tauriClient.ts:922:    return await this.invoke(
src/lib/tauriClient.ts:929:    return await this.invoke(
src/lib/tauriClient.ts:936:    return await this.invoke(
src/lib/tauriClient.ts:943:    return await this.invoke(
src/lib/tauriClient.ts:950:    return await this.invoke(
src/lib/tauriClient.ts:957:    return await this.invoke(
src/lib/tauriClient.ts:964:    return await this.invoke(
src/lib/tauriClient.ts:971:    return await this.invoke(
src/lib/tauriClient.ts:978:    return await this.invoke(
src/lib/tauriClient.ts:985:    return await this.invoke(
src/lib/tauriClient.ts:992:    return await this.invoke(
src/lib/tauriClient.ts:999:    return await this.invoke(
src/lib/tauriClient.ts:1006:    return await this.invoke(
src/lib/tauriClient.ts:1013:    return await this.invoke(
src/lib/tauriClient.ts:1020:    return await this.invoke(
src/lib/tauriClient.ts:1027:    return await this.invoke(
src/lib/tauriClient.ts:1034:    return await this.invoke(
src/lib/tauriClient.ts:1041:    return await this.invoke(
src/lib/tauriClient.ts:1048:    return await this.invoke(
src/lib/tauriClient.ts:1055:    return await this.invoke(
src/lib/tauriClient.ts:1062:    return await this.invoke(
src/lib/tauriClient.ts:1069:    return await this.invoke(
src/lib/tauriClient.ts:1076:    return await this.invoke(
src/lib/tauriClient.ts:1083:    return await this.invoke(
src/lib/tauriClient.ts:1090:    return await this.invoke(
src/lib/tauriClient.ts:1097:    return await this.invoke(
src/lib/tauriClient.ts:1104:    return await this.invoke(
src/lib/tauriClient.ts:1111:    return await this.invoke(
src/lib/tauriClient.ts:1118:    return await this.invoke(
src/lib/tauriClient.ts:1125:    return await this.invoke(
src/lib/tauriClient.ts:1132:    return await this.invoke(
src/lib/tauriClient.ts:1139:    return await this.invoke(
src/lib/tauriClient.ts:1146:    return await this.invoke(
src/lib/tauriClient.ts:1153:    return await this.invoke(
src/lib/tauriClient.ts:1160:    return await this.invoke(
src/lib/tauriClient.ts:1167:    return await this.invoke(
src/lib/tauriClient.ts:1174:    return await this.invoke(
src/lib/tauriClient.ts:1181:    return await this.invoke(
src/lib/tauriClient.ts:1188:    return await this.invoke(
src/lib/tauriClient.ts:1195:    return await this.invoke(
src/lib/tauriClient.ts:1202:    return await this.invoke(
src/lib/tauriClient.ts:1209:    return await this.invoke(
src/lib/tauriClient.ts:1216:    return await this.invoke(
src/lib/tauriClient.ts:1223:    return await this.invoke(
src/lib/tauriClient.ts:1230:    return await this.invoke(
src/lib/tauriClient.ts:1237:    return await this.invoke(
src/lib/tauriClient.ts:1244:    return await this.invoke(
src/lib/tauriClient.ts:1251:    return await this.invoke(
src/lib/tauriClient.ts:1258:    return await this.invoke(
src/lib/tauriClient.ts:1265:    return await this.invoke(
src/lib/tauriClient.ts:1272:    return await this.invoke(
src/lib/tauriClient.ts:1279:    return await this.invoke(
src/lib/tauriClient.ts:1286:    return await this.invoke(
src/lib/tauriClient.ts:1293:    return await this.invoke(
src/lib/tauriClient.ts:1300:    return await this.invoke(
src/lib/tauriClient.ts:1307:    return await this.invoke(
src/lib/tauriClient.ts:1314:    return await this.invoke(
src/lib/tauriClient.ts:1321:    return await this.invoke(
src/lib/tauriClient.ts:1328:    return await this.invoke(
src/lib/tauriClient.ts:1335:    return await this.invoke(
src/lib/tauriClient.ts:1342:    return await this.invoke(
src/lib/tauriClient.ts:1349:    return await this.invoke(
src/lib/tauriClient.ts:1356:    return await this.invoke(
src/lib/tauriClient.ts:1363:    return await this.invoke(
src/lib/tauriClient.ts:1370:    return await this.invoke(
src/lib/tauriClient.ts:1377:    return await this.invoke(
src/lib/tauriClient.ts:1384:    return await this.invoke(
src/lib/tauriClient.ts:1391:    return await this.invoke(
src/lib/tauriClient.ts:1398:    return await this.invoke(
src/lib/tauriClient.ts:1405:    return await this.invoke(
src/lib/tauriClient.ts:1412:    return await this.invoke(
src/lib/tauriClient.ts:1419:    return await this.invoke(
src/lib/tauriClient.ts:1426:    return await this.invoke(
src/lib/tauriClient.ts:1433:    return await this.invoke(
src/lib/tauriClient.ts:1440:    return await this.invoke(
src/lib/tauriClient.ts:1447:    return await this.invoke(
src/lib/tauriClient.ts:1454:    return await this.invoke(
src/lib/tauriClient.ts:1461:    return await this.invoke(
src/lib/tauriClient.ts:1468:    return await this.invoke(
src/lib/tauriClient.ts:1475:    return await this.invoke(
src/lib/tauriClient.ts:1482:    return await this.invoke(
src/lib/tauriClient.ts:1489:    return await this.invoke(
src/lib/tauriClient.ts:1496:    return await this.invoke(
src/lib/tauriClient.ts:1503:    return await this.invoke(
src/lib/tauriClient.ts:1510:    return await this.invoke(
src/lib/tauriClient.ts:1517:    return await this.invoke(
src/lib/tauriClient.ts:1524:    return await this.invoke(
src/lib/tauriClient.ts:1531:    return await this.invoke(
src/lib/tauriClient.ts:1538:    return await this.invoke(
src/lib/tauriClient.ts:1545:    return await this.invoke(
src/lib/tauriClient.ts:1552:    return await this.invoke(
src/lib/tauriClient.ts:1559:    return await this.invoke(
src/lib/tauriClient.ts:1566:    return await this.invoke(
src/lib/tauriClient.ts:1573:    return await this.invoke(
src/lib/tauriClient.ts:1580:    return await this.invoke(
src/lib/tauriClient.ts:1587:    return await this.invoke(
src/lib/tauriClient.ts:1594:    return await this.invoke(
src/lib/tauriClient.ts:1601:    return await this.invoke(
src/lib/tauriClient.ts:1608:    return await this.invoke(
src/lib/tauriClient.ts:1615:    return await this.invoke(
src/lib/tauriClient.ts:1622:    return await this.invoke(
src/lib/tauriClient.ts:1629:    return await this.invoke(
src/lib/tauriClient.ts:1636:    return await this.invoke(
src/lib/tauriClient.ts:1643:    return await this.invoke(
src/lib/tauriClient.ts:1650:    return await this.invoke(
src/lib/tauriClient.ts:1657:    return await this.invoke(
src/lib/tauriClient.ts:1664:    return await this.invoke(
src/lib/tauriClient.ts:1671:    return await this.invoke(
src/lib/tauriClient.ts:1678:    return await this.invoke(
src/lib/tauriClient.ts:1685:    return await this.invoke(
src/lib/tauriClient.ts:1692:    return await this.invoke(
src/lib/tauriClient.ts:1699:    return await this.invoke(
src/lib/tauriClient.ts:1706:    return await this.invoke(
src/lib/tauriClient.ts:1713:    return await this.invoke(
src/lib/tauriClient.ts:1720:    return await this.invoke(
src/lib/tauriClient.ts:1727:    return await this.invoke(
src/lib/tauriClient.ts:1734:    return await this.invoke(
src/lib/tauriClient.ts:1741:    return await this.invoke(
src/lib/tauriClient.ts:1748:    return await this.invoke(
src/lib/tauriClient.ts:1755:    return await this.invoke(
src/lib/tauriClient.ts:1762:    return await this.invoke(
src/lib/tauriClient.ts:1769:    return await this.invoke(
src/lib/tauriClient.ts:1776:    return await this.invoke(
src/lib/tauriClient.ts:1783:    return await this.invoke(
src/lib/tauriClient.ts:1790:    return await this.invoke(
src/lib/tauriClient.ts:1797:    return await this.invoke(
src/lib/tauriClient.ts:1804:    return await this.invoke(
src/lib/tauriClient.ts:1811:    return await this.invoke(
src/lib/tauriClient.ts:1818:    return await this.invoke(
src/lib/tauriClient.ts:1825:    return await this.invoke(
src/lib/tauriClient.ts:1832:    return await this.invoke(
src/lib/tauriClient.ts:1839:    return await this.invoke(
src/lib/tauriClient.ts:1846:    return await this.invoke(
src/lib/tauriClient.ts:1853:    return await this.invoke(
src/lib/tauriClient.ts:1860:    return await this.invoke(
src/lib/tauriClient.ts:1867:    return await this.invoke(
src/lib/tauriClient.ts:1874:    return await this.invoke(
src/lib/tauriClient.ts:1881:    return await this.invoke(
src/lib/tauriClient.ts:1888:    return await this.invoke(
src/lib/tauriClient.ts:1895:    return await this.invoke(
src/lib/tauriClient.ts:1902:    return await this.invoke(
src/lib/tauriClient.ts:1909:    return await this.invoke(
src/lib/tauriClient.ts:1916:    return await this.invoke(
src/lib/tauriClient.ts:1923:    return await this.invoke(
src/lib/tauriClient.ts:1930:    return await this.invoke(
src/lib/tauriClient.ts:1937:    return await this.invoke(
src/lib/tauriClient.ts:1944:    return await this.invoke(
src/lib/tauriClient.ts:1951:    return await this.invoke(
src/lib/tauriClient.ts:1958:    return await this.invoke(
src/lib/tauriClient.ts:1965:    return await this.invoke(
src/lib/tauriClient.ts:1972:    return await this.invoke(
src/lib/tauriClient.ts:1979:    return await this.invoke(
src/lib/tauriClient.ts:1986:    return await this.invoke(
src/lib/tauriClient.ts:1993:    return await this.invoke(
src/lib/tauriClient.ts:2000:    return await this.invoke(
src/lib/tauriClient.ts:2007:    return await this.invoke(
src/lib/tauriClient.ts:2014:    return await this.invoke(
src/lib/tauriClient.ts:2021:    return await this.invoke(
src/lib/tauriClient.ts:2028:    return await this.invoke(
src/lib/tauriClient.ts:2035:    return await this.invoke(
src/lib/tauriClient.ts:2042:    return await this.invoke(
src/lib/tauriClient.ts:2049:    return await this.invoke(
src/lib/tauriClient.ts:2056:    return await this.invoke(
src/lib/tauriClient.ts:2063:    return await this.invoke(
src/lib/tauriClient.ts:2070:    return await this.invoke(
src/lib/tauriClient.ts:2077:    return await this.invoke(
src/lib/tauriClient.ts:2084:    return await this.invoke(
src/lib/tauriClient.ts:2091:    return await this.invoke(
src/lib/tauriClient.ts:2098:    return await this.invoke(
src/lib/tauriClient.ts:2105:    return await this.invoke(
src/lib/tauriClient.ts:2112:    return await this.invoke(
src/lib/tauriClient.ts:2119:    return await this.invoke(
src/lib/tauriClient.ts:2126:    return await this.invoke(
src/lib/tauriClient.ts:2133:    return await this.invoke(
src/lib/tauriClient.ts:2140:    return await this.invoke(
src/lib/tauriClient.ts:2147:    return await this.invoke(
src/lib/tauriClient.ts:2154:    return await this.invoke(
src/lib/tauriClient.ts:2161:    return await this.invoke(
src/lib/tauriClient.ts:2168:    return await this.invoke(
src/lib/tauriClient.ts:2175:    return await this.invoke(
src/lib/tauriClient.ts:2182:    return await this.invoke(
src/lib/tauriClient.ts:2189:    return await this.invoke(
src/lib/tauriClient.ts:2196:    return await this.invoke(
src/lib/tauriClient.ts:2203:    return await this.invoke(
src/lib/tauriClient.ts:2210:    return await this.invoke(
src/lib/tauriClient.ts:2217:    return await this.invoke(
src/lib/tauriClient.ts:2224:    return await this.invoke(
src/lib/tauriClient.ts:2231:    return await this.invoke(
src/lib/tauriClient.ts:2238:    return await this.invoke(
src/lib/tauriClient.ts:2245:    return await this.invoke(
src/lib/tauriClient.ts:2252:    return await this.invoke(
src/lib/tauriClient.ts:2259:    return await this.invoke(
src/lib/tauriClient.ts:2266:    return await this.invoke(
src/lib/tauriClient.ts:2273:    return await this.invoke(
src/lib/tauriClient.ts:2280:    return await this.invoke(
src/lib/tauriClient.ts:2287:    return await this.invoke(
src/lib/tauriClient.ts:2294:    return await this.invoke(
src/lib/tauriClient.ts:2301:    return await this.invoke(
src/lib/tauriClient.ts:2308:    return await this.invoke(
src/lib/tauriClient.ts:2315:    return await this.invoke(
src/lib/tauriClient.ts:2322:    return await this.invoke(
src/lib/tauriClient.ts:2329:    return await this.invoke(
src/lib/tauriClient.ts:2336:    return await this.invoke(
src/lib/tauriClient.ts:2343:    return await this.invoke(
src/lib/tauriClient.ts:2350:    return await this.invoke(
src/lib/tauriClient.ts:2357:    return await this.invoke(
src/lib/tauriClient.ts:2364:    return await this.invoke(
src/lib/tauriClient.ts:2371:    return await this.invoke(
src/lib/tauriClient.ts:2378:    return await this.invoke(
src/lib/tauriClient.ts:2385:    return await this.invoke(
src/lib/tauriClient.ts:2392:    return await this.invoke(
src/lib/tauriClient.ts:2399:    return await this.invoke(
src/lib/tauriClient.ts:2406:    return await this.invoke(
src/lib/tauriClient.ts:2413:    return await this.invoke(
src/lib/tauriClient.ts:2420:    return await this.invoke(
src/lib/tauriClient.ts:2427:    return await this.invoke(
src/lib/tauriClient.ts:2434:    return await this.invoke(
src/lib/tauriClient.ts:2441:    return await this.invoke(
src/lib/tauriClient.ts:2448:    return await this.invoke(
src/lib/tauriClient.ts:2455:    return await this.invoke(
src/lib/tauriClient.ts:2462:    return await this.invoke(
src/lib/tauriClient.ts:2469:    return await this.invoke(
src/lib/tauriClient.ts:2476:    return await this.invoke(
src/lib/tauriClient.ts:2483:    return await this.invoke(
src/lib/tauriClient.ts:2490:    return await this.invoke(
src/lib/tauriClient.ts:2497:    return await this.invoke(
src/lib/tauriClient.ts:2504:    return await this.invoke(
src/lib/tauriClient.ts:2511:    return await this.invoke(
src/lib/tauriClient.ts:2518:    return await this.invoke(
src/lib/tauriClient.ts:2525:    return await this.invoke(
src/lib/tauriClient.ts:2532:    return await this.invoke(
src/lib/tauriClient.ts:2539:    return await this.invoke(
src/lib/tauriClient.ts:2546:    return await this.invoke(
src/lib/tauriClient.ts:2553:    return await this.invoke(
src/lib/tauriClient.ts:2560:    return await this.invoke(
src/lib/tauriClient.ts:2567:    return await this.invoke(
src/lib/tauriClient.ts:2574:    return await this.invoke(
src/lib/tauriClient.ts:2581:    return await this.invoke(
src/lib/tauriClient.ts:2588:    return await this.invoke(
src/lib/tauriClient.ts:2595:    return await this.invoke(
src/lib/tauriClient.ts:2602:    return await this.invoke(
src/lib/tauriClient.ts:2609:    return await this.invoke(
src/lib/tauriClient.ts:2616:    return await this.invoke(
src/lib/tauriClient.ts:2623:    return await this.invoke(
src/lib/tauriClient.ts:2630:    return await this.invoke(
src/lib/tauriClient.ts:2637:    return await this.invoke(
src/lib/tauriClient.ts:2644:    return await this.invoke(
src/lib/tauriClient.ts:2651:    return await this.invoke(
src/lib/tauriClient.ts:2658:    return await this.invoke(
src/lib/tauriClient.ts:2665:    return await this.invoke(
src/lib/tauriClient.ts:2672:    return await this.invoke(
src/lib/tauriClient.ts:2679:    return await this.invoke(
src/lib/tauriClient.ts:2686:    return await this.invoke(
src/lib/tauriClient.ts:2694:    return await this.invoke(
src/lib/tauriClient.ts:2701:    return await this.invoke(
src/lib/tauriClient.ts:2708:    return await this.invoke(
src/lib/tauriClient.ts:2715:    return await this.invoke(
src/lib/tauriClient.ts:2722:    return await this.invoke(
src/lib/tauriClient.ts:2729:    return await this.invoke(
src/lib/tauriClient.ts:2736:    return await this.invoke(
src/lib/tauriClient.ts:2743:    return await this.invoke(
src/lib/tauriClient.ts:2750:    return await this.invoke(
src/lib/tauriClient.ts:2757:    return await this.invoke(
src/lib/tauriClient.ts:2764:    return await this.invoke(
src/lib/tauriClient.ts:2771:    return await this.invoke(
src/lib/tauriClient.ts:2778:    return await this.invoke(
src/lib/tauriClient.ts:2785:    return await this.invoke(
src/lib/tauriClient.ts:2792:    return await this.invoke(
src/lib/tauriClient.ts:2799:    return await this.invoke(
src/lib/tauriClient.ts:2806:    return await this.invoke(
src/lib/tauriClient.ts:2813:    return await this.invoke(
src/lib/tauriClient.ts:2820:    return await this.invoke(
src/lib/tauriClient.ts:2827:    return await this.invoke(
src/lib/tauriClient.ts:2834:    return await this.invoke(
src/lib/tauriClient.ts:2841:    return await this.invoke(
src/lib/tauriClient.ts:2848:    return await this.invoke(
src/lib/tauriClient.ts:2856:  //   return await this.invoke('start_recording', (params as Record<string, unknown>) || {});
src/lib/tauriClient.ts:2860:    return await this.invoke(
src/lib/tauriClient.ts:2867:    return await this.invoke(
src/lib/tauriClient.ts:2874:    return await this.invoke(
src/lib/tauriClient.ts:2881:    return await this.invoke(
src/lib/tauriClient.ts:2888:    return await this.invoke(
src/lib/tauriClient.ts:2895:    return await this.invoke(
src/lib/tauriClient.ts:2902:    return await this.invoke(
src/lib/tauriClient.ts:2909:    return await this.invoke(
src/lib/tauriClient.ts:2916:    return await this.invoke(
src/lib/tauriClient.ts:2923:    return await this.invoke(
src/lib/tauriClient.ts:2930:    return await this.invoke(
src/lib/tauriClient.ts:2937:    return await this.invoke(
src/lib/tauriClient.ts:2948:    return await this.invoke(
src/lib/tauriClient.ts:2955:    return await this.invoke(
src/lib/tauriClient.ts:2962:    return await this.invoke(
src/lib/tauriClient.ts:2969:    return await this.invoke(
src/lib/tauriClient.ts:2976:    return await this.invoke(
src/lib/tauriClient.ts:2983:    return await this.invoke(
src/lib/tauriClient.ts:2990:    return await this.invoke(
src/lib/tauriClient.ts:2997:    return await this.invoke(
src/lib/tauriClient.ts:3004:    return await this.invoke(
src/lib/tauriClient.ts:3011:    return await this.invoke(
src/lib/tauriClient.ts:3018:    return await this.invoke(
src/lib/tauriClient.ts:3025:    return await this.invoke(
src/lib/tauriClient.ts:3032:    return await this.invoke(
src/lib/tauriClient.ts:3039:    return await this.invoke(
src/lib/tauriClient.ts:3046:    return await this.invoke(
src/lib/tauriClient.ts:3053:    return await this.invoke(
src/lib/tauriClient.ts:3060:    return await this.invoke(
src/lib/tauriClient.ts:3071:    return await this.invoke(
src/lib/tauriClient.ts:3078:    return await this.invoke(
src/lib/tauriClient.ts:3085:    return await this.invoke(
src/lib/tauriClient.ts:3092:    return await this.invoke(
src/lib/tauriClient.ts:3099:    return await this.invoke(
src/lib/tauriClient.ts:3106:    return await this.invoke(
src/lib/tauriClient.ts:3113:    return await this.invoke(
src/lib/tauriClient.ts:3120:    return await this.invoke(
src/lib/tauriClient.ts:3127:    return await this.invoke(
src/lib/tauriClient.ts:3134:    return await this.invoke(
src/lib/tauriClient.ts:3141:    return await this.invoke(
src/lib/tauriClient.ts:3148:    return await this.invoke(
src/lib/tauriClient.ts:3155:    return await this.invoke(
src/lib/tauriClient.ts:3162:    return await this.invoke(
src/lib/tauriClient.ts:3169:    return await this.invoke(
src/lib/tauriClient.ts:3176:    return await this.invoke(
src/lib/tauriClient.ts:3183:    return await this.invoke(
src/lib/tauriClient.ts:3190:    return await this.invoke(
src/lib/tauriClient.ts:3197:    return await this.invoke(
src/lib/tauriClient.ts:3208:    return await this.invoke(
src/lib/tauriClient.ts:3215:    return await this.invoke(
src/lib/tauriClient.ts:3222:    return await this.invoke(
src/lib/tauriClient.ts:3229:    return await this.invoke(
src/lib/tauriClient.ts:3236:    return await this.invoke(
src/lib/tauriClient.ts:3243:    return await this.invoke(
src/lib/tauriClient.ts:3250:    return await this.invoke(
src/lib/tauriClient.ts:3257:    return await this.invoke(
src/lib/tauriClient.ts:3264:    return await this.invoke(
src/lib/tauriClient.ts:3271:    return await this.invoke(
src/lib/tauriClient.ts:3278:    return await this.invoke(
src/lib/tauriClient.ts:3289:    return await this.invoke(
src/lib/tauriClient.ts:3296:    return await this.invoke(
src/lib/tauriClient.ts:3303:    return await this.invoke(
src/lib/tauriClient.ts:3310:    return await this.invoke(
src/lib/tauriClient.ts:3317:    return await this.invoke(
src/lib/tauriClient.ts:3324:    return await this.invoke(
src/lib/tauriClient.ts:3331:    return await this.invoke(
src/lib/tauriClient.ts:3338:    return await this.invoke(
src/lib/tauriClient.ts:3345:    return await this.invoke(
src/lib/tauriClient.ts:3352:    return await this.invoke(
src/lib/tauriClient.ts:3359:    return await this.invoke(
src/lib/tauriClient.ts:3366:    return await this.invoke(
src/lib/tauriClient.ts:3373:    return await this.invoke(
src/lib/tauriClient.ts:3380:    return await this.invoke(
src/lib/tauriClient.ts:3387:    return await this.invoke(
src/lib/tauriClient.ts:3394:    return await this.invoke(
src/lib/tauriClient.ts:3405:    return await this.invoke(
src/lib/tauriClient.ts:3412:    return await this.invoke(TAURI_COMMANDS.READ_PRODUCTION_WEEK1_CSV, {});
src/services/unified/__tests__/VectorStoreClient.test.ts:12:vi.mock('@tauri-apps/api/core', () => ({
src/utils/invoke.ts:11: * Wrapper universel pour invoke() avec gestion d'erreur automatique
src/utils/invoke.ts:36: * Wrapper pour invoke() avec retry automatique
src/utils/invoke.ts:78: * Wrapper pour invoke() avec timeout
src/services/ai/ConversationManager.ts:22:import { emit } from '@tauri-apps/api/event';
src/services/selfHealing/selfHealingExecutor.ts:22:import { emit } from '@tauri-apps/api/event';
src/utils/tauriFsAdapter.ts:27:let tauriPath: typeof import('@tauri-apps/api/path') | null = null;
src/utils/tauriFsAdapter.ts:39:      tauriPath = await import('@tauri-apps/api/path');
src/utils/tauriFsAdapter.ts:121: * Tauri: uses @tauri-apps/api/fs exists()
src/utils/tauriFsAdapter.ts:143: * Tauri: uses @tauri-apps/api/fs readTextFile()
src/utils/tauriFsAdapter.ts:165: * Tauri: uses @tauri-apps/api/fs writeTextFile()
src/utils/tauriFsAdapter.ts:228:   * Tauri: uses @tauri-apps/api/fs createDir()
src/utils/tauriFsAdapter.ts:252:   * Tauri: uses @tauri-apps/api/fs readDir()
src/utils/tauriFsAdapter.ts:331: * - ✅ Real Tauri filesystem APIs (@tauri-apps/api/fs)
src/services/selfHealing/selfHealingObserver.ts:22:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/services/selfHealing/selfHealingObserver.ts:789:  const { invoke } = await import('@tauri-apps/api/core');
src/services/selfHealing/selfHealingSyncLayer.ts:22:import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event';
src/ui/reading/UIReadingProvider.tsx:181:        const { getCurrentWindow } = await import('@tauri-apps/api/window');
src/utils/tauriProtector.ts:186:    invoke: typeof import('@tauri-apps/api/core').invoke;
src/utils/tauriProtector.ts:444:    invoke: typeof import('@tauri-apps/api/core').invoke;
src/utils/tauriProtector.ts:458:      const module = await import('@tauri-apps/api/core');
src/services/tauriClient.ts:4: * Client centralisé pour tous les appels Tauri invoke()
src/services/tauriClient.ts:10:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/services/singularityBridge.ts:25:import { listen, type UnlistenFn } from '@tauri-apps/api/event';
src/config/offline-first.ts:29:  // Use invoke('ollama_generate') instead of direct HTTP
src/services/performanceEngine/analyzerEngine.ts:520:    if (frontend.tauri.invokeLatency >= thresholds.frontend.invokeLatencyWarning) {
src/services/performanceEngine/analyzerEngine.ts:525:          frontend.tauri.invokeLatency,
src/services/performanceEngine/analyzerEngine.ts:529:          `Latence Tauri: ${formatDuration(frontend.tauri.invokeLatency)}`
src/services/performanceEngine/analyzerEngine.ts:809:    if (frontend.tauri.invokeLatency < thresholds.frontend.invokeLatencyWarning * 0.5)
src/services/performanceEngine/metricsCollector.ts:914:      if (frontend.tauri.invokeLatency > 500) {
src/services/performanceEngine/reporter.ts:445:            tauriLatency: latestSnapshot.frontend.tauri.invokeLatency,
src/services/performanceEngine/reporter.ts:620:      snapshots.reduce((sum, s) => sum + s.frontend.tauri.invokeLatency, 0) /
src/services/performanceEngine/reporter.ts:623:      (sum, s) => sum + s.frontend.tauri.invokeCount,
src/services/performanceEngine/reporter.ts:627:      (sum, s) => sum + s.frontend.tauri.invokeErrors,
src/os/bridge/TauriBridge.ts:7:import { listen, emit as tauriEmit, type UnlistenFn } from '@tauri-apps/api/event';
src/os/bridge/TauriBridge.ts:32:      await this.invoke('ping');
src/os/bridge/TauriBridge.ts:162:    return Promise.all(commands.map(cmd => this.invoke(cmd.name, cmd.args))) as Promise<
src/os/bridge/TauriBridge.ts:172:      await this.invoke('ping');
src/os/bridge/StateBridge.ts:84:      await this.bridge.invoke('set_state', { key, value });
src/os/bridge/StateBridge.ts:116:      await this.bridge.invoke('delete_state', { key });
src/os/bridge/StateBridge.ts:225:        await this.bridge.invoke('set_state', { key, value });

### chat config keys in src-tauri/src
src-tauri/src/control_panel_commands.rs:49:    pub temperature: f32,
src-tauri/src/control_panel_commands.rs:117:    temperature: f32,
src-tauri/src/control_panel_commands.rs:125:            temperature: sanitize_temperature(self.temperature),
src-tauri/src/control_panel_commands.rs:135:            temperature: 0.7,
src-tauri/src/control_panel_commands.rs:154:fn sanitize_temperature(value: f32) -> f32 {
src-tauri/src/control_panel_commands.rs:247:        temperature: stored.temperature,
src-tauri/src/control_panel_commands.rs:260:        temperature,
src-tauri/src/control_panel_commands.rs:267:        temperature: sanitize_temperature(temperature),
src-tauri/src/control_panel_commands.rs:300:        "[ControlPanel] Gemini config saved (model={}, temperature={:.2}, max_tokens={})",
src-tauri/src/control_panel_commands.rs:302:        sanitized.temperature,
src-tauri/src/commands/chat_modes.rs:180:    pub temperature: f32,
src-tauri/src/commands/chat_modes.rs:194:                temperature: 0.7,
src-tauri/src/commands/chat_modes.rs:203:                temperature: 0.9,
src-tauri/src/commands/chat_modes.rs:212:                temperature: 0.5,
src-tauri/src/commands/chat_modes.rs:221:                temperature: 0.4,
src-tauri/src/commands/chat_modes.rs:231:                temperature: 0.7,
src-tauri/src/commands/ia_commands.rs:29:    pub temperature: Option<f32>,
src-tauri/src/commands/ia_commands.rs:163:        temperature: 0.0,
src-tauri/src/commands/ia_commands.rs:199:        temperature: request.temperature.unwrap_or(0.7),
src-tauri/src/commands/ai_chat.rs:156:    temperature: Option<f32>,
src-tauri/src/commands/ai_chat.rs:191:        temperature: temperature.unwrap_or(0.7),
src-tauri/src/commands/ai_chat.rs:266:    temperature: Option<f32>,
src-tauri/src/commands/ai_chat.rs:289:        temperature: temperature.unwrap_or(0.7),
src-tauri/src/commands/ollama_command.rs:17:    pub temperature: Option<f32>,
src-tauri/src/commands/ollama_command.rs:64:    // Add temperature if provided
src-tauri/src/commands/ollama_command.rs:65:    if let Some(temp) = req.temperature {
src-tauri/src/commands/ollama_command.rs:67:            "temperature": temp,
src-tauri/src/commands/ollama_command.rs:139:            temperature: Some(0.7),
src-tauri/src/commands/ollama_command.rs:146:        assert_eq!(req.temperature, Some(0.7));
src-tauri/src/commands/tests_ai_chat.rs:217:        // Phase 1 Stabilisation: Paramètres temperature/max_tokens
src-tauri/src/commands/glm46v_commands.rs:33:    pub temperature: Option<f32>,
src-tauri/src/commands/ai_prompt_generator.rs:139:            "temperature": 0.7,
src-tauri/src/commands/copilot_commands.rs:38:    pub temperature: Option<f32>,
src-tauri/src/commands/copilot_commands.rs:152:        temperature: request.config.as_ref().and_then(|c| c.temperature),
src-tauri/src/commands/copilot_commands.rs:364:                temperature: Some(0.7),
src-tauri/src/gemini_provider_refactor.rs:18:    pub temperature: f32,
src-tauri/src/gemini_provider_refactor.rs:46:    pub temperature: f32,
src-tauri/src/gemini_provider_refactor.rs:47:    pub max_output_tokens: u32,
src-tauri/src/gemini_provider_refactor.rs:107:        if self.config.temperature < 0.0 || self.config.temperature > 2.0 {
src-tauri/src/gemini_provider_refactor.rs:109:                format!("Invalid temperature: {}. Must be 0.0-2.0", self.config.temperature)
src-tauri/src/gemini_provider_refactor.rs:166:                temperature: self.config.temperature,
src-tauri/src/gemini_provider_refactor.rs:167:                max_output_tokens: self.config.max_tokens,
src-tauri/src/gemini_provider_refactor.rs:223:                temperature: 0.1,
src-tauri/src/gemini_provider_refactor.rs:224:                max_output_tokens: 10,
src-tauri/src/gemini_provider_refactor.rs:270:            temperature: 0.7,
src-tauri/src/gemini_provider_refactor.rs:283:            temperature: 0.7,
src-tauri/src/gemini_provider_refactor.rs:294:    fn test_invalid_temperature() {
src-tauri/src/gemini_provider_refactor.rs:298:            temperature: 3.0, // Invalid: > 2.0
src-tauri/src/gemini_provider_refactor.rs:313:            temperature: 0.7,
src-tauri/src/gemini_provider_refactor.rs:341:            temperature: 0.7,
src-tauri/src/gemini_provider_refactor.rs:361:            temperature: 0.7,
src-tauri/src/commands/chat_generate_commands.rs:33:    pub temperature: Option<f32>,
src-tauri/src/ollama_provider_refactor.rs:19:    pub temperature: f32,
src-tauri/src/ollama_provider_refactor.rs:30:            temperature: 0.7,
src-tauri/src/ollama_provider_refactor.rs:50:    pub temperature: f32,
src-tauri/src/ollama_provider_refactor.rs:122:        if config.temperature < 0.0 || config.temperature > 2.0 {
src-tauri/src/ollama_provider_refactor.rs:124:                format!("Invalid temperature: {} (must be 0.0-2.0)", config.temperature)
src-tauri/src/ollama_provider_refactor.rs:148:                temperature: self.config.temperature,
src-tauri/src/ollama_provider_refactor.rs:370:    fn test_ollama_invalid_config_temperature() {
src-tauri/src/ollama_provider_refactor.rs:372:            temperature: 3.0, // Invalid: >2.0
src-tauri/src/singularity_state/layers.rs:60:    pub temperature: f32,           // Celsius
src-tauri/src/singularity_state/layers.rs:72:            temperature: 0.0,
src-tauri/src/singularity_state/layers.rs:450:        assert_eq!(state.temperature, 0.0);
src-tauri/src/singularity_state/layers.rs:462:            temperature: 45.0,
src-tauri/src/mock_commands.rs:43:    pub temperature: Option<f32>,
src-tauri/src/mock_commands.rs:44:    pub max_output_tokens: Option<u32>,
src-tauri/src/mock_commands.rs:106:        "temperature": 0.0,
src-tauri/src/mock_commands.rs:504:            "temperature": 55.0,
src-tauri/src/mock_commands.rs:562:            "temperature": 55.0,
src-tauri/src/mock_commands.rs:652:            "temperature": 50.0,
src-tauri/src/config/presets.rs:71:    let chat_engine = super::ChatEngineConfig::default();
src-tauri/src/chat_engine/providers.rs:69:pub fn build_ai_request(prompt: String, temperature: f32, max_tokens: usize) -> AIRequest {
src-tauri/src/chat_engine/providers.rs:72:        temperature,
src-tauri/src/chat_engine/providers.rs:90:        assert_eq!(request.temperature, 0.7);
src-tauri/src/chat_engine/providers.rs:102:    fn test_build_ai_request_zero_temperature() {
src-tauri/src/chat_engine/providers.rs:104:        assert_eq!(request.temperature, 0.0);
src-tauri/src/chat_engine/providers.rs:108:    fn test_build_ai_request_high_temperature() {
src-tauri/src/chat_engine/providers.rs:110:        assert_eq!(request.temperature, 2.0);
src-tauri/src/config/io.rs:15:use super::{ChatEngineConfig, ConfigSnapshot, RuntimeConfig};
src-tauri/src/config/io.rs:71:    let chat_engine = ChatEngineConfig::default();
src-tauri/src/config/io.rs:145:    super::update::validate_temperature(config.chat_engine.temperature)?;
src-tauri/src/chat_engine/types.rs:21:pub struct ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:25:    pub temperature: f32,
src-tauri/src/chat_engine/types.rs:26:    pub max_output_tokens: usize,
src-tauri/src/chat_engine/types.rs:31:impl ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:41:        if !(0.0..=2.0).contains(&self.temperature) {
src-tauri/src/chat_engine/types.rs:45:        if self.max_output_tokens == 0 || self.max_output_tokens > 8096 {
src-tauri/src/chat_engine/types.rs:46:            return Err("max_output_tokens must be between 1 and 8096".to_string());
src-tauri/src/chat_engine/types.rs:159:    // ChatRequestPayload Tests
src-tauri/src/chat_engine/types.rs:164:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:168:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:169:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:179:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:183:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:184:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:197:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:201:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:202:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:213:    fn test_chat_request_payload_temperature_too_low() {
src-tauri/src/chat_engine/types.rs:214:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:218:            temperature: -0.5,
src-tauri/src/chat_engine/types.rs:219:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:230:    fn test_chat_request_payload_temperature_too_high() {
src-tauri/src/chat_engine/types.rs:231:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:235:            temperature: 2.5,
src-tauri/src/chat_engine/types.rs:236:            max_output_tokens: 1000,
src-tauri/src/chat_engine/types.rs:248:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:252:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:253:            max_output_tokens: 0,
src-tauri/src/chat_engine/types.rs:260:        assert!(result.unwrap_err().contains("max_output_tokens"));
src-tauri/src/chat_engine/types.rs:265:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:269:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:270:            max_output_tokens: 10000,
src-tauri/src/chat_engine/types.rs:277:        assert!(result.unwrap_err().contains("max_output_tokens"));
src-tauri/src/chat_engine/types.rs:281:    fn test_chat_request_payload_boundary_temperature() {
src-tauri/src/chat_engine/types.rs:283:        let payload_low = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:287:            temperature: 0.0,
src-tauri/src/chat_engine/types.rs:288:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:295:        let payload_high = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:299:            temperature: 2.0,
src-tauri/src/chat_engine/types.rs:300:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:310:        let payload_min = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:314:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:315:            max_output_tokens: 1,
src-tauri/src/chat_engine/types.rs:322:        let payload_max = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:326:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:327:            max_output_tokens: 8096,
src-tauri/src/chat_engine/types.rs:336:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:340:            temperature: 0.5,
src-tauri/src/chat_engine/types.rs:341:            max_output_tokens: 500,
src-tauri/src/chat_engine/types.rs:347:        assert_eq!(cloned.temperature, 0.5);
src-tauri/src/chat_engine/types.rs:352:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:356:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:357:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:362:        assert!(debug_str.contains("ChatRequestPayload"));
src-tauri/src/chat_engine/types.rs:367:        let payload = ChatRequestPayload {
src-tauri/src/chat_engine/types.rs:371:            temperature: 0.7,
src-tauri/src/chat_engine/types.rs:372:            max_output_tokens: 100,
src-tauri/src/chat_engine/types.rs:378:            serde_json::to_string(&payload).expect("serialize ChatRequestPayload should succeed");
src-tauri/src/chat_engine/types.rs:379:        let restored: ChatRequestPayload =
src-tauri/src/chat_engine/types.rs:380:            serde_json::from_str(&json).expect("deserialize ChatRequestPayload should succeed");
src-tauri/src/config/update.rs:40: * ChatEngineConfigUpdate
src-tauri/src/config/update.rs:42: * Structure pour mettre à jour la ChatEngineConfig
src-tauri/src/config/update.rs:46:pub struct ChatEngineConfigUpdate {
src-tauri/src/config/update.rs:50:    pub temperature: Option<f32>,
src-tauri/src/config/update.rs:91:pub struct ChatEngineConfigDto {
src-tauri/src/config/update.rs:93:    pub stream_chunk_size: u64,
src-tauri/src/config/update.rs:96:    pub memory_flush_interval_ms: u64,
src-tauri/src/config/update.rs:104:    pub temperature: f32,
src-tauri/src/config/update.rs:105:    pub max_output_tokens: u64,
src-tauri/src/config/update.rs:113:    pub engine: ChatEngineConfigDto,
src-tauri/src/config/update.rs:119:        engine: ChatEngineConfigDto {
src-tauri/src/config/update.rs:121:            stream_chunk_size: 640,
src-tauri/src/config/update.rs:124:            memory_flush_interval_ms: 750,
src-tauri/src/config/update.rs:129:            temperature: 0.7,
src-tauri/src/config/update.rs:130:            max_output_tokens: 484,
src-tauri/src/config/update.rs:141:            engine: ChatEngineConfigDto {
src-tauri/src/config/update.rs:143:                stream_chunk_size: 640,
src-tauri/src/config/update.rs:146:                memory_flush_interval_ms: 1_000,
src-tauri/src/config/update.rs:151:                temperature: 0.6,
src-tauri/src/config/update.rs:152:                max_output_tokens: 8096,
src-tauri/src/config/update.rs:158:            engine: ChatEngineConfigDto {
src-tauri/src/config/update.rs:160:                stream_chunk_size: 480,
src-tauri/src/config/update.rs:163:                memory_flush_interval_ms: 1_500,
src-tauri/src/config/update.rs:168:                temperature: 0.5,
src-tauri/src/config/update.rs:169:                max_output_tokens: 1024,
src-tauri/src/config/update.rs:220:fn validate_engine_dto(dto: &ChatEngineConfigDto) -> Result<(), String> {
src-tauri/src/config/update.rs:222:    validate_chunk_size(dto.stream_chunk_size as usize)?;
src-tauri/src/config/update.rs:232:    if dto.memory_flush_interval_ms < 50 || dto.memory_flush_interval_ms > 60_000 {
src-tauri/src/config/update.rs:233:        return Err("memory_flush_interval_ms doit être entre 50 et 60000".to_string());
src-tauri/src/config/update.rs:244:    validate_temperature(defaults.temperature)?;
src-tauri/src/config/update.rs:246:    if defaults.max_output_tokens == 0 || defaults.max_output_tokens > 8096 {
src-tauri/src/config/update.rs:247:        return Err("max_output_tokens doit être entre 1 et 8096".to_string());
src-tauri/src/config/update.rs:349:pub fn validate_temperature(temperature: f32) -> Result<(), String> {
src-tauri/src/config/update.rs:350:    if temperature < 0.0 {
src-tauri/src/config/update.rs:354:    if temperature > 2.0 {
src-tauri/src/config/update.rs:416:/// (nécessiterait un state management pour ChatEngineConfig).
src-tauri/src/config/update.rs:425:pub async fn update_chat_engine_config(update: ChatEngineConfigUpdate) -> Result<(), String> {
src-tauri/src/config/update.rs:444:    if let Some(temperature) = update.temperature {
src-tauri/src/config/update.rs:445:        validate_temperature(temperature)?;
src-tauri/src/config/update.rs:446:        log::info!("✅ [CONFIG] Temperature validated: {}", temperature);
src-tauri/src/config/update.rs:456:        bundle.engine.stream_chunk_size = chunk_size as u64;
src-tauri/src/config/update.rs:460:        bundle.request_defaults.max_output_tokens = max_tokens as u64;
src-tauri/src/config/update.rs:463:    if let Some(temperature) = update.temperature {
src-tauri/src/config/update.rs:464:        bundle.request_defaults.temperature = temperature;
src-tauri/src/config/update.rs:477:pub async fn get_chat_engine_config() -> IpcEnvelope<ChatEngineConfigDto> {
src-tauri/src/config/update.rs:484:    config: ChatEngineConfigDto,
src-tauri/src/config/update.rs:485:) -> IpcEnvelope<ChatEngineConfigDto> {
src-tauri/src/config/update.rs:604:    fn test_validate_temperature() {
src-tauri/src/config/update.rs:605:        assert!(validate_temperature(0.0).is_ok());
src-tauri/src/config/update.rs:606:        assert!(validate_temperature(0.7).is_ok());
src-tauri/src/config/update.rs:607:        assert!(validate_temperature(1.0).is_ok());
src-tauri/src/config/update.rs:608:        assert!(validate_temperature(2.0).is_ok());
src-tauri/src/config/update.rs:609:        assert!(validate_temperature(-0.1).is_err());
src-tauri/src/config/update.rs:610:        assert!(validate_temperature(2.5).is_err());
src-tauri/src/control_panel_commands/tests.rs:123:        assert!((0.0..=1.0).contains(&config.temperature));
src-tauri/src/control_panel_commands/tests.rs:142:            temperature: 0.7,
src-tauri/src/control_panel_commands/tests.rs:152:        assert!((stored.temperature - 0.7).abs() < f32::EPSILON);
src-tauri/src/control_panel_commands/tests.rs:179:            temperature: 0.3,
src-tauri/src/control_panel_commands/tests.rs:190:            temperature: 0.6,
src-tauri/src/control_panel_commands/tests.rs:201:        assert!((stored.temperature - 0.6).abs() < f32::EPSILON);
src-tauri/src/chat_engine/commands.rs:9:    ChatCompletionPayload, ChatEngine, ChatEngineError, ChatRequestPayload, EngineHealthReport,
src-tauri/src/chat_engine/commands.rs:20:    payload: ChatRequestPayload,
src-tauri/src/chat_engine/commands.rs:29:    payload: ChatRequestPayload,
src-tauri/src/config/mod.rs:35:pub struct ChatEngineConfig {
src-tauri/src/config/mod.rs:39:    pub temperature: f32,
src-tauri/src/config/mod.rs:42:impl Default for ChatEngineConfig {
src-tauri/src/config/mod.rs:48:            temperature: 0.7,
src-tauri/src/config/mod.rs:62:    pub chat_engine: ChatEngineConfig,
src-tauri/src/config/mod.rs:71:    pub fn new(runtime: RuntimeConfig, chat_engine: ChatEngineConfig) -> Self {
src-tauri/src/config/mod.rs:120:    let chat_engine = ChatEngineConfig {
src-tauri/src/config/mod.rs:122:        chunk_size: bundle.engine.stream_chunk_size as usize,
src-tauri/src/config/mod.rs:123:        max_tokens: bundle.request_defaults.max_output_tokens as usize,
src-tauri/src/config/mod.rs:124:        temperature: bundle.request_defaults.temperature,
src-tauri/src/config/mod.rs:162:        let chat = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:5:pub struct ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:9:    pub stream_chunk_size: usize,
src-tauri/src/chat_engine/config.rs:15:    pub memory_flush_interval: Duration,
src-tauri/src/chat_engine/config.rs:22:impl Default for ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:26:            stream_chunk_size: 480,
src-tauri/src/chat_engine/config.rs:29:            memory_flush_interval: Duration::from_millis(350),
src-tauri/src/chat_engine/config.rs:42:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:44:        assert_eq!(config.stream_chunk_size, 480);
src-tauri/src/chat_engine/config.rs:47:        assert_eq!(config.memory_flush_interval, Duration::from_millis(350));
src-tauri/src/chat_engine/config.rs:54:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:57:        assert_eq!(cloned.stream_chunk_size, config.stream_chunk_size);
src-tauri/src/chat_engine/config.rs:63:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:65:        assert!(debug_str.contains("ChatEngineConfig"));
src-tauri/src/chat_engine/config.rs:71:        let config = ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:73:            stream_chunk_size: 1024,
src-tauri/src/chat_engine/config.rs:76:            memory_flush_interval: Duration::from_millis(500),
src-tauri/src/chat_engine/config.rs:82:        assert_eq!(config.stream_chunk_size, 1024);
src-tauri/src/chat_engine/config.rs:89:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:96:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:97:        assert_eq!(config.memory_flush_interval.as_millis(), 350);
src-tauri/src/chat_engine/config.rs:102:        let config = ChatEngineConfig::default();
src-tauri/src/chat_engine/config.rs:109:        let config = ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:111:            stream_chunk_size: 1,
src-tauri/src/chat_engine/config.rs:114:            memory_flush_interval: Duration::from_millis(1),
src-tauri/src/chat_engine/config.rs:119:        assert_eq!(config.stream_chunk_size, 1);
src-tauri/src/chat_engine/config.rs:125:        let config = ChatEngineConfig {
src-tauri/src/chat_engine/config.rs:127:            stream_chunk_size: 65536,
src-tauri/src/chat_engine/config.rs:130:            memory_flush_interval: Duration::from_secs(10),
src-tauri/src/chat_engine/config.rs:136:        assert_eq!(config.stream_chunk_size, 65536);
src-tauri/src/chat_engine/mod.rs:31:pub use config::ChatEngineConfig;
src-tauri/src/chat_engine/mod.rs:35:    ChatCompletionPayload, ChatRequestPayload, EngineHealthReport, ProviderPreference, StreamChunk,
src-tauri/src/chat_engine/mod.rs:40:    config: ChatEngineConfig,
src-tauri/src/chat_engine/mod.rs:54:        config: ChatEngineConfig,
src-tauri/src/chat_engine/mod.rs:69:        mut payload: ChatRequestPayload,
src-tauri/src/chat_engine/mod.rs:95:            payload.temperature,
src-tauri/src/chat_engine/mod.rs:96:            payload.max_output_tokens,
src-tauri/src/chat_engine/mod.rs:148:        mut payload: ChatRequestPayload,
src-tauri/src/chat_engine/mod.rs:174:            payload.temperature,
src-tauri/src/chat_engine/mod.rs:175:            payload.max_output_tokens,
src-tauri/src/chat_engine/mod.rs:200:                        config.stream_chunk_size,
src-tauri/src/chat_engine/mod.rs:357:    config: Option<ChatEngineConfig>,
src-tauri/src/chat_engine/mod.rs:390:        config.memory_flush_interval,
src-tauri/src/local_provider_refactor.rs:21:    pub temperature: f32,
src-tauri/src/local_provider_refactor.rs:36:            temperature: 0.7,
src-tauri/src/local_provider_refactor.rs:88:        if !(0.0..=2.0).contains(&self.config.temperature) {
src-tauri/src/local_provider_refactor.rs:90:                format!("Invalid temperature: {} (must be 0.0-2.0)", self.config.temperature),
src-tauri/src/local_provider_refactor.rs:120:                temperature: self.config.temperature,
src-tauri/src/local_provider_refactor.rs:294:    temperature: f32,
src-tauri/src/local_provider_refactor.rs:336:    fn test_invalid_temperature() {
src-tauri/src/local_provider_refactor.rs:338:            temperature: 3.0,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:19:    pub creative_temperature: f32, // 0.0 - 1.0 (randomness)
src-tauri/src/cycle_engine/cognitive_rhythm.rs:31:                creative_temperature: 0.8,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:39:                creative_temperature: 0.3,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:47:                creative_temperature: 0.5,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:55:                creative_temperature: 0.4,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:63:                creative_temperature: 0.6,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:71:                creative_temperature: 0.2,
src-tauri/src/cycle_engine/cognitive_rhythm.rs:106:        assert_eq!(params.creative_temperature, 0.8);
src-tauri/src/cycle_engine/cognitive_rhythm.rs:286:    fn test_creative_temperature_range() {
src-tauri/src/cycle_engine/cognitive_rhythm.rs:299:            assert!(params.creative_temperature >= 0.0 && params.creative_temperature <= 1.0);
src-tauri/src/cycle_engine/omega_integration.rs:49:            creativity_weight: rhythm.creative_temperature,
src-tauri/src/cycle_engine/commands.rs.disabled:80:    pub creative_temperature: f32,
src-tauri/src/cycle_engine/commands.rs.disabled:100:        creative_temperature: rhythm.creative_temperature,
src-tauri/src/conversation_engine/types.rs:377:    pub temperature: f32,
src-tauri/src/conversation_engine/types.rs:395:            temperature: 0.7,
src-tauri/src/conversation_engine/types.rs:985:        assert_eq!(config.temperature, 0.7);
src-tauri/src/conversation_engine/types.rs:996:            temperature: 0.9,
src-tauri/src/conversation_engine/types.rs:1000:        assert_eq!(config.temperature, 0.9);
src-tauri/src/conversation_engine/types.rs:1008:        assert!(json.contains("temperature"));
src-tauri/src/harmonia_engine.rs:26:    pub temperature: Option<f32>,
src-tauri/src/harmonia_engine.rs:124:            temperature: None, // sysinfo ne fournit pas toujours la température
src-tauri/src/harmonia_engine.rs:186:                temperature: None,
src-tauri/src/conversation_engine/commands.rs:462:                temperature: 0.7,
src-tauri/src/conversation_engine/pipeline.rs:419:            temperature: config.temperature,
src-tauri/src/engines/unified_memory/summarizer.rs:321:            "temperature": 0.3
src-tauri/src/main.rs:836:                            temperature: 0.7,
src-tauri/src/overdrive/semantic_kernel.rs:193:    //   - temperature: 0.7 (balanced creativity/determinism)
src-tauri/src/fusion_commands_week2.rs:176:    pub temperature: Option<f32>,
src-tauri/src/fusion_commands_week2.rs:222:    let temperature = request.temperature.unwrap_or(0.7);
src-tauri/src/fusion_commands_week2.rs:223:    if temperature < 0.0 || temperature > 2.0 {
src-tauri/src/fusion_commands_week2.rs:240:            format!("{}:{}:{}", model, request.prompt, temperature)
src-tauri/src/fusion_commands_week2.rs:267:        temperature
src-tauri/src/fusion_commands_week2.rs:275:            format!("{}:{}:{}", model, request.prompt, temperature)
src-tauri/src/fusion_commands_week2.rs:447:            temperature: Some(0.7),
src-tauri/src/fusion_commands_week2.rs:469:            temperature: None,
src-tauri/src/fusion_commands_week2.rs:481:    fn test_ia_response_invalid_temperature() {
src-tauri/src/fusion_commands_week2.rs:487:            temperature: Some(3.0), // Out of range
src-tauri/src/ia/anthropic_claude.rs:23:    pub temperature: f32,
src-tauri/src/ia/anthropic_claude.rs:50:    temperature: f32,
src-tauri/src/ia/anthropic_claude.rs:107:            temperature: request.temperature.clamp(0.0, 1.0),
src-tauri/src/ia/unified_engine.rs:63:    pub temperature: f32,
src-tauri/src/ia/unified_engine.rs:219:            temperature: request.temperature,
src-tauri/src/ia/unified_engine.rs:252:            temperature: request.temperature,
src-tauri/src/ia/unified_engine.rs:271:        // - Mapping: Convert UnifiedIARequest → AIRequest (prompt, model, temperature)
src-tauri/src/ai/cache.rs:127:    fn generate_cache_key(prompt: &str, temperature: f32, max_tokens: u32) -> u64 {
src-tauri/src/ai/cache.rs:130:        temperature.to_bits().hash(&mut hasher);
src-tauri/src/ai/cache.rs:139:        temperature: f32,
src-tauri/src/ai/cache.rs:146:        let key = Self::generate_cache_key(prompt, temperature, max_tokens);
src-tauri/src/ai/cache.rs:182:        temperature: f32,
src-tauri/src/ai/cache.rs:190:        let key = Self::generate_cache_key(prompt, temperature, max_tokens);
src-tauri/src/ia/openai_gpt.rs:22:    pub temperature: f32,
src-tauri/src/ia/openai_gpt.rs:46:    temperature: f32,
src-tauri/src/ia/openai_gpt.rs:113:            temperature: request.temperature.clamp(0.0, 2.0),
src-tauri/src/ai/api.rs:25:    temperature: Option<f32>,
src-tauri/src/ai/api.rs:36:        temperature,
src-tauri/src/ai/api.rs:64:        temperature: None,
src-tauri/src/ai/api.rs:95:        temperature: None,
src-tauri/src/ai/api.rs:147:        temperature: None,
src-tauri/src/api_hub/anthropic.rs:70:            temperature: request.temperature,
src-tauri/src/api_hub/anthropic.rs:130:            temperature: request.temperature,
src-tauri/src/api_hub/anthropic.rs:195:            temperature: request.temperature,
src-tauri/src/api_hub/anthropic.rs:232:            temperature: Some(0.3),
src-tauri/src/api_hub/anthropic.rs:256:            temperature: Some(0.5),
src-tauri/src/api_hub/anthropic.rs:323:    temperature: Option<f32>,
src-tauri/src/api_hub/anthropic.rs:391:            temperature: None,
src-tauri/src/overdrive/chat_orchestrator.rs:719:            "temperature": 0.7,
src-tauri/src/overdrive/chat_orchestrator.rs:864:            "temperature": 0.7,
src-tauri/src/overdrive/chat_orchestrator.rs:968:        "temperature": 0.7,
src-tauri/src/overdrive/chat_orchestrator.rs:1120:        "temperature": 0.7,
src-tauri/src/overdrive/chat_orchestrator.rs:1549:    _temperature: Option<f32>,
src-tauri/src/overdrive/chat_orchestrator.rs:1580:    _temperature: Option<f32>,
src-tauri/src/overdrive/chat_orchestrator.rs:1783:            "temperature": 0.7,
src-tauri/src/ai/orchestrator_multi.rs:296:            temperature: Some(0.7),
src-tauri/src/api_hub/temporal_integration_tests.rs:113:            temperature: None,
src-tauri/src/api_hub/temporal_integration_tests.rs:245:            temperature: None,
src-tauri/src/ai/fusion.rs:79:                temperature_used: primary.metadata.temperature_used,
src-tauri/src/ai/fusion.rs:113:                temperature_used: primary.metadata.temperature_used,
src-tauri/src/ai/fusion.rs:139:                temperature_used: primary.metadata.temperature_used,
src-tauri/src/ai/fusion.rs:205:                temperature_used: Some(0.7),
src-tauri/src/ai/router.rs:138:                request.temperature,
src-tauri/src/ai/router.rs:168:            request.temperature,
src-tauri/src/ai/router.rs:179:                request.temperature,
src-tauri/src/ai/router.rs:210:                temperature: request.temperature,
src-tauri/src/ai/router.rs:336:                temperature: request.temperature,
src-tauri/src/api_hub/safety_bridge.rs:414:            temperature: None,
src-tauri/src/api_hub/safety_bridge.rs:437:            temperature: None,
src-tauri/src/api_hub/safety_bridge.rs:456:            temperature: None,
src-tauri/src/ai/gemini.rs:33:    temperature: f32,
src-tauri/src/ai/gemini.rs:35:    max_output_tokens: usize,
src-tauri/src/ai/gemini.rs:105:                temperature: request.temperature,
src-tauri/src/ai/gemini.rs:106:                max_output_tokens: request.max_tokens,
src-tauri/src/ai/ollama.rs:75:    pub temperature: Option<f32>,
src-tauri/src/ai/ollama.rs:162:    if let Some(temp) = request.temperature {
src-tauri/src/ai/ollama.rs:163:        options.insert("temperature".to_string(), serde_json::json!(temp));
src-tauri/src/ai/ollama.rs:224:    if let Some(temp) = request.temperature {
src-tauri/src/ai/ollama.rs:225:        options.insert("temperature".to_string(), serde_json::json!(temp));
src-tauri/src/ai/ollama.rs:346:        temperature: None,
src-tauri/src/ai/ollama.rs:458:    temperature: f32,
src-tauri/src/ai/ollama.rs:523:                temperature: request.temperature,
src-tauri/src/ai/mod.rs:37:    pub temperature: Option<f32>,
src-tauri/src/ai/mod.rs:81:    pub temperature_used: Option<f32>,
src-tauri/src/ai/mod.rs:96:    pub temperature: f32,
src-tauri/src/ai/providers/openai.rs:44:        temperature: f32,
src-tauri/src/ai/providers/openai.rs:54:            temperature,
src-tauri/src/ai/providers/openai.rs:96:        let temperature = req.temperature.unwrap_or(0.7);
src-tauri/src/ai/providers/openai.rs:100:            .call_openai_api(model, &req.prompt, temperature, max_tokens)
src-tauri/src/ai/providers/openai.rs:120:                temperature_used: Some(temperature),
src-tauri/src/ai/providers/openai.rs:155:    temperature: f32,
src-tauri/src/ai/router_intelligent.rs:221:            temperature: None,
src-tauri/src/ai/router_intelligent.rs:246:            temperature: None,
src-tauri/src/ai/router_intelligent.rs:263:            temperature: None,
src-tauri/src/ai/providers/local.rs:47:        temperature: f32,
src-tauri/src/ai/providers/local.rs:53:            options: OllamaOptions { temperature },
src-tauri/src/ai/providers/local.rs:89:        let temperature = req.temperature.unwrap_or(0.7);
src-tauri/src/ai/providers/local.rs:92:            .call_ollama_api(model, &req.prompt, temperature)
src-tauri/src/ai/providers/local.rs:111:                temperature_used: Some(temperature),
src-tauri/src/ai/providers/local.rs:159:    temperature: f32,
src-tauri/src/ai/providers/claude.rs:44:        temperature: f32,
src-tauri/src/ai/providers/claude.rs:54:            temperature,
src-tauri/src/ai/providers/claude.rs:97:        let temperature = req.temperature.unwrap_or(0.7);
src-tauri/src/ai/providers/claude.rs:101:            .call_claude_api(model, &req.prompt, temperature, max_tokens)
src-tauri/src/ai/providers/claude.rs:122:                temperature_used: Some(temperature),
src-tauri/src/ai/providers/claude.rs:158:    temperature: f32,
src-tauri/src/ai/evaluator.rs:294:            temperature: None,
src-tauri/src/api_hub/config.rs:21:    pub default_temperature: f32,
src-tauri/src/api_hub/config.rs:53:            default_temperature: 0.7,
src-tauri/src/api_hub/config.rs:246:        assert!((config.default_temperature - 0.7).abs() < 0.01);
src-tauri/src/ai/providers/titane_engine.rs:176:                temperature_used: Some(0.7),
src-tauri/src/ai/providers/titane_engine.rs:238:            temperature: None,
src-tauri/src/api_hub/copilot.rs:23:    pub temperature: Option<f32>,
src-tauri/src/api_hub/copilot.rs:131:            temperature: Some(0.0),
src-tauri/src/api_hub/mod.rs:103:    pub temperature: Option<f32>,
src-tauri/src/api_hub/mod.rs:345:            temperature: None,
src-tauri/src/api_hub/mod.rs:373:            temperature: Some(0.7),
src-tauri/src/api_hub/mod.rs:398:            temperature: Some(0.5),
src-tauri/src/api_hub/openai.rs:73:            temperature: request.temperature,
src-tauri/src/api_hub/openai.rs:129:            temperature: request.temperature,
src-tauri/src/api_hub/openai.rs:368:    temperature: Option<f32>,
src-tauri/src/api_hub/openai.rs:464:            temperature: None,
src-tauri/src/api_hub/gemini.rs:67:                temperature: request.temperature,
src-tauri/src/api_hub/gemini.rs:68:                max_output_tokens: request.max_tokens,
src-tauri/src/api_hub/gemini.rs:124:                temperature: request.temperature,
src-tauri/src/api_hub/gemini.rs:125:                max_output_tokens: request.max_tokens,
src-tauri/src/api_hub/gemini.rs:179:                temperature: Some(0.3),
src-tauri/src/api_hub/gemini.rs:180:                max_output_tokens: request.max_tokens,
src-tauri/src/api_hub/gemini.rs:286:                temperature: request.temperature,
src-tauri/src/api_hub/gemini.rs:287:                max_output_tokens: request.max_tokens,
src-tauri/src/api_hub/gemini.rs:413:    temperature: Option<f32>,
src-tauri/src/api_hub/gemini.rs:415:    max_output_tokens: Option<u32>,
src-tauri/src/api_hub/gemini.rs:459:            temperature: None,
src-tauri/src/api_hub/multimodal_router.rs:128:            temperature: Some(0.7),
src-tauri/src/api_hub/multimodal_router.rs:180:                temperature: Some(0.5),
src-tauri/src/api_hub/multimodal_router.rs:215:                temperature: None,
src-tauri/src/api_hub/multimodal_router.rs:259:            temperature: Some(0.7),
src-tauri/src/api_hub/multimodal_router.rs:352:                temperature: Some(0.7),
src-tauri/src/api_hub/multimodal_router.rs:435:                temperature: Some(0.7),
src-tauri/src/api_hub/multimodal_router.rs:480:            temperature: Some(0.5),
src-tauri/src/api_hub/router.rs:442:            temperature: None,
src-tauri/src/api_hub/router.rs:468:            temperature: None,
src-tauri/src/api_hub/router.rs:492:            temperature: None,
src-tauri/src/api_hub/router.rs:683:            temperature: None,
src-tauri/src/api_hub/router.rs:707:            temperature: None,
src-tauri/src/api_hub/router.rs:731:            temperature: None,
src-tauri/src/api_hub/router.rs:755:            temperature: None,

### retention/chunk internals
src-tauri/src/bounded.rs:339:        self.items.retain(|(_, time)| {
src-tauri/src/agi_core/abstraction.rs:201:        concepts.retain(|c| seen.insert(c.name.clone()));
src-tauri/src/commands/persistent_memory_commands.rs:83:    entries.retain(|e| e.id != entry_id);
src-tauri/src/meta/monitoring.rs:476:        alerts.retain(|a| !a.acknowledged);
src-tauri/src/commands/cognitive_center.rs:767:        .retain(|m| m.importance < 0.6 && m.access_count < 3);
src-tauri/src/commands/cognitive_center.rs:780:        .retain(|m| m.importance < 0.8 && m.access_count < 5);
src-tauri/src/cache/semantic_cache.rs:437:        entries.retain(|e| !e.is_expired(self.config.default_ttl_secs));
src-tauri/src/commands/governance_commands.rs:166:    state.retain(|p| p.id != policy_id);
src-tauri/src/commands/orchestration_center.rs:833:        events.retain(|e| e.timestamp > threshold);
src-tauri/src/system_center/logs.rs:173:            logs.retain(|l| l.level == level);
src-tauri/src/system_center/logs.rs:177:            logs.retain(|l| l.source.contains(&source));
src-tauri/src/system_center/logs.rs:182:            logs.retain(|l| l.message.to_lowercase().contains(&search_lower));
src-tauri/src/commands/memory_os_commands.rs:107:    nodes.retain(|n| n.id != node_id);
src-tauri/src/commands/qa_monitoring.rs:622:        logs.retain(|l| l.level == *lvl);
src-tauri/src/commands/qa_monitoring.rs:627:        logs.retain(|l| l.source == *src);
src-tauri/src/commands/ai_chat.rs:326:        .chunks(CHUNK_SIZE_WORDS)
src-tauri/src/cognitive/security.rs:294:    state.mental.charge.history.retain(|&x| !x.is_nan());
src-tauri/src/cognitive/context_graph.rs:631:                edge_list.retain(|e| e.to != id);
src-tauri/src/commands/devops.rs:147:    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
src-tauri/src/commands/devops.rs:148:    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
src-tauri/src/commands/devops.rs:177:    let cpu_usage = String::from_utf8_lossy(&cpu_output.stdout)
src-tauri/src/commands/devops.rs:187:    let memory_usage = String::from_utf8_lossy(&mem_output.stdout)
src-tauri/src/commands/devops.rs:197:    let processes_count = String::from_utf8_lossy(&proc_output.stdout)
src-tauri/src/commands/devops.rs:208:    let uptime = String::from_utf8_lossy(&uptime_output.stdout)
src-tauri/src/commands/devops.rs:237:        let error_count = String::from_utf8_lossy(&npm_check.stdout)
src-tauri/src/time/snapshot.rs:173:        self.snapshots.retain(|s| s.id != id);
src-tauri/src/time/travel_engine.rs:196:        cache.retain(|s| s.metadata.id != id);
src-tauri/src/commands/persistent_memory.rs:863:            entries.retain(|e| e.id != entry_id);
src-tauri/src/ai/cache.rs:273:        status.retain(|_, entry| !entry.is_expired());
src-tauri/src/core/modules/unified_memory.rs:581:        self.stm.items.retain(|item| {
src-tauri/src/conversation_os/router.rs:287:            self.config.active_stages.retain(|s| s != &stage);
src-tauri/src/chat_engine/streaming.rs:140:    fn test_chunk_text_multiple_chunks() {
src-tauri/src/chat_engine/streaming.rs:191:    fn test_chunk_text_single_char_chunks() {
src-tauri/src/chat_engine/streaming.rs:234:    fn test_chunk_text_no_empty_chunks() {
src-tauri/src/chat_engine/memory.rs:103:        self.enforce_retention(conversation);
src-tauri/src/chat_engine/memory.rs:110:    fn enforce_retention(&self, conversation: &mut Conversation) {
src-tauri/src/chat_engine/memory.rs:399:    fn test_enforce_retention_keeps_most_recent_entries() {
src-tauri/src/chat_engine/memory.rs:413:        manager.enforce_retention(&mut conversation);
src-tauri/src/omega/adaptive_router.rs:245:        self.engines.retain(|e| e.engine != engine);
src-tauri/src/auth/roles.rs:107:            .retain(|rb| !(rb.user == user && rb.role == role));
src-tauri/src/omega/scheduler.rs:457:        jobs.retain(|_, status| matches!(status, JobStatus::Queued | JobStatus::Running));
src-tauri/src/agenda/storage.rs:163:        cache.events.retain(|e| e.id != event_id);
src-tauri/src/gemini_provider_extensions.rs:144:    for (i, word_chunk) in words.chunks(chunk_size).enumerate() {
src-tauri/src/avatar/appearance_state.rs:236:        self.custom_styles.retain(|s| s.name != name);
src-tauri/src/ai/ollama.rs:262:        buffer.push_str(&String::from_utf8_lossy(&chunk));
src-tauri/src/selfheal/monitor.rs:168:        incidents.retain(|i| i.detected_at > cutoff);
src-tauri/src/system/healing_executor.rs:233:                state.isolated_engines.retain(|e| e != engine_id);
src-tauri/src/ipc/cache.rs:120:        self.entries.retain(|key, _| !predicate(key));
src-tauri/src/ipc/cache.rs:126:            .retain(|_, entry| entry.created_at.elapsed() < self.ttl);
src-tauri/src/services/robots_service.rs:83:                let text = String::from_utf8_lossy(&result.body).into_owned();
src-tauri/src/services/extract_service.rs:78:        let html = String::from_utf8_lossy(bytes);
src-tauri/src/services/seed_pack_service.rs:105:        pack.urls.retain(|u| !u.is_empty() && u.starts_with("http"));
src-tauri/src/services/network_gateway.rs:219:        Ok(String::from_utf8_lossy(&body).to_string())
src-tauri/src/cloud/cloud_sync_engine.rs:696:        self.known_devices.retain(|d| d.device_id != device_id);
src-tauri/src/conversation_engine/literary_engine.rs:393:        for chunk in sentences.chunks(chunk_size) {
src-tauri/src/tts/mod.rs:58:pub fn split_into_chunks(text: &str, max_chars: usize) -> Vec<String> {
src-tauri/src/tts/local_tts.rs:145:            let stderr = String::from_utf8_lossy(&output.stderr);
src-tauri/src/temporal_engine/temporal_memory.rs:270:        traces.retain(|t| t.current_strength() >= self.config.min_significance);
src-tauri/src/temporal_engine/temporal_events.rs:213:        subscribers.retain(|s| s.id != id);
src-tauri/src/reality_renderer/scene.rs:65:        self.root_entities.retain(|id| id != entity_id);
src-tauri/src/reality_renderer/scene.rs:146:        self.scene_history.retain(|id| id != scene_id);
src-tauri/src/reality_renderer/physics.rs:218:        self.colliders.retain(|_, c| c.body_id != body_id);
src-tauri/src/singularity_fusion/fusion_engine.rs:221:        .retain(|id| id != &pipeline_id);
src-tauri/src/temporal_engine/planner.rs:321:            tasks.retain(|t| t.status != TaskStatus::Completed);
src-tauri/src/reality_renderer/spatial.rs:221:                    cell.entity_ids.retain(|id| id != entity_id);
src-tauri/src/temporal_engine/routines.rs:351:        routines.retain(|r| r.id != id);
src-tauri/src/audio/commands.rs:137:                let stderr = String::from_utf8_lossy(&piper_output.stderr);
src-tauri/src/audio/commands.rs:172:                let stderr = String::from_utf8_lossy(&play_output.stderr);
src-tauri/src/audio/commands.rs:173:                let stdout = String::from_utf8_lossy(&play_output.stdout);
src-tauri/src/audio/commands.rs:278:        let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:333:        let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:388:    let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:452:    let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:520:    let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:551:    let stdout = String::from_utf8_lossy(&output.stdout);
src-tauri/src/audio/commands.rs:654:                let stderr = String::from_utf8_lossy(&output.stderr);
src-tauri/src/audio/commands.rs:790:        String::from_utf8_lossy(&output.stdout).trim().to_string()
src-tauri/src/audio/commands.rs:866:            String::from_utf8_lossy(&output.stderr)
src-tauri/src/audio/commands.rs:870:    let transcript = String::from_utf8_lossy(&output.stdout).trim().to_string();
src-tauri/src/ai_chat/training_engine.rs:544:        self.state.patterns.retain(|p| {
src-tauri/src/cluster/mesh_layer.rs:182:                lock_or_recover!(peers).retain(|_, node| now - node.last_seen < 30);
src-tauri/src/singularity/security.rs:213:            .retain(|e| valid_engines.contains(e.as_str()));
src-tauri/src/engines/temporal/snapshot_manager.rs:55:            self.access_order.retain(|i| i != id);
src-tauri/src/engines/temporal/snapshot_manager.rs:65:        self.access_order.retain(|i| i != id);
src-tauri/src/engines/temporal/snapshot_manager.rs:154:            .retain(|id| self.snapshots.contains_key(id));
src-tauri/src/doc_engine/storage.rs:242:        metadata_list.retain(|m| m.id != document_id);
src-tauri/src/evolution/evolution_loop.rs:191:        self.mutations.retain(|m| m.risk_level != risk_level);
src-tauri/src/multimodal/image_memory.rs:101:        entries.retain(|e| e.id != id);
src-tauri/src/evolution/evolution_commands.rs:1017:    store.history.retain(|h| h.timestamp >= before_timestamp);
src-tauri/src/semantic/query.rs:93:        results.retain(|r| r.similarity >= self.config.similarity_threshold);
src-tauri/src/semantic/vector_store.rs:138:        all_results.retain(|r| filter(&r.metadata));
src-tauri/src/neural_memory/mtm.rs:92:        self.entries.retain(|e| e.importance >= min_importance);
src-tauri/src/memory_evolution/memory_patterns.rs:142:        all_patterns.retain(|p| p.confidence >= self.config.min_confidence);
src-tauri/src/engines/monitoring_engine.rs:347:        anomalies.retain(|a| !a.auto_fixed);
src-tauri/src/agents/registry.rs:83:                ids.retain(|x| x != id);
src-tauri/src/agents/registry.rs:172:                ids.retain(|x| x != &id);
src-tauri/src/memory_os/clustering.rs:142:        clusters.retain(|c| c.size > 0);
src-tauri/src/agent_system/communication.rs:261:            queue.retain(|m| !m.is_expired());
src-tauri/src/persistence/backup.rs:493:                String::from_utf8_lossy(&decompressed[cursor..cursor + name_end]).to_string();
src-tauri/src/memory_os/multimodal_memory.rs:349:        entries.retain(|e| &e.base.id != id);
src-tauri/src/constitution/enforcement.rs:288:            restrictions.retain(|s| s != sanction);
src-tauri/src/api_hub/temporal_cache.rs:107:        store.retain(|_, entry| !entry.is_expired());
src-tauri/src/memory_os/embeddings.rs:93:        for chunk in texts.chunks(self.config.batch_size) {
src-tauri/src/memory_os/vector_store.rs:182:        results.retain(|r| r.similarity >= threshold);
src-tauri/src/persistence/compression.rs:453:        self.summaries.retain(|s| s.created_at > threshold);
src-tauri/src/security/rate_limit.rs:48:        user_requests.retain(|&timestamp| now.duration_since(timestamp) < self.window);
src-tauri/src/security/rate_limit.rs:102:        requests.retain(|_, timestamps| {
src-tauri/src/security/rate_limit.rs:103:            timestamps.retain(|&timestamp| now.duration_since(timestamp) < self.window);
src-tauri/src/api_hub/config.rs:120:        self.enabled_providers.retain(|p| *p != provider);
src-tauri/src/security/vault_engine.rs:162:        index.retain(|m| m.file_id != file_id);
src-tauri/src/security/vault_engine.rs:251:        index.retain(|m| m.file_id != file_id);
src-tauri/src/security/shell_guard.rs:44:            let stderr = String::from_utf8_lossy(&output.stderr);
src-tauri/src/security/shell_guard.rs:48:        Ok(String::from_utf8_lossy(&output.stdout).to_string())
src-tauri/src/identity/mod.rs:444:        self.identity.rules.retain(|r| r.id != rule_id);
src-tauri/src/overdrive/project_autopilot.rs:218:    tasks.retain(|t| t.project_id != project_id);
src-tauri/src/overdrive/project_autopilot.rs:501:    tasks.retain(|t| t.id != task_id);
src-tauri/src/overdrive/voice_engine.rs:265:            String::from_utf8_lossy(&output.stdout).trim().to_string()
src-tauri/src/overdrive/memory_engine.rs:381:    entries.retain(|e| e.importance >= min_importance || e.access_count >= min_access_count);
src-tauri/src/overdrive/memory_engine.rs:401:    entries.retain(|e| e.id != entry_id);
src-tauri/src/singularity_fusion/auto_fix.rs:158:    issues.retain(|i| i.id != issue_id);
src-tauri/src/overdrive/chat_orchestrator.rs:1381:    conversations.retain(|c| c.conversation_id != conversation_id);
src-tauri/src/overdrive/chat_orchestrator.rs:1687:        .chunks(chunk_size)
src-tauri/src/overdrive/chat_orchestrator.rs:1842:        let chunk_str = String::from_utf8_lossy(&chunk_bytes);

### flush/persist/debounce
src-tauri/src/api/system_api.rs:104:        recommendations.push("Memory flush recommended".to_string());
src-tauri/src/commands/copilot_commands.rs:249:        error!("Failed to persist Copilot key: {:?}", e);
src-tauri/src/commands/ai_chat.rs:105:                    eprintln!("Warning: Failed to initialize persistent memory storage ({}), using in-memory fallback", e);
src-tauri/src/commands/ai_chat.rs:229:            // Save to persistent storage
src-tauri/src/commands/ai_chat.rs:231:            if let Err(e) = storage.save_conversation(conv) {
src-tauri/src/commands/ai_chat.rs:376:            // Save to persistent storage
src-tauri/src/commands/ai_chat.rs:378:            if let Err(e) = storage.save_conversation(conv) {
src-tauri/src/commands/ai_chat.rs:535:        .save_conversation(&conversation)
src-tauri/src/commands/mod.rs:35:pub mod persistent_memory; // ✅ v19.2Ω: Persistent Memory 3-Level System
src-tauri/src/commands/mod.rs:65:pub mod persistent_memory_commands;
src-tauri/src/commands/mod.rs:79:pub use persistent_memory::*; // ✅ v19.2Ω: Export persistent memory commands
src-tauri/src/commands/mod.rs:80:pub use persistent_memory_commands::*;
src-tauri/src/commands/mod.rs:335:/// Save an encrypted entry to persistent memory
src-tauri/src/commands/mod.rs:352:/// Load all encrypted entries from persistent memory
src-tauri/src/commands/one_core.rs:47:    Data,      // Mémoire, persistance, cache
src-tauri/src/commands/persistent_memory.rs:6:// - Intermediate: persistant, 90 jours, ~500 entrées
src-tauri/src/commands/persistent_memory.rs:222:/// État global de la mémoire persistante
src-tauri/src/commands/persistent_memory.rs:247:        let base_path = app_data_dir.join("persistent_memory");
src-tauri/src/commands/persistent_memory.rs:291:pub async fn persistent_memory_read(
src-tauri/src/commands/persistent_memory.rs:431:pub async fn persistent_memory_get_stats(
src-tauri/src/commands/persistent_memory.rs:525:pub async fn persistent_memory_get_bundles(
src-tauri/src/commands/persistent_memory.rs:534:pub async fn persistent_memory_get_context(
src-tauri/src/commands/persistent_memory.rs:564:    let response = persistent_memory_read(state, request).await?;
src-tauri/src/commands/persistent_memory.rs:607:pub async fn persistent_memory_write_entry(
src-tauri/src/commands/persistent_memory.rs:720:pub async fn persistent_memory_promote_entry(
src-tauri/src/commands/persistent_memory.rs:775:pub async fn persistent_memory_archive_entry(
src-tauri/src/commands/persistent_memory.rs:832:pub async fn persistent_memory_delete_entry(
src-tauri/src/commands/persistent_memory.rs:886:pub async fn persistent_memory_create_summary(
src-tauri/src/commands/persistent_memory.rs:912:    let response = persistent_memory_read(State::from(&*state), request).await?;
src-tauri/src/commands/persistent_memory.rs:984:pub async fn persistent_memory_create_bundle(
src-tauri/src/commands/persistent_memory.rs:1021:pub async fn persistent_memory_add_to_bundle(
src-tauri/src/commands/persistent_memory.rs:1048:pub async fn persistent_memory_export(
src-tauri/src/meta_energy/diagnostics.rs:93:    /// Déséquilibre persistant
src-tauri/src/meta_energy/diagnostics.rs:234:        // Fatigue élevée persistante
src-tauri/src/commands/persistent_memory_commands.rs:34:pub async fn persistent_memory_promote_entry(entry_id: String) -> Result<(), TitaneError> {
src-tauri/src/commands/persistent_memory_commands.rs:56:pub async fn persistent_memory_archive_entry(entry_id: String) -> Result<(), TitaneError> {
src-tauri/src/commands/persistent_memory_commands.rs:76:pub async fn persistent_memory_delete_entry(entry_id: String) -> Result<(), TitaneError> {
src-tauri/src/commands/persistent_memory_commands.rs:90:pub async fn persistent_memory_add_to_bundle(
src-tauri/src/cache/middleware.rs:22:        enable_persistence: false,
src-tauri/src/cache/middleware.rs:23:        persistence_path: None,
src-tauri/src/commands/memory_commands.rs:71:    storage.save_conversation(&conversation)
src-tauri/src/cache/mod.rs:58:    pub enable_persistence: bool,
src-tauri/src/cache/mod.rs:59:    pub persistence_path: Option<PathBuf>,
src-tauri/src/cache/mod.rs:74:            enable_persistence: false,
src-tauri/src/cache/mod.rs:75:            persistence_path: None,
src-tauri/src/cache/mod.rs:313:    /// Save cache to disk (if persistence enabled)
src-tauri/src/cache/mod.rs:314:    pub fn persist(&self) -> Result<(), String> {
src-tauri/src/cache/mod.rs:315:        if !self.config.enable_persistence {
src-tauri/src/cache/mod.rs:321:            .persistence_path
src-tauri/src/cache/mod.rs:323:            .ok_or_else(|| "No persistence path configured".to_string())?;
src-tauri/src/cache/mod.rs:350:        if !self.config.enable_persistence {
src-tauri/src/cache/mod.rs:356:            .persistence_path
src-tauri/src/cache/mod.rs:358:            .ok_or_else(|| "No persistence path configured".to_string())?;
src-tauri/src/singularity_state/persistence.rs:17:    /// Créer un nouveau layer de persistence
src-tauri/src/singularity_state/persistence.rs:22:    /// Créer un layer de persistence avec un chemin explicite.
src-tauri/src/singularity_state/persistence.rs:129:    async fn test_persistence_save_load() {
src-tauri/src/singularity_state/persistence.rs:130:        let persistence = PersistenceLayer::with_db_path(unique_test_state_path());
src-tauri/src/singularity_state/persistence.rs:134:        let result = persistence.save_state(&state).await;
src-tauri/src/singularity_state/persistence.rs:138:        let loaded = persistence.load_state().await;
src-tauri/src/singularity_state/persistence.rs:142:        persistence.clear_state().await.ok();
src-tauri/src/singularity_state/persistence.rs:146:    async fn test_persistence_clear() {
src-tauri/src/singularity_state/persistence.rs:147:        let persistence = PersistenceLayer::with_db_path(unique_test_state_path());
src-tauri/src/singularity_state/persistence.rs:150:        persistence.save_state(&state).await.ok();
src-tauri/src/singularity_state/persistence.rs:151:        assert!(persistence.state_exists());
src-tauri/src/singularity_state/persistence.rs:153:        persistence.clear_state().await.ok();
src-tauri/src/singularity_state/persistence.rs:154:        assert!(!persistence.state_exists());
src-tauri/src/meta_energy/config.rs:45:    pub persist_state: bool,
src-tauri/src/meta_energy/config.rs:78:            persist_state: true,
src-tauri/src/meta_energy/config.rs:105:            persist_state: false,
src-tauri/src/meta_energy/config.rs:146:            persist_state: true,
src-tauri/src/meta_energy/config.rs:187:            persist_state: true,
src-tauri/src/meta_energy/config.rs:212:            persist_state: false,
src-tauri/src/meta_energy/config.rs:334:    pub fn persist_state(mut self, persist: bool, path: Option<String>) -> Self {
src-tauri/src/meta_energy/config.rs:335:        self.config.persist_state = persist;
src-tauri/src/commands/cognitive_center.rs:457:            "XP Engine unifié avec persistence".into(),
src-tauri/src/singularity_state/commands.rs:199:/// Charger état depuis persistence
src-tauri/src/singularity_state/commands.rs:335:    fn test_get_all_commands_contains_persistence_commands() {
src-tauri/src/singularity_state/mod.rs:40:pub mod persistence;
src-tauri/src/singularity_state/mod.rs:47:pub use persistence::PersistenceLayer;
src-tauri/src/singularity_state/mod.rs:185:                                           // - Access: Load last 10 states from persistence layer
src-tauri/src/singularity_state/mod.rs:327:    /// Layer de persistence (SQLite)
src-tauri/src/singularity_state/mod.rs:328:    persistence: PersistenceLayer,
src-tauri/src/singularity_state/mod.rs:341:        let persistence = PersistenceLayer::new();
src-tauri/src/singularity_state/mod.rs:346:            persistence,
src-tauri/src/singularity_state/mod.rs:352:    /// Initialiser le moteur (charger état persisté)
src-tauri/src/singularity_state/mod.rs:355:        if let Ok(persisted_state) = self.persistence.load_state().await {
src-tauri/src/singularity_state/mod.rs:357:            *state = persisted_state;
src-tauri/src/singularity_state/mod.rs:378:        self.persistence.save_state(&state).await.ok();
src-tauri/src/singularity_state/mod.rs:390:        self.persistence.save_state(&state).await.ok();
src-tauri/src/singularity_state/mod.rs:402:        self.persistence.save_state(&state).await.ok();
src-tauri/src/singularity_state/mod.rs:414:        self.persistence.save_state(&state).await.ok();
src-tauri/src/singularity_state/mod.rs:426:        self.persistence.save_state(&state).await.ok();
src-tauri/src/singularity_state/mod.rs:439:        self.persistence.save_state(&state).await.ok();
src-tauri/src/singularity_state/mod.rs:457:        self.persistence.save_state(&state).await
src-tauri/src/singularity_state/mod.rs:460:    /// Charger état depuis persistence
src-tauri/src/singularity_state/mod.rs:462:        let persisted_state = self.persistence.load_state().await?;
src-tauri/src/singularity_state/mod.rs:464:        *state = persisted_state;
src-tauri/src/core/legacy.rs:58:/// MemoryCore vΩ.6 — disk-backed persistence with telemetry hooks
src-tauri/src/core/legacy.rs:89:    fn persist_locked(&self, state: &MemoryDisk) -> AppResult<()> {
src-tauri/src/core/legacy.rs:90:        // En mode dev (feature mock), ne persister que toutes les 30 secondes
src-tauri/src/core/legacy.rs:99:                // Skip persist si moins de 30s depuis la dernière
src-tauri/src/core/legacy.rs:104:        state.persist(&self.paths.storage_file)
src-tauri/src/core/legacy.rs:158:        self.persist_locked(&data)
src-tauri/src/core/legacy.rs:188:        self.persist_locked(&data)
src-tauri/src/core/legacy.rs:205:        self.persist_locked(&data)
src-tauri/src/core/legacy.rs:328:        self.persist_locked(&data)
src-tauri/src/core/legacy.rs:834:            default.persist(path)?;
src-tauri/src/core/legacy.rs:841:            default.persist(path)?;
src-tauri/src/core/legacy.rs:852:    fn persist(&self, path: &PathBuf) -> AppResult<()> {
src-tauri/src/core/engine.rs:113:    /// Synchronize state (persist important data)
src-tauri/src/core/engine.rs:122:        // In a real implementation, this would persist state to disk
src-tauri/src/mock_commands.rs:976:    // Store file in memory_persistence if content is provided
src-tauri/src/mock_commands.rs:978:        if let Err(e) = crate::memory_persistence::store_file(&path, file_content, &file_category) {
src-tauri/src/mock_commands.rs:1210:    match crate::memory_persistence::get_all_files() {
src-tauri/src/mock_commands.rs:1222:    match crate::memory_persistence::get_files_by_category(&category) {
src-tauri/src/mock_commands.rs:1234:    match crate::memory_persistence::clear_memory() {
src-tauri/src/mock_commands.rs:1244:    match crate::memory_persistence::store_file(&path, &category, &content) {
src-tauri/src/core/modules/unified_memory.rs:548:            // Implementation: Encrypted disk persistence for LTM entries
src-tauri/src/system/adaptive_engine/analysis.rs:48:/// * `memory` - État du module Memory (persistance)
src-tauri/src/config/io.rs:166:        "⚠️  [CONFIG] Chat engine config imported but not persisted (state management needed)"
src-tauri/src/config/update.rs:96:    pub memory_flush_interval_ms: u64,
src-tauri/src/config/update.rs:124:            memory_flush_interval_ms: 750,
src-tauri/src/config/update.rs:146:                memory_flush_interval_ms: 1_000,
src-tauri/src/config/update.rs:163:                memory_flush_interval_ms: 1_500,
src-tauri/src/config/update.rs:232:    if dto.memory_flush_interval_ms < 50 || dto.memory_flush_interval_ms > 60_000 {
src-tauri/src/config/update.rs:233:        return Err("memory_flush_interval_ms doit être entre 50 et 60000".to_string());
src-tauri/src/config/update.rs:371:/// Les changements sont validés puis persistés dans les variables d'environnement.
src-tauri/src/config/update.rs:415:/// Les changements sont validés mais pour l'instant ne sont pas persistés
src-tauri/src/config/update.rs:471:    log::info!("✅ [CONFIG] Chat engine configuration persisted successfully");
src-tauri/src/conversation_os/memory_context.rs:287:        // En production: persister les préférences dans le Memory OS
src-tauri/src/chat_engine/config.rs:12:    /// Maximum total tokens allowed to be persisted for a conversation.
src-tauri/src/chat_engine/config.rs:14:    /// Interval used to debounce memory flush operations to disk.
src-tauri/src/chat_engine/config.rs:15:    pub memory_flush_interval: Duration,
src-tauri/src/chat_engine/config.rs:29:            memory_flush_interval: Duration::from_millis(350),
src-tauri/src/chat_engine/config.rs:47:        assert_eq!(config.memory_flush_interval, Duration::from_millis(350));
src-tauri/src/chat_engine/config.rs:76:            memory_flush_interval: Duration::from_millis(500),
src-tauri/src/chat_engine/config.rs:95:    fn test_chat_engine_config_flush_interval_conversion() {
src-tauri/src/chat_engine/config.rs:97:        assert_eq!(config.memory_flush_interval.as_millis(), 350);
src-tauri/src/chat_engine/config.rs:114:            memory_flush_interval: Duration::from_millis(1),
src-tauri/src/chat_engine/config.rs:130:            memory_flush_interval: Duration::from_secs(10),
src-tauri/src/chat_engine/mod.rs:215:                        log::error!("[ChatEngine] Failed to persist streamed response: {}", err);
src-tauri/src/chat_engine/mod.rs:292:        self.memory.flush_conversation_now(conversation_id).await?;
src-tauri/src/chat_engine/mod.rs:390:        config.memory_flush_interval,
src-tauri/src/singularity_cortex/state.rs:9:/// Singularity State — Le cerveau global persistant de TITANE∞
src-tauri/src/chat_engine/memory.rs:21:    flush_interval: Duration,
src-tauri/src/chat_engine/memory.rs:22:    flush_tasks: Mutex<HashMap<String, JoinHandle<()>>>,
src-tauri/src/chat_engine/memory.rs:26:    pub fn new(storage: Arc<MemoryStorage>, retention_tokens: usize, flush_interval: Duration) -> Self {
src-tauri/src/chat_engine/memory.rs:31:            flush_interval,
src-tauri/src/chat_engine/memory.rs:32:            flush_tasks: Mutex::new(HashMap::new()),
src-tauri/src/chat_engine/memory.rs:41:    /// a new conversation is created and persisted immediately.
src-tauri/src/chat_engine/memory.rs:54:            .save_conversation(&conversation)
src-tauri/src/chat_engine/memory.rs:106:        self.schedule_flush(conversation_id.to_string()).await;
src-tauri/src/chat_engine/memory.rs:135:    async fn schedule_flush(&self, conversation_id: String) {
src-tauri/src/chat_engine/memory.rs:136:        let mut tasks = self.flush_tasks.lock().await;
src-tauri/src/chat_engine/memory.rs:139:                log::debug!("[Memory] flush coalesced: {}", conversation_id);
src-tauri/src/chat_engine/memory.rs:146:        let delay = self.flush_interval;
src-tauri/src/chat_engine/memory.rs:149:            log::debug!("[Memory] flush scheduled: {}", conversation_id_for_task);
src-tauri/src/chat_engine/memory.rs:158:                if let Err(err) = storage.save_conversation(&conversation) {
src-tauri/src/chat_engine/memory.rs:160:                        "[Memory] flush persist failed for {}: {}",
src-tauri/src/chat_engine/memory.rs:165:                    log::debug!("[Memory] flush persisted: {}", conversation_id_for_task);
src-tauri/src/chat_engine/memory.rs:173:    pub async fn flush_conversation_now(&self, conversation_id: &str) -> Result<(), ChatEngineError> {
src-tauri/src/chat_engine/memory.rs:174:        if let Some(handle) = self.flush_tasks.lock().await.remove(conversation_id) {
src-tauri/src/chat_engine/memory.rs:185:                .save_conversation(&conversation)
src-tauri/src/chat_engine/memory.rs:187:            log::debug!("[Memory] flush persisted: {}", conversation_id);
src-tauri/src/chat_engine/memory.rs:193:    pub async fn flush_all_now(&self) -> Result<(), ChatEngineError> {
src-tauri/src/chat_engine/memory.rs:200:            self.flush_conversation_now(&conversation_id).await?;
src-tauri/src/chat_engine/memory.rs:239:            .save_conversation(&conversation)
src-tauri/src/chat_engine/memory.rs:265:            let mut tasks = self.flush_tasks.lock().await;
src-tauri/src/agenda/storage.rs:3:// Stockage persistant des événements (fichier JSON local)
src-tauri/src/unified_memory_v2/persistence.rs:3://   Disk I/O operations (migré depuis memory_persistence.rs)
src-tauri/src/unified_memory_v2/persistence.rs:12:/// Memory persistence manager
src-tauri/src/unified_memory_v2/persistence.rs:19:    /// Create new persistence manager
src-tauri/src/unified_memory_v2/persistence.rs:27:    /// Initialize persistence (create directories)
src-tauri/src/unified_memory_v2/tests_simple.rs:19:            persistence_enabled: false,
src-tauri/src/unified_memory_v2/config.rs:24:    pub persistence_enabled: bool,
src-tauri/src/unified_memory_v2/config.rs:36:            persistence_enabled: true,
src-tauri/src/unified_memory_v2/tests.rs:29:            persistence_enabled: false,
src-tauri/src/unified_memory_v2/tests.rs:142:            persistence_enabled: false,
src-tauri/src/unified_memory_v2/mod.rs:16://! - `memory_persistence.rs` → Persistence
src-tauri/src/unified_memory_v2/mod.rs:26://! │  ├── persistence.rs    ← Disk I/O (from memory_persistence.rs)
src-tauri/src/unified_memory_v2/mod.rs:45:pub mod persistence;
src-tauri/src/temporal_engine/config.rs:38:    pub persist_state: bool,
src-tauri/src/temporal_engine/config.rs:58:            persist_state: true,
src-tauri/src/temporal_engine/config.rs:87:            persist_state: false,
src-tauri/src/temporal_engine/config.rs:118:            persist_state: true,
src-tauri/src/temporal_engine/config.rs:142:            persist_state: false, // Don't persist in dev
src-tauri/src/temporal_engine/config.rs:242:    pub fn persist_state(mut self, persist: bool, path: Option<String>) -> Self {
src-tauri/src/temporal_engine/config.rs:243:        self.config.persist_state = persist;
src-tauri/src/temporal_engine/config.rs:336:        assert!(config.persist_state);
src-tauri/src/temporal_engine/config.rs:347:        assert!(!config.persist_state);
src-tauri/src/temporal_engine/config.rs:368:        assert!(!config.persist_state);
src-tauri/src/temporal_engine/config.rs:445:            .persist_state(true, Some("custom_state.json".to_string()))
src-tauri/src/temporal_engine/config.rs:454:        assert!(config.persist_state);
src-tauri/src/security/secrets_engine.rs:70:    /// Initialise le moteur. Si un mot de passe est fourni, les secrets sont persistant chiffrés.
src-tauri/src/security/secrets_engine.rs:82:        let mut needs_initial_persist = false;
src-tauri/src/security/secrets_engine.rs:102:                needs_initial_persist = true;
src-tauri/src/security/secrets_engine.rs:110:            warn!("[SecretsEngine] No passphrase configured. Running in ephemeral mode (no persistence)");
src-tauri/src/security/secrets_engine.rs:121:        if matches!(engine.mode(), SecretsMode::Encrypted { .. }) && needs_initial_persist {
src-tauri/src/security/secrets_engine.rs:122:            engine.persist().map_err(|e| {
src-tauri/src/security/secrets_engine.rs:123:                error!("[SecretsEngine] Failed to persist encrypted store: {}", e);
src-tauri/src/security/secrets_engine.rs:184:        self.persist()
src-tauri/src/security/secrets_engine.rs:200:        self.persist()
src-tauri/src/security/secrets_engine.rs:290:    fn persist(&self) -> Result<(), SecretsError> {
src-tauri/src/memory_os/memory_state.rs:125:    /// Long-Term Memory (persistent, >7d)
src-tauri/src/security/vault_engine.rs:6://   Auto-chiffrement transparent de toute la persistence
src-tauri/src/security/security_engine.rs:229:    fn test_persistence() {
src-tauri/src/security/security_engine.rs:238:                .set_secret("persist_key", "persist_value")
src-tauri/src/security/security_engine.rs:248:            assert_eq!(engine.get_secret("persist_key"), Some(&"persist_value".to_string()));
src-tauri/src/conversation_engine/commands.rs:341:        let _ = persist_conversation_os_artifacts(
src-tauri/src/conversation_engine/commands.rs:367:        let _ = persist_conversation_os_artifacts(
src-tauri/src/conversation_engine/commands.rs:409:        let _ = persist_conversation_os_artifacts(
src-tauri/src/conversation_engine/commands.rs:495:    if let Err(err) = persist_conversation_os_artifacts(
src-tauri/src/conversation_engine/commands.rs:504:        log::warn!("[Ω:CMD] Conversation OS persistence skipped: {}", err);
src-tauri/src/conversation_engine/commands.rs:572:fn persist_conversation_os_artifacts(
src-tauri/src/conversation_engine/commands.rs:581:    persist_conversation_os_artifacts_with_path(
src-tauri/src/conversation_engine/commands.rs:594:fn persist_conversation_os_artifacts_with_path(
src-tauri/src/conversation_engine/commands.rs:779:fn persist_conversation_os_artifacts_with_path(
src-tauri/src/conversation_engine/commands.rs:1133:    fn conversation_os_persistence_stores_events_and_sources() {
src-tauri/src/conversation_engine/commands.rs:1153:        persist_conversation_os_artifacts_with_path(
src-tauri/src/conversation_engine/commands.rs:1163:        .expect("persistence should succeed");
src-tauri/src/conversation_engine/commands.rs:1214:        persist_conversation_os_artifacts_with_path(
src-tauri/src/conversation_engine/commands.rs:1224:        .expect("single-pipeline persistence should succeed");
src-tauri/src/conversation_engine/commands.rs:1264:            .expect("trace should be persisted in user payload");
src-tauri/src/conversation_engine/commands.rs:1282:    fn conversation_os_persistence_stores_snapshot_and_failures_from_trace() {
src-tauri/src/conversation_engine/commands.rs:1303:        persist_conversation_os_artifacts_with_path(
src-tauri/src/conversation_engine/commands.rs:1313:        .expect("persistence should succeed");
src-tauri/src/evolution/evolution_commands.rs:321:/// État persistant de l'Evolution Engine
src-tauri/src/semantic/storage.rs:2:// Stockage persistant chiffré pour l'index sémantique
src-tauri/src/error.rs:20:    #[error("Memory persistence failed: {0}")]
src-tauri/src/persistence/database.rs:72:/// Base de données de persistence
src-tauri/src/persistence/database.rs:93:        // Implementation: Migrate to rusqlite for production-grade persistence
src-tauri/src/persistence/database.rs:117:        path.push("persistence");
src-tauri/src/persistence/memory_health.rs:210:        // Récupérer les infos depuis le moteur de persistence
src-tauri/src/persistence/memory_health.rs:211:        let persistence = super::PERSISTENCE_ENGINE.read().await;
src-tauri/src/persistence/memory_health.rs:212:        let status = persistence.get_status();
src-tauri/src/persistence/memory_health.rs:325:            (status.events_persisted as u64).saturating_mul(10), // ~10ms par event
src-tauri/src/persistence/memory_health.rs:345:            event_count: status.events_persisted,
src-tauri/src/persistence/memory_health.rs:465:        if let Err(e) = engine.persist_event(event).await {
src-tauri/src/persistence/backup.rs:171:        path.push("persistence");
src-tauri/src/persistence/types.rs:3://! Types pour le système de persistence 100% SAVE
src-tauri/src/persistence/types.rs:13:// TITAN EVENT (Événement persisté)
src-tauri/src/persistence/types.rs:16:/// Événement TITANE persistable
src-tauri/src/persistence/types.rs:221:/// Status du système de persistence
src-tauri/src/persistence/types.rs:224:    /// Nombre d'événements persistés
src-tauri/src/persistence/types.rs:225:    pub events_persisted: u64,
src-tauri/src/persistence/types.rs:300:/// Erreurs de persistence
src-tauri/src/persistence/types.rs:303:    #[error("Moteur de persistence non initialisé")]
src-tauri/src/persistence/types.rs:570:    fn test_persistence_status_default() {
src-tauri/src/persistence/types.rs:573:        assert_eq!(status.events_persisted, 0);
src-tauri/src/persistence/types.rs:580:    fn test_persistence_status_with_data() {
src-tauri/src/persistence/types.rs:582:            events_persisted: 1000,
src-tauri/src/persistence/types.rs:596:        assert_eq!(status.events_persisted, 1000);
src-tauri/src/persistence/types.rs:601:    fn test_persistence_status_clone() {
src-tauri/src/persistence/types.rs:603:            events_persisted: 50,
src-tauri/src/persistence/types.rs:608:        assert_eq!(cloned.events_persisted, 50);
src-tauri/src/persistence/types.rs:613:    fn test_persistence_status_debug() {
src-tauri/src/persistence/types.rs:620:    fn test_persistence_status_serialization() {
src-tauri/src/persistence/types.rs:622:            events_persisted: 100,
src-tauri/src/persistence/types.rs:632:        assert_eq!(restored.events_persisted, 100);
src-tauri/src/persistence/types.rs:780:    fn test_persistence_error_not_initialized() {
src-tauri/src/persistence/types.rs:787:    fn test_persistence_error_database() {
src-tauri/src/persistence/types.rs:794:    fn test_persistence_error_serialization_err() {
src-tauri/src/persistence/types.rs:801:    fn test_persistence_error_integrity() {
src-tauri/src/persistence/types.rs:808:    fn test_persistence_error_recovery() {
src-tauri/src/persistence/types.rs:815:    fn test_persistence_error_io() {
src-tauri/src/persistence/types.rs:822:    fn test_persistence_error_schema_mismatch() {
src-tauri/src/persistence/types.rs:834:    fn test_persistence_error_debug() {
src-tauri/src/persistence/types.rs:841:    fn test_persistence_error_clone() {
src-tauri/src/persistence/types.rs:848:    fn test_persistence_error_serialization() {
src-tauri/src/persistence/mod.rs:74:/// Instance globale du moteur de persistence
src-tauri/src/persistence/mod.rs:78:/// Moteur de persistence principal
src-tauri/src/persistence/mod.rs:100:    /// Initialiser le moteur de persistence
src-tauri/src/persistence/mod.rs:128:    pub async fn persist_event(&mut self, event: TitanEvent) -> Result<(), PersistenceError> {
src-tauri/src/persistence/mod.rs:133:                    "[PersistenceEngine] Event {} déjà persisté (idempotent)",
src-tauri/src/persistence/mod.rs:146:            self.status.events_persisted += 1;
src-tauri/src/persistence/mod.rs:150:            log::debug!("[PersistenceEngine] Event {} persisté", event.id);
src-tauri/src/persistence/mod.rs:246:    /// Obtenir le status de persistence
src-tauri/src/persistence/mod.rs:266:    /// Shutdown propre (flush final)
src-tauri/src/persistence/commands.rs:3://! Commandes Tauri pour la persistence 100% SAVE
src-tauri/src/persistence/commands.rs:7:use crate::persistence::{IntegrityReport, PersistenceStatus, TitanEvent, PERSISTENCE_ENGINE};
src-tauri/src/persistence/commands.rs:13:/// Les valeurs par défaut sont appliquées dans titan_persist_event
src-tauri/src/persistence/commands.rs:28:/// DTO pour le status de persistence
src-tauri/src/persistence/commands.rs:31:    pub events_persisted: u64,
src-tauri/src/persistence/commands.rs:44:            events_persisted: status.events_persisted,
src-tauri/src/persistence/commands.rs:56:/// Initialiser le moteur de persistence
src-tauri/src/persistence/commands.rs:58:pub async fn titan_persistence_init() -> Result<(), String> {
src-tauri/src/persistence/commands.rs:65:pub async fn titan_persist_event(event: TitanEventDto) -> Result<(), String> {
src-tauri/src/persistence/commands.rs:66:    use crate::persistence::EventOrigin;
src-tauri/src/persistence/commands.rs:77:                "[titan_persist_event] Origine inconnue '{}', utilisation de 'user'",
src-tauri/src/persistence/commands.rs:89:        .persist_event(titan_event)
src-tauri/src/persistence/commands.rs:108:/// Obtenir le status de persistence
src-tauri/src/persistence/commands.rs:110:pub async fn titan_get_persistence_status() -> Result<PersistenceStatusDto, String> {
src-tauri/src/persistence/commands.rs:124:pub async fn titan_compact_journal() -> Result<crate::persistence::CompactionReport, String> {
src-tauri/src/persistence/commands.rs:148:pub async fn titan_list_snapshots() -> Result<Vec<crate::persistence::SnapshotInfo>, String> {
src-tauri/src/persistence/commands.rs:169:pub async fn titan_persistence_shutdown() -> Result<(), String> {
src-tauri/src/persistence/commands.rs:181:    use crate::persistence::migrations::MigrationEngine;
src-tauri/src/persistence/commands.rs:215:    crate::persistence::migrations::CURRENT_SCHEMA_VERSION
src-tauri/src/persistence/commands.rs:224:    use crate::persistence::backup::BackupEngine;
src-tauri/src/persistence/commands.rs:256:    use crate::persistence::backup::BackupEngine;
src-tauri/src/persistence/commands.rs:292:    use crate::persistence::backup::{BackupEngine, ImportMode};
src-tauri/src/persistence/commands.rs:340:    use crate::persistence::memory_health::MEMORY_HEALTH_ENGINE;
src-tauri/src/persistence/commands.rs:423:    use crate::persistence::memory_health::MEMORY_HEALTH_ENGINE;
src-tauri/src/persistence/commands.rs:536:    let mut persistence = PERSISTENCE_ENGINE.write().await;
src-tauri/src/persistence/commands.rs:537:    let db_report = persistence
src-tauri/src/persistence/commands.rs:547:    let recovery_ok = persistence.load_latest_state().await.is_ok();
src-tauri/src/persistence/commands.rs:575:) -> Result<crate::persistence::memory_doctor::DoctorReport, String> {
src-tauri/src/persistence/commands.rs:576:    let mut doctor = crate::persistence::memory_doctor::MemoryDoctor::new();
src-tauri/src/persistence/commands.rs:583:    let mut doctor = crate::persistence::memory_doctor::MemoryDoctor::new();
src-tauri/src/persistence/commands.rs:585:    Ok(crate::persistence::memory_doctor::MemoryDoctor::generate_summary(&report))
src-tauri/src/persistence/commands.rs:591:) -> Result<crate::persistence::memory_health::SelfHealingReport, String> {
src-tauri/src/persistence/commands.rs:592:    let mut doctor = crate::persistence::memory_doctor::MemoryDoctor::new();
src-tauri/src/persistence/commands.rs:599:) -> Result<crate::persistence::types::CompactionReport, String> {
src-tauri/src/persistence/commands.rs:600:    let doctor = crate::persistence::memory_doctor::MemoryDoctor::new();
src-tauri/src/persistence/commands.rs:607:    let mut doctor = crate::persistence::memory_doctor::MemoryDoctor::new();
src-tauri/src/persistence/memory_doctor.rs:442:                fix_action: Some("titan_persistence_init".to_string()),
src-tauri/src/persistence/invariants.rs:537:            origin: crate::persistence::types::EventOrigin::System,
src-tauri/src/persistence/recovery.rs:40:        // 1. Vérifier l'état des fichiers de persistence
src-tauri/src/persistence/recovery.rs:41:        let db_path = Self::get_persistence_path();
src-tauri/src/persistence/recovery.rs:123:    /// Obtenir le chemin de persistence
src-tauri/src/persistence/recovery.rs:124:    fn get_persistence_path() -> std::path::PathBuf {
src-tauri/src/persistence/recovery.rs:127:        path.push("persistence");
src-tauri/src/engines/unified_memory/mod.rs:56:    /// Long-term memory (persistent)
src-tauri/src/lib.rs:141:    note = "Use unified_memory_v2::persistence module instead"
src-tauri/src/lib.rs:143:pub mod memory_persistence; // ⚠️ Phase 2.4: → unified_memory_v2::persistence
src-tauri/src/lib.rs:145:pub mod persistence; // ✅ v∞.MPE - 100% SAVE Persistence Engine (NEW)
src-tauri/src/services/rate_limit_service.rs:4://   In-memory (no persistence in P3)
src-tauri/src/main.rs:56:    pub mod persistent_memory_commands {
src-tauri/src/main.rs:57:        include!("commands/persistent_memory_commands.rs");
src-tauri/src/main.rs:365:// Use persistence module from lib.rs (includes all commands)
src-tauri/src/main.rs:366:use titane_infinity::persistence;
src-tauri/src/main.rs:482:            fn flush(&mut self) -> std::io::Result<()> {
src-tauri/src/main.rs:484:                    let _ = f.flush();
src-tauri/src/main.rs:486:                let _ = std::io::stderr().flush();
src-tauri/src/main.rs:1389:            commands_v21::persistent_memory_commands::persistent_memory_promote_entry,
src-tauri/src/main.rs:1390:            commands_v21::persistent_memory_commands::persistent_memory_archive_entry,
src-tauri/src/main.rs:1391:            commands_v21::persistent_memory_commands::persistent_memory_delete_entry,
src-tauri/src/main.rs:1392:            commands_v21::persistent_memory_commands::persistent_memory_add_to_bundle,
src-tauri/src/main.rs:1433:            persistence::commands::titan_persistence_init,
src-tauri/src/main.rs:1434:            persistence::commands::titan_persist_event,
src-tauri/src/main.rs:1435:            persistence::commands::titan_force_snapshot,
src-tauri/src/main.rs:1436:            persistence::commands::titan_get_persistence_status,
src-tauri/src/main.rs:1437:            persistence::commands::titan_check_integrity,
src-tauri/src/main.rs:1438:            persistence::commands::titan_compact_journal,
src-tauri/src/main.rs:1439:            persistence::commands::titan_load_state,
src-tauri/src/main.rs:1440:            persistence::commands::titan_get_events_since,
src-tauri/src/main.rs:1441:            persistence::commands::titan_list_snapshots,
src-tauri/src/main.rs:1442:            persistence::commands::titan_recover_state,
src-tauri/src/main.rs:1443:            persistence::commands::titan_verify_integrity,
src-tauri/src/main.rs:1444:            persistence::commands::titan_persistence_shutdown,
src-tauri/src/main.rs:1445:            persistence::commands::titan_migrate_state,
src-tauri/src/main.rs:1446:            persistence::commands::titan_get_schema_version,
src-tauri/src/main.rs:1447:            persistence::commands::titan_export_data,
src-tauri/src/main.rs:1448:            persistence::commands::titan_validate_archive,
src-tauri/src/main.rs:1449:            persistence::commands::titan_import_data,
src-tauri/src/main.rs:1450:            persistence::commands::titan_get_memory_health,
src-tauri/src/main.rs:1451:            persistence::commands::titan_run_self_healing,
src-tauri/src/main.rs:1452:            persistence::commands::titan_reset_module,
src-tauri/src/main.rs:1453:            persistence::commands::titan_dump_raw_state,
src-tauri/src/main.rs:1454:            persistence::commands::titan_run_full_integrity_check,
src-tauri/src/main.rs:1455:            persistence::commands::titan_memory_doctor_diagnose,
src-tauri/src/main.rs:1456:            persistence::commands::titan_memory_doctor_summary,
src-tauri/src/main.rs:1457:            persistence::commands::titan_memory_doctor_heal,
src-tauri/src/main.rs:1458:            persistence::commands::titan_memory_doctor_compact,
src-tauri/src/main.rs:1459:            persistence::commands::titan_memory_doctor_export,
src-tauri/src/memory/mod.rs:4:// Encrypted persistent conversational memory with AES-256-GCM + Argon2id
src-tauri/src/services/db_service.rs:5:// Ring: 3 (Services — I/O, persistence)
src-tauri/src/memory/telemetry.rs:11:/// Resolve the base directory storing persisted memory JSON files.
src-tauri/src/memory/tests_storage.rs:90:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:119:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:123:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:137:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:160:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:204:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:224:        storage.save_conversation(&conv1)?;
src-tauri/src/memory/tests_storage.rs:225:        storage.save_conversation(&conv2)?;
src-tauri/src/memory/tests_storage.rs:226:        storage.save_conversation(&conv3)?;
src-tauri/src/memory/tests_storage.rs:241:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:245:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:265:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:300:        storage.save_conversation(&conv1)?;
src-tauri/src/memory/tests_storage.rs:301:        storage.save_conversation(&conv2)?;
src-tauri/src/memory/tests_storage.rs:335:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:343:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:372:            storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:399:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:419:        storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:443:            storage.save_conversation(&conv)?;
src-tauri/src/memory/tests_storage.rs:464:            storage.save_conversation(&conv)?;
src-tauri/src/memory/storage.rs:4:// Encrypted persistent storage for conversations
src-tauri/src/memory/storage.rs:7:// PLAN v25.x: Migrer vers unified_memory_v2::persistence
src-tauri/src/memory/storage.rs:58:    pub fn save_conversation(&self, conversation: &Conversation) -> MemoryResult<()> {
src-tauri/src/memory/storage.rs:287:            .save_conversation(&conv)
src-tauri/src/services/storage_service.rs:3://   JSON persistence with StorageGuard protection
src-tauri/src/services/storage_service.rs:6:#![allow(dead_code)] // Storage service - used by memory persistence
src-tauri/src/streaming.rs:101:    last_flush: std::time::Instant,
src-tauri/src/streaming.rs:102:    flush_interval: std::time::Duration,
src-tauri/src/streaming.rs:106:    pub fn new(threshold: usize, flush_interval_ms: u64) -> Self {
src-tauri/src/streaming.rs:110:            last_flush: std::time::Instant::now(),
src-tauri/src/streaming.rs:111:            flush_interval: std::time::Duration::from_millis(flush_interval_ms),
src-tauri/src/streaming.rs:115:    /// Push token and return chunk if buffer should flush
src-tauri/src/streaming.rs:120:        if self.buffer.len() >= self.threshold || self.last_flush.elapsed() > self.flush_interval {
src-tauri/src/streaming.rs:123:            self.last_flush = std::time::Instant::now();
src-tauri/src/streaming.rs:130:    /// Force flush remaining buffer
src-tauri/src/streaming.rs:131:    pub fn flush(&mut self) -> Option<String> {
src-tauri/src/streaming.rs:174:    flush_interval_ms: u64,
src-tauri/src/streaming.rs:177:    let mut buffer = StreamBuffer::new(buffer_threshold, flush_interval_ms);
src-tauri/src/streaming.rs:200:        if let Some(chunk) = buffer.flush() {
src-tauri/src/streaming.rs:316:    fn test_stream_buffer_flush() {
src-tauri/src/streaming.rs:320:        let chunk = buffer.flush();
src-tauri/src/streaming.rs:323:            chunk.expect("flush should return buffered content"),
src-tauri/src/streaming.rs:327:        // Empty after flush
src-tauri/src/streaming.rs:328:        assert!(buffer.flush().is_none());
src-tauri/src/devtools/telemetry.rs:34:        // - Batching: Buffer events in memory (Vec<TelemetryEvent>), flush every 100 events or 10s
src-tauri/src/conversation_engine/memory.rs:1:// PLAN v25.x: Migrer vers unified_memory_v2::persistence
src-tauri/src/conversation_engine/memory.rs:67:                        .save_conversation(&conversation)
src-tauri/src/conversation_engine/memory.rs:77:                    .save_conversation(&conversation)
src-tauri/src/conversation_engine/memory.rs:169:            .save_conversation(&conversation)
src-tauri/src/memory_os/memory_os_bridge.rs:208:        // - MTM→LTM promotion: Remove from MTM, persist to LTM SQLite with INSERT statement
src-tauri/src/memory_os/ltm.rs:379:    pub async fn flush(&self) -> Result<(), LTMError> {
src-tauri/src/memory_os/ltm.rs:413:    /// Sync to disk (alias for flush)
src-tauri/src/memory_os/ltm.rs:415:        self.flush().await
src-tauri/src/memory_os/ltm.rs:706:    async fn test_ltm_flush() {
src-tauri/src/memory_os/ltm.rs:713:        let result = ltm.flush().await;
src-tauri/src/engines/unified_memory/models.rs:54:    /// Long-term memories (persistent knowledge)
src-tauri/src/devtools/docs_engine.rs:53:    /// Mémoire et persistance
src-tauri/src/devtools/docs_engine.rs:191:            description: "Retourne l'intégralité de l'état persistant de TITANE, incluant tous les sous-modules (nexus, memory, harmonia, sentinel, cognition, timeline, autonomy, devops, metrics).".to_string(),
src-tauri/src/devtools/docs_engine.rs:192:            module: "persistence".to_string(),
src-tauri/src/devtools/docs_engine.rs:218:            module: "persistence".to_string(),
src-tauri/src/devtools/docs_engine.rs:260:            module: "persistence/memory_doctor".to_string(),
src-tauri/src/devtools/docs_engine.rs:288:            module: "persistence/memory_doctor".to_string(),
src-tauri/src/devtools/docs_engine.rs:307:            module: "persistence".to_string(),
src-tauri/src/devtools/docs_engine.rs:331:            module: "persistence/backup".to_string(),
src-tauri/src/devtools/docs_engine.rs:350:                "persistence".to_string(),
src-tauri/src/devtools/docs_engine.rs:362:            module: "persistence/backup".to_string(),
src-tauri/src/devtools/docs_engine.rs:381:            module: "persistence/backup".to_string(),
src-tauri/src/devtools/docs_engine.rs:588:                "persistence" => "Gestion de l'état et de la persistance",
src-tauri/src/devtools/docs_engine.rs:589:                "persistence/memory_doctor" => "Diagnostic et réparation de la mémoire",
src-tauri/src/devtools/docs_engine.rs:590:                "persistence/backup" => "Système de backup et restauration",
src-tauri/src/memory_evolution/memory_patterns.rs:240:                action: "ensure_persistence".to_string(),
src-tauri/src/memory_os/vector_hnsw.rs:245:/// HNSW Metadata for persistence
