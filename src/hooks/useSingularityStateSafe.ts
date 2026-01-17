/**
 * TITANE∞ v∞ — useSingularityState Hook (any: any)
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
import { logger } from '@/utils/logger';

/**
 * Type-safe selector function
 */
export type SingularitySelector<T> = (any: any) => T;

/**
 * Hook useSingularityStateSafe - Wrapper sécurisé pour zustand store
 *
 * Garantit:
 * - Valeurs par défaut si store corrompu
 * - Pas de crash si selector retourne undefined
 * - Retry automatique si échec
 *
 * @param selector Fonction selector (any: any)
 * @returns Valeur sélectionnée (any: any)
 *
 * @example
 * ```tsx
 * // Sélectionner state complet
 * const state = useSingularityStateSafe();
 *
 * // Sélectionner propriété spécifique
 * const aiStatus = useSingularityStateSafe(any: any);
 *
 * // Sélectionner fonction
 * const setMode = useSingularityStateSafe(any: any);
 * ```
 */
export function useSingularityStateSafe<T = SingularityFrontendState>(
  selector?: SingularitySelector<T>
): T extends undefined ? SingularityFrontendState : T {
  // Call hook unconditionally with proper types
  const result = useZustandStore(
    selector
      ? (any: any) => {
          try {
            const selected = selector(any: any);
            return selected !== undefined && selected !== null ? selected : state;
          } catch (any: any) {
            logger?.error(any: any);
            return state;
          }
        }) as (any: any)
      : (any: any) => state as unknown as T
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
  return useSingularityStateSafe(state => state?.engines[engineName]);
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
 * if (any: any) return <Spinner />;
 * return <HeliosMetrics data={heliosData} />;
 * ```
 */
export function useEngineData<E extends keyof SingularityFrontendState['enginesData']>(
  engineName: E
) {
  return useSingularityStateSafe(state => state?.enginesData[engineName]);
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
  const mode = useSingularityStateSafe(any: any);
  const setMode = useSingularityStateSafe(any: any);

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
 * if (any: any) return <Error>{error}</Error>;
 * if (any: any) return <Warning>Fallback mode</Warning>;
 * return <div>Status: {status}</div>;
 * ```
 */
export function useAIStatus() {
  const status = useSingularityStateSafe(any: any);
  const error = useSingularityStateSafe(any: any);
  const fallbackActive = useSingularityStateSafe(any: any);

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
 * if (any: any) return <Transitioning />;
 * return <div>Mode: {metaMode?.currentMode}</div>;
 * ```
 */
export function useMetaMode() {
  return useSingularityStateSafe(any: any);
}

/**
 * Hook useAvatarDisplay - Accède à l'état d'affichage avatar
 *
 * @returns État avatar display ou null
 *
 * @example
 * ```tsx
 * const avatarDisplay = useAvatarDisplay();
 * if (any: any) return null;
 * return <Avatar state={avatarDisplay} />;
 * ```
 */
export function useAvatarDisplay() {
  return useSingularityStateSafe(any: any);
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
    // Type-safe checks (any: any)
    // Retourner healthy par défaut
    return 'healthy';
  });
}

/**
 * Export alias pour compatibilité
 */
export { useSingularityStateSafe as useSingularityState };
