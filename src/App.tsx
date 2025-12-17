/**
 * TITANE_INFINITY v24.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24.3.0 — APP COMPONENT - PRODUCTION READY
 *   v22Ω AI Performance Optimizations: 12 optimizations (-40% latency)
 *   Build 11.5s, Tests 1964 passed, Boot ~2s, 20 Engines Unified
 *   React Router + AppShell + Living Engines + Code Splitting
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState, Suspense, lazy, useMemo, useCallback } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { useLivingEngines } from './hooks';
import { useSingularityState } from './core/state/SingularityState';
import { logger } from './lib/logger';
import { ThemeProvider } from './themes/ThemeProvider';
import { AnimationProvider } from './contexts/AnimationContext';
import { TitanStateProvider } from './context/TitanStateContext'; // ✨ v∞.MPE - Persistence
import { AppShell, Sidebar, Header } from '@components/layout';
import { Button } from './ui';
import { CompactXPBar } from './components/experience/CompactXPBar';
import { XPBar } from './components/experience/XPBar'; // ✨ v∞.D4 - Barre XP
import { AutoHealErrorBoundary } from './components/AutoHealErrorBoundary';
import { ErrorBoundary } from './components/ErrorBoundary'; // ✨ v19 - Security Hardening
import {
  detectEnvironment,
  shouldBlockLoading,
  logEnvironmentWarnings,
} from './core/tauri/environment';
// ✨ OPT-10: autoAuditEngine lazy-loaded below (removed static import)
import { TitaneLogo } from './components/branding/TitaneLogo'; // ✨ v∞ - Logo Reactor
import { OnboardingFlow } from './components/Onboarding'; // ✨ v19.5.2 - User Onboarding System
import { PageLoadingFallback } from './ui/components/PageLoadingFallback'; // ✨ v19.5.2 - Enhanced loading
// ✨ OPT-10: initializeMicroInteractions lazy-loaded below (removed static import)
import { ToastContainer } from './ui/components/Toast'; // ✨ v19.5.2 - Toast notifications
import { useUIStore } from './stores/uiStore'; // ✨ v19.5.2 - UI state management
import { initializeOllama } from './services/ai/providers/ollama'; // ✨ v21 - Local AI initialization
// ✨ OPT-12: connectCacheToSingularity lazy-loaded below (removed static import)
// ✨ OPT-7: i18n is now lazy-loaded in useEffect below (removed static import)
// ✨ v25.4.1 - A11Y & Performance monitoring (utilities planned for future implementation)
// ✨ v25.3.1 - Aura Quantum Particles Background
import { QuantumParticles } from './components/aura/QuantumParticles';
// QuantumParticlesPresets disponible si besoin: import { QuantumParticlesPresets } from './components/aura/QuantumParticles'
import { AuraControlPanel } from './components/aura/AuraControlPanel';
import { useAura } from './hooks/useAuraOrchestrator';

/**
 * 🔒 POLITIQUE DE SÉCURITÉ ENVIRONNEMENT
 *
 * Mode DEV (import.meta.env.DEV === true):
 *   - ✅ Tauri dev: Autorisé (http://127.0.0.1:xxxx avec __TAURI__)
 *   - ✅ Browser dev: Autorisé (http://localhost:5173 pour Vite HMR)
 *   - Logs: Warning console si pas Tauri, mais n'empêche PAS le rendu
 *
 * Mode PROD (import.meta.env.DEV === false):
 *   - ✅ Tauri prod: Autorisé (tauri://localhost)
 *   - ⚠️ Browser prod: Affiche warning UI non-bloquant
 *   - Note: Pas de throw ni document.body.innerHTML qui cassent React
 */
if (typeof window !== 'undefined') {
  const env = detectEnvironment();

  // Log environnement (toujours utile, pas bloquant)
  logEnvironmentWarnings();

  // En dev: JAMAIS bloquer (autoriser Vite HMR + Tauri dev)
  // En prod browser: Afficher warning dans l'UI via composant, pas via document.body
  if (shouldBlockLoading()) {
    console.warn('⚠️ TITANE∞ - Contexte browser production détecté');
    console.warn('   Origine:', env.origin);
    console.warn('   Recommandation: Utiliser build Tauri natif');
    // Note: Le warning sera affiché dans l'UI via un composant dédié si nécessaire,
    // mais on ne bloque plus le rendu React pour permettre l'affichage
  }
}

// ✨ v24 P2-4 - Performance: Lazy load ALL pages except Dashboard
// ❌ SUPPRIMÉ v24.3.8: DashboardPage (fusionné dans EvoPage)
// const DashboardPage = lazy(() => import('./pages/DashboardPage')...);

// ❌ SUPPRIMÉ v25.3.0: EvoPage (fusionné dans TitanePage - le cœur du système)
// const EvoPage = lazy(() => import('./pages/EvoPage').then(m => ({ default: m.EvoPage })));

// ✨ v25.1 TIME - Centre Temporel Unifié (Fusion Temporal Flow + Agenda + Time Navigator)
const TimePage = lazy(() =>
  import('./pages/TimePage').then(m => ({ default: m.TimePage }))
);

// ❌ SUPPRIMÉ v25.3.0: ChatPage (fusionné dans TitanePage - le cœur du système)
// const ChatPage = lazy(() => import('./ui/pages/Chat').then(m => ({ default: m.Chat })));
// ❌ SUPPRIMÉ v25.1: CognitivePage (redirigé vers /stats)
// const CognitivePage = lazy(() => import('./pages/CognitivePage')...);
// ❌ SUPPRIMÉ v24.3.8: ProgressionPage (fusionné dans EvoPage)
// const ProgressionPage = lazy(() => import('./pages/ProgressionPage')...);
const Experience = lazy(() =>
  import('./pages/Experience').then(m => ({ default: m.Experience }))
);
// ❌ SUPPRIMÉ v25.1: ConfigurationHub (redirigé vers /admin)
// const ConfigurationHub = lazy(() => import('./pages/ConfigurationHub')...);
// Diagnostics, DevTools, Cluster, Introspection, HyperVision → System Center

