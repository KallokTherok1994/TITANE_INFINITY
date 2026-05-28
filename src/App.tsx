/**
 * TITANE_INFINITY v35.1.8 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v35.1.8 — APP COMPONENT - PRODUCTION READY
 *   v22Ω AI Performance Optimizations: 12 optimizations (-40% latency)
 *   Build 11.5s, Tests 1964 passed, Boot ~2s, 20 Engines Unified
 *   React Router + AppShell + Living Engines + Code Splitting
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { initializeSecurity } from './security'; // ✨ SPRINT 2: Security module initialization
import { lazyWithRetry } from './utils/lazyWithRetry'; // ✨ v35.1.2 - retry on rejected dynamic-import promise
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { useOAuthStore } from '@/core/auth/oauthStore';

import { useLivingEngines } from './hooks/useLivingEngines';
import { logger } from './lib/logger';
import { ThemeProvider } from './themes/ThemeProvider';
import { UIThemeProvider } from './features/design-center';
import { AnimationProvider } from './contexts/AnimationContext';
import { LoggingProvider } from './contexts/LoggingContext';
import { TitanStateProvider } from './context/TitanStateContext'; // ✨ v∞.MPE - Persistence
import { AppShell, TopNav } from '@components/layout';
import { BackendDownIndicator } from '@/components/system/BackendDownIndicator'; // ✨ UI vΩ Phase F - Mode dégradé
import { UpdateAvailableToast } from '@/components/system/UpdateAvailableToast'; // ✨ v34.0.13 - SW update prompt (stale-pages hotfix)
import { SurfaceTruthBadge } from '@/components/dev/SurfaceTruthBadge'; // ✨ v34.0.13 - Canonical surface truth overlay (Ctrl+Alt+T)
import { SurfaceRoot } from '@/components/system/SurfaceRoot';
import { GlobalRuntimePulse } from '@/components/system/GlobalRuntimePulse'; // ✨ v34.0.3 - Living Pulse runtime visible
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
import { useIsMobile } from '@/hooks/useResponsive';
// ✨ OPT-12: connectCacheToSingularity lazy-loaded below (removed static import)
// ✨ OPT-7: i18n is now lazy-loaded in useEffect below (removed static import)
// ✨ v35.1.8 - A11Y & performance utilities remain intentionally deferred
// consoleMonitor init moved to useAppInitialization hook
// ✨ v35.1.8 + P3: Lazy-load Aura components (heavy graphics)
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
import { useWindowControls } from './hooks/useWindowControls'; // ✨ v35.1.8 - Canonical window zoom & fullscreen controls
import { ToastProvider } from './components/providers/ToastProvider'; // ✨ M1 - Toast notifications via Sonner
import { publishActiveModuleContext } from '@/services/chat/moduleRouteContext';
import { SingularityConnections } from './services/singularityConnections';
import { GlobalTemporalContextPublisher } from '@/components/runtime/GlobalTemporalContextPublisher';
import { CommandPalette } from '@/components/palette/CommandPalette';
import { TimeToTwinBridge } from '@/components/runtime/TimeToTwinBridge';

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

// `/chat` is a legacy alias and must resolve to `/titane?tab=conversation`.

// ✨ v24.3.0 - Lazy loaded pages (code splitting)
const TimePage = lazy(() =>
  import('./pages/TimePage').then(m => ({ default: m.TimePage }))
);
const Experience = lazy(() =>
  import('./pages/Experience').then(m => ({ default: m.Experience }))
);
const TwinsPage = lazy(() =>
  import('./pages/TwinsPage').then(m => ({ default: m.default }))
);
const DocCenterPage = lazy(() =>
  import('./pages/DocCenterPage').then(m => ({ default: m.DocCenterPage }))
);

const HTFPage = lazy(() => import('./pages/HTFPage').then(m => ({ default: m.HTFPage })));

// v24.3.0 - CognitiveLayoutControl déplacé dans ADMIN (ConfigurationHub)

import './components/psyche/DeepPsychePanel.css';
// ✨ P0.Ω∞ - Splash Watchdog (Anti-freeze diagnostic)
import { SplashWatchdog } from './components/diagnostics/SplashWatchdog';
import { isRemoteContext } from './lib/transport';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { getActiveTransport } from './api/tauriClient';
import { RemoteGatewayLayout } from './pages/RemoteGatewayLayout';

// ✨ v34.2.0 — TanStack Query DevTools (DEV-only, lazy-loaded so it is tree-shaken in prod)
const ReactQueryDevtools = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then(m => ({
        default: m.ReactQueryDevtools,
      }))
    )
  : null;

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
    default: m.default,
  }))
);
const KnowledgeFusionPage = lazy(() => import('./ui/pages/KnowledgeFusionPage'));

// ✨ v24.3.0 - Core pages
const TitanePage = lazyWithRetry(
  () => import('./pages/TitanePage').then(m => ({ default: m.TitanePage })),
  'TitanePage'
);
const OrchestrationMetaCenter = lazy(() =>
  import('./pages/OrchestrationMetaCenter').then(m => ({
    default: m.OrchestrationMetaCenter,
  }))
);
// ✨ v35.1.2 — lazyWithRetry: DevPage chunk fetch retry on transient failure (root cause /admin → /dev FAIL)
const DevPage = lazyWithRetry(
  () => import('./pages/DevPage').then(m => ({ default: m.DevPage })),
  'DevPage'
);

// ✨ v35.1.8 CONSOLE MONITOR DASHBOARD - Dev-only monitoring UI
const ConsoleMonitorDashboard = lazy(() =>
  import('./components/dev/ConsoleMonitorDashboard').then(m => ({
    default: m.ConsoleMonitorDashboard,
  }))
);

// ✨ v35.1.8 PREDICTIVE DASHBOARD - ML-like error prediction & correlation
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

// ✨ TWINS — Access via dedicated page route (/twins)

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
const Memory = lazy(() => import('./pages/Memory').then(m => ({ default: m.Memory })));
const ResearchPage = lazy(() =>
  import('./pages/ResearchPage').then(m => ({ default: m.ResearchPage }))
);
const SkillManager = lazy(() =>
  import('./ui/pages/Skills/SkillManager').then(m => ({ default: m.default }))
);
const MultiProjectDashboard = lazy(() => import('./pages/MultiProjectDashboard'));

// ✨ TOTAL_DEV v35.1.8 — GOD DEV sovereign space (unlock-gated)
const TotalDevPage = lazyWithRetry(
  () => import('./pages/TotalDevPage').then(m => ({ default: m.TotalDevPage })),
  'TotalDevPage'
);

const AdminPage = lazyWithRetry(
  () =>
    import('./pages/AdminPage').then(m => ({
      default: m.default as React.ComponentType<any>,
    })),
  'AdminPage'
);
const PerfectFusionDashboard = lazy(() => import('./pages/PerfectFusionDashboard'));
const UltimateOptimizationDashboard = lazy(
  () => import('./pages/UltimateOptimizationDashboard')
);
const RealityCenter = lazy(() => import('./pages/RealityCenter'));
const CreationStudio = lazy(() => import('./pages/CreationStudio'));
const EvolutionMonitor = lazy(() => import('./pages/EvolutionMonitor'));
const SingularityMonitor = lazy(() =>
  import('./pages/SingularityMonitor').then(m => ({ default: m.default }))
);

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
export const AppRouter: React.FC = () => {
  const location = useLocation();
  const { handleCallback: handleOAuthCallback } = useOAuthStore();

  // Deep-link handler: titane://auth/callback?code=...&state=...
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    onOpenUrl(urls => {
      for (const url of urls) {
        if (url.startsWith('titane://auth/callback')) {
          void handleOAuthCallback(url);
        }
      }
    })
      .then(fn => {
        unlisten = fn;
      })
      .catch(err => {
        logger.warn('[DeepLink] onOpenUrl setup failed', { error: err });
      });
    return () => unlisten?.();
  }, [handleOAuthCallback]);

  useEffect(() => {
    emitBootMarker('BOOT:AFTER_ROUTER');
    emitBootMarker('BOOT:BEFORE_ORCHESTRATOR');
    emitBootMarker('BOOT:BEFORE_ORCHESTRATOR_INIT');
    initializeSecurity(); // ✨ Initialize security modules on app boot
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

  // ✨ v35.1.8 - Canonical desktop controls (CTRL+scroll, Ctrl+Plus/Minus/0, F11)
  useWindowControls({ enableZoom: true, enableFullscreen: true });

  useAppInitialization();

  // ✨ v35.1.8 - A11Y & performance: keyboard shortcuts and Web Vitals planned

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
  const isMobile = useIsMobile();

  // ✨ UI vΩ - Main app with TopNav (global navigation)
  return (
    <AppShell
      footerOverlay={location.pathname.startsWith('/titane')}
      topNav={
        <TopNav
          items={topNavItems}
          currentRoute={location.pathname}
          onNavigate={handleNavigate}
          maxVisibleItems={isMobile ? 3 : 5}
        />
      }
      footer={
        <span className="select-none text-xs tracking-widest font-mono text-titanium-text-secondary">
          TITANE∞ <span className="text-success-500">V{__APP_VERSION__}</span>{' '}
          <span className="text-titanium-text-secondary">· Living Pulse</span>
        </span>
      }
    >
      {/* ✨ v34.0.3 - Global Runtime Pulse (top-right overlay, probe quick_health_check 5s) */}
      <GlobalRuntimePulse />
      {/* ✨ UI vΩ Phase F: Backend down indicator (mode dégradé local-first) */}
      <BackendDownIndicator position="top" dismissible />
      {/* ✨ v34.0.13: SW update available toast (stale-pages hotfix, pairs with index.html NetworkFirst) */}
      <UpdateAvailableToast />
      {/* ✨ v34.0.13: Canonical surface truth overlay (Ctrl+Alt+T to toggle, dev/diagnostic only) */}
      <SurfaceTruthBadge />
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
      <GlobalTemporalContextPublisher />
      <TimeToTwinBridge />
      {/* ✨ v34.3.0 — Command Palette (⌘K / Ctrl+K) — keyboard-first navigation. */}
      <CommandPalette />

      {/* Phase 9: Suspense boundary for lazy-loaded routes */}
      <SurfaceRoot id="app-root" ring="core">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Main Routes — TITANE Homepage */}
            <Route path="/" element={<Navigate to="/titane" replace />} />
            <Route path="/titane.sh" element={<Navigate to="/titane" replace />} />
            <Route path="/titane.sh/*" element={<Navigate to="/titane" replace />} />
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
            <Route
              path="/chat"
              element={<Navigate to="/titane?tab=conversation" replace />}
            />
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
            <Route
              path="/progression"
              element={<Navigate to="/titane?tab=progression" replace />}
            />
            <Route path="/xp" element={<Navigate to="/experience" replace />} />
            {/* /cognitive redirigé vers DEV Cockpit > Diagnostics */}
            <Route
              path="/cognitive"
              element={<Navigate to="/dev?tab=diagnostics" replace />}
            />
            {/* /stats fusionné dans DEV Cockpit > Diagnostics */}
            <Route
              path="/stats"
              element={<Navigate to="/dev?tab=diagnostics" replace />}
            />
            <Route path="/experience" element={<Experience />} />{' '}
            {/* ✨ v∞.D5 - Page XP */}
            {/* ✨ v35.1.8 TIME CENTER - Temporal Flow + Agenda + Time Navigator */}
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
            {/* ✨ v35.1.8 ADMIN CENTER - Module ADMIN unifié */}
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
            <Route
              path="/devtools"
              element={<Navigate to="/admin?tab=system&systemTab=devtools" replace />}
            />
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
            <Route
              path="/settings"
              element={<Navigate to="/admin?tab=config" replace />}
            />
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
            {/* ✨ v35.1.8 - FUSION DASHBOARD - Perfect Backend/Frontend Integration */}
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
            {/* ✨ v35.1.8 - ULTIMATE OPTIMIZATION - Phase 12: GPU/WASM/Cache/IndexedDB */}
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
            <Route
              path="/meta"
              element={<Navigate to="/orchestration-center" replace />}
            />
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
            {/* ✨ v35.1.8 DEV CENTER - Fusion Complete (4 modules → 1) */}
            <Route
              path="/dev"
              element={
                <ErrorBoundary context="DevCenter">
                  <DevPage />
                </ErrorBoundary>
              }
            />
            {/* ✨ TOTAL_DEV v35.1.8 — GOD DEV sovereign space */}
            <Route
              path="/total-dev"
              element={
                <ErrorBoundary context="TotalDev">
                  <TotalDevPage />
                </ErrorBoundary>
              }
            />
            {/* Redirections des anciens modules vers DEV */}
            <Route
              path="/one-core"
              element={<Navigate to="/dev?tab=overview" replace />}
            />
            <Route
              path="/command-center"
              element={<Navigate to="/dev?tab=operations" replace />}
            />
            <Route
              path="/unified"
              element={<Navigate to="/dev?tab=overview" replace />}
            />
            <Route
              path="/qa-monitoring"
              element={<Navigate to="/dev?tab=validation" replace />}
            />
            <Route path="/qa" element={<Navigate to="/dev?tab=validation" replace />} />
            <Route
              path="/monitoring"
              element={<Navigate to="/dev?tab=diagnostics" replace />}
            />
            <Route
              path="/tests"
              element={<Navigate to="/dev?tab=validation" replace />}
            />
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
            <Route
              path="/ia-dev"
              element={<Navigate to="/dev?tab=operations" replace />}
            />
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
            <Route
              path="/intelligence"
              element={<Navigate to="/hyper-center" replace />}
            />
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
            {/* ✨ TWINS — Page dédiée, accessible via menu Plus */}
            <Route path="/identity-center" element={<Navigate to="/twins" replace />} />
            <Route path="/identity" element={<Navigate to="/twins" replace />} />
            <Route path="/persona" element={<Navigate to="/twins" replace />} />
            <Route
              path="/twins"
              element={
                <ErrorBoundary context="TwinsPage">
                  <TwinsPage />
                </ErrorBoundary>
              }
            />
            <Route path="/twin" element={<Navigate to="/twins" replace />} />
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
            {/* Routes historiques → redirections canoniques DEV/TITANE */}
            <Route path="/sentinel" element={<Sentinel />} />
            <Route path="/watchdog" element={<Navigate to="/dev" replace />} />
            <Route path="/selfheal" element={<Navigate to="/dev" replace />} />
            <Route path="/adaptive" element={<Navigate to="/dev" replace />} />
            <Route path="/memory" element={<Memory />} />
            <Route path="/research" element={<ResearchPage />} />
            {/* ✨ Skill OS — Import/manage external skills */}
            <Route path="/skills" element={<SkillManager />} />
            <Route
              path="/multiproject"
              element={
                <ErrorBoundary context="MultiProjectDashboard">
                  <MultiProjectDashboard />
                </ErrorBoundary>
              }
            />
            {/* ✨ v31.1.0 — DOC CENTER — Export DOCX natif */}
            <Route
              path="/doc-center"
              element={
                <ErrorBoundary context="DocCenterPage">
                  <DocCenterPage />
                </ErrorBoundary>
              }
            />
            <Route path="/doc" element={<Navigate to="/doc-center" replace />} />
            {/* HTF Module — L'Humain à tout faire */}
            <Route
              path="/htf"
              element={
                <ErrorBoundary context="HTFPage">
                  <HTFPage />
                </ErrorBoundary>
              }
            />
            {/* System Routes (Phase 9: lazy loaded) */}
            <Route path="/performance" element={<PerformanceTest />} />
            {/* Catch-all - Redirection vers Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </SurfaceRoot>

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

      {/* ✨ v35.1.8 - Keyboard Shortcuts Help: Planned for future release */}

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

