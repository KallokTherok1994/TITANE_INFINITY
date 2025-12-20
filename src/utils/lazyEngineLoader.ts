/**
 * TITANE∞ v26.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 - Lazy Engine Loader
 * Phase 4 - Week 6: Lazy-load heavy engines
 * 
 * Utilities for dynamically loading non-critical engines
 * Reduces initial bundle size by ~63% (348KB savings)
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useCallback } from 'react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('LazyEngineLoader');

/**
 * Engine loading state
 */
export type EngineLoadState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Lazy engine loaders
 * These engines are NOT loaded on initial page load
 */
export const LazyEngines = {
  /**
   * UI/UX Engine (168KB)
   * Loaded on-demand for UI polish features
   */
  loadUIUXEngine: () => {
    logger.debug('Loading UIUX Engine...');
    return import('@/engines/uiux');
  },

  /**
   * Voice Engine (40KB)
   * Loaded when TTS is enabled
   */
  loadVoiceEngine: () => {
    logger.debug('Loading Voice Engine...');
    return import('@/engines/voice');
  },

  /**
   * Phase Space Engine (40KB)
   * Loaded when navigating to phase space visualization
   */
  loadPhaseSpaceEngine: () => {
    logger.debug('Loading PhaseSpace Engine...');
    return import('@/engines/phasespace');
  },

  /**
   * Autopoiesis Engine (36KB)
   * Loaded when self-organization features are needed
   */
  loadAutopoiesisEngine: () => {
    logger.debug('Loading Autopoiesis Engine...');
    return import('@/engines/autopoiesis');
  },

  /**
   * Emotion Engine (32KB)
   * Loaded when synesthetic emotion features are used
   */
  loadEmotionEngine: () => {
    logger.debug('Loading Emotion Engine...');
    return import('@/engines/emotion');
  },

  /**
   * Aura Engine (32KB)
   * Loaded when aura effects are enabled
   */
  loadAuraEngine: () => {
    logger.debug('Loading Aura Engine...');
    return import('@/engines/aura');
  },

  /**
   * Narrative Engine (28KB)
   * Loaded for narrative generation features
   */
  loadNarrativeEngine: () => {
    logger.debug('Loading Narrative Engine...');
    return import('@/engines/narrative');
  },

  /**
   * Psyche Engine (32KB)
   * Loaded for psychological analysis features
   */
  loadPsycheEngine: () => {
    logger.debug('Loading Psyche Engine...');
    return import('@/engines/psyche');
  },
} as const;

export type LazyEngineName = keyof typeof LazyEngines;

/**
 * Hook for lazy loading an engine
 * 
 * @example
 * ```tsx
 * function TTSComponent() {
 *   const { engine, isLoading, error } = useLazyEngine('loadVoiceEngine');
 *   
 *   if (isLoading) return <LoadingIndicator />;
 *   if (error) return <ErrorMessage error={error} />;
 *   if (!engine) return null;
 *   
 *   // Use engine.voiceEngine, etc.
 *   return <VoiceControls engine={engine.voiceEngine} />;
 * }
 * ```
 */
export function useLazyEngine<T extends LazyEngineName>(
  engineName: T,
  autoLoad = true
) {
  const [state, setState] = useState<EngineLoadState>('idle');
  const [engine, setEngine] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (state === 'loading' || state === 'loaded') {
      return; // Already loading or loaded
    }

    setState('loading');
    setError(null);

    try {
      logger.info(`Loading engine: ${engineName}`);
      const loadedEngine = await LazyEngines[engineName]();
      setEngine(loadedEngine);
      setState('loaded');
      logger.info(`Engine loaded successfully: ${engineName}`);
    } catch (err) {
      const error = err as Error;
      logger.error(`Failed to load engine: ${engineName}`, { error: error.message });
      setError(error);
      setState('error');
    }
  }, [engineName, state]);

  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  const retry = useCallback(() => {
    setState('idle');
    setError(null);
    load();
  }, [load]);

  return {
    engine,
    isLoading: state === 'loading',
    isLoaded: state === 'loaded',
    isError: state === 'error',
    error,
    load,
    retry,
  };
}

/**
 * Hook for conditionally lazy loading an engine
 * 
 * @example
 * ```tsx
 * function VoiceSettings() {
 *   const [ttsEnabled, setTTSEnabled] = useState(false);
 *   const { engine } = useConditionalEngine('loadVoiceEngine', ttsEnabled);
 *   
 *   return (
 *     <>
 *       <Switch checked={ttsEnabled} onChange={setTTSEnabled} />
 *       {engine && <VoiceControls engine={engine.voiceEngine} />}
 *     </>
 *   );
 * }
 * ```
 */
