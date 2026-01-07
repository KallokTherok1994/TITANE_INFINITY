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

export interface UseIdentityMatrixResult {
  /** Matrice identité (toujours définie) */
  matrix: IdentityMatrix;
  /** True si chargée depuis backend, false si fallback */
  isLoaded: boolean;
  /** True si fallback utilisé (fichier corrompu/manquant) */
  isFallback: boolean;
  /** True pendant chargement initial */
  loading: boolean;
  /** Erreur si chargement échoué (mais matrix reste disponible) */
  error: string | null;
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
 * if (loading) return <Skeleton />;
 * if (isFallback) return <Warning>Using default identity</Warning>;
 *
 * return <IdentityDisplay matrix={matrix} />;
 * ```
 */
export function useIdentityMatrix(): UseIdentityMatrixResult {
  const [matrix, setMatrix] = useState<IdentityMatrix>(DEFAULT_IDENTITY_MATRIX);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFallback, setIsFallback] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatrix = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loadIdentityMatrix();

      if (validateIdentityMatrix(result.matrix)) {
        setMatrix(result.matrix);
        setIsLoaded(result.isLoaded);
        setIsFallback(result.isFallback);

        if (result.isFallback) {
          logger.warn('Using fallback identity matrix');
        }
      } else {
        // Validation échoué - utiliser default
        logger.error('Loaded matrix invalid, using default');
        setMatrix(DEFAULT_IDENTITY_MATRIX);
        setIsLoaded(false);
        setIsFallback(true);
        setError('Loaded identity matrix failed validation');
      }
    } catch (err) {
      logger.error('Load failed:', err);
      setMatrix(DEFAULT_IDENTITY_MATRIX);
      setIsLoaded(false);
      setIsFallback(true);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
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
export function useIdentityValue(valueId: string) {
  const { matrix, loading } = useIdentityMatrix();

  if (loading) return undefined;

  return matrix.values.find(v => v.id === valueId);
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
export function useIdentityCluster(clusterIds: string[]) {
  const { matrix, loading } = useIdentityMatrix();

  if (loading) return [];

  return matrix.values.filter(v => clusterIds.includes(v.id));
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
 *   {topValues.map(v => <li key={v.id}>{v.label}: {v.weight}</li>)}
 * </ul>;
 * ```
 */
export function useTopIdentityValues(count: number = 5) {
  const { matrix, loading } = useIdentityMatrix();

  if (loading) return [];

  return [...matrix.values].sort((a, b) => b.weight - a.weight).slice(0, count);
}
