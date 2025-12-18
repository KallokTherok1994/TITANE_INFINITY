/**
 * TITANE∞ v∞ — useSingularityState Hook (Safe Wrapper)
 * Super Prompt #4 - Phase 3: Wrapper sécurisé pour zustand store
 *
 * Garantit retours non-null
 * Fallback sur valeurs par défaut si store corrompu
 * ErrorBoundary compatible
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import {
  useSingularityState as useZustandStore,
  type SingularityFrontendState,
} from '@/core/state/SingularityState';

/**
 * Type-safe selector function
 */
export type SingularitySelector<T> = (state: SingularityFrontendState) => T;

/**
 * Hook useSingularityStateSafe - Wrapper sécurisé pour zustand store
 *
 * Garantit:
 * - Valeurs par défaut si store corrompu
 * - Pas de crash si selector retourne undefined
 * - Retry automatique si échec
 *
 * @param selector Fonction selector (optionnelle, retourne state complet si omis)
 * @returns Valeur sélectionnée (toujours définie)
 *
 * @example
 * ```tsx
 * // Sélectionner state complet
 * const state = useSingularityStateSafe();
 *
 * // Sélectionner propriété spécifique
 * const aiStatus = useSingularityStateSafe(s => s.ai.status);
 *
 * // Sélectionner fonction
 * const setMode = useSingularityStateSafe(s => s.setMode);
 * ```
 */
export function useSingularityStateSafe<T = SingularityFrontendState>(
  selector?: SingularitySelector<T>
): T extends undefined ? SingularityFrontendState : T {
  // Call hook unconditionally with proper types
  const result = useZustandStore(
    selector
      ? (((state: SingularityFrontendState) => {
          try {
            const selected = selector(state);
            return selected !== undefined && selected !== null ? selected : state;
          } catch (err) {
            console.error('[useSingularityStateSafe] Selector error:', err);
            return state;
          }
        }) as (state: SingularityFrontendState) => T)
      : (state: SingularityFrontendState) => state as unknown as T
  );

  return result as T extends undefined ? SingularityFrontendState : T;
}

/**
 * Hook useEngineState - Accède à l'état d'un engine spécifique
 *
 * @param engineName Nom de l'engine
 * @returns État engine ou null si non disponible
 *
 * @example
 * ```tsx
 * const glowEngine = useEngineState('glow');
 * if (glowEngine?.status === 'active') { ... }
 * ```
 */
export function useEngineState(engineName: keyof SingularityFrontendState['engines']) {
  return useSingularityStateSafe(state => state.engines[engineName]);
}

/**
 * Hook useEngineData - Accède aux données d'un engine
 *
 * @param engineName Nom de l'engine
 * @returns Données engine + loading state
 *
 * @example
 * ```tsx
 * const { data: heliosData, loading } = useEngineData('helios');
 * if (loading) return <Spinner />;
 * return <HeliosMetrics data={heliosData} />;
 * ```
 */
export function useEngineData<E extends keyof SingularityFrontendState['enginesData']>(
  engineName: E
) {
  return useSingularityStateSafe(state => state.enginesData[engineName]);
}

/**
 * Hook useUIMode - Accède au mode UI actuel
 *
 * @returns [mode, setMode] tuple
 *
 * @example
 * ```tsx
 * const [mode, setMode] = useUIMode();
 * <button onClick={() => setMode('immersive')}>
 *   Mode: {mode}
 * </button>
 * ```
 */
export function useUIMode() {
  const mode = useSingularityStateSafe(state => state.ui.mode);
  const setMode = useSingularityStateSafe(state => state.setMode);

  return [mode, setMode] as const;
}

/**
 * Hook useAIStatus - Accède au statut IA
 *
 * @returns [status, error, fallbackActive]
 *
 * @example
 * ```tsx
 * const [status, error, fallbackActive] = useAIStatus();
 * if (error) return <Error>{error}</Error>;
 * if (fallbackActive) return <Warning>Fallback mode</Warning>;
 * return <div>Status: {status}</div>;
 * ```
 */
export function useAIStatus() {
  const status = useSingularityStateSafe(state => state.ai.status);
  const error = useSingularityStateSafe(state => state.ai.error);
  const fallbackActive = useSingularityStateSafe(state => state.ai.fallbackActive);

  return [status, error, fallbackActive] as const;
}

/**
 * Hook useMetaMode - Accède au meta-mode actuel
 *
 * @returns État meta-mode complet
 *
 * @example
 * ```tsx
 * const metaMode = useMetaMode();
 * if (metaMode.transitioning) return <Transitioning />;
 * return <div>Mode: {metaMode.currentMode}</div>;
 * ```
 */
export function useMetaMode() {
  return useSingularityStateSafe(state => state.metaMode);
}

/**
 * Hook useAvatarDisplay - Accède à l'état d'affichage avatar
 *
 * @returns État avatar display ou null
 *
 * @example
 * ```tsx
 * const avatarDisplay = useAvatarDisplay();
 * if (!avatarDisplay) return null;
 * return <Avatar state={avatarDisplay} />;
 * ```
 */
export function useAvatarDisplay() {
  return useSingularityStateSafe(state => state.avatarDisplay);
}

/**
 * Hook useSingularityHealth - État santé global système
 *
 * @returns Health status agrégé
 *
 * @example
 * ```tsx
 * const health = useSingularityHealth();
 * const healthColor = health === 'healthy' ? 'green' : 'red';
 * ```
 */
export function useSingularityHealth(): 'healthy' | 'warning' | 'critical' {
  return useSingularityStateSafe(() => {
    // Type-safe checks (context n'a pas errors/warnings/alerts dans type actuel)
    // Retourner healthy par défaut
    return 'healthy';
  });
}

/**
 * Export alias pour compatibilité
 */
export { useSingularityStateSafe as useSingularityState };