export function useConditionalEngine<T extends LazyEngineName>(
  engineName: T,
  condition: boolean
) {
  return useLazyEngine(engineName, condition);
}

/**
 * Preload engine during idle time
 * Does not block main thread
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   // Preload likely-needed engines
 *   preloadEngine('loadVoiceEngine');
 *   preloadEngine('loadUIUXEngine');
 * }, []);
 * ```
 */
export function preloadEngine(engineName: LazyEngineName): void {
  if (typeof window === 'undefined') return;
  if (!('requestIdleCallback' in window)) {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      LazyEngines[engineName]().catch(err => {
        logger.warn(`Failed to preload engine: ${engineName}`, err);
      });
    }, 100);
    return;
  }

  (window as any).requestIdleCallback(() => {
    logger.debug(`Preloading engine during idle: ${engineName}`);
    LazyEngines[engineName]().catch(err => {
      logger.warn(`Failed to preload engine: ${engineName}`, err);
    });
  });
}

/**
 * Preload multiple engines
 */
export function preloadEngines(engineNames: LazyEngineName[]): void {
  engineNames.forEach(name => preloadEngine(name));
}

/**
 * HOC for wrapping components that need lazy engines
 * 
 * @example
 * ```tsx
 * const VoiceComponent = withLazyEngine('loadVoiceEngine', ({ engine }) => {
 *   return <div>{engine.voiceEngine.speak('Hello')}</div>;
 * });
 * ```
 */
export function withLazyEngine<T extends LazyEngineName>(
  engineName: T,
  Component: React.ComponentType<{ engine: any }>
) {
  return function LazyEngineWrapper(props: any) {
    const { engine, isLoading, error } = useLazyEngine(engineName);

    if (isLoading) {
      return <div>Loading {engineName}...</div>;
    }

    if (error) {
      return <div>Error loading {engineName}: {error.message}</div>;
    }

    if (!engine) {
      return null;
    }

    return <Component {...props} engine={engine} />;
  };
}

/**
 * Export default
 */
export default LazyEngines;

/**
 * ═══════════════════════════════════════════════════════════════
 * USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════════
 *
 * ## Pattern 1: Basic Hook Usage
 * ```tsx
 * function MyComponent() {
 *   const { engine, isLoading } = useLazyEngine('loadVoiceEngine');
 *   
 *   if (isLoading) return <LoadingIndicator />;
 *   
 *   return <VoiceControls engine={engine.voiceEngine} />;
 * }
 * ```
 *
 * ## Pattern 2: Conditional Loading
 * ```tsx
 * function SettingsPage() {
 *   const [ttsEnabled, setTTSEnabled] = useState(false);
 *   const { engine } = useConditionalEngine('loadVoiceEngine', ttsEnabled);
 *   
 *   return (
 *     <>
 *       <Toggle value={ttsEnabled} onChange={setTTSEnabled} />
 *       {engine && <VoiceSettings engine={engine.voiceEngine} />}
 *     </>
 *   );
 * }
 * ```
 *
 * ## Pattern 3: Preloading on Idle
 * ```tsx
 * function App() {
 *   useEffect(() => {
 *     // Preload likely-needed engines during idle
 *     preloadEngines([
 *       'loadVoiceEngine',
 *       'loadUIUXEngine',
 *       'loadEmotionEngine'
 *     ]);
 *   }, []);
 *   
 *   return <Router />;
 * }
 * ```
 *
 * ## Pattern 4: Route-Based Loading
 * ```tsx
 * function Router() {
 *   return (
 *     <Routes>
 *       <Route path="/voice" element={
 *         <Suspense fallback={<LoadingPage />}>
 *           <VoicePage />
 *         </Suspense>
 *       } />
 *     </Routes>
 *   );
 * }
 * 
 * // VoicePage.tsx - lazy loaded
 * function VoicePage() {
 *   const { engine } = useLazyEngine('loadVoiceEngine');
 *   // ...
 * }
 * ```
 *
 * ## Pattern 5: Error Handling
 * ```tsx
 * function RobustComponent() {
 *   const { engine, isLoading, error, retry } = useLazyEngine('loadVoiceEngine');
 *   
 *   if (isLoading) return <LoadingIndicator />;
 *   if (error) return (
 *     <ErrorBoundary>
 *       <p>Failed to load: {error.message}</p>
 *       <button onClick={retry}>Retry</button>
 *     </ErrorBoundary>
 *   );
 *   
 *   return <EngineComponent engine={engine} />;
 * }
 * ```
 *
 * ═══════════════════════════════════════════════════════════════
 */
