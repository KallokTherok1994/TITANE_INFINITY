/**
 * TITANE_INFINITY v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — APP COMPONENT - PRODUCTION READY
 *   v22Ω AI Performance Optimizations: 12 optimizations (-40% latency)
 *   Build 11.5s, Tests 1964 passed, Boot ~2s, 20 Engines Unified
 *   React Router + AppShell + Living Engines + Code Splitting
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { useLivingEngines } from './hooks';
import { logger } from './lib/logger';
import { ThemeProvider } from './themes/ThemeProvider';
import { UIThemeProvider } from './features/design-center';
import { AnimationProvider } from './contexts/AnimationContext';
import { TitanStateProvider } from './context/TitanStateContext'; // ✨ v∞.MPE - Persistence
import { AppShell, TopNav } from '@components/layout';
import { BackendDownIndicator } from '@/components/system/BackendDownIndicator'; // ✨ UI vΩ Phase F - Mode dégradé
import { Button } from './ui';
// ✨ P3: Lazy-load XP bar for smaller initial bundle
const XPBar = lazy(() =>
  import('./components/experience/XPBar').then(m => ({ default: m.XPBar }))
);
import { AutoHealErrorBoundary } from './components/AutoHealErrorBoundary';
import { ErrorBoundary } from './components/ErrorBoundary'; // ✨ v19 - Security Hardening
import {
  detectEnvironment,
  shouldBlockLoading as _shouldBlockLoading,
  logEnvironmentWarnings,
} from './core/tauri/environment';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';
// ✨ OPT-10: autoAuditEngine lazy-loaded below (removed static import)
import { TitaneLogo } from './components/branding/TitaneLogo'; // ✨ v∞ - Logo Reactor
import { PageLoadingFallback } from './ui/components/PageLoadingFallback'; // ✨ v19.5.2 - Enhanced loading
// ✨ OPT-10: initializeMicroInteractions lazy-loaded below (removed static import)
import { ToastContainer } from './ui/components/Toast'; // ✨ v19.5.2 - Toast notifications
import { useToasts, useToastActions } from './stores/uiStore.selectors'; // ✨ v29.1.0 - Optimized selectors
// Sidebar state removed in UI vΩ - Navigation moved to TopNav
// import { useSingularitySidebarCollapsed, useContextActions } from './core/state/SingularityState.selectors';
import { useAppInitialization } from './hooks/useAppInitialization';
import { useTopNavigation } from './hooks/useTopNavigation';
// ✨ OPT-12: connectCacheToSingularity lazy-loaded below (removed static import)
// ✨ OPT-7: i18n is now lazy-loaded in useEffect below (removed static import)
// ✨ v30.0.0 - A11Y & performance utilities remain intentionally deferred
// consoleMonitor init moved to useAppInitialization hook
// ✨ v30.0.0 + P3: Lazy-load Aura components (heavy graphics)
const QuantumParticles = lazy(() =>
  import('./components/aura/QuantumParticles').then(m => ({
    default: m.QuantumParticles,
  }))
);
const AuraControlPanel = lazy(() =>
  import('./components/aura/AuraControlPanel').then(m => ({
    default: m.AuraControlPanel,
  }))
);
import { useAura } from './hooks/useAuraOrchestrator';
import { useWindowControls } from './hooks/useWindowControls'; // ✨ v30.0.0 - Window zoom & fullscreen controls
import { useZoomControl } from './hooks/useZoomControl'; // ✨ Sprint 6 Phase 3 - Zoom control
import { ToastProvider } from './components/providers/ToastProvider'; // ✨ M1 - Toast notifications via Sonner
import { publishActiveModuleContext } from '@/services/chat/moduleRouteContext';
import { SingularityConnections } from './services/singularityConnections';

/**
 * 🔐 POLITIQUE DE SÉCURITÉ ENVIRONNEMENT - FALLBACK GOUVERNÉ
 *
 * Mode gouverné:
 *   - ✅ Tauri dev/prod: chemin nominal autorisé
 *   - ✅ Browser dev/prod: fallback local limité et explicite
 *   - ⚠️ Les indisponibilités backend restent visibles via logs/UI
 *   - 🚫 Aucun faux état "open", "complete" ou déverrouillage simulé
 */
