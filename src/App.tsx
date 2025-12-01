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
// Diagnostics, DevTools, Cluster, Introspection, HyperVision → System Center

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
    { id: '/system-center', label: 'Centre Système', icon: '⚙️', badge: 'v∞' },
    { id: '/design-center', label: 'Design & Apparence', icon: '🎨', badge: 'v16' },
    { id: '/governance-center', label: 'Gouvernance & Sécurité', icon: '🛡️', badge: 'v∞' },
    { id: '/time-navigator', label: 'Navigateur Temporel', icon: '⏱️', badge: 'v∞' },
    { id: '/multi-ai', label: 'Système Multi-IA', icon: '🌌', badge: 'Phase 4' },
    { id: '/evolution', label: 'Évolution', icon: '🧬', badge: 'Phase 10' },
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

          {/* v∞ Super-Prompt N6 - Time Navigation (Phase 9: lazy loaded) */}
          <Route path="/time-navigator" element={<TimeNavigator />} />

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