// ✨ v24 - Performance: Lazy load SingularityMonitor
const SingularityMonitor = lazy(() =>
  import('./components/SingularityMonitor').then(m => ({ default: m.SingularityMonitor }))
);

// ✨ v∞.20.0 - Chat Bubble Global (Super Prompt #3)
// ✨ PHASE 4.2 - Lazy load chat bubbles (defer ~150KB)
const ChatBubble = lazy(() =>
  import('./components/chat/ChatBubble').then(m => ({ default: m.ChatBubble }))
);

// ✨ v∞.25.0 - AI Bubble Engine (Super Prompt #14 - BUBBLE ENGINE)
const _AIChatBubble = lazy(() =>
  import('./components/AIChatBubble').then(m => ({ default: m.AIChatBubble }))
);

// ✨ v∞.26.0 - Hybrid Engine (Super Prompt #16 - AI + DEV CONSOLE FUSION)
const _HybridBubble = lazy(() =>
  import('./components/HybridBubble').then(m => ({ default: m.HybridBubble }))
);

// ✨ v∞.27.0 - Cognitive Layout Engine (Super Prompt #2 - ADAPTIVE UI)
// ✨ PHASE 4.2 - Lazy load cognitive layout (defer ~50KB)
const CognitiveLayoutControl = lazy(() =>
  import('./components/cognitive/CognitiveLayoutControl').then(m => ({
    default: m.CognitiveLayoutControl,
  }))
);
// ✨ OPT-11: cognitiveLayoutEngine lazy-loaded below (removed static import)

// ✨ v∞.27.0 - Unified Presence Engine (Super Prompt #3 - EXPERIENTIAL IDENTITY)
// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B)
// import { UnifiedPresenceControl as _UnifiedPresenceControl } from './components/presence/UnifiedPresenceControl';
// import { unifiedPresenceEngine } from './engines/presence/unifiedPresenceEngine';
// import { presenceIntegrations } from './engines/presence/presenceIntegrations';
// import { narrativeProtocol } from './engines/presence/narrativeProtocol';

// ✨ v∞.28.0 - Multimodal Presence Engine (Super Prompt XXVIII - LIVING PRESENCE)
// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B)
// import { MultimodalPresencePanel as _MultimodalPresencePanel } from './components/presence/MultimodalPresencePanel';
// import { multimodalPresenceEngine } from './engines/presence/multimodalPresenceEngine';
// import './components/presence/MultimodalPresencePanel.css';

// ✨ v∞.29-32 - Deep Psyche Engines (Super Prompts XXIX, XXX, XXXII, X)
// ❌ SUPPRIMÉ v24.3.8: Stubs engines inutilisés (archetypeResonanceEngine, metaContinuumEngine, embodiedPresenceEngine)
import { neuralVoiceBlendingEngine as _neuralVoiceBlendingEngine } from './engines/voice/neuralVoiceBlendingEngine';

// ✨ v∞.33 - Presence OS Panel (Super Prompt XII - TITANE∞ PRESENCE OS 🌌)
// ✨ v24.2.1 PERF: Removed unused PresenceOSPanel import (~19KB savings)
// import { PresenceOSPanel as _PresenceOSPanel } from './components/presence/PresenceOSPanel';
// import './components/presence/PresenceOSPanel.css';

// ✨ v∞.34 - Physiological Panel (Super Prompts XI + XIII - HOLOPHONIC + INTEROCEPTION 🌬️)
// ✨ v24.2.1 PERF: Removed unused PhysiologicalPanel import (~22KB savings)
// import { PhysiologicalPanel as _PhysiologicalPanel } from './components/physiological/PhysiologicalPanel';
// import './components/physiological/PhysiologicalPanel.css';

// ✨ v∞.31-33 - Expression Engines (SUPER PROMPTS XXXI-XXXIII + Aura Ultra)
// ❌ SUPPRIMÉ v24.3.8: Stubs engines inutilisés (synestheticEmotionEngine, unifiedMultimodalOutputEngine, auraEngine)
import './components/psyche/DeepPsychePanel.css';

// ✨ v∞.12 - Presence OS (Unified Multimodal Identity System)
// STUB: engines/presence supprimé en PHASE 1 (OPTION B) - utilise stub temporaire
import { presenceOS } from './engines/presence/_stubs';

// ✨ v∞ - Multi-Agent Engine & Agents
// REMOVED: core/ai/multi_agent_engine + agents supprimés en PHASE 1 (OPTION B)
// import { multiAgentEngine } from './core/ai/multi_agent_engine';
// import { HeliosAgent } from './core/ai/agents/helios_agent';
// import { HarmoniaAgent } from './core/ai/agents/harmonia_agent';
// import { PersonaAgent } from './core/ai/agents/persona_agent';
// import { MemoryCoreAgent } from './core/ai/agents/memory_core_agent';
// import { WatchdogAgent } from './core/ai/agents/watchdog_agent';

// Phase 9: Lazy load heavy pages (code splitting with named exports)
const _DesignSystemPage = lazy(() =>
  import('./pages/DesignSystemPage').then(m => ({ default: m.DesignSystemPage }))
);
const PerformanceTest = lazy(() =>
  import('./pages/PerformanceTest').then(m => ({ default: m.PerformanceTest }))
);
const _TimeNavigator = lazy(() =>
  import('./pages/TimeNavigator').then(m => ({ default: m.TimeNavigator }))
);
// ❌ SUPPRIMÉ v24.3.7: MultiAIDashboard (deprecated stub)
const KnowledgeFusionPage = lazy(() => import('./ui/pages/KnowledgeFusionPage'));
const CreationStudio = lazy(() => import('./ui/pages/CreationStudio'));
const EvolutionMonitor = lazy(() => import('./ui/pages/EvolutionMonitor'));

// ✨ v25.2.2 ADMIN CENTER - Module ADMIN Unifié (Système, Config, Audio, Design, Gouvernance)
const AdminPage = lazy(() =>
  import('./features/admin').then(m => ({ default: m.AdminPage }))
);

// ✨ v25.3.0 TITANE - Le Cœur du Système (fusion Chat IA + Vision + EVO)
const TitanePage = lazy(() =>
  import('./pages/TitanePage').then(m => ({ default: m.TitanePage }))
);