if (typeof window !== 'undefined') {
  const env = detectEnvironment();

  // Log environnement non-bloquant; les erreurs restent visibles dans l'UI.
  logEnvironmentWarnings();

  logger.info('TITANE∞ démarré - fallback gouverné', {
    component: 'Environment',
    origin: env.origin,
    mode: env.isDev ? 'Development' : 'Production',
    runtime: env.isTauri ? 'Tauri' : 'Browser',
  });
}

// ✨ v30 - Chat page (main feature)
const ChatPage = lazy(() =>
  import('./pages/ChatPage').then(m => ({ default: m.ChatPage }))
);

// ✨ v24.3.0 - Lazy loaded pages (code splitting)
const TimePage = lazy(() =>
  import('./pages/TimePage').then(m => ({ default: m.TimePage }))
);
const Experience = lazy(() =>
  import('./pages/Experience').then(m => ({ default: m.Experience }))
);

// v24.3.0 - CognitiveLayoutControl déplacé dans ADMIN (ConfigurationHub)

import './components/psyche/DeepPsychePanel.css';
// ✨ P0.Ω∞ - Splash Watchdog (Anti-freeze diagnostic)
import { SplashWatchdog } from './components/diagnostics/SplashWatchdog';

type LazyModule<T> = { default: T };

