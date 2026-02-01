/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v37.0.0 — USE LAZY AVATAR HOOK
 *   Phase 3: Avatar System Lazy-Loading Hook
 *   Purpose: Easy integration of lazy-loaded avatar components
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useCallback } from 'react';
import {
  loadAvatarModuleByMode,
  loadThreeJSAvatarRenderer,
  loadAvatarFloatingWindow,
  loadAvatarFloatingPopup,
  loadFullBodyAvatarHook,
  preloadAvatarModules,
  type AvatarRenderingMode,
} from '@/services/avatar/AvatarLazyLoader';
import { logger } from '@/lib/logger';

/**
 * Avatar loading state
 */
export interface AvatarLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  mode: AvatarRenderingMode;
}

/**
 * Avatar module result
 */
export interface AvatarModuleResult {
  component: any;
  engine: any;
  renderer: any;
}

/**
 * Hook: Load avatar components on-demand
 *
 * @param mode - Avatar rendering mode (floating-window, floating-popup, fullbody)
 * @param autoLoad - If true, automatically load when component mounts
 * @returns Loading state and module result
 *
 * @example
 * const { isLoaded, component, error } = useLazyAvatar('floating-window');
 *
 * if (isLoaded) {
 *   return <component {...props} />;
 * }
 *
 * return <LoadingSpinner />;
 */
export function useLazyAvatar(
  mode: AvatarRenderingMode = 'floating-window',
  autoLoad = true
): AvatarLoadingState & {
  module?: AvatarModuleResult;
  loadAvatarModule: () => Promise<void>;
} {
  const [state, setState] = useState<AvatarLoadingState>({
    isLoading: autoLoad,
    isLoaded: false,
    error: null,
    mode,
  });

  const [module, setModule] = useState<AvatarModuleResult | undefined>();

  const loadAvatarModule = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const startTime = performance.now();
      const result = await loadAvatarModuleByMode(mode, 15000);
      const duration = performance.now() - startTime;

      setModule(result as AvatarModuleResult);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        error: null,
      }));

      logger.debug(`[useLazyAvatar] Loaded ${mode} in ${duration.toFixed(2)}ms`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: false,
        error: err,
      }));

      logger.error(`[useLazyAvatar] Failed to load ${mode}: ${err.message}`);
    }
  }, [mode]);

  useEffect(() => {
    if (autoLoad && !state.isLoaded && !state.isLoading) {
      loadAvatarModule();
    }
  }, [autoLoad, state.isLoaded, state.isLoading, loadAvatarModule]);

  return { ...state, module, loadAvatarModule };
}

/**
 * Hook: Preload avatar module on hover/idle
 * Useful for anticipatory loading to improve perceived performance
 *
 * @param mode - Avatar rendering mode to preload
 * @returns Preload function
 *
 * @example
 * const preload = usePreloadAvatar('floating-window');
 *
 * return <button onMouseEnter={preload}>Show Avatar</button>;
 */
export function usePreloadAvatar(mode: AvatarRenderingMode = 'floating-window') {
  return useCallback(async () => {
    logger.debug(`[usePreloadAvatar] Preloading ${mode}...`);
    await preloadAvatarModules(mode);
  }, [mode]);
}

/**
 * Hook: Load specific avatar component
 * More granular control than useLazyAvatar for single components
 *
 * @param componentType - Type of component to load (renderer, window, popup, fullbody-hook)
 * @returns Loading state and component
 */
export function useLazyAvatarComponent(
  componentType: 'renderer' | 'window' | 'popup' | 'fullbody-hook' = 'renderer'
) {
  const [isLoading, setIsLoading] = useState(false);
  const [component, setComponent] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result: any;

      switch (componentType) {
        case 'renderer':
          result = await loadThreeJSAvatarRenderer();
          break;
        case 'window':
          result = await loadAvatarFloatingWindow();
          break;
        case 'popup':
          result = await loadAvatarFloatingPopup();
          break;
        case 'fullbody-hook':
          result = await loadFullBodyAvatarHook();
          break;
      }

      setComponent(result);
      logger.debug(`[useLazyAvatarComponent] Loaded ${componentType}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error(
        `[useLazyAvatarComponent] Failed to load ${componentType}: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [componentType]);

  useEffect(() => {
    load();
  }, [load]);

  return { isLoading, component, error, reload: load };
}

/**
 * Hook: Lazy avatar with visibility detection
 * Loads avatar only when element becomes visible in viewport
 *
 * @param mode - Avatar rendering mode
 * @param threshold - Intersection observer threshold (0-1)
 * @returns Loading state, module, and ref to attach to element
 *
 * @example
 * const { isLoaded, module, ref } = useLazyAvatarOnVisible('floating-window');
 *
 * return (
 *   <div ref={ref}>
 *     {isLoaded && <module.component />}
 *   </div>
 * );
 */
export function useLazyAvatarOnVisible(
  mode: AvatarRenderingMode = 'floating-window',
  threshold = 0.1
) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { isLoaded, module, error } = useLazyAvatar(mode, false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return {
    ref: setRef,
    isVisible,
    isLoaded,
    module,
    error,
  };
}
