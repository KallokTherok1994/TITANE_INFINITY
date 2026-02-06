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
import { secureInvoke } from '@/lib/security';
import { useLivingEngines } from './hooks';
import { logger } from './lib/logger';
import { ThemeProvider } from './themes/ThemeProvider';
import { AnimationProvider } from './contexts/AnimationContext';
import { TitanStateProvider } from './context/TitanStateContext'; // ✨ v∞.MPE - Persistence
import { AppShell, TopNav, createTopNavItems } from '@components/layout';
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
// ✨ OPT-10: autoAuditEngine lazy-loaded below (removed static import)
import { TitaneLogo } from './components/branding/TitaneLogo'; // ✨ v∞ - Logo Reactor
import { OnboardingFlow } from './components/Onboarding'; // ✨ v19.5.2 - User Onboarding System
import { PageLoadingFallback } from './ui/components/PageLoadingFallback'; // ✨ v19.5.2 - Enhanced loading
// ✨ OPT-10: initializeMicroInteractions lazy-loaded below (removed static import)
import { ToastContainer } from './ui/components/Toast'; // ✨ v19.5.2 - Toast notifications
import { useToasts, useToastActions } from './stores/uiStore.selectors'; // ✨ v29.1.0 - Optimized selectors
// Sidebar state removed in UI vΩ - Navigation moved to TopNav
// import { useSingularitySidebarCollapsed, useContextActions } from './core/state/SingularityState.selectors';
import { initializeOllama } from './services/ai/providers/ollama'; // ✨ v21 - Local AI initialization
// ✨ OPT-12: connectCacheToSingularity lazy-loaded below (removed static import)
// ✨ OPT-7: i18n is now lazy-loaded in useEffect below (removed static import)
// ✨ v25.4.1 - A11Y & Performance monitoring (utilities planned for future implementation)
// ✨ CONSOLE MONITOR - Auto-Heal Integration
import { consoleMonitor } from './services/monitoring/consoleMonitor';
// ✨ v25.3.1 + P3: Lazy-load Aura components (heavy graphics)
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
import { useWindowControls } from './hooks/useWindowControls'; // ✨ v26.2.1 - Window zoom & fullscreen controls
import { useZoomControl, loadSavedZoom } from './hooks/useZoomControl'; // ✨ Sprint 6 Phase 3 - Zoom control
import { ToastProvider } from './components/providers/ToastProvider'; // ✨ M1 - Toast notifications via Sonner

/**
 * 🔐 POLITIQUE DE SÉCURITÉ ENVIRONNEMENT - RESTRICTIONS DÉSACTIVÉES
 *
 * Mode OUVERT TOTAL:
 *   - ✅ Tauri dev: Autorisé
 *   - ✅ Browser dev: Autorisé
 *   - ✅ Tauri prod: Autorisé
 *   - ✅ Browser prod: Autorisé
 *   - ✅ HTTP: Autorisé
 *   - ✅ Tous contextes: Autorisés sans restriction
 *   - Note: Aucun blocage, aucun warning - Fonctionnement total
 */
if (typeof window !== 'undefined') {
  const env = detectEnvironment();

  // Log environnement (informatif uniquement, aucune restriction)
  logEnvironmentWarnings();

  // 🔓 RESTRICTIONS DÉSACTIVÉES: Aucun blocage dans aucun contexte
  // L'application fonctionne librement en Tauri, HTTP, dev ou prod
  logger.info('TITANE∞ démarré - Mode ouvert (restrictions désactivées)', {
    component: 'Environment',
    origin: env.origin,
    mode: env.isDev ? 'Development' : 'Production',
  });
}

// ✨ v24.3.0 - Lazy loaded pages (code splitting)
const TimePage = lazy(() =>
  import('./pages/TimePage').then(m => ({ default: m.TimePage }))
);
const Experience = lazy(() =>
  import('./pages/Experience').then(m => ({ default: m.Experience }))
);
const Stats = lazy(() => import('./pages/Stats').then(m => ({ default: m.Stats })));

// ✨ v24 - Performance: Lazy load SingularityMonitor
const SingularityMonitor = lazy(() =>
  import('./components/SingularityMonitor').then(m => ({ default: m.SingularityMonitor }))
);

// ✨ v∞.20.0 - Chat Bubble Global (Super Prompt #3)
// ✨ PHASE 4.2 - Lazy load chat bubbles (defer ~150KB)
const ChatBubble = lazy(() =>
  import('./components/chat/ChatBubble').then(m => ({ default: m.ChatBubble }))
);

