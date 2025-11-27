/**
 * TITANE_INFINITY v16.2.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v16.2.2 — APP COMPONENT
 *   Unified Architecture: AIRouter + Memory + SingularityEngine
 *   React Router + AppShell + Living Engines + Code Splitting
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLivingEngines } from './hooks';
import { useSingularityState } from './core/state/SingularityState';
import { ThemeProvider } from './themes/ThemeProvider';
import { AnimationProvider } from './contexts/AnimationContext';
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
import { DiagnosticPanel } from './components/DiagnosticPanel'; // ✨ v19.1.0 - System Diagnostics
import { ChatDiagnostic } from './components/ChatDiagnostic'; // ✨ v16.2.2 - Chat IA Diagnostic
import { ChatIADiagnostic } from './components/ChatIADiagnostic'; // ✨ v16.2.2 - Chat IA Diagnostic

// v15: SingularityState Monitor
import { SingularityMonitor } from './components/SingularityMonitor';

// ✨ v∞ - Multi-Agent Engine & Agents
import { multiAgentEngine } from './core/ai/multi_agent_engine';
import { HeliosAgent } from './core/ai/agents/helios_agent';
import { HarmoniaAgent } from './core/ai/agents/harmonia_agent';
import { PersonaAgent } from './core/ai/agents/persona_agent';
import { MemoryCoreAgent } from './core/ai/agents/memory_core_agent';
import { WatchdogAgent } from './core/ai/agents/watchdog_agent';

// Phase 9: Lazy load heavy pages (code splitting with named exports)
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const DevTools = lazy(() => import('./pages/DevTools').then(m => ({ default: m.DevTools })));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage').then(m => ({ default: m.DesignSystemPage })));
const PerformanceTest = lazy(() => import('./pages/PerformanceTest').then(m => ({ default: m.PerformanceTest })));
const TimeNavigator = lazy(() => import('./pages/TimeNavigator').then(m => ({ default: m.TimeNavigator })));
const SystemGovernance = lazy(() => import('./pages/SystemGovernance').then(m => ({ default: m.SystemGovernance })));
const MultiAIDashboard = lazy(() => import('./ui/pages/MultiAIDashboard'));
const NodeClusterDashboard = lazy(() => import('./ui/pages/NodeClusterDashboard'));
const KnowledgeFusionPage = lazy(() => import('./ui/pages/KnowledgeFusionPage'));
const HyperVisionDashboard = lazy(() => import('./ui/pages/HyperVisionDashboard'));
const CreationStudio = lazy(() => import('./ui/pages/CreationStudio'));
const IntrospectionDashboard = lazy(() => import('./ui/pages/IntrospectionDashboard'));
const EvolutionMonitor = lazy(() => import('./ui/pages/EvolutionMonitor'));

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

  // Sidebar items configuration
  const sidebarItems = [
    { id: '/', label: 'Tableau de bord', icon: '📊' },
    { id: '/chat', label: 'Chat IA', icon: '💬', badge: 'v15.1' },
    { id: '/cognitive', label: 'État Cognitif', icon: '🧠' },
    { id: '/progression', label: 'Progression', icon: '⚡', badge: 'NEW' },
    { id: '/diagnostics', label: 'Diagnostics', icon: '🔬', badge: 'v19.1.0' },
    { id: '/design-system', label: 'Design System', icon: '🎨', badge: 'v15.1' },
    { id: '/time-navigator', label: 'Time Navigator', icon: '⏱️', badge: 'v∞' },
    { id: '/governance', label: 'Governance', icon: '⚖️', badge: 'v∞' },
    { id: '/multi-ai', label: 'Multi-AI System', icon: '🌌', badge: 'Phase 4' },
    { id: '/cluster', label: 'Node Cluster', icon: '📦', badge: 'Phase 5' },
    { id: '/knowledge', label: 'Knowledge Fusion', icon: '📚', badge: 'Phase 6' },
    { id: '/hypervision', label: 'HyperVision', icon: '🔍', badge: 'Phase 7' },
    { id: '/creation', label: 'Creation Studio', icon: '🎨', badge: 'Phase 8' },
    { id: '/introspection', label: 'Introspection', icon: '🔬', badge: 'Phase 9' },
    { id: '/evolution', label: 'Evolution', icon: '🧬', badge: 'Phase 10' },
    { id: '/helios', label: 'Helios', icon: '☀️' },
    { id: '/nexus', label: 'Nexus', icon: '🔗' },
    { id: '/harmonia', label: 'Harmonia', icon: '🎵' },
    { id: '/memory', label: 'Memory', icon: '💾' },
    { id: '/settings', label: 'Paramètres', icon: '⚙️' },
    { id: '/devtools', label: 'DevTools', icon: '🔧' },
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
              <span>v16.2.2 - Chat IA + TTS Operationnel</span>
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
      {/* Chat IA Diagnostic Overlay */}
      <ChatDiagnostic />

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
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="/diagnostics" element={<DiagnosticPanel />} /> {/* ✨ v19.1.0 - System Diagnostics */}

          {/* v∞ Super-Prompt N6/K8 - Time Navigation & Governance (Phase 9: lazy loaded) */}
          <Route path="/time-navigator" element={<TimeNavigator />} />
          <Route path="/governance" element={<SystemGovernance />} />

          {/* v∞ Phase 4 - Multi-Agent System (Super-Prompt O) (Phase 9: lazy loaded) */}
          <Route path="/multi-ai" element={
            <ErrorBoundary context="MultiAIDashboard">
              <MultiAIDashboard />
            </ErrorBoundary>
          } />

          {/* v∞ Phases 5-10 - Super-Prompts P-U (Phase 9: lazy loaded) */}
          <Route path="/cluster" element={<NodeClusterDashboard />} />
          <Route path="/knowledge" element={<KnowledgeFusionPage />} />
          <Route path="/hypervision" element={<HyperVisionDashboard />} />
          <Route path="/creation" element={<CreationStudio />} />
          <Route path="/introspection" element={<IntrospectionDashboard />} />
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
          <Route path="/settings" element={
            <ErrorBoundary context="Settings">
              <Settings />
            </ErrorBoundary>
          } />
          <Route path="/devtools" element={<DevTools />} />
          <Route path="/performance" element={<PerformanceTest />} />

          {/* Catch-all - Redirection vers Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * APP COMPONENT - Point d'entrée principal avec Auto-Heal
 * ThemeProvider > AnimationProvider > BrowserRouter > AutoHealErrorBoundary
 * ═══════════════════════════════════════════════════════════════
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
        <BrowserRouter>
          <AutoHealErrorBoundary>
            <AppRouter />
          </AutoHealErrorBoundary>
        </BrowserRouter>
      </AnimationProvider>
    </ThemeProvider>
  );
};

export default App;
