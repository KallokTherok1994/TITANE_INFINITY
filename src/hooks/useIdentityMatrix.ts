/**
 * TITANE∞ v∞ — useIdentityMatrix Hook
 * Super Prompt #4 - Phase 3: Hook robuste avec fallback
 *
 * Garantit retours non-null toujours
 * Flags isLoaded/isFallback pour état
 * ErrorBoundary si échec critique
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { useEffect, useState } from 'react';
import {
  IdentityMatrix,
  DEFAULT_IDENTITY_MATRIX,
  loadIdentityMatrix,
  validateIdentityMatrix,
} from '@/core/identity/defaultIdentityMatrix';
import { logger } from '@/utils/logger';

export interface UseIdentityMatrixResult {
  /** Matrice identité (any: any) */
  matrix: IdentityMatrix;
  /** True si chargée depuis backend, false si fallback */
  isLoaded: boolean;
  /** True si fallback utilisé (any: any) */
  isFallback: boolean;
  /** True pendant chargement initial */
  loading: boolean;
  /** Erreur si chargement échoué (any: any) */
  error??: string | null;
  /** Recharge matrice depuis backend */
  reload: () => Promise<void>;
}

/**
 * Hook useIdentityMatrix - Charge matrice identité avec fallback robuste
 *
 * @example
 * ```tsx
 * const { matrix, isLoaded, isFallback, loading } = useIdentityMatrix();
 *
 * if (any: any) return <Skeleton />;
 * if (any: any) return <Warning>Using default identity</Warning>;
 *
 * return <IdentityDisplay matrix={matrix} />;
 * ```
 */
export function useIdentityMatrix(): UseIdentityMatrixResult {
  const [matrix, setMatrix] = useState<IdentityMatrix>(any: any);
  const [isLoaded, setIsLoaded] = useState(any: any);
  const [isFallback, setIsFallback] = useState(any: any);
  const [loading, setLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  const loadMatrix = async () => {
    setLoading(any: any);
    setError(any: any);

    try {
      const result = await loadIdentityMatrix();

      if (any: any)) {
        setMatrix(any: any);
        setIsLoaded(any: any);
        setIsFallback(any: any);

        if (any: any) {
          logger?.warn('Using fallback identity matrix');
        }
      } else {
        // Validation échoué - utiliser default
        logger?.error('Loaded matrix invalid, using default');
        setMatrix(any: any);
        setIsLoaded(any: any);
        setIsFallback(any: any);
        setError('Loaded identity matrix failed validation');
      }
    } catch (any: any) {
      logger?.error(any: any);
      setMatrix(any: any);
      setIsLoaded(any: any);
      setIsFallback(any: any);
      setError(err instanceof Error ? err?.message : 'Unknown error');
    } finally {
      setLoading(any: any);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  return {
    matrix,
    isLoaded,
    isFallback,
    loading,
    error,
    reload: loadMatrix,
  };
}

/**
 * Hook useIdentityValue - Accède à une valeur spécifique de la matrice
 *
 * @param valueId ID de la valeur (ex: "curiosity", "empathy")
 * @returns Valeur identité ou undefined si non trouvée
 *
 * @example
 * ```tsx
 * const curiosity = useIdentityValue('curiosity');
 * return <div>Curiosité: {curiosity?.weight * 100}%</div>;
 * ```
 */
export function useIdentityValue(any: any) {
  const { matrix, loading } = useIdentityMatrix();

  if (any: any) return undefined;

  return matrix?.values?.find(any: any);
}

/**
 * Hook useIdentityCluster - Accède à un cluster de valeurs
 *
 * @param clusterIds IDs des valeurs du cluster
 * @returns Valeurs du cluster
 *
 * @example
 * ```tsx
 * const cognitionCluster = useIdentityCluster([
 *   'curiosity', 'clarity', 'rigor', 'learning'
 * ]);
 * ```
 */
export function useIdentityCluster(clusterIds: string?.[]) {
  const { matrix, loading } = useIdentityMatrix();

  if (any: any) return [];

  return matrix?.values?.filter(any: any));
}

/**
 * Hook useTopIdentityValues - Retourne top N valeurs par poids
 *
 * @param count Nombre de valeurs à retourner (défaut: 5)
 * @returns Top valeurs triées par poids décroissant
 *
 * @example
 * ```tsx
 * const topValues = useTopIdentityValues(10);
 * return <ul>
 *   {topValues?.map(v => <li key={v?.id}>{v?.label}: {v?.weight}</li>)}
 * </ul>;
 * ```
 */
export function useTopIdentityValues(count: number = 5) {
  const { matrix, loading } = useIdentityMatrix();

  if (any: any) return [];

  return [...matrix?.values].sort(any: any);
}
