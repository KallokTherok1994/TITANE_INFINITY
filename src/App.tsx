/**
 * TITANE_INFINITY v∞.19.2.3Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.19.2.3Ω — APP COMPONENT
 *   Singularity Architecture: AIRouter + Memory + SingularityEngine + 20 Engines
 *   React Router + AppShell + Living Engines + Code Splitting
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { detectEnvironment, shouldBlockLoading, logEnvironmentWarnings } from './core/tauri/environment';
import { autoAuditEngine } from './services/autoAuditEngine'; // ✨ v∞ - Auto-Audit Engine

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
// CORRECTION v19.1.0: Utiliser la vraie page Chat avec useChat() au lieu du mock setTimeout
import { Chat as ChatPage } from './ui/pages/Chat';
import { CognitivePage } from './pages/CognitivePage';
import { ProgressionPage } from './pages/ProgressionPage';
import { Experience } from './pages/Experience'; // ✨ v∞.D5 - Page XP
// Diagnostics, DevTools, Cluster, Introspection, HyperVision → System Center

// v15: SingularityState Monitor
import { SingularityMonitor } from './components/SingularityMonitor';

// ✨ v∞.20.0 - Chat Bubble Global (Super Prompt #3)
import { ChatBubble } from './components/chat/ChatBubble';

// ✨ v∞.25.0 - AI Bubble Engine (Super Prompt #14 - BUBBLE ENGINE)
import { AIChatBubble } from './components/AIChatBubble';

// ✨ v∞.26.0 - Hybrid Engine (Super Prompt #16 - AI + DEV CONSOLE FUSION)
import { HybridBubble } from './components/HybridBubble';

// ✨ v∞ - Multi-Agent Engine & Agents
import { multiAgentEngine } from './core/ai/multi_agent_engine';
import { HeliosAgent } from './core/ai/agents/helios_agent';
import { HarmoniaAgent } from './core/ai/agents/harmonia_agent';
import { PersonaAgent } from './core/ai/agents/persona_agent';
import { MemoryCoreAgent } from './core/ai/agents/memory_core_agent';
import { WatchdogAgent } from './core/ai/agents/watchdog_agent';

// Phase 9: Lazy load heavy pages (code splitting with named exports)
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage').then(m => ({ default: m.DesignSystemPage })));
const PerformanceTest = lazy(() => import('./pages/PerformanceTest').then(m => ({ default: m.PerformanceTest })));
const TimeNavigator = lazy(() => import('./pages/TimeNavigator').then(m => ({ default: m.TimeNavigator })));
const MultiAIDashboard = lazy(() => import('./ui/pages/MultiAIDashboard'));
const KnowledgeFusionPage = lazy(() => import('./ui/pages/KnowledgeFusionPage'));
const CreationStudio = lazy(() => import('./ui/pages/CreationStudio'));
const EvolutionMonitor = lazy(() => import('./ui/pages/EvolutionMonitor'));

// ✨ SYSTEM CENTER - Centre Système Unifié v∞
const SystemCenterPage = lazy(() => import('./features/system-center').then(m => ({ default: m.SystemCenterPage })));

// ✨ DESIGN CENTER - Centre Design & Apparence v16
const DesignCenterPage = lazy(() => import('./features/design-center').then(m => ({ default: m.DesignCenterPage })));

// ✨ GOVERNANCE CENTER - Centre Gouvernance & Sécurité v∞
const GovernanceCenterPage = lazy(() => import('./features/governance-center').then(m => ({ default: m.GovernanceCenterPage })));

// ✨ AUDIO CENTER - Centre Audio & Voix v19.2
const AudioCenterPage = lazy(() => import('./features/audio-center').then(m => ({ default: m.AudioCenterPage })));

// ✨ EVOLUTION CENTER - Centre d'Évolution Cognitive v19.3 (OPUS #4)
const EvolutionCenterPage = lazy(() => import('./pages/EvolutionCenterPage').then(m => ({ default: m.EvolutionCenterPage })));

// ✨ ORCHESTRATION CENTER - Centre d'Orchestration Cognitive v19.4 (OPUS #5)
const OrchestrationCenterPage = lazy(() => import('./pages/OrchestrationCenterPage').then(m => ({ default: m.OrchestrationCenterPage })));

// ✨ ONE CORE - Centre de Commande Unifié v19.5 (OPUS #6)
const OneCorePage = lazy(() => import('./features/one-core').then(m => ({ default: m.OneCorePage })));

// ✨ QA MONITORING CENTER - Centre QA & Monitoring v19.6 (OPUS #7)
const QAMonitoringPage = lazy(() => import('./features/qa-monitoring').then(m => ({ default: m.QAMonitoringPage })));

// ✨ DEVELOPER MODE - IA Developer Mode v∞ (OPUS #10)
const DeveloperModePage = lazy(() => import('./features/developer-mode').then(m => ({ default: m.DeveloperModePage })));

// ✨ META CENTER - Meta Orchestrator v∞ (OPUS #18)
const MetaCenter = lazy(() => import('./components/MetaCenter/MetaCenter').then(m => ({ default: m.default })));

// ✨ REALITY CENTER - Reality Rendering Layer v∞ (OPUS #19)
const RealityCenter = lazy(() => import('./components/RealityCenter/RealityCenter').then(m => ({ default: m.default })));

// ✨ HYPER CENTER - Hyper-Intelligence Engine v∞ (OPUS #20)
const HyperCenter = lazy(() => import('./components/HyperCenter/HyperCenter').then(m => ({ default: m.default })));

// ✨ QUANTUM CENTER - Quantum Rendering Layer v∞ (OPUS #17)
const QuantumCenter = lazy(() => import('./components/QuantumCenter/QuantumCenter').then(m => ({ default: m.default })));

// ✨ IDENTITY CENTER - System Identity Engine v∞ (OPUS #15)
const IdentityCenter = lazy(() => import('./components/IdentityCenter/IdentityCenter').then(m => ({ default: m.default })));

// ✨ MEMORY EVOLUTION - Memory Evolution Engine++ v∞ (OPUS #14)
const MemoryEvolutionCenter = lazy(() => import('./components/MemoryEvolution/MemoryEvolutionCenter').then(m => ({ default: m.default })));

// ✨ CLOUD CENTER - Cloud Sync & Vault Engine v∞
const CloudCenter = lazy(() => import('./pages/CloudCenter').then(m => ({ default: m.CloudCenter })));

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
  AgendaPage,
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
  const sidebarCollapsed = useSingularityState((s) => s.context.sidebarCollapsed);
  const toggleSidebar = useSingularityState((s) => s.toggleSidebar);

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
    { id: '/agenda', label: 'Agenda', icon: '📅', badge: 'v∞' },
    { id: '/camera', label: 'Vision', icon: '📷', badge: 'v∞' },

    // ═══ CENTRES UNIFIÉS ═══
    { id: '/one-core', label: 'ONE CORE', icon: '🎯', badge: 'OPUS#6' },
    { id: '/system-center', label: 'Centre Système', icon: '⚙️' },
    { id: '/audio-center', label: 'Audio & Voix', icon: '🔊', badge: 'v19.3' },
    { id: '/design-center', label: 'Design & Apparence', icon: '🎨' },
    { id: '/governance-center', label: 'Gouvernance', icon: '🛡️' },
    { id: '/qa-monitoring', label: 'QA & Monitoring', icon: '🧪', badge: 'OPUS#7' },
    { id: '/developer-mode', label: 'Mode Développeur', icon: '💻', badge: 'OPUS#10' },

    // ═══ CENTRES COGNITIFS ═══
    { id: '/evolution-center', label: 'Évolution Cognitive', icon: '🧬', badge: 'OPUS#4' },
    { id: '/orchestration-center', label: 'Orchestration', icon: '🎛️', badge: 'OPUS#5' },
    { id: '/meta-center', label: 'Meta Orchestrator', icon: '🌐', badge: 'OPUS#18' },
    { id: '/hyper-center', label: 'Hyper Intelligence', icon: '✨', badge: 'OPUS#20' },
    { id: '/quantum-center', label: 'Quantum Layer', icon: '⚛️', badge: 'OPUS#17' },
    { id: '/identity-center', label: 'Identité Système', icon: '🎭', badge: 'OPUS#15' },
    { id: '/memory-evolution', label: 'Mémoire Évolutive', icon: '🧠', badge: 'OPUS#14' },
    { id: '/reality-center', label: 'Reality Renderer', icon: '🌌', badge: 'OPUS#19' },

    // ═══ MOTEURS ═══
    { id: '/multi-ai', label: 'Système Multi-IA', icon: '🤖' },
    { id: '/time-navigator', label: 'Navigateur Temporel', icon: '⏱️' },
    { id: '/helios', label: 'Helios', icon: '☀️' },
    { id: '/nexus', label: 'Nexus', icon: '🔗' },
    { id: '/harmonia', label: 'Harmonia', icon: '🎵' },
    { id: '/memory', label: 'Mémoire', icon: '💾' },
  ];

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={sidebarItems.map(item => ({
            ...item,
            active: item.id === location.pathname
          }))}
          onItemClick={(item) => { navigate(item.id); }}
          collapsed={sidebarCollapsed}
          header={
            <>
              {/* Logo TITANE∞ */}
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #727b81, #93b399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                TITANE∞
              </div>
              {/* Compact XP Bar */}
              {!sidebarCollapsed && (
                <CompactXPBar onClick={() => { navigate('/progression'); }} />
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
      <Suspense fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#727b81'
        }}>
          ⚡ Chargement...
        </div>
      }>
        <Routes>
          {/* Main Routes v15.2+ */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/chat" element={
            <ErrorBoundary context="ChatPage">
              <ChatPage />
            </ErrorBoundary>
          } />
          <Route path="/cognitive" element={
            <ErrorBoundary context="CognitivePage">
              <CognitivePage />
            </ErrorBoundary>
          } />
          <Route path="/progression" element={<ProgressionPage />} />
          <Route path="/experience" element={<Experience />} /> {/* ✨ v∞.D5 - Page XP */}

          {/* ✨ v∞ AGENDA - Gestion Planning & Événements */}
          <Route path="/agenda" element={
            <ErrorBoundary context="AgendaPage">
              <AgendaPage />
            </ErrorBoundary>
          } />

          {/* ✨ v∞ CAMERA - Centre Vision & Analyse Visuelle */}
          <Route path="/camera" element={
            <ErrorBoundary context="CameraPage">
              <CameraPage />
            </ErrorBoundary>
          } />

          {/* ✨ v16 - DESIGN CENTER UNIFIÉ (Design System + Apparence + Tokens Dynamiques) */}
          <Route path="/design-center" element={
            <ErrorBoundary context="DesignCenter">
              <DesignCenterPage />
            </ErrorBoundary>
          } />

          {/* Redirections vers Design Center pour anciennes routes */}
          <Route path="/design-system" element={<Navigate to="/design-center" replace />} />
          <Route path="/settings" element={<Navigate to="/design-center" replace />} />

          {/* ✨ v∞ - SYSTÈME CENTER UNIFIÉ (Diagnostic + DevTools + Cluster + Introspection + HyperVision) */}
          <Route path="/system-center" element={
            <ErrorBoundary context="SystemCenter">
              <SystemCenterPage />
            </ErrorBoundary>
          } />

          {/* Redirections vers System Center pour anciennes routes */}
          <Route path="/diagnostics" element={<Navigate to="/system-center" replace />} />
          <Route path="/devtools" element={<Navigate to="/system-center" replace />} />
          <Route path="/cluster" element={<Navigate to="/system-center" replace />} />
          <Route path="/introspection" element={<Navigate to="/system-center" replace />} />
          <Route path="/hypervision" element={<Navigate to="/system-center" replace />} />

          {/* ✨ v∞ GOVERNANCE CENTER - Centre Gouvernance & Sécurité Unifié */}
          <Route path="/governance-center" element={
            <ErrorBoundary context="GovernanceCenter">
              <GovernanceCenterPage />
            </ErrorBoundary>
          } />

          {/* Redirections vers Governance Center pour anciennes routes */}
          <Route path="/governance" element={<Navigate to="/governance-center" replace />} />
          <Route path="/secure" element={<Navigate to="/governance-center" replace />} />

          {/* ✨ v19.2 AUDIO CENTER - Centre Audio & Voix */}
          <Route path="/audio-center" element={
            <ErrorBoundary context="AudioCenter">
              <AudioCenterPage />
            </ErrorBoundary>
          } />

          {/* Redirections vers Audio Center pour anciennes routes */}
          <Route path="/audio" element={<Navigate to="/audio-center" replace />} />
          <Route path="/voice" element={<Navigate to="/audio-center" replace />} />
          <Route path="/tts" element={<Navigate to="/audio-center" replace />} />

          {/* ✨ v19.3 EVOLUTION CENTER - Centre d'Évolution Cognitive (OPUS #4) */}
          <Route path="/evolution-center" element={
            <ErrorBoundary context="EvolutionCenter">
              <EvolutionCenterPage />
            </ErrorBoundary>
          } />

          {/* Redirections vers Evolution Center pour anciennes routes */}
          <Route path="/cognitive-evolution" element={<Navigate to="/evolution-center" replace />} />
          <Route path="/xp" element={<Navigate to="/evolution-center" replace />} />

          {/* ✨ v19.4 ORCHESTRATION CENTER - Centre d'Orchestration Cognitive (OPUS #5) */}
          <Route path="/orchestration-center" element={
            <ErrorBoundary context="OrchestrationCenter">
              <OrchestrationCenterPage />
            </ErrorBoundary>
          } />

          {/* Redirections vers Orchestration Center pour anciennes routes */}
          <Route path="/multi-ai-dashboard" element={<Navigate to="/orchestration-center" replace />} />
          <Route path="/nexus-engine" element={<Navigate to="/orchestration-center" replace />} />
          <Route path="/harmonia-engine" element={<Navigate to="/orchestration-center" replace />} />
          <Route path="/cognitive-state" element={<Navigate to="/orchestration-center" replace />} />

          {/* ✨ v19.5 ONE CORE - Centre de Commande Unifié (OPUS #6) */}
          <Route path="/one-core" element={
            <ErrorBoundary context="OneCore">
              <OneCorePage />
            </ErrorBoundary>
          } />

          {/* Redirections vers ONE CORE pour anciennes routes */}
          <Route path="/command-center" element={<Navigate to="/one-core" replace />} />
          <Route path="/unified" element={<Navigate to="/one-core" replace />} />
          <Route path="/singularity" element={<Navigate to="/one-core" replace />} />

          {/* ✨ v19.6 QA MONITORING CENTER - Centre QA & Monitoring (OPUS #7) */}
          <Route path="/qa-monitoring" element={
            <ErrorBoundary context="QAMonitoring">
              <QAMonitoringPage />
            </ErrorBoundary>
          } />
          {/* Alias pour QA Center */}
          <Route path="/qa" element={<Navigate to="/qa-monitoring" replace />} />
          <Route path="/monitoring" element={<Navigate to="/qa-monitoring" replace />} />
          <Route path="/tests" element={<Navigate to="/qa-monitoring" replace />} />

          {/* ✨ v∞ DEVELOPER MODE - IA Developer Mode (OPUS #10) */}
          <Route path="/developer-mode" element={
            <ErrorBoundary context="DeveloperMode">
              <DeveloperModePage />
            </ErrorBoundary>
          } />
          {/* Alias pour Developer Mode */}
          <Route path="/dev-mode" element={<Navigate to="/developer-mode" replace />} />
          <Route path="/devmode" element={<Navigate to="/developer-mode" replace />} />
          <Route path="/ia-dev" element={<Navigate to="/developer-mode" replace />} />

          {/* v∞ Super-Prompt N6 - Time Navigation (Phase 9: lazy loaded) */}
          <Route path="/time-navigator" element={<TimeNavigator />} />

          {/* ✨ META CENTER - Meta Orchestrator v∞ (OPUS #18) */}
          <Route path="/meta-center" element={
            <ErrorBoundary context="MetaCenter">
              <MetaCenter />
            </ErrorBoundary>
          } />
          <Route path="/meta" element={<Navigate to="/meta-center" replace />} />
          <Route path="/orchestrator" element={<Navigate to="/meta-center" replace />} />

          {/* ✨ REALITY CENTER - Reality Rendering Layer v∞ (OPUS #19) */}
          <Route path="/reality-center" element={
            <ErrorBoundary context="RealityCenter">
              <RealityCenter />
            </ErrorBoundary>
          } />
          <Route path="/reality" element={<Navigate to="/reality-center" replace />} />
          <Route path="/renderer" element={<Navigate to="/reality-center" replace />} />

          {/* ✨ HYPER CENTER - Hyper-Intelligence Engine v∞ (OPUS #20) */}
          <Route path="/hyper-center" element={
            <ErrorBoundary context="HyperCenter">
              <HyperCenter />
            </ErrorBoundary>
          } />
          <Route path="/hyper" element={<Navigate to="/hyper-center" replace />} />
          <Route path="/intelligence" element={<Navigate to="/hyper-center" replace />} />

          {/* ✨ QUANTUM CENTER - Quantum Rendering Layer v∞ (OPUS #17) */}
          <Route path="/quantum-center" element={
            <ErrorBoundary context="QuantumCenter">
              <QuantumCenter />
            </ErrorBoundary>
          } />
          <Route path="/quantum" element={<Navigate to="/quantum-center" replace />} />

          {/* ✨ IDENTITY CENTER - System Identity Engine v∞ (OPUS #15) */}
          <Route path="/identity-center" element={
            <ErrorBoundary context="IdentityCenter">
              <IdentityCenter />
            </ErrorBoundary>
          } />
          <Route path="/identity" element={<Navigate to="/identity-center" replace />} />
          <Route path="/persona" element={<Navigate to="/identity-center" replace />} />

          {/* ✨ MEMORY EVOLUTION - Memory Evolution Engine++ v∞ (OPUS #14) */}
          <Route path="/memory-evolution" element={
            <ErrorBoundary context="MemoryEvolution">
              <MemoryEvolutionCenter />
            </ErrorBoundary>
          } />
          <Route path="/memory-evo" element={<Navigate to="/memory-evolution" replace />} />

          {/* ✨ CLOUD CENTER - Cloud Sync & Vault Engine v∞ */}
          <Route path="/cloud" element={
            <ErrorBoundary context="CloudCenter">
              <CloudCenter />
            </ErrorBoundary>
          } />
          <Route path="/cloud-sync" element={<Navigate to="/cloud" replace />} />
          <Route path="/vault" element={<Navigate to="/cloud" replace />} />

          {/* v∞ Phase 4 - Multi-Agent System (Super-Prompt O) (Phase 9: lazy loaded) */}
          <Route path="/multi-ai" element={
            <ErrorBoundary context="MultiAIDashboard">
              <MultiAIDashboard />
            </ErrorBoundary>
          } />

          {/* v∞ Phases 5-10 - Knowledge, Creation, Evolution (Phase 9: lazy loaded) */}
          <Route path="/knowledge" element={<KnowledgeFusionPage />} />
          <Route path="/creation" element={<CreationStudio />} />
          <Route path="/evolution" element={<EvolutionMonitor />} />

          {/* v15: SingularityState Monitor */}
          <Route path="/singularity" element={
            <ErrorBoundary context="SingularityMonitor">
              <SingularityMonitor />
            </ErrorBoundary>
          } />

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