// ✨ GitHub Pages / subdirectory support: use absolute base or fallback to '/'
const routerBase = import.meta.env.BASE_URL?.startsWith('/')
  ? import.meta.env.BASE_URL
  : '/';

/**
 * ═══════════════════════════════════════════════════════════════
 * APP COMPONENT - Point d'entrée principal avec Auto-Heal
 * ThemeProvider > AnimationProvider > TitanStateProvider > BrowserRouter > AutoHealErrorBoundary
 * ═══════════════════════════════════════════════════════════════
 */
const App: React.FC = () => {
  // ✨ v34.1.0 — hierarchical transport probe (tauri | remote | degraded)
  //   Result is pushed into useTransportState and consumed by SurfaceTruthBadge,
  //   RemoteGatewayLayout and any future debugging surface.
  useEffect(() => {
    void getActiveTransport({ force: true });
  }, []);

  // ⭐ PHASE 2: BOOT DIAGNOSTIC MARKER
  if (typeof window !== 'undefined') {
    window.__TITANE_BOOT__ = window.__TITANE_BOOT__ || {};
    const bootState = window.__TITANE_BOOT__;

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

  const isAutomatedBrowser =
    typeof navigator !== 'undefined' &&
    (navigator.webdriver || /HeadlessChrome|Playwright/i.test(navigator.userAgent || ''));

  return (
    <QueryClientProvider client={queryClient}>
      {import.meta.env.DEV && !isAutomatedBrowser && ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </Suspense>
      )}
      <ToastProvider>
        {/* ✨ Remote browser mode — wrap entire app in auth guard */}
        {isRemoteContext() ? (
          <RemoteGatewayLayout>
            <ThemeProvider>
              <UIThemeProvider>
                <LoggingProvider>
                  <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
                    <TitanStateProvider>
                      <BrowserRouter basename={routerBase}>
                        <AutoHealErrorBoundary>
                          <AppRouter />
                        </AutoHealErrorBoundary>
                      </BrowserRouter>
                    </TitanStateProvider>
                  </AnimationProvider>
                </LoggingProvider>
              </UIThemeProvider>
            </ThemeProvider>
          </RemoteGatewayLayout>
        ) : (
          <>
            {/* ✨ P0.Ω∞ - Splash Watchdog: Diagnostic si boot timeout (10s) — Tauri only */}
            <SplashWatchdog />

            <ThemeProvider>
              <UIThemeProvider>
                <LoggingProvider>
                  <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
                    <TitanStateProvider>
                      {/* ✨ v35.1.8 - Console Monitor Dashboard (Dev only) */}
                      {import.meta.env.DEV && (
                        <Suspense fallback={null}>
                          <ConsoleMonitorDashboard />
                        </Suspense>
                      )}

                      {/* ✨ v35.1.8 - Predictive AI Dashboard (Dev only) */}
                      {import.meta.env.DEV && (
                        <Suspense fallback={null}>
                          <PredictiveDashboard />
                        </Suspense>
                      )}

                      {/* ✨ v35.1.8 - Quantum Particles Background (Global) - Connected to Aura Orchestrator */}
                      <AuraConnectedParticles />

                      <BrowserRouter basename={routerBase}>
                        <AutoHealErrorBoundary>
                          <AppRouter />
                        </AutoHealErrorBoundary>
                      </BrowserRouter>
                    </TitanStateProvider>
                  </AnimationProvider>
                </LoggingProvider>
              </UIThemeProvider>
            </ThemeProvider>
          </>
        )}
      </ToastProvider>
    </QueryClientProvider>
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
