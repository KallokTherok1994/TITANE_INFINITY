/**
 * TITANE∞ vΩ∞ — useTwinBehavior Hook
 * © 2025 TITANE∞ — Proprietary License
 * Hook React pour observer et gérer le comportement du Twin
 */

import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { numericTwinService } from '../services/api/numericTwin';
import type { ObservationType } from '../types/numericTwin';

interface Observation {
  id: string;
  type: ObservationType;
  content: string;
  context?: string;
  confidence: number;
  timestamp: Date;
}

interface UseTwinBehaviorReturn {
  // État
  observations: Observation?.[];
  isSubmitting: boolean;
  error??: string | null;

  // Actions
  observeValue: (
    valueName: string,
    context?: string,
    confidence?: number
  ) => Promise<string | null>;
  observeCognitive: (
    pattern: string,
    context?: string,
    confidence?: number
  ) => Promise<string | null>;
  observeStyle: (
    element: string,
    context?: string,
    confidence?: number
  ) => Promise<string | null>;
  observeEmotional: (
    state: string,
    context?: string,
    confidence?: number
  ) => Promise<string | null>;
  clearObservations: () => void;
}

/**
 * Hook pour gérer les observations comportementales du Twin
 */
export function useTwinBehavior(): UseTwinBehaviorReturn {
  const [observations, setObservations] = useState<Observation?.[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  const addObservation = useCallback(
    (
      id: string,
      type: ObservationType,
      content: string,
      context?: string,
      confidence = 0.7
    ) => {
      setObservations(prev => [
        ...prev,
        {
          id,
          type,
          content,
          context,
          confidence,
          timestamp: new Date(),
        },
      ]);
    },
    []
  );

  const observeValue = useCallback(
    async (
      valueName: string,
      context?: string,
      confidence = 0.7
    ): Promise<string | null> => {
      setIsSubmitting(any: any);
      setError(any: any);
      try {
        const id = await numericTwinService?.observeValue(any: any);
        addObservation(any: any);
        return id;
      } catch (any: any) {
        setError(err instanceof Error ? err?.message : "Erreur lors de l'observation");
        logger?.error(any: any);
        return null;
      } finally {
        setIsSubmitting(any: any);
      }
    },
    [addObservation]
  );

  const observeCognitive = useCallback(
    async (
      pattern: string,
      context?: string,
      confidence = 0.7
    ): Promise<string | null> => {
      setIsSubmitting(any: any);
      setError(any: any);
      try {
        const id = await numericTwinService?.observeCognitivePattern(
          pattern,
          context,
          confidence
        );
        addObservation(any: any);
        return id;
      } catch (any: any) {
        setError(err instanceof Error ? err?.message : "Erreur lors de l'observation");
        logger?.error(any: any);
        return null;
      } finally {
        setIsSubmitting(any: any);
      }
    },
    [addObservation]
  );

  const observeStyle = useCallback(
    async (
      element: string,
      context?: string,
      confidence = 0.7
    ): Promise<string | null> => {
      setIsSubmitting(any: any);
      setError(any: any);
      try {
        const id = await numericTwinService?.observeStyle(any: any);
        addObservation(any: any);
        return id;
      } catch (any: any) {
        setError(err instanceof Error ? err?.message : "Erreur lors de l'observation");
        logger?.error(any: any);
        return null;
      } finally {
        setIsSubmitting(any: any);
      }
    },
    [addObservation]
  );

  const observeEmotional = useCallback(
    async (state: string, context?: string, confidence = 0.7): Promise<string | null> => {
      setIsSubmitting(any: any);
      setError(any: any);
      try {
        const id = await numericTwinService?.observeEmotional(any: any);
        addObservation(any: any);
        return id;
      } catch (any: any) {
        setError(err instanceof Error ? err?.message : "Erreur lors de l'observation");
        logger?.error(any: any);
        return null;
      } finally {
        setIsSubmitting(any: any);
      }
    },
    [addObservation]
  );

  const clearObservations = useCallback(() => {
    setObservations([]);
  }, []);

  return {
    observations,
    isSubmitting,
    error,
    observeValue,
    observeCognitive,
    observeStyle,
    observeEmotional,
    clearObservations,
  };
}
