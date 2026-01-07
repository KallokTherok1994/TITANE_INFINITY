/**
 * TITANE∞ vΩ∞ — useTwinBehavior Hook
 * © 2025 TITANE∞ — Proprietary License
 * Hook React pour observer et gérer le comportement du Twin
 */

import { useState, useCallback } from 'react';
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
  observations: Observation[];
  isSubmitting: boolean;
  error: string | null;

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
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setIsSubmitting(true);
      setError(null);
      try {
        const id = await numericTwinService.observeValue(valueName, context, confidence);
        addObservation(id, 'value', valueName, context, confidence);
        return id;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'observation");
        logger.error('observeValue error:', err);
        return null;
      } finally {
        setIsSubmitting(false);
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
      setIsSubmitting(true);
      setError(null);
      try {
        const id = await numericTwinService.observeCognitivePattern(
          pattern,
          context,
          confidence
        );
        addObservation(id, 'cognitive', pattern, context, confidence);
        return id;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'observation");
        logger.error('observeCognitive error:', err);
        return null;
      } finally {
        setIsSubmitting(false);
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
      setIsSubmitting(true);
      setError(null);
      try {
        const id = await numericTwinService.observeStyle(element, context, confidence);
        addObservation(id, 'style', element, context, confidence);
        return id;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'observation");
        logger.error('observeStyle error:', err);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [addObservation]
  );

  const observeEmotional = useCallback(
    async (state: string, context?: string, confidence = 0.7): Promise<string | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const id = await numericTwinService.observeEmotional(state, context, confidence);
        addObservation(id, 'emotional', state, context, confidence);
        return id;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'observation");
        logger.error('observeEmotional error:', err);
        return null;
      } finally {
        setIsSubmitting(false);
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