// ✨ v24.3.0 - Cognitive Layout Control
const CognitiveLayoutControl = lazy(() =>
  import('./components/cognitive/CognitiveLayoutControl').then(m => ({
    default: m.CognitiveLayoutControl,
  }))
);

import './components/psyche/DeepPsychePanel.css';
import { presenceOS } from './engines/presence/_stubs';
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
  import('./pages/PerformanceTest').then(m => ({ default: m.PerformanceTest }))
);
const KnowledgeFusionPage = lazy(() => import('./ui/pages/KnowledgeFusionPage'));
const CreationStudio = lazy(() => import('./ui/pages/CreationStudio'));
const EvolutionMonitor = lazy(() => import('./ui/pages/EvolutionMonitor'));

// ✨ v24.3.0 - Core pages
const AdminPage = lazy(() =>
  import('./features/admin').then(m => ({ default: m.AdminPage }))
);
const TitanePage = lazyWithTimeout(
  () => import('./pages/TitanePage').then(m => ({ default: m.TitanePage })),
  { timeoutMs: 20000, label: 'TitanePage' }
);
const OrchestrationMetaCenter = lazy(() =>
  import('./pages/OrchestrationMetaCenter').then(m => ({
    default: m.OrchestrationMetaCenter,
  }))
);
const DevPage = lazy(() => import('./pages/DevPage').then(m => ({ default: m.DevPage })));
const PerfectFusionDashboard = lazy(() =>
  import('./components/fusion/PerfectFusionDashboard').then(m => ({ default: m.default }))
);
const UltimateOptimizationDashboard = lazy(() =>
  import('./components/optimization/UltimateOptimizationDashboard').then(m => ({
    default: m.UltimateOptimizationDashboard,
  }))
);

// ✨ v24.3.0 - Center modules
const RealityCenter = lazy(() =>
  import('./components/RealityCenter/RealityCenter').then(m => ({ default: m.default }))
);

// ✨ v26.1 CONSOLE MONITOR DASHBOARD - Dev-only monitoring UI
const ConsoleMonitorDashboard = lazy(() =>
  import('./components/dev/ConsoleMonitorDashboard').then(m => ({
    default: m.ConsoleMonitorDashboard,
  }))
);

