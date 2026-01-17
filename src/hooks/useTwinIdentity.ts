/**
 * TITANE∞ vΩ∞ — useTwinIdentity Hook
 * © 2025 TITANE∞ — Proprietary License
 * Hook React pour l'identité du Numeric Twin
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { numericTwinService } from '../services/api/numericTwin';
import type { TwinIdentityCore, CoreValue, HumanStyle } from '../types/numericTwin';

interface UseTwinIdentityReturn {
  identity: TwinIdentityCore | null;
  isLoading: boolean;
  error: string | null;
  coreValues: CoreValue[];
  humanStyle: HumanStyle | null;
  fusionIndex: number;
  refresh: () => Promise<void>;
}

/**
 * Hook pour accéder à l'identité du Twin
 */
export function useTwinIdentity(): UseTwinIdentityReturn {
  const [identity, setIdentity] = useState<TwinIdentityCore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdentity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await numericTwinService.getIdentity();
      setIdentity(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement de l'identité"
      );
      logger.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdentity();
  }, [fetchIdentity]);

  return {
    identity,
    isLoading,
    error,
    coreValues: identity?.coreValues ?? [],
    humanStyle: identity?.humanStyle ?? null,
    fusionIndex: identity?.fusionIndex ?? 0,
    refresh: fetchIdentity,
  };
}
