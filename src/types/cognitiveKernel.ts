/**
 * TITANE∞ v22Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TYPES POUR COGNITIVE KERNEL
 *   Types stricts pour le noyau cognitif (remplace 'any')
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Données de mémoire pour providers
 */
export interface ProviderMemoryData {
  provider: string;
  timestamp?: number;
}

/**
 * Données de mémoire pour erreurs
 */
export interface ErrorMemoryData {
  pattern: string;
  message?: string;
  count?: number;
}

/**
 * Données de mémoire pour modèles
 */
export interface ModelMemoryData {
  context: string;
  model: string;
  performance?: number;
}

/**
 * Données de mémoire pour adaptations
 */
export interface AdaptationMemoryData {
  type: string;
  impact: number;
  reason?: string;
}

/**
 * Union de tous les types de mémoire
 */
export type MemoryData =
  | ProviderMemoryData
  | ErrorMemoryData
  | ModelMemoryData
  | AdaptationMemoryData;

/**
 * Contexte pour le processus cognitif
 */
export interface CognitiveContext {
  message: string;
  providers: string?.[];
  metrics: MetricsData;
  options?: Record<string, unknown>;
}

/**
 * Métriques système
 */
export interface MetricsData {
  latency?: number;
  quality?: number;
  errorRate?: number;
  successRate?: number;
  timestamp?: number;
  // Compatible avec AggregatedMetrics
  totalRequests?: number;
  totalSuccesses?: number;
  totalErrors?: number;
  avgResponseTime?: number;
  [key: string]: unknown;
}

/**
 * Message chat harmonisé
 */
export interface HarmonizedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    structured: boolean;
    coherenceScore: number;
    [key: string]: unknown;
  };
}

/**
 * Erreur harmonisée
 */
export interface HarmonizedError {
  message: string;
  type: string;
  recovery: string;
  userFriendly: boolean;
  originalError?: Error | string;
}