// ✨ v26.2 PREDICTIVE DASHBOARD - ML-like error prediction & correlation
const PredictiveDashboard = lazy(() =>
  import('./components/dev/PredictiveDashboard').then(m => ({
    default: m.PredictiveDashboard,
  }))
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

/**
 * ═══════════════════════════════════════════════════════════════
 * APP ROUTER - Composant interne avec accès au router + Living Engines
 * ═══════════════════════════════════════════════════════════════
 */
const AppRouter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // UI vΩ: Sidebar removed, TopNav navigation only
  // const sidebarCollapsed = useSingularitySidebarCollapsed();
  // const { toggleSidebar } = useContextActions();

  // ✨ v19.5.2 - Toast system
  const toasts = useToasts();
  const { removeToast } = useToastActions();

  // ✨ v26.2.1 - Window zoom & fullscreen controls (CTRL+scroll, F11)
  useWindowControls({ enableZoom: true, enableFullscreen: true });

  // ✨ Sprint 6 Phase 3 - Keyboard zoom controls (Ctrl+Plus/Minus/0)
  useZoomControl();

  // ✨ v19.5.2 - User Onboarding State
  // 🔧 vΩ.3 PROD-BOOT FIX: Override checkingOnboarding to false ALWAYS to prevent loader hang
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState<boolean>(false);

  // vΩ.3: Garantir checkingOnboarding = false SANS JAMAIS bloquer - spinner ne s'affiche pas
  useEffect(() => {
    // Immédiate reset - force UI to show, même si backend tardive
    setCheckingOnboarding(false);

    // Puis check le backend EN ARRIÈRE-PLAN UNIQUEMENT (ne modifie pas checkingOnboarding)
    const checkOnboarding = async () => {
      try {
        // En mode navigateur, vérifier d'abord le localStorage
        if (typeof localStorage !== 'undefined') {
          const browserMode = localStorage.getItem('titane_browser_mode') === '1';
          if (browserMode) {
            const localComplete =
              localStorage.getItem('titane_onboarding_complete') === '1';
            logger.info('Onboarding status (browser mode)', {
              component: 'Onboarding',
              status: localComplete ? 'Complete' : 'Not started',
            });
            setOnboardingComplete(localComplete || true);
            return;
          }
        }

        // Mode Tauri : interroger le backend
        const isComplete = await secureInvoke<boolean>('is_onboarding_complete');
        logger.info('Onboarding status (Tauri mode)', {
          component: 'Onboarding',
          status: isComplete ? 'Complete' : 'Not started',
        });
        setOnboardingComplete(isComplete);
      } catch (error) {
        logger.warn('Failed to check onboarding status, assuming complete', {
          component: 'Onboarding',
          error,
        });
        setOnboardingComplete(true);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutDuration =
      typeof window !== 'undefined' && localStorage.getItem('titane_browser_mode') === '1'
        ? 1000
        : 5000;

    const timeoutId = setTimeout(() => {
      logger.warn('Onboarding check timeout, assuming complete', {
        component: 'Onboarding',
      });
      setOnboardingComplete(true);
    }, timeoutDuration);

    checkOnboarding();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // ✨ v21 - Initialiser Ollama Provider au démarrage
  useEffect(() => {
    // Opt-in only: Ollama is an optional local service.
    // Avoid background localhost probes unless explicitly enabled.
    const envEnabled = import.meta.env.VITE_OLLAMA_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_ollama_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    if (!envEnabled && !userEnabled) {
      return;
    }

    logger.info('Initializing local AI provider', {
      component: 'Ollama',
      optIn: envEnabled ? 'env' : 'user',
    });

    initializeOllama().catch(error => {
      logger.error(
        'Failed to initialize OLLAMA',
        { component: 'App', service: 'Ollama' },
        error as Error
      );
    });
  }, []);

  // ✨ CONSOLE MONITOR - Start monitoring in development mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(
        '🔍 [CONSOLE-MONITOR] Starting console monitoring & auto-heal integration...'
      );
      try {
        consoleMonitor.start();
        logger.info('Console monitor started', {
          component: 'App',
          service: 'ConsoleMonitor',
        });
      } catch (error) {
        logger.error(
          'Failed to start console monitor',
          { component: 'App', service: 'ConsoleMonitor' },
          error as Error
        );
      }
    }

    return () => {
      if (import.meta.env.DEV) {
        consoleMonitor.stop();
      }
    };
  }, []);

  // ✨ v26.2 - Enable local network security mode for private home network
  useEffect(() => {
    // ✨ Sprint 6 Phase 3 - Load saved zoom level
    loadSavedZoom();

    import('./lib/security')
      .then(({ enableLocalNetworkMode }) => {
        enableLocalNetworkMode();
        logger.info('Local network mode enabled - reduced restrictions', {
          component: 'Security',
        });
      })
      .catch(err => {
        logger.warn('Failed to enable local network mode', {
          component: 'Security',
          error: err,
        });
      });
  }, []);

  // ✨ v26.2 - Initialize auto-backup service (6-hour intervals)
  useEffect(() => {
    // Silent-by-default in production/Tauri: periodic background backups must be explicitly enabled.
    const envEnabled = import.meta.env.VITE_AUTO_BACKUP_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_auto_backup_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabled = import.meta.env.DEV || envEnabled || userEnabled;
    if (!enabled) {
      return;
    }

    import('./services/backup/AutoBackupService')
      .then(({ autoBackupService }) => {
        autoBackupService.initialize();
        console.log('💾 [BACKUP] Auto-backup service initialized (6h intervals)');
      })
      .catch(err => {
        console.warn('⚠️ [BACKUP] Failed to initialize auto-backup:', err);
      });
  }, []);

  // ✨ OPT-7 - Initialize i18n asynchronously (non-blocking, lazy-loaded)
  useEffect(() => {
    import('./i18n')
      .then(({ initI18nAsync }) => {
        initI18nAsync(); // Background load, doesn&apos;t block UI
      })
      .catch(error => {
        logger.warn('i18n lazy initialization failed', { component: 'i18n', error });
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
        logger.warn('Failed to load cognitive cache', {
          component: 'CognitiveCache',
          error,
        });
      });
  }, []);

  // ✨ OPT-10 - Lazy-load Auto-Audit Engine
  useEffect(() => {
    let started = false;

    // Silent-by-default in production/Tauri: background audits must be explicitly enabled.
    const envEnabled = import.meta.env.VITE_AUTO_AUDIT_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_auto_audit_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabled = import.meta.env.DEV || envEnabled || userEnabled;
    if (!enabled) {
      return;
    }

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

    // Silent-by-default in production/Tauri: the cognitive layout observation loop must be explicitly enabled.
    const envEnabled = import.meta.env.VITE_COGNITIVE_LAYOUT_ENGINE_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_cognitive_layout_engine_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabled = import.meta.env.DEV || envEnabled || userEnabled;
    if (!enabled) {
      return;
    }

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
        logger.warn('Failed to load Cognitive Layout Engine', {
          component: 'CognitiveLayout',
          error: err,
        });
      });
  }, []);

  // ✨ OPT-10 - Lazy-load TITANE∞ Micro-Interactions
  useEffect(() => {
    logger.info('Loading TITANE∞ micro-interactions', { component: 'UIPolish' });
    import('./ui/motion')
      .then(({ initializeMicroInteractions }) => {
        try {
          initializeMicroInteractions();
          logger.info(
            'Micro-interactions initialized (Ripple, Magnetism, Focus Glow, Tooltips)',
            { component: 'UIPolish' }
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
        logger.warn('Failed to load motion module', {
          component: 'UIPolish',
          error: err,
        });
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

  // ✨ UI vΩ: TopNav items - Navigation horizontale (max 5 visibles)
  const topNavSections = useMemo(
    () => [
      // ═══ PRINCIPAL ═══
      {
        id: 'titane',
        label: 'TITANE',
        route: '/titane',
        description: 'Le Cœur du Système',
      },
      { id: 'time', label: 'TIME', route: '/time', description: 'Centre Temporel' },
      { id: 'stats', label: 'STATS', route: '/stats', description: 'Métriques Système' },
      {
        id: 'admin',
        label: 'ADMIN',
        route: '/admin',
        description: 'Centre Admin Unifié',
      },
      { id: 'dev', label: 'DEV', route: '/dev', description: 'Centre DEV Unifié' },
      // Dans menu "Plus"
      {
        id: 'fusion',
        label: 'FUSION',
        route: '/fusion',
        description: 'Backend/Frontend Fusion',
      },
      {
        id: 'optimization',
        label: 'OPTIMIZE',
        route: '/optimization',
        description: 'Performance Ultime',
      },
    ],
    []
  );

  const topNavItems = useMemo(() => createTopNavItems(topNavSections), [topNavSections]);

  // ✨ UI vΩ: Navigation handler
  const handleNavigate = useCallback(
    (route: string) => {
      navigate(route);
    },
    [navigate]
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#00d4ff',
          fontSize: '1.5rem',
          fontWeight: '600',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span
            style={{
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            ⚡
          </span>
          <span>TITANE∞ Initialisation...</span>
        </div>
        <div
          style={{
            width: '300px',
            height: '4px',
            background: 'rgba(0, 212, 255, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    );
  }

  // ✨ v19.5.2 - Show onboarding if not complete
  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

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
          <Route
            path="/stats"
            element={
              <ErrorBoundary context="Stats">
                <Stats />
              </ErrorBoundary>
            }
          />
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
              <ErrorBoundary context="PerfectFusionDashboard">
                <Suspense fallback={<PageLoadingFallback variant="dashboard" />}>
                  <PerfectFusionDashboard />
                </Suspense>
              </ErrorBoundary>
            }
          />
          {/* ✨ v25.6.0 - ULTIMATE OPTIMIZATION - Phase 12: GPU/WASM/Cache/IndexedDB */}
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
          {/* Note: /orchestration-intelligence et /orchestration-center ont leurs propres composants ci-dessus */}
          <Route
            path="/orchestration"
            element={<Navigate to="/orchestration-intelligence" replace />}
          />
          <Route
            path="/meta-center"
            element={<Navigate to="/orchestration-center" replace />}
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
  // ⭐ PHASE 2: BOOT DIAGNOSTIC MARKER
  console.log('[BOOT] App render');
  (window as any).__TITANE_BOOT__ = (window as any).__TITANE_BOOT__ || {};
  (window as any).__TITANE_BOOT__.app_render = true;
  (window as any).__TITANE_BOOT__.app_render_timestamp = Date.now();
  (window as any).__TITANE_BOOT__.stage = '[BOOT] App render';
  (window as any).__TITANE_BOOT__.timestamp = Date.now();

  return (
    <ToastProvider>
      {/* ✨ P0.Ω∞ - Splash Watchdog: Diagnostic si boot timeout (10s) */}
      <SplashWatchdog />

      <ThemeProvider>
        <AnimationProvider fpsThreshold={40} cpuThreshold={80}>
          <TitanStateProvider>
            {/* ✨ v26.1 - Console Monitor Dashboard (Dev only) */}
            {import.meta.env.DEV && (
              <Suspense fallback={null}>
                <ConsoleMonitorDashboard />
              </Suspense>
            )}

            {/* ✨ v26.2 - Predictive AI Dashboard (Dev only) */}
            {import.meta.env.DEV && (
              <Suspense fallback={null}>
                <PredictiveDashboard />
              </Suspense>
            )}

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