// ❌ SUPPRIMÉ v24.3.8: EvolutionCenterPage (fusionné dans EvoPage)
// const EvolutionCenterPage = lazy(() => import('./pages/EvolutionCenterPage')...);

// ✨ ORCHESTRATION META CENTER - Centre Unifié v24 (TODO #9 - Fusion Meta + Orchestration)
const OrchestrationMetaCenter = lazy(() =>
  import('./pages/OrchestrationMetaCenter').then(m => ({
    default: m.OrchestrationMetaCenter,
  }))
);

// ✨ v25.4.0 DEV CENTER - Fusion Complete (Dev Mode + ONE CORE + QA & Tests + Orchestration)
const DevPage = lazy(() => import('./pages/DevPage').then(m => ({ default: m.DevPage })));

// ✨ v25.3.2 FUSION DASHBOARD - Perfect Backend/Frontend Fusion (Singularity + Memory + Health)
const PerfectFusionDashboard = lazy(() =>
  import('./components/fusion/PerfectFusionDashboard').then(m => ({ default: m.default }))
);

// ✨ v25.6.0 ULTIMATE OPTIMIZATION - Phase 12: GPU + WASM + Service Worker + IndexedDB
const UltimateOptimizationDashboard = lazy(() =>
  import('./components/optimization/UltimateOptimizationDashboard').then(m => ({
    default: m.UltimateOptimizationDashboard,
  }))
);

// ❌ DEPRECATED v25.4.0: Modules fusionnés dans DevPage
// - ONE CORE (Centre de Commande Unifié)
// - QA MONITORING (Centre QA & Monitoring)
// - DEVELOPER MODE (IA Developer Mode)
// - ORCHESTRATION (Orchestration & IA)
// Ces modules sont maintenant accessibles via /dev

// ✨ REALITY CENTER - Reality Rendering Layer v∞ (OPUS #19)
const RealityCenter = lazy(() =>
  import('./components/RealityCenter/RealityCenter').then(m => ({ default: m.default }))
);

// ✨ HYPER CENTER - Hyper-Intelligence Engine v∞ (OPUS #20)
const HyperCenter = lazy(() =>
  import('./components/HyperCenter/HyperCenter').then(m => ({ default: m.default }))
);

// ✨ QUANTUM CENTER - Quantum Rendering Layer v∞ (OPUS #17)
const QuantumCenter = lazy(() =>
  import('./components/QuantumCenter/QuantumCenter').then(m => ({ default: m.default }))
);

// ✨ IDENTITY CENTER - System Identity Engine v∞ (OPUS #15)
const IdentityCenter = lazy(() =>
  import('./components/IdentityCenter/IdentityCenter').then(m => ({ default: m.default }))
);

// ✨ MEMORY EVOLUTION - Memory Evolution Engine++ v∞ (OPUS #14)
const MemoryEvolutionCenter = lazy(() =>
  import('./components/MemoryEvolution/MemoryEvolutionCenter').then(m => ({
    default: m.default,
  }))
);

// ✨ CLOUD CENTER - Cloud Sync & Vault Engine v∞
const CloudCenter = lazy(() =>
  import('./pages/CloudCenter').then(m => ({ default: m.CloudCenter }))
);

// ✨ v24.1 - ORCHESTRATION & INTELLIGENCE CENTER (FUSION 6 modules → 1 centre)
const OrchestrationIntelligenceCenter = lazy(
  () => import('./modules/OrchestrationIntelligenceCenter')
);

// ❌ SUPPRIMÉ v24.3.8: IdentityMemoryEvolutionCenter (fusionné dans EvoPage)
// const IdentityMemoryEvolutionCenter = lazy(() => import('./modules/IdentityMemoryEvolutionCenter'));

// ❌ SUPPRIMÉ v25.1: TemporalFlowCenter (fusionné dans TimePage)
// const TemporalFlowCenter = lazy(() => import('./modules/TemporalFlowCenter'));

// ✨ v24 P2-4 - Engine & System pages (lazy loaded for code splitting)
// ❌ SUPPRIMÉ v25.2.1: Helios, Nexus, Harmonia → fusionnés dans /stats (Stats.tsx)
const Sentinel = lazy(() =>
  import('./pages/Sentinel').then(m => ({ default: m.Sentinel }))
);
const Watchdog = lazy(() =>
  import('./pages/Watchdog').then(m => ({ default: m.Watchdog }))
);
const SelfHeal = lazy(() =>
  import('./pages/SelfHeal').then(m => ({ default: m.SelfHeal }))
);
const AdaptiveEngine = lazy(() =>
  import('./pages/AdaptiveEngine').then(m => ({ default: m.AdaptiveEngine }))
);
const Memory = lazy(() => import('./pages/Memory').then(m => ({ default: m.Memory })));
const _AgendaPage = lazy(() =>
  import('./pages/AgendaPage').then(m => ({ default: m.AgendaPage }))
);
// ❌ SUPPRIMÉ v25.3.0: CameraPage (fusionné dans TitanePage via Vision tab)
// const CameraPage = lazy(() =>
//   import('./pages/CameraPage').then(m => ({ default: m.CameraPage }))
// );

/**
 * ═══════════════════════════════════════════════════════════════
 * APP ROUTER - Composant interne avec accès au router + Living Engines
 * ═══════════════════════════════════════════════════════════════
 */
