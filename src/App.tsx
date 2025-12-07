/**
 * TITANE_INFINITY v∞.19.2.3Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v19.5.2 — APP COMPONENT - PRODUCTION READY
 *   Phase A+B Complete: IPC Profiler + Memory Baseline + Database Fix
 *   Build 25MB, Tests 98.2%, Boot ~2s, 20 Engines Unified
 *   React Router + AppShell + Living Engines + Code Splitting
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState, Suspense, lazy } from 'react';
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
import { autoAuditEngine } from './services/autoAuditEngine'; // ✨ v∞ - Auto-Audit Engine
import { TitaneLogo } from './components/branding/TitaneLogo'; // ✨ v∞ - Logo Reactor
import { OnboardingFlow } from './components/Onboarding'; // ✨ v19.5.2 - User Onboarding System

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

// New v15.1 pages (Phase 9: Core pages eagerly loaded)
import { DashboardPage } from './pages/DashboardPage';
// ✨ v24 - Performance: Lazy load Chat (1108 lines)
const ChatPage = lazy(() => import('./ui/pages/Chat').then(m => ({ default: m.Chat })));
import { CognitivePage } from './pages/CognitivePage';
import { ProgressionPage } from './pages/ProgressionPage';
import { Experience } from './pages/Experience'; // ✨ v∞.D5 - Page XP
import { ConfigurationHub } from './pages/ConfigurationHub'; // 🎯 v19.5.2 - Configuration Management (Phase 2)
// Diagnostics, DevTools, Cluster, Introspection, HyperVision → System Center

// ✨ v24 - Performance: Lazy load SingularityMonitor
const SingularityMonitor = lazy(() =>
  import('./components/SingularityMonitor').then(m => ({ default: m.SingularityMonitor }))
);

// ✨ v∞.20.0 - Chat Bubble Global (Super Prompt #3)
import { ChatBubble } from './components/chat/ChatBubble';

// ✨ v∞.25.0 - AI Bubble Engine (Super Prompt #14 - BUBBLE ENGINE)
import { AIChatBubble } from './components/AIChatBubble';

// ✨ v∞.26.0 - Hybrid Engine (Super Prompt #16 - AI + DEV CONSOLE FUSION)
import { HybridBubble } from './components/HybridBubble';

// ✨ v∞.27.0 - Cognitive Layout Engine (Super Prompt #2 - ADAPTIVE UI)
import { CognitiveLayoutControl } from './components/cognitive/CognitiveLayoutControl';
import { cognitiveLayoutEngine } from './engines/cognitive/cognitiveLayoutEngine';

// ✨ v∞.27.0 - Unified Presence Engine (Super Prompt #3 - EXPERIENTIAL IDENTITY)
import { UnifiedPresenceControl as _UnifiedPresenceControl } from './components/presence/UnifiedPresenceControl';
import { unifiedPresenceEngine } from './engines/presence/unifiedPresenceEngine';
import { presenceIntegrations } from './engines/presence/presenceIntegrations';
import { narrativeProtocol } from './engines/presence/narrativeProtocol';

// ✨ v∞.28.0 - Multimodal Presence Engine (Super Prompt XXVIII - LIVING PRESENCE)
import { MultimodalPresencePanel as _MultimodalPresencePanel } from './components/presence/MultimodalPresencePanel';
import { multimodalPresenceEngine } from './engines/presence/multimodalPresenceEngine';
import './components/presence/MultimodalPresencePanel.css';

// ✨ v∞.29-32 - Deep Psyche Engines (Super Prompts XXIX, XXX, XXXII, X)
import { DeepPsychePanel as _DeepPsychePanel } from './components/psyche/DeepPsychePanel';
import { archetypeResonanceEngine } from './engines/psyche/archetypeResonanceEngine';
import { metaContinuumEngine } from './engines/continuum/metaContinuumEngine';
import { embodiedPresenceEngine } from './engines/embodiment/embodiedPresenceEngine';
import { neuralVoiceBlendingEngine as _neuralVoiceBlendingEngine } from './engines/voice/neuralVoiceBlendingEngine';

// ✨ v∞.33 - Presence OS Panel (Super Prompt XII - TITANE∞ PRESENCE OS 🌌)
import { PresenceOSPanel as _PresenceOSPanel } from './components/presence/PresenceOSPanel';
import './components/presence/PresenceOSPanel.css';

// ✨ v∞.34 - Physiological Panel (Super Prompts XI + XIII - HOLOPHONIC + INTEROCEPTION 🌬️)
import { PhysiologicalPanel as _PhysiologicalPanel } from './components/physiological/PhysiologicalPanel';
import './components/physiological/PhysiologicalPanel.css';

// ✨ v∞.31-33 - Expression Engines (SUPER PROMPTS XXXI-XXXIII + Aura Ultra)
import { synestheticEmotionEngine } from './engines/emotion/synestheticEmotionEngine';
import { unifiedMultimodalOutputEngine } from './engines/output/unifiedMultimodalOutputEngine';
import { auraEngine } from './engines/aura/auraEngine';
import './components/psyche/DeepPsychePanel.css';

// ✨ v∞.12 - Presence OS (Unified Multimodal Identity System)
import { presenceOS } from './engines/presence/presenceOS';

// ✨ v∞ - Multi-Agent Engine & Agents
import { multiAgentEngine } from './core/ai/multi_agent_engine';
import { HeliosAgent } from './core/ai/agents/helios_agent';
import { HarmoniaAgent } from './core/ai/agents/harmonia_agent';
import { PersonaAgent } from './core/ai/agents/persona_agent';
import { MemoryCoreAgent } from './core/ai/agents/memory_core_agent';
import { WatchdogAgent } from './core/ai/agents/watchdog_agent';

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
const MultiAIDashboard = lazy(() => import('./ui/pages/MultiAIDashboard'));
const KnowledgeFusionPage = lazy(() => import('./ui/pages/KnowledgeFusionPage'));
const CreationStudio = lazy(() => import('./ui/pages/CreationStudio'));
const EvolutionMonitor = lazy(() => import('./ui/pages/EvolutionMonitor'));

// ✨ SYSTEM CENTER - Centre Système Unifié v∞
const SystemCenterPage = lazy(() =>
  import('./features/system-center').then(m => ({ default: m.SystemCenterPage }))
);

// ✨ DESIGN CENTER - Centre Design & Apparence v16
const DesignCenterPage = lazy(() =>
  import('./features/design-center').then(m => ({ default: m.DesignCenterPage }))
);

// ✨ GOVERNANCE CENTER - Centre Gouvernance & Sécurité v∞
const GovernanceCenterPage = lazy(() =>
  import('./features/governance-center').then(m => ({ default: m.GovernanceCenterPage }))
);

// ✨ AUDIO CENTER - Centre Audio & Voix v19.2
const AudioCenterPage = lazy(() =>
  import('./features/audio-center').then(m => ({ default: m.AudioCenterPage }))
);

// ✨ EVOLUTION CENTER - Centre d'Évolution Cognitive v19.3 (OPUS #4)
const EvolutionCenterPage = lazy(() =>
  import('./pages/EvolutionCenterPage').then(m => ({ default: m.EvolutionCenterPage }))
);

// ✨ ORCHESTRATION META CENTER - Centre Unifié v24 (TODO #9 - Fusion Meta + Orchestration)
const OrchestrationMetaCenter = lazy(() =>
  import('./pages/OrchestrationMetaCenter').then(m => ({
    default: m.OrchestrationMetaCenter,
  }))
);

// ✨ ONE CORE - Centre de Commande Unifié v19.5 (OPUS #6)
const OneCorePage = lazy(() =>
  import('./features/one-core').then(m => ({ default: m.OneCorePage }))
);

// ✨ QA MONITORING CENTER - Centre QA & Monitoring v19.6 (OPUS #7)
const QAMonitoringPage = lazy(() =>
  import('./features/qa-monitoring').then(m => ({ default: m.QAMonitoringPage }))
);

// ✨ DEVELOPER MODE - IA Developer Mode v∞ (OPUS #10)
const DeveloperModePage = lazy(() =>
  import('./features/developer-mode').then(m => ({ default: m.DeveloperModePage }))
);

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

// ✨ v24.1 - IDENTITY & MEMORY EVOLUTION CENTER (FUSION 4 modules → 1 centre)
const IdentityMemoryEvolutionCenter = lazy(
  () => import('./modules/IdentityMemoryEvolutionCenter')
);

// ✨ v24.2 - TEMPORAL FLOW & AGENDA CENTER (FUSION 2 modules → 1 centre)
const TemporalFlowCenter = lazy(() => import('./modules/TemporalFlowCenter'));

// Engine & System pages (Phase 9: Keep core engines eagerly loaded)
import {
  Helios,
  Nexus,
  Harmonia,
  Sentinel,
  Watchdog,
  SelfHeal,
  AdaptiveEngine,
  Memory,
  AgendaPage as _AgendaPage,
  CameraPage,
} from './pages';

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

  // ✨ v∞ - Démarrer Auto-Audit Engine au chargement
  useEffect(() => {
    console.log('🔍 [AUTO-AUDIT] Starting automatic audits...');
    autoAuditEngine.start();

    return () => {
      console.log('🛑 [AUTO-AUDIT] Stopping audits...');
      autoAuditEngine.stop();
    };
  }, []);

  // ✨ v∞ Phase 4 - Initialiser Multi-Agent System
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

  // ✨ v∞.27.0 - Initialiser Cognitive Layout Engine
  useEffect(() => {
    console.log('🧠 [COGNITIVE] Starting Cognitive Layout Engine...');
    cognitiveLayoutEngine.start();

    return () => {
      console.log('🛑 [COGNITIVE] Stopping Cognitive Layout Engine...');
      cognitiveLayoutEngine.stop();
    };
  }, []);

  // ✨ v∞.27.0 - Initialiser Unified Presence Engine (Super Prompt #3)
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

  // ✨ v∞.28.0 - Initialiser Multimodal Presence Engine (Super Prompt XXVIII)
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

  // ✨ v∞.29-32 - Initialiser Deep Psyche Engines (Super Prompts XXIX, XXX, XXXII, X)
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

  // ✨ v∞.31-33 - Expression Engines (Synesthetic Emotion + Unified Output + Aura)
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

  // 🌟 Initialize Living Engines v21-v24
  const livingEngines = useLivingEngines(100); // Update every 100ms

  // Log living state (debug) - effet optimisé avec dépendances stables
  useEffect(() => {
    if (!livingEngines.state.initialized) return;

    console.log('🎭 Persona:', livingEngines.state.persona?.mood.current);
    console.log('⚡ Glow:', livingEngines.state.glow.toFixed(2));
    console.log('🧠 Cognitive Load:', livingEngines.state.cognitiveLoad.toFixed(2));
    // Note: Cet effet log uniquement à l'initialisation, pas à chaque update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livingEngines.state.initialized]);

  // Sidebar items configuration - v∞.19.3 COMPLETE
  const sidebarItems = [
    // ═══ PRINCIPAL ═══
    { id: '/', label: 'Tableau de bord', icon: '📊' },
    { id: '/chat', label: 'Chat IA', icon: '💬', badge: 'OMEGA' },
    { id: '/cognitive', label: 'État Cognitif', icon: '🧠' },
    { id: '/progression', label: 'Progression', icon: '⚡' },

    // ✨ v24.2 - NOUVEAU CENTRE TEMPS UNIFIÉ
    {
      id: '/temporal-center',
      label: 'Centre Temps & Navigation',
      icon: '⏳',
      badge: 'v24.2',
    },

    // Anciens (à migrer vers Centre Temps)
    { id: '/agenda', label: 'Agenda', icon: '📅', badge: 'legacy' },
    { id: '/camera', label: 'Vision', icon: '📷', badge: 'v∞' },

    // ═══ CENTRES UNIFIÉS ═══
    { id: '/one-core', label: 'ONE CORE', icon: '🎯', badge: 'OPUS#6' },
    { id: '/system-center', label: 'Centre Système', icon: '⚙️' },
    { id: '/configuration', label: 'Configuration Hub', icon: '🎛️', badge: 'v19.5.2' },
    { id: '/audio-center', label: 'Audio & Voix', icon: '🔊', badge: 'v19.3' },
    { id: '/design-center', label: 'Design & Apparence', icon: '🎨' },
    { id: '/governance-center', label: 'Gouvernance', icon: '🛡️' },
    { id: '/qa-monitoring', label: 'QA & Monitoring', icon: '🧪', badge: 'OPUS#7' },
    { id: '/developer-mode', label: 'Mode Développeur', icon: '💻', badge: 'OPUS#10' },

    // ═══ CENTRES COGNITIFS ═══
    {
      id: '/evolution-center',
      label: 'Évolution Cognitive',
      icon: '🧬',
      badge: 'OPUS#4',
    },

    // ✨ v24.1 - NOUVEAUX CENTRES UNIFIÉS (10 modules → 2 centres)
    {
      id: '/orchestration-intelligence',
      label: 'Orchestration & Intelligence',
      icon: '🔥',
      badge: 'v24.1',
    },
    {
      id: '/identity-memory-evolution',
      label: 'Identity & Memory Evolution',
      icon: '🧠',
      badge: 'v24.1',
    },

    // Anciens centres (à migrer vers les nouveaux)
    { id: '/orchestration-center', label: 'Orchestration', icon: '🎛️', badge: 'OPUS#5' },
    { id: '/meta-center', label: 'Meta Orchestrator', icon: '🌐', badge: 'OPUS#18' },
    { id: '/hyper-center', label: 'Hyper Intelligence', icon: '✨', badge: 'OPUS#20' },
    { id: '/quantum-center', label: 'Quantum Layer', icon: '⚛️', badge: 'OPUS#17' },
    { id: '/identity-center', label: 'Identité Système', icon: '🎭', badge: 'OPUS#15' },
    { id: '/memory-evolution', label: 'Mémoire Évolutive', icon: '🧠', badge: 'OPUS#14' },
    { id: '/reality-center', label: 'Reality Renderer', icon: '🌌', badge: 'OPUS#19' },

    // ═══ MOTEURS ═══
    { id: '/multi-ai', label: 'Système Multi-IA', icon: '🤖' },
    { id: '/helios', label: 'Helios', icon: '☀️' },
    { id: '/nexus', label: 'Nexus', icon: '🔗' },
    { id: '/harmonia', label: 'Harmonia', icon: '🎵' },
    { id: '/memory', label: 'Mémoire', icon: '💾' },
  ];

  // ✨ v19.5.2 - Handler onboarding completion
  const handleOnboardingComplete = async () => {
    console.log('✅ [ONBOARDING] User completed onboarding flow');
    setOnboardingComplete(true);
  };

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
          items={sidebarItems.map(item => ({
            ...item,
            active: item.id === location.pathname,
          }))}
          onItemClick={item => {
            navigate(item.id);
          }}
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
              {!sidebarCollapsed && (
                <CompactXPBar
                  onClick={() => {
                    navigate('/progression');
                  }}
                />
              )}
            </>
          }
        />
      }
      header={
        <Header
          title="TITANE∞"
          subtitle={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span>v∞.19.3Ω — Singularity Architecture • 20 Engines • Full OPUS</span>
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
      <Suspense
        fallback={
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
        }
      >
        <Routes>
          {/* Main Routes v15.2+ */}
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/chat"
            element={
              <ErrorBoundary context="ChatPage">
                <ChatPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/cognitive"
            element={
              <ErrorBoundary context="CognitivePage">
                <CognitivePage />
              </ErrorBoundary>
            }
          />
          <Route path="/progression" element={<ProgressionPage />} />
          <Route path="/experience" element={<Experience />} /> {/* ✨ v∞.D5 - Page XP */}
          <Route path="/configuration" element={<ConfigurationHub />} />{' '}
          {/* 🎯 v19.5.2 - Configuration Hub (Phase 2) */}
          {/* ✨ v24.2 TEMPORAL FLOW & AGENDA CENTER - Fusion Agenda + Navigation Temporelle */}
          <Route
            path="/temporal-center"
            element={
              <ErrorBoundary context="TemporalFlowCenter">
                <TemporalFlowCenter />
              </ErrorBoundary>
            }
          />
          {/* ✨ v∞ AGENDA - Gestion Planning & Événements (Legacy - redirige vers temporal-center) */}
          <Route path="/agenda" element={<Navigate to="/temporal-center" replace />} />
          <Route
            path="/time-navigator"
            element={<Navigate to="/temporal-center" replace />}
          />
          {/* ✨ v∞ CAMERA - Centre Vision & Analyse Visuelle */}
          <Route
            path="/camera"
            element={
              <ErrorBoundary context="CameraPage">
                <CameraPage />
              </ErrorBoundary>
            }
          />
          {/* ✨ v16 - DESIGN CENTER UNIFIÉ (Design System + Apparence + Tokens Dynamiques) */}
          <Route
            path="/design-center"
            element={
              <ErrorBoundary context="DesignCenter">
                <DesignCenterPage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers Design Center pour anciennes routes */}
          <Route
            path="/design-system"
            element={<Navigate to="/design-center" replace />}
          />
          <Route path="/settings" element={<Navigate to="/design-center" replace />} />
          {/* ✨ v∞ - SYSTÈME CENTER UNIFIÉ (Diagnostic + DevTools + Cluster + Introspection + HyperVision) */}
          <Route
            path="/system-center"
            element={
              <ErrorBoundary context="SystemCenter">
                <SystemCenterPage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers System Center pour anciennes routes */}
          <Route path="/diagnostics" element={<Navigate to="/system-center" replace />} />
          <Route path="/devtools" element={<Navigate to="/system-center" replace />} />
          <Route path="/cluster" element={<Navigate to="/system-center" replace />} />
          <Route
            path="/introspection"
            element={<Navigate to="/system-center" replace />}
          />
          <Route path="/hypervision" element={<Navigate to="/system-center" replace />} />
          {/* ✨ v∞ GOVERNANCE CENTER - Centre Gouvernance & Sécurité Unifié */}
          <Route
            path="/governance-center"
            element={
              <ErrorBoundary context="GovernanceCenter">
                <GovernanceCenterPage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers Governance Center pour anciennes routes */}
          <Route
            path="/governance"
            element={<Navigate to="/governance-center" replace />}
          />
          <Route path="/secure" element={<Navigate to="/governance-center" replace />} />
          {/* ✨ v19.2 AUDIO CENTER - Centre Audio & Voix */}
          <Route
            path="/audio-center"
            element={
              <ErrorBoundary context="AudioCenter">
                <AudioCenterPage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers Audio Center pour anciennes routes */}
          <Route path="/audio" element={<Navigate to="/audio-center" replace />} />
          <Route path="/voice" element={<Navigate to="/audio-center" replace />} />
          <Route path="/tts" element={<Navigate to="/audio-center" replace />} />
          {/* ✨ v19.3 EVOLUTION CENTER - Centre d'Évolution Cognitive (OPUS #4) */}
          <Route
            path="/evolution-center"
            element={
              <ErrorBoundary context="EvolutionCenter">
                <EvolutionCenterPage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers Evolution Center pour anciennes routes */}
          <Route
            path="/cognitive-evolution"
            element={<Navigate to="/evolution-center" replace />}
          />
          <Route path="/xp" element={<Navigate to="/evolution-center" replace />} />
          {/* ✨ v24.1 ORCHESTRATION & INTELLIGENCE CENTER - Fusion 6 modules (QA, Meta, Orchestration, Quantum, Multi-IA, Reality) */}
          <Route
            path="/orchestration-intelligence"
            element={
              <ErrorBoundary context="OrchestrationIntelligenceCenter">
                <OrchestrationIntelligenceCenter />
              </ErrorBoundary>
            }
          />
          {/* ✨ v24.1 IDENTITY & MEMORY EVOLUTION CENTER - Fusion 4 modules (Identité, Mémoire, Mémoire Évolutive, Évolution Cognitive) */}
          <Route
            path="/identity-memory-evolution"
            element={
              <ErrorBoundary context="IdentityMemoryEvolutionCenter">
                <IdentityMemoryEvolutionCenter />
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
          {/* ✨ v19.5 ONE CORE - Centre de Commande Unifié (OPUS #6) */}
          <Route
            path="/one-core"
            element={
              <ErrorBoundary context="OneCore">
                <OneCorePage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers ONE CORE pour anciennes routes */}
          <Route path="/command-center" element={<Navigate to="/one-core" replace />} />
          <Route path="/unified" element={<Navigate to="/one-core" replace />} />
          <Route path="/singularity" element={<Navigate to="/one-core" replace />} />
          {/* ✨ v19.6 QA MONITORING CENTER - Centre QA & Monitoring (OPUS #7) */}
          <Route
            path="/qa-monitoring"
            element={
              <ErrorBoundary context="QAMonitoring">
                <QAMonitoringPage />
              </ErrorBoundary>
            }
          />
          {/* Alias pour QA Center */}
          <Route path="/qa" element={<Navigate to="/qa-monitoring" replace />} />
          <Route path="/monitoring" element={<Navigate to="/qa-monitoring" replace />} />
          <Route path="/tests" element={<Navigate to="/qa-monitoring" replace />} />
          {/* ✨ v∞ DEVELOPER MODE - IA Developer Mode (OPUS #10) */}
          <Route
            path="/developer-mode"
            element={
              <ErrorBoundary context="DeveloperMode">
                <DeveloperModePage />
              </ErrorBoundary>
            }
          />
          {/* Alias pour Developer Mode */}
          <Route path="/dev-mode" element={<Navigate to="/developer-mode" replace />} />
          <Route path="/devmode" element={<Navigate to="/developer-mode" replace />} />
          <Route path="/ia-dev" element={<Navigate to="/developer-mode" replace />} />
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
          {/* v∞ Phase 4 - Multi-Agent System (Super-Prompt O) (Phase 9: lazy loaded) */}
          <Route
            path="/multi-ai"
            element={
              <ErrorBoundary context="MultiAIDashboard">
                <MultiAIDashboard />
              </ErrorBoundary>
            }
          />
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
          <Route path="/helios" element={<Helios />} />
          <Route path="/nexus" element={<Nexus />} />
          <Route path="/harmonia" element={<Harmonia />} />
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
      <ChatBubble position="bottom-right" persistHistory />

      {/* ✨ v∞.25.0 - AI Bubble Engine (Super Prompt #14 - BUBBLE ENGINE v∞) */}
      <AIChatBubble />

      {/* ✨ v∞.26.0 - Hybrid Engine (Super Prompt #16 - AI + DEV CONSOLE FUSION ⚡🧠) */}
      <HybridBubble initialMode="bubble" />

      {/* ✨ v∞.27.0 - Cognitive Layout Control (Super Prompt #2 - ADAPTIVE UI 🧠) */}
      <CognitiveLayoutControl />

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

export default App;