const lazyWithTimeout = <T extends React.ComponentType>(
  loader: () => Promise<LazyModule<T>>,
  options: { timeoutMs: number; label: string }
) =>
  lazy<T>(() => {
    const timeoutPromise = new Promise<LazyModule<T>>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Lazy load timeout: ${options.label}`));
      }, options.timeoutMs);
    });
    return Promise.race([loader(), timeoutPromise]);
  });

// ✨ v24.3.0 - Lazy loaded pages
const PerformanceTest = lazy(() =>
  import('./pages/PerformanceTest').then(m => ({
    default: m.PerformanceTest,
  }))
);
const KnowledgeFusionPage = lazy(() => import('./ui/pages/KnowledgeFusionPage'));

// ✨ v24.3.0 - Core pages
const TitanePage = lazyWithTimeout(
  () => import('./pages/TitanePage').then(m => ({ default: m.TitanePage })),
  {
    // Dev startup can be slower while Vite compiles large page chunks.
    timeoutMs: import.meta.env.DEV ? 120000 : 20000,
    label: 'TitanePage',
  }
);
const OrchestrationMetaCenter = lazy(() =>
  import('./pages/OrchestrationMetaCenter').then(m => ({
    default: m.OrchestrationMetaCenter,
  }))
);
const DevPage = lazy(() => import('./pages/DevPage').then(m => ({ default: m.DevPage })));

// ✨ v30.0.0 CONSOLE MONITOR DASHBOARD - Dev-only monitoring UI
const ConsoleMonitorDashboard = lazy(() =>
  import('./components/dev/ConsoleMonitorDashboard').then(m => ({
    default: m.ConsoleMonitorDashboard,
  }))
);

// ✨ v30.0.0 PREDICTIVE DASHBOARD - ML-like error prediction & correlation
const PredictiveDashboard = lazy(() =>
  import('./components/dev/PredictiveDashboard').then(m => ({
    default: m.PredictiveDashboard,
  }))
);

// ✨ HYPER CENTER - Hyper-Intelligence Engine v∞ (OPUS #20)
const HyperCenter = lazy(() =>
  import('./components/HyperCenter/HyperCenter').then(m => ({
    default: m.default,
  }))
);

// ✨ QUANTUM CENTER - Quantum Rendering Layer v∞ (OPUS #17)
const QuantumCenter = lazy(() =>
  import('./components/QuantumCenter/QuantumCenter').then(m => ({
    default: m.default,
  }))
);

// ✨ TWINS — Fully unified (Identity + Twins + Persona → /titane?tab=twins)

// ✨ MEMORY EVOLUTION - fusionné dans Transform (v30 fusion, lazy import conservé dans TransformationSection)

// ✨ CLOUD CENTER - Cloud Sync & Vault Engine v∞
const CloudCenter = lazy(() =>
  import('./pages/CloudCenter').then(m => ({ default: m.CloudCenter }))
);

const OrchestrationIntelligenceCenter = lazy(
  () => import('./modules/OrchestrationIntelligenceCenter')
);

// ✨ v24.3.0 - Engine pages
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
const ResearchPage = lazy(() =>
  import('./pages/ResearchPage').then(m => ({ default: m.ResearchPage }))
);
const SkillManager = lazy(() =>
  import('./ui/pages/Skills/SkillManager').then(m => ({ default: m.default }))
);

// ✨ TOTAL_DEV v30.0.0 — GOD DEV sovereign space (unlock-gated)
const TotalDevPage = lazy(() =>
  import('./pages/TotalDevPage').then(m => ({ default: m.TotalDevPage }))
);

const AdminPage = lazy(() => import('./pages/AdminPage'));
const PerfectFusionDashboard = lazy(() => import('./pages/PerfectFusionDashboard'));
const UltimateOptimizationDashboard = lazy(
  () => import('./pages/UltimateOptimizationDashboard')
);
const RealityCenter = lazy(() => import('./pages/RealityCenter'));
const CreationStudio = lazy(() => import('./pages/CreationStudio'));
const EvolutionMonitor = lazy(() => import('./pages/EvolutionMonitor'));
const SingularityMonitor = lazy(() => import('./pages/SingularityMonitor'));

const emitBootMarker = (marker: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.__TITANE_EMIT_BOOT_MARKER__?.(marker);
};

/**
 * ═══════════════════════════════════════════════════════════════
 * APP ROUTER - Composant interne avec accès au router + Living Engines
 * ═══════════════════════════════════════════════════════════════
 */
const AppRouter: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    emitBootMarker('BOOT:AFTER_ROUTER');
    emitBootMarker('BOOT:BEFORE_ORCHESTRATOR');
    emitBootMarker('BOOT:BEFORE_ORCHESTRATOR_INIT');
  }, []);

  useEffect(() => {
    const routeWithState = `${location.pathname}${location.search}`;

    try {
      publishActiveModuleContext(routeWithState);
      void SingularityConnections.syncUIState(routeWithState);
    } catch (error) {
      logger.warn('Failed to sync active UI/module context', {
        component: 'AppRouter',
        route: routeWithState,
        error,
      });
    }
  }, [location.pathname, location.search]);

  // UI vΩ: Sidebar removed, TopNav navigation only
  // const sidebarCollapsed = useSingularitySidebarCollapsed();
  // const { toggleSidebar } = useContextActions();

  // ✨ v19.5.2 - Toast system
  const toasts = useToasts();
  const { removeToast } = useToastActions();

  // ✨ v30.0.0 - Window zoom & fullscreen controls (CTRL+scroll, F11)
  useWindowControls({ enableZoom: true, enableFullscreen: true });

  // ✨ Sprint 6 Phase 3 - Keyboard zoom controls (Ctrl+Plus/Minus/0)
  useZoomControl();

  useAppInitialization();

  // ✨ v30.0.0 - A11Y & performance: keyboard shortcuts and Web Vitals planned

  // 🌟 Initialize Living Engines v21-v24
  const livingEngines = useLivingEngines(100); // Update every 100ms

  useEffect(() => {
    if (!livingEngines.state.initialized) {
      return;
    }
    emitBootMarker('BOOT:AFTER_ORCHESTRATOR');
    emitBootMarker('BOOT:AFTER_ORCHESTRATOR_INIT');
    emitBootMarker('BOOT:READY');
  }, [livingEngines.state.initialized]);

  useEffect(() => {
    if (!livingEngines.state.initialized || !import.meta.env.DEV) {
      return;
    }

    logger.debug('Living engines initialized', {
      component: 'AppRouter',
      persona: livingEngines.state.persona?.mood ?? 'unknown',
      glow: Number(livingEngines.state.glow.toFixed(2)),
      cognitiveLoad: Number(livingEngines.state.cognitiveLoad.toFixed(2)),
    });
  }, [livingEngines.state.initialized]);

  // ✨ UI vΩ: TopNav items + navigation (extracted to useTopNavigation hook)
  const { topNavSections, topNavItems, handleNavigate } = useTopNavigation();

  // ✨ UI vΩ - Main app with TopNav (global navigation)
  return (
    <AppShell
      topNav={
        <TopNav
          items={topNavItems}
          currentRoute={location.pathname}
          onNavigate={handleNavigate}
          maxVisibleItems={5}
        />
      }
    >
      {/* ✨ UI vΩ Phase F: Backend down indicator (mode dégradé local-first) */}
      <BackendDownIndicator position="top" dismissible />
      <div
        data-testid="app-ready"
        data-state="ready"
        aria-hidden="true"
        style={{ display: 'none' }}
      />
      <div
        data-testid="ipc-ready"
        data-state={isTauriRuntimeAvailable() ? 'ready' : 'fallback'}
        aria-hidden="true"
        style={{ display: 'none' }}
      />

      {/* Phase 9: Suspense boundary for lazy-loaded routes */}
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Main Routes — TITANE Homepage */}
          <Route path="/" element={<Navigate to="/titane" replace />} />
          {/* ⚡ TITANE - LE CŒUR DU SYSTÈME (Chat IA + Vision + EVO unifiés) */}
          <Route
            path="/titane"
            element={
              <ErrorBoundary context="TitanePage">
                <TitanePage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers TITANE */}
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
          <Route path="/xp" element={<Navigate to="/experience" replace />} />
          {/* /cognitive redirigé vers DEV Cockpit > Diagnostics */}
          <Route
            path="/cognitive"
            element={<Navigate to="/dev?tab=diagnostics" replace />}
          />
          {/* /stats fusionné dans DEV Cockpit > Diagnostics */}
          <Route path="/stats" element={<Navigate to="/dev?tab=diagnostics" replace />} />
          <Route path="/experience" element={<Experience />} /> {/* ✨ v∞.D5 - Page XP */}
          {/* ✨ v30.0.0 TIME CENTER - Temporal Flow + Agenda + Time Navigator */}
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
          {/* ✨ v30.0.0 ADMIN CENTER - Module ADMIN unifié */}
          <Route
            path="/admin"
            element={
              <ErrorBoundary context="AdminCenter">
                <AdminPage />
              </ErrorBoundary>
            }
          />
          {/* Redirections vers ADMIN Center */}
          <Route
            path="/system-center"
            element={<Navigate to="/admin?tab=system" replace />}
          />
          <Route
            path="/diagnostics"
            element={<Navigate to="/admin?tab=production-health" replace />}
          />
          <Route path="/devtools" element={<Navigate to="/admin?tab=system" replace />} />
          <Route
            path="/cluster"
            element={<Navigate to="/admin?tab=production-health" replace />}
          />
          <Route
            path="/introspection"
            element={<Navigate to="/admin?tab=system" replace />}
          />
          <Route
            path="/hypervision"
            element={<Navigate to="/admin?tab=system" replace />}
          />
          <Route
            path="/configuration"
            element={<Navigate to="/admin?tab=config" replace />}
          />
          <Route
            path="/design-center"
            element={<Navigate to="/admin?tab=design" replace />}
          />
          <Route
            path="/design-system"
            element={<Navigate to="/admin?tab=design" replace />}
          />
          <Route path="/settings" element={<Navigate to="/admin?tab=config" replace />} />
          <Route
            path="/governance-center"
            element={<Navigate to="/admin?tab=governance" replace />}
          />
          <Route
            path="/governance"
            element={<Navigate to="/admin?tab=governance" replace />}
          />
          <Route
            path="/secure"
            element={<Navigate to="/admin?tab=governance" replace />}
          />
          <Route
            path="/audio-center"
            element={<Navigate to="/admin?tab=audio" replace />}
          />
          <Route path="/audio" element={<Navigate to="/admin?tab=audio" replace />} />
          <Route path="/voice" element={<Navigate to="/admin?tab=audio" replace />} />
          <Route path="/tts" element={<Navigate to="/admin?tab=audio" replace />} />
          {/* ✨ v30.0.0 - FUSION DASHBOARD - Perfect Backend/Frontend Integration */}
          <Route
            path="/fusion"
            element={
              <ErrorBoundary context="PerfectFusionDashboard">
                <Suspense fallback={<PageLoadingFallback variant="dashboard" />}>
                  <PerfectFusionDashboard />
                </Suspense>
              </ErrorBoundary>
            }
          />
          {/* ✨ v30.0.0 - ULTIMATE OPTIMIZATION - Phase 12: GPU/WASM/Cache/IndexedDB */}
          <Route
            path="/optimization"
            element={
              <ErrorBoundary context="UltimateOptimizationDashboard">
                <Suspense fallback={<PageLoadingFallback variant="dashboard" />}>
                  <UltimateOptimizationDashboard />
                </Suspense>
              </ErrorBoundary>
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
          {/* ✨ v24 ORCHESTRATION META CENTER - Centre Unifié (#9) */}
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
          {/* ✨ v30.0.0 DEV CENTER - Fusion Complete (4 modules → 1) */}
          <Route
            path="/dev"
            element={
              <ErrorBoundary context="DevCenter">
                <DevPage />
              </ErrorBoundary>
            }
          />
          {/* ✨ TOTAL_DEV v30.0.0 — GOD DEV sovereign space */}
          <Route
            path="/total-dev"
            element={
              <ErrorBoundary context="TotalDev">
                <TotalDevPage />
              </ErrorBoundary>
            }
          />
          {/* Redirections des anciens modules vers DEV */}
          <Route path="/one-core" element={<Navigate to="/dev?tab=overview" replace />} />
          <Route
            path="/command-center"
            element={<Navigate to="/dev?tab=operations" replace />}
          />
          <Route path="/unified" element={<Navigate to="/dev?tab=overview" replace />} />
          <Route
            path="/qa-monitoring"
            element={<Navigate to="/dev?tab=validation" replace />}
          />
          <Route path="/qa" element={<Navigate to="/dev?tab=validation" replace />} />
          <Route
            path="/monitoring"
            element={<Navigate to="/dev?tab=diagnostics" replace />}
          />
          <Route path="/tests" element={<Navigate to="/dev?tab=validation" replace />} />
          <Route
            path="/developer-mode"
            element={<Navigate to="/dev?tab=operations" replace />}
          />
          <Route
            path="/dev-mode"
            element={<Navigate to="/dev?tab=operations" replace />}
          />
          <Route
            path="/devmode"
            element={<Navigate to="/dev?tab=operations" replace />}
          />
          <Route path="/ia-dev" element={<Navigate to="/dev?tab=operations" replace />} />
          {/* Note: /orchestration-intelligence et /orchestration-center ont leurs propres composants ci-dessus */}
          <Route
            path="/orchestration"
            element={<Navigate to="/orchestration-intelligence" replace />}
          />
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
          {/* ✨ TWINS — Fully unified (Identity + Twins + Persona) */}
          <Route path="/identity-center" element={<Navigate to="/titane?tab=twins" replace />} />
          <Route path="/identity" element={<Navigate to="/titane?tab=twins" replace />} />
          <Route path="/persona" element={<Navigate to="/titane?tab=twins" replace />} />
          <Route path="/twins" element={<Navigate to="/titane?tab=twins" replace />} />
          <Route path="/twin" element={<Navigate to="/titane?tab=twins" replace />} />
          {/* ✨ MEMORY EVOLUTION - Memory Evolution Engine++ v∞ (OPUS #14) */}
          <Route
            path="/memory-evolution"
            element={<Navigate to="/titane?tab=transformation" replace />}
          />
          <Route
            path="/memory-evo"
            element={<Navigate to="/titane?tab=transformation" replace />}
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
          {/* Routes historiques fusionnées vers les surfaces DEV/TITANE actives */}
          <Route path="/sentinel" element={<Sentinel />} />
          <Route path="/watchdog" element={<Watchdog />} />
          <Route path="/selfheal" element={<SelfHeal />} />
          <Route path="/adaptive" element={<AdaptiveEngine />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/research" element={<ResearchPage />} />
          {/* ✨ Skill OS — Import/manage external skills */}
          <Route path="/skills" element={<SkillManager />} />
          {/* System Routes (Phase 9: lazy loaded) */}
          <Route path="/performance" element={<PerformanceTest />} />
          {/* Catch-all - Redirection vers Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* ✨ v∞.26.0 - Hybrid Engine (Super Prompt #16 - AI + DEV CONSOLE FUSION ⚡🧠) */}
      {/* DÉSACTIVÉ v19.5.0 - Doublon avec le chat de page dédié */}
      {/* <Suspense fallback={null}>
        <HybridBubble initialMode="bubble" />
      </Suspense> */}

      {/* v∞.27.0 - Cognitive Layout Control déplacé dans ADMIN (ConfigurationHub) */}

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

      {/* ✨ v30.0.0 - Keyboard Shortcuts Help: Planned for future release */}

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
  // ⭐ PHASE 2: BOOT DIAGNOSTIC MARKER
  if (typeof window !== 'undefined') {
    (window as any).__TITANE_BOOT__ = (window as any).__TITANE_BOOT__ || {};
    const bootState = (window as any).__TITANE_BOOT__;

    if (!bootState.app_render) {
      bootState.app_render = true;
      bootState.app_render_timestamp = Date.now();
      bootState.stage = '[BOOT] App render';
      bootState.timestamp = Date.now();
    }

    if (import.meta.env.DEV && !bootState.app_render_logged) {
      logger.debug('[BOOT] App render', { component: 'App' });
      bootState.app_render_logged = true;
    }
  }

  return (
    <ToastProvider>
      {/* ✨ P0.Ω∞ - Splash Watchdog: Diagnostic si boot timeout (10s) */}
      <SplashWatchdog />

      <ThemeProvider>
        <UIThemeProvider>
          <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
            <TitanStateProvider>
              {/* ✨ v30.0.0 - Console Monitor Dashboard (Dev only) */}
              {import.meta.env.DEV && (
                <Suspense fallback={null}>
                  <ConsoleMonitorDashboard />
                </Suspense>
              )}

              {/* ✨ v30.0.0 - Predictive AI Dashboard (Dev only) */}
              {import.meta.env.DEV && (
                <Suspense fallback={null}>
                  <PredictiveDashboard />
                </Suspense>
              )}

              {/* ✨ v30.0.0 - Quantum Particles Background (Global) - Connected to Aura Orchestrator */}
              <AuraConnectedParticles />

              <BrowserRouter>
                <AutoHealErrorBoundary>
                  <AppRouter />
                </AutoHealErrorBoundary>
              </BrowserRouter>
            </TitanStateProvider>
          </AnimationProvider>
        </UIThemeProvider>
      </ThemeProvider>
    </ToastProvider>
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