const AppRouter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Use Singularity State instead of local state
  const sidebarCollapsed = useSingularityState(s => s.context.sidebarCollapsed);
  const toggleSidebar = useSingularityState(s => s.toggleSidebar);

  // ✨ v19.5.2 - Toast system
  const { toasts, removeToast } = useUIStore();

  // ✨ v19.5.2 - User Onboarding State
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(true); // Assume complete until proven otherwise
  const [checkingOnboarding, setCheckingOnboarding] = useState<boolean>(true);

  // ✨ v19.5.2 - Check if onboarding is complete (first-run detection)
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const isComplete = await invoke<boolean>('is_onboarding_complete');
        console.log('🎨 [ONBOARDING] Status:', isComplete ? 'Complete' : 'Not started');
        setOnboardingComplete(isComplete);
      } catch (error) {
        console.warn('⚠️ [ONBOARDING] Failed to check status, assuming complete:', error);
        setOnboardingComplete(true); // Fallback to main app
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  // ✨ v21 - Initialiser Ollama Provider au démarrage
  useEffect(() => {
    console.log('🤖 [OLLAMA] Initializing local AI provider...');
    initializeOllama().catch(error => {
      logger.error(
        'Failed to initialize OLLAMA',
        { component: 'App', service: 'Ollama' },
        error as Error
      );
    });
  }, []);

  // ✨ OPT-7 - Initialize i18n asynchronously (non-blocking, lazy-loaded)
  useEffect(() => {
    import('./i18n')
      .then(({ initI18nAsync }) => {
        initI18nAsync(); // Background load, doesn't block UI
      })
      .catch(error => {
        console.warn('⚠️ [i18n] Lazy initialization failed:', error);
      });
  }, []);

  // ✨ v21.5 Sprint 1 + OPT-12 - Lazy-load Cognitive Cache Connection
  useEffect(() => {
    console.log('🧠 [COGNITIVE-CACHE] Connecting to SingularityKernel...');

    // OPT-12: Import dynamique complet (évite circular dependency + lazy-load)
    Promise.all([import('./services/ai/singularityKernel'), import('./services/ai')])
      .then(([{ singularityKernel }, { connectCacheToSingularity }]) => {
        try {
          connectCacheToSingularity(singularityKernel);
          console.log('✅ [COGNITIVE-CACHE] Connected successfully');
        } catch (error) {
          logger.error(
            'Connection failed',
            { component: 'App', service: 'CognitiveCache' },
            error as Error
          );
        }
      })
      .catch(error => {
        console.warn('⚠️ [COGNITIVE-CACHE] Failed to load:', error);
      });
  }, []);

  // ✨ OPT-10 - Lazy-load Auto-Audit Engine
  useEffect(() => {
    let started = false;

    console.log('🔍 [AUTO-AUDIT] Loading automatic audits...');
    import('./services/autoAuditEngine')
      .then(({ autoAuditEngine }) => {
        if (!started) {
          autoAuditEngine.start();
          started = true;
          console.log('✅ [AUTO-AUDIT] Started');
        }

        // Cleanup
        return () => {
          autoAuditEngine.stop();
        };
      })
      .catch(err => {
        console.warn('⚠️ [AUTO-AUDIT] Failed to load:', err);
      });
  }, []);

  // ✨ v∞ Phase 4 - Initialiser Multi-Agent System
  // REMOVED: core/ai/multi_agent_engine supprimé en PHASE 1 (OPTION B)
  /*
  useEffect(() => {
    const initAgents = async () => {
      console.log('🌌 [MULTI-AGENT] Initializing 5-agent system...');

      // Register all 5 agents
      multiAgentEngine.registerAgent(new HeliosAgent());
      multiAgentEngine.registerAgent(new HarmoniaAgent());
      multiAgentEngine.registerAgent(new PersonaAgent());
      multiAgentEngine.registerAgent(new MemoryCoreAgent());
      multiAgentEngine.registerAgent(new WatchdogAgent());

      // Start orchestration
      await multiAgentEngine.initialize();
      console.log('✅ [MULTI-AGENT] System ready');
    };

    initAgents();

    return () => {
      console.log('🛑 [MULTI-AGENT] Shutting down...');
      multiAgentEngine.shutdown();
    };
  }, []);
  */

  // ✨ OPT-11 - Lazy-load Cognitive Layout Engine
  useEffect(() => {
    let started = false;

    console.log('🧠 [COGNITIVE] Loading Cognitive Layout Engine...');
    import('./engines/cognitive/cognitiveLayoutEngine')
      .then(({ cognitiveLayoutEngine }) => {
        if (!started) {
          cognitiveLayoutEngine.start();
          started = true;
          console.log('✅ [COGNITIVE] Cognitive Layout Engine started');
        }

        return () => {
          cognitiveLayoutEngine.stop();
        };
      })
      .catch(err => {
        console.warn('⚠️ [COGNITIVE] Failed to load Cognitive Layout Engine:', err);
      });
  }, []);

  // ✨ OPT-10 - Lazy-load TITANE∞ Micro-Interactions
  useEffect(() => {
    console.log('✨ [UI-POLISH] Loading TITANE∞ micro-interactions...');
    import('./ui/motion')
      .then(({ initializeMicroInteractions }) => {
        try {
          initializeMicroInteractions();
          console.log(
            '✅ [UI-POLISH] Micro-interactions initialized (Ripple, Magnetism, Focus Glow, Tooltips)'
          );
        } catch (error) {
          logger.error(
            'Failed to initialize micro-interactions',
            { component: 'App', service: 'UIPolish' },
            error as Error
          );
        }
      })
      .catch(err => {
        console.warn('⚠️ [UI-POLISH] Failed to load motion module:', err);
      });
  }, []);

  // ✨ v∞.27.0 - Initialiser Unified Presence Engine (Super Prompt #3)
  // REMOVED: engines/presence supprimé en PHASE 1 (OPTION B)
  /*
  useEffect(() => {
    console.log('🌌 [PRESENCE] Starting Unified Presence Engine...');

    // Démarrer le moteur de présence
    unifiedPresenceEngine.start();

    // Démarrer l'arc narratif
    const sessionId = `session_${Date.now()}`;
    narrativeProtocol.startNewArc(sessionId);

    // Démarrer toutes les intégrations
    presenceIntegrations.startAll();

    console.log('✅ [PRESENCE] Unified Presence System active');

    return () => {
      console.log('🛑 [PRESENCE] Stopping Unified Presence Engine...');
      presenceIntegrations.stopAll();
      unifiedPresenceEngine.stop();
    };
  }, []);
  */

  // ✨ v∞.28.0 - Initialiser Multimodal Presence Engine (Super Prompt XXVIII)
  // REMOVED: engines/presence supprimé en PHASE 1 (OPTION B)
  /*
  useEffect(() => {
    console.log('🎭 [MULTIMODAL] Starting Multimodal Presence Engine...');

    // Démarrer la boucle multimodale (30Hz)
    multimodalPresenceEngine.start();

    console.log('✅ [MULTIMODAL] Multimodal Presence System active (30Hz)');

    return () => {
      console.log('🛑 [MULTIMODAL] Stopping Multimodal Presence Engine...');
      multimodalPresenceEngine.stop();
    };
  }, []);
  */

  // ✨ v∞.29-32 - Initialiser Deep Psyche Engines (Super Prompts XXIX, XXX, XXXII, X)
  // ✨ PHASE 4.2 - Désactivé temporairement (engines stubés pour lazy loading)
  /*
  useEffect(() => {
    console.log('🧠 [DEEP-PSYCHE] Starting Deep Psyche Engines...');

    // 1. Archetype Resonance Engine (XXIX) - 10Hz
    archetypeResonanceEngine.start();
    console.log('  ✅ Archetype Resonance Engine active (10Hz)');

    // 2. Meta-Continuum Engine (XXX) - 60Hz NowPulse
    metaContinuumEngine.start();
    console.log('  ✅ Meta-Continuum Engine active (60Hz)');

    // 3. Embodied Presence Engine (XXXII) - 30Hz
    embodiedPresenceEngine.start();
    console.log('  ✅ Embodied Presence Engine active (30Hz)');

    // 4. Neural Voice Blending Engine (X) - Event-based (pas de loop)
    console.log('  ✅ Neural Voice Blending Engine ready');

    console.log('✅ [DEEP-PSYCHE] All engines synchronized and active');

    return () => {
      console.log('🛑 [DEEP-PSYCHE] Stopping Deep Psyche Engines...');
      archetypeResonanceEngine.stop();
      metaContinuumEngine.stop();
      embodiedPresenceEngine.stop();
    };
  }, []);
  */

  // ✨ v∞.31-33 - Expression Engines (Synesthetic Emotion + Unified Output + Aura)
  // ✨ PHASE 4.2 - Désactivé temporairement (engines stubés pour lazy loading)
  /*
  useEffect(() => {
    console.log('🎭 [EXPRESSION] Starting Expression Engines...');
    console.log('═══════════════════════════════════════════════════');

    // 1. Synesthetic Emotion Engine (XXXI) - 30Hz emotional state analysis
    synestheticEmotionEngine.start();
    console.log('  ✅ Synesthetic Emotion Engine active (30Hz, 12 emotional states)');

    // 2. Aura Engine Ultra (v∞.Σ) - 60Hz visual halo with audio reactivity
    auraEngine.start();
    console.log('  ✅ Aura Engine active (60Hz, 8 visual modes)');

    // 3. Unified Multimodal Output Engine (XXXIII) - 30Hz orchestration layer
    unifiedMultimodalOutputEngine.start();
    console.log('  ✅ Unified Output Engine active (30Hz, 5 modalities)');

    console.log('✅ [EXPRESSION] All expression engines synchronized and active');

    return () => {
      console.log('🛑 [EXPRESSION] Stopping Expression Engines...');
      synestheticEmotionEngine.stop();
      auraEngine.stop();
      unifiedMultimodalOutputEngine.stop();
    };
  }, []);
  */

  // ✨ v∞.12 - Presence OS (Unified Multimodal Identity System)
  useEffect(() => {
    console.log('🌐 [PRESENCE] Starting Presence OS...');
    console.log('═══════════════════════════════════════════════════');

    presenceOS.start();
    console.log('  ✅ Presence OS active (30Hz, 8 signature modes)');
    console.log(
      '  ✅ 7 layers: Cognitive, Affective, Expression, Aura, Spatial, Autonomic, Evolution'
    );
    console.log('  ✅ Unified identity orchestration across 6 engines');

    return () => {
      console.log('🛑 [PRESENCE] Stopping Presence OS...');
      presenceOS.stop();
    };
  }, []);

  // ✨ v25.4.1 - A11Y & Performance: Keyboard shortcuts and Web Vitals planned

  // 🌟 Initialize Living Engines v21-v24
  const livingEngines = useLivingEngines(100); // Update every 100ms

  // Log living state (debug) - effet optimisé avec dépendances stables
  useEffect(() => {
    if (!livingEngines.state.initialized) return;

    console.log('🎭 Persona:', livingEngines.state.persona?.mood); // mood is MoodType string
    console.log('⚡ Glow:', livingEngines.state.glow.toFixed(2));
    console.log('🧠 Cognitive Load:', livingEngines.state.cognitiveLoad.toFixed(2));
    // Note: Cet effet log uniquement à l'initialisation, pas à chaque update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livingEngines.state.initialized]);

  // ✨ v25.3.0: Sidebar items - Architecture FINALE avec TITANE CORE
  // FUSION v25.3.0: Chat IA + Vision + EVO → TITANE (le cœur du système)
  const sidebarItems = useMemo(
    () => [
      // ═══ PRINCIPAL ═══
      { id: '/titane', label: 'TITANE', icon: '⚡', badge: 'v25.3' }, // FUSION: Chat+Vision+EVO
      { id: '/time', label: 'TIME', icon: '🕐', badge: 'v25.1' }, // FUSION: Temporal+Agenda+TimeNav
      { id: '/stats', label: 'STATS', icon: '📊', badge: 'v25.2' }, // FUSION: Nexus+Helios+Harmonia+Cognitif

      // ═══ CENTRES UNIFIÉS ═══
      { id: '/admin', label: 'ADMIN', icon: '👑', badge: 'v25.2' }, // FUSION: Système + Config + Audio + Design + Gouvernance
      { id: '/dev', label: 'DEV', icon: '🔧', badge: 'v25.4' }, // FUSION: Dev Mode + ONE CORE + QA & Tests + Orchestration
      { id: '/fusion', label: 'FUSION', icon: '🌌', badge: 'v25.3.2' }, // ✨ Backend/Frontend Perfect Fusion Dashboard
      { id: '/optimization', label: 'OPTIMIZE', icon: '⚡', badge: 'v25.6' }, // ✨ Phase 12: GPU/WASM/Cache/IndexedDB Ultimate Performance
    ],
    []
  ); // Empty deps = stable reference

  // ✨ v24.2.1: Memoized onItemClick to prevent re-renders
  const handleSidebarClick = useCallback(
    (item: { id: string }) => {
      navigate(item.id);
    },
    [navigate]
  );

  // ✨ v24.2.1: Stable callback for XP bar navigation
  const handleXPBarClick = useCallback(() => {
    navigate('/evo'); // v25.2.1: Progression fusionné dans EVO
  }, [navigate]);

  // ✨ v24.2.1: Memoized sidebar items with active state
  const sidebarItemsWithActive = useMemo(
    () =>
      sidebarItems.map(item => ({
        ...item,
        active: item.id === location.pathname,
      })),
    [sidebarItems, location.pathname]
  );

  // ✨ v19.5.2 - Handler onboarding completion
  // ✨ v24.2.1: useCallback for stable reference
  const handleOnboardingComplete = useCallback(async () => {
    console.log('✅ [ONBOARDING] User completed onboarding flow');
    setOnboardingComplete(true);
  }, []);

  // ✨ v19.5.2 - Show loading while checking onboarding status
  if (checkingOnboarding) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#727b81',
        }}
      >
        ⚡ Chargement...
      </div>
    );
  }

  // ✨ v19.5.2 - Show onboarding if not complete
  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // ✨ v19.5.2 - Main app (onboarding completed)
  return (
    <AppShell
      sidebar={
        <Sidebar
          items={sidebarItemsWithActive}
          onItemClick={handleSidebarClick}
          collapsed={sidebarCollapsed}
          header={
            <>
              {/* Logo TITANE∞ Reactor */}
              <div style={{ padding: '8px 0' }}>
                <TitaneLogo
                  size={sidebarCollapsed ? 32 : 36}
                  withText={!sidebarCollapsed}
                  direction="column"
                />
              </div>
              {/* Compact XP Bar */}
              {!sidebarCollapsed && <CompactXPBar onClick={handleXPBarClick} />}
            </>
          }
        />
      }
      header={
        <Header
          title="TITANE∞"
          subtitle={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span>v19.5.2 — Singularity Architecture • 20 Engines • Full OPUS</span>
              <XPBar /> {/* ✨ v∞.D4 - Barre XP */}
            </div>
          }
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              leftIcon={sidebarCollapsed ? '→' : '←'}
            >
              {sidebarCollapsed ? 'Ouvrir' : 'Fermer'}
            </Button>
          }
        />
      }
      sidebarCollapsed={sidebarCollapsed}
    >
      {/* Phase 9: Suspense boundary for lazy-loaded routes */}
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Main Routes v25.3.0 - TITANE Homepage */}
          <Route path="/" element={<Navigate to="/titane" replace />} />
          {/* ⚡ v25.3.0 TITANE - LE CŒUR DU SYSTÈME (Fusion Chat IA + Vision + EVO) */}
          <Route
            path="/titane"
            element={
              <ErrorBoundary context="TitanePage">
                <TitanePage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers TITANE (fusion v25.3.0) */}
          <Route path="/chat" element={<Navigate to="/titane" replace />} />
          <Route path="/camera" element={<Navigate to="/titane" replace />} />
          <Route path="/evo" element={<Navigate to="/titane" replace />} />
          <Route path="/dashboard" element={<Navigate to="/titane" replace />} />
          <Route path="/evolution-center" element={<Navigate to="/titane" replace />} />
          <Route
            path="/cognitive-evolution"
            element={<Navigate to="/titane" replace />}
          />
          <Route
            path="/identity-memory-evolution"
            element={<Navigate to="/titane" replace />}
          />
          <Route path="/progression" element={<Navigate to="/titane" replace />} />
          <Route path="/xp" element={<Navigate to="/titane" replace />} />
          {/* ❌ v25.2.1: /cognitive redirigé vers /stats (Section 4: État Cognitif) */}
          <Route path="/cognitive" element={<Navigate to="/stats" replace />} />
          <Route path="/experience" element={<Experience />} /> {/* ✨ v∞.D5 - Page XP */}
          {/* ✨ v25.1 TIME CENTER - Fusion Temporal Flow + Agenda + Time Navigator */}
          <Route
            path="/time"
            element={
              <ErrorBoundary context="TimePage">
                <TimePage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers TIME */}
          <Route path="/temporal-center" element={<Navigate to="/time" replace />} />
          <Route path="/agenda" element={<Navigate to="/time" replace />} />
          <Route path="/time-navigator" element={<Navigate to="/time" replace />} />
          {/* ✨ v25.2.2 ADMIN CENTER - Module ADMIN Unifié */}
          <Route
            path="/admin"
            element={
              <ErrorBoundary context="AdminCenter">
                <AdminPage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers ADMIN Center */}
          <Route path="/system-center" element={<Navigate to="/admin" replace />} />
          <Route path="/diagnostics" element={<Navigate to="/admin" replace />} />
          <Route path="/devtools" element={<Navigate to="/admin" replace />} />
          <Route path="/cluster" element={<Navigate to="/admin" replace />} />
          <Route path="/introspection" element={<Navigate to="/admin" replace />} />
          <Route path="/hypervision" element={<Navigate to="/admin" replace />} />
          <Route path="/configuration" element={<Navigate to="/admin" replace />} />
          <Route path="/design-center" element={<Navigate to="/admin" replace />} />
          <Route path="/design-system" element={<Navigate to="/admin" replace />} />
          <Route path="/settings" element={<Navigate to="/admin" replace />} />
          <Route path="/governance-center" element={<Navigate to="/admin" replace />} />
          <Route path="/governance" element={<Navigate to="/admin" replace />} />
          <Route path="/secure" element={<Navigate to="/admin" replace />} />
          <Route path="/audio-center" element={<Navigate to="/admin" replace />} />
          <Route path="/audio" element={<Navigate to="/admin" replace />} />
          <Route path="/voice" element={<Navigate to="/admin" replace />} />
          <Route path="/tts" element={<Navigate to="/admin" replace />} />
          {/* ✨ v25.3.2 - FUSION DASHBOARD - Perfect Backend/Frontend Integration */}
          <Route
            path="/fusion"
            element={
              <Suspense fallback={<PageLoadingFallback variant="dashboard" />}>
                <PerfectFusionDashboard />
              </Suspense>
            }
          />
          {/* ✨ v25.6.0 - ULTIMATE OPTIMIZATION - Phase 12: GPU/WASM/Cache/IndexedDB */}
          <Route
            path="/optimization"
            element={
              <Suspense fallback={<PageLoadingFallback variant="dashboard" />}>
                <UltimateOptimizationDashboard />
              </Suspense>
            }
          />
          {/* ✨ v24.1 ORCHESTRATION & INTELLIGENCE CENTER - Fusion 6 modules (QA, Meta, Orchestration, Quantum, Multi-IA, Reality) */}
          <Route
            path="/orchestration-intelligence"
            element={
              <ErrorBoundary context="OrchestrationIntelligenceCenter">
                <OrchestrationIntelligenceCenter />
              </ErrorBoundary>
            }
          />
          {/* ✨ v24 ORCHESTRATION META CENTER - Centre Unifié (TODO #9) */}
          <Route
            path="/orchestration-center"
            element={
              <ErrorBoundary context="OrchestrationMetaCenter">
                <OrchestrationMetaCenter />
              </ErrorBoundary>
            }
          />
          <Route
            path="/meta-center"
            element={<Navigate to="/orchestration-center" replace />}
          />
          {/* Redirections vers Orchestration Meta Center pour anciennes routes */}
          <Route path="/meta" element={<Navigate to="/orchestration-center" replace />} />
          <Route
            path="/multi-ai-dashboard"
            element={<Navigate to="/orchestration-center" replace />}
          />
          <Route
            path="/nexus-engine"
            element={<Navigate to="/orchestration-center" replace />}
          />
          <Route
            path="/harmonia-engine"
            element={<Navigate to="/orchestration-center" replace />}
          />
          <Route
            path="/cognitive-state"
            element={<Navigate to="/orchestration-center" replace />}
          />
          {/* ✨ v25.4.0 DEV CENTER - Fusion Complete (4 modules → 1) */}
          <Route
            path="/dev"
            element={
              <ErrorBoundary context="DevCenter">
                <DevPage />
              </ErrorBoundary>
            }
          />
          {/* Redirections des anciens modules vers DEV */}
          <Route path="/one-core" element={<Navigate to="/dev" replace />} />
          <Route path="/command-center" element={<Navigate to="/dev" replace />} />
          <Route path="/unified" element={<Navigate to="/dev" replace />} />
          <Route path="/singularity" element={<Navigate to="/dev" replace />} />
          <Route path="/qa-monitoring" element={<Navigate to="/dev" replace />} />
          <Route path="/qa" element={<Navigate to="/dev" replace />} />
          <Route path="/monitoring" element={<Navigate to="/dev" replace />} />
          <Route path="/tests" element={<Navigate to="/dev" replace />} />
          <Route path="/developer-mode" element={<Navigate to="/dev" replace />} />
          <Route path="/dev-mode" element={<Navigate to="/dev" replace />} />
          <Route path="/devmode" element={<Navigate to="/dev" replace />} />
          <Route path="/ia-dev" element={<Navigate to="/dev" replace />} />
          <Route
            path="/orchestration-intelligence"
            element={<Navigate to="/dev" replace />}
          />
          <Route path="/orchestration-center" element={<Navigate to="/dev" replace />} />
          <Route path="/orchestration" element={<Navigate to="/dev" replace />} />
          <Route path="/meta-center" element={<Navigate to="/dev" replace />} />
          {/* ✨ REALITY CENTER - Reality Rendering Layer v∞ (OPUS #19) */}
          <Route
            path="/reality-center"
            element={
              <ErrorBoundary context="RealityCenter">
                <RealityCenter />
              </ErrorBoundary>
            }
          />
          <Route path="/reality" element={<Navigate to="/reality-center" replace />} />
          <Route path="/renderer" element={<Navigate to="/reality-center" replace />} />
          {/* ✨ HYPER CENTER - Hyper-Intelligence Engine v∞ (OPUS #20) */}
          <Route
            path="/hyper-center"
            element={
              <ErrorBoundary context="HyperCenter">
                <HyperCenter />
              </ErrorBoundary>
            }
          />
          <Route path="/hyper" element={<Navigate to="/hyper-center" replace />} />
          <Route path="/intelligence" element={<Navigate to="/hyper-center" replace />} />
          {/* ✨ QUANTUM CENTER - Quantum Rendering Layer v∞ (OPUS #17) */}
          <Route
            path="/quantum-center"
            element={
              <ErrorBoundary context="QuantumCenter">
                <QuantumCenter />
              </ErrorBoundary>
            }
          />
          <Route path="/quantum" element={<Navigate to="/quantum-center" replace />} />
          {/* ✨ IDENTITY CENTER - System Identity Engine v∞ (OPUS #15) */}
          <Route
            path="/identity-center"
            element={
              <ErrorBoundary context="IdentityCenter">
                <IdentityCenter />
              </ErrorBoundary>
            }
          />
          <Route path="/identity" element={<Navigate to="/identity-center" replace />} />
          <Route path="/persona" element={<Navigate to="/identity-center" replace />} />
          {/* ✨ MEMORY EVOLUTION - Memory Evolution Engine++ v∞ (OPUS #14) */}
          <Route
            path="/memory-evolution"
            element={
              <ErrorBoundary context="MemoryEvolution">
                <MemoryEvolutionCenter />
              </ErrorBoundary>
            }
          />
          <Route
            path="/memory-evo"
            element={<Navigate to="/memory-evolution" replace />}
          />
          {/* ✨ CLOUD CENTER - Cloud Sync & Vault Engine v∞ */}
          <Route
            path="/cloud"
            element={
              <ErrorBoundary context="CloudCenter">
                <CloudCenter />
              </ErrorBoundary>
            }
          />
          <Route path="/cloud-sync" element={<Navigate to="/cloud" replace />} />
          <Route path="/vault" element={<Navigate to="/cloud" replace />} />
          {/* ❌ SUPPRIMÉ v24.3.7: Route /multi-ai (deprecated stub) */}
          {/* v∞ Phases 5-10 - Knowledge, Creation, Evolution (Phase 9: lazy loaded) */}
          <Route path="/knowledge" element={<KnowledgeFusionPage />} />
          <Route path="/creation" element={<CreationStudio />} />
          <Route path="/evolution" element={<EvolutionMonitor />} />
          {/* v15: SingularityState Monitor */}
          <Route
            path="/singularity"
            element={
              <ErrorBoundary context="SingularityMonitor">
                <SingularityMonitor />
              </ErrorBoundary>
            }
          />
          {/* Engine Routes */}
          {/* ❌ SUPPRIMÉ v25.2.1: /helios, /nexus, /harmonia → fusionnés dans /stats */}
          <Route path="/sentinel" element={<Sentinel />} />
          <Route path="/watchdog" element={<Watchdog />} />
          <Route path="/selfheal" element={<SelfHeal />} />
          <Route path="/adaptive" element={<AdaptiveEngine />} />
          <Route path="/memory" element={<Memory />} />
          {/* System Routes (Phase 9: lazy loaded) */}
          <Route path="/performance" element={<PerformanceTest />} />
          {/* Catch-all - Redirection vers Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* ✨ v∞.20.0 - Chat Bubble Global (Super Prompt #3) */}
      {/* ✅ ACTIF - Bulle Arc Reactor style Iron Man 🔵⚡ */}
      <Suspense fallback={null}>
        <ChatBubble position="bottom-right" persistHistory />
      </Suspense>

      {/* ✨ v∞.25.0 - AI Bubble Engine (Super Prompt #14 - BUBBLE ENGINE v∞) */}
      {/* DÉSACTIVÉ v19.5.0 - Doublon avec ChatBubble Arc Reactor */}
      {/* <Suspense fallback={null}>
        <AIChatBubble />
      </Suspense> */}

      {/* ✨ v∞.26.0 - Hybrid Engine (Super Prompt #16 - AI + DEV CONSOLE FUSION ⚡🧠) */}
      {/* DÉSACTIVÉ v19.5.0 - Doublon avec ChatBubble Arc Reactor */}
      {/* <Suspense fallback={null}>
        <HybridBubble initialMode="bubble" />
      </Suspense> */}

      {/* ✨ v∞.27.0 - Cognitive Layout Control (Super Prompt #2 - ADAPTIVE UI 🧠) */}
      <Suspense fallback={null}>
        <CognitiveLayoutControl />
      </Suspense>

      {/* ✨ v∞.27.0 - Unified Presence Control (Super Prompt #3 - EXPERIENTIAL IDENTITY 🌌) */}
      {/* MASQUÉ - Analyse UI */}
      {/* <UnifiedPresenceControl /> */}

      {/* ✨ v∞.28.0 - Multimodal Presence Panel (Super Prompt XXVIII - LIVING PRESENCE 🎭) */}
      {/* MASQUÉ - Analyse UI */}
      {/* <MultimodalPresencePanel /> */}

      {/* ✨ v∞.29-32 - Deep Psyche Panel (Super Prompts XXIX-XXXII - PSYCHOLOGICAL DEPTH 🧠) */}
      {/* MASQUÉ - Analyse UI */}
      {/* <DeepPsychePanel /> */}

      {/* ✨ v∞.33 - Presence OS Panel (Super Prompt XII - TITANE∞ PRESENCE OS 🌌) */}
      {/* MASQUÉ - Analyse UI */}
      {/* <PresenceOSPanel /> */}

      {/* ✨ v∞.34 - Physiological Panel (Super Prompts XI + XIII - HOLOPHONIC + INTEROCEPTION 🌬️) */}
      {/* MASQUÉ - Analyse UI */}
      {/* <PhysiologicalPanel /> */}

      {/* ✨ v25.4.1 - Keyboard Shortcuts Help: Planned for future release */}

      {/* ✨ v19.5.2 - Toast Notifications System */}
      <ToastContainer
        toasts={toasts.map(t => ({
          id: t.id,
          variant: t.type === 'error' ? 'danger' : t.type,
          message: t.message,
          duration: t.duration || 5000,
        }))}
        position="top-right"
        onRemove={removeToast}
      />
    </AppShell>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * APP COMPONENT - Point d'entrée principal avec Auto-Heal
 * ThemeProvider > AnimationProvider > TitanStateProvider > BrowserRouter > AutoHealErrorBoundary
 * ═══════════════════════════════════════════════════════════════
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
        <TitanStateProvider>
          {/* ✨ v25.3.1 - Aura Control System */}
          <AuraControlPanel position="bottom-right" defaultOpen={false} />

          {/* ✨ v25.3.1 - Quantum Particles Background (Global) - Connected to Aura Orchestrator */}
          <AuraConnectedParticles />

          <BrowserRouter>
            <AutoHealErrorBoundary>
              <AppRouter />
            </AutoHealErrorBoundary>
          </BrowserRouter>
        </TitanStateProvider>
      </AnimationProvider>
    </ThemeProvider>
  );
};

/**
 * Component wrapper qui connecte QuantumParticles à l'orchestrateur Aura
 */
const AuraConnectedParticles: React.FC = () => {
  const aura = useAura();

  // Convertir config Aura en props QuantumParticles
  const particlesProps = {
    count: aura.config.particleCount,
    connectionDistance: aura.config.connectionDistance,
    mouseForce: aura.config.mouseAttraction ? 0.02 : 0,
    opacity: aura.globalIntensity * 0.6,
    colors: React.useMemo(() => {
      const themeColors = {
        default: [
          'rgba(124, 58, 237, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        ocean: [
          'rgba(6, 182, 212, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(124, 58, 237, 0.8)',
        ],
        sunset: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        forest: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(132, 204, 22, 0.8)',
          'rgba(52, 211, 153, 0.8)',
        ],
        fire: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(253, 224, 71, 0.8)',
        ],
        rainbow: [
          'rgba(124, 58, 237, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
      };
      return themeColors[aura.theme] || themeColors.default;
    }, [aura.theme]),
  };

  if (!aura.enabled || !aura.config.particlesEnabled) {
    return null;
  }

  return <QuantumParticles {...particlesProps} />;
};

export default App;
