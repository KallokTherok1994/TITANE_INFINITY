/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  FAST_COMMAND_OPTIONS,
  LONG_COMMAND_OPTIONS,
  CRITICAL_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';

/**
 * État évolution système
 */
export interface EvolutionState {
  version: string;
  cycle: number;
  phase: 'learning' | 'adapting' | 'evolving' | 'stable';
  metrics: {
    learningRate: number;
    adaptationScore: number;
    evolutionProgress: number; // 0-100
  };
  timestamp: string;
}

/**
 * Données évolution
 */
export interface EvolutionData {
  interactions: number;
  patterns: Array<{
    name: string;
    frequency: number;
    effectiveness: number;
  }>;
  adaptations: Array<{
    type: string;
    timestamp: string;
    impact: number; // -1 to 1
  }>;
}

/**
 * Configuration évolution
 */
export interface EvolutionConfig {
  autoEvolve: boolean;
  learningRate: number; // 0-1
  adaptationThreshold: number; // 0-1
  evolutionInterval: number; // minutes
  preserveStability: boolean;
}

/**
 * Suggestion évolution
 */
export interface EvolutionSuggestion {
  id: string;
  type: 'optimization' | 'adaptation' | 'new_feature';
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
  estimated_improvement: number; // %
}

/**
 * Service centralisé Evolution Engine
 * Adaptation automatique + amélioration continue
 */
class EvolutionService {
  /**
   * Récupération état évolution
   */
  async getState(): Promise<EvolutionState> {
    try {
      return await invokeWithRetry<EvolutionState>(
        'evolution_get_state',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur getState:', error);
      throw new Error(`Récupération état échoué: ${error}`);
    }
  }

  /**
   * Récupération données évolution
   */
  async getData(): Promise<EvolutionData> {
    try {
      return await invokeWithRetry<EvolutionData>(
        'evolution_get_data',
        {},
        { ...STANDARD_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur getData:', error);
      throw new Error(`Récupération données échouée: ${error}`);
    }
  }

  /**
   * Récupération configuration
   */
  async getConfig(): Promise<EvolutionConfig> {
    try {
      return await invokeWithRetry<EvolutionConfig>(
        'evolution_get_config',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur getConfig:', error);
      throw new Error(`Récupération config échouée: ${error}`);
    }
  }

  /**
   * Modification configuration
   */
  async updateConfig(config: Partial<EvolutionConfig>): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'evolution_update_config',
        { config },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur updateConfig:', error);
      throw new Error(`Modification config échouée: ${error}`);
    }
  }

  /**
   * Déclenchement cycle évolution manuel
   */
  async runCycle(): Promise<EvolutionState> {
    try {
      return await invokeWithRetry<EvolutionState>(
        'evolution_run_cycle',
        {},
        { ...LONG_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur runCycle:', error);
      throw new Error(`Cycle évolution échoué: ${error}`);
    }
  }

  /**
   * Récupération suggestions évolution
   */
  async getSuggestions(): Promise<EvolutionSuggestion[]> {
    try {
      return await invokeWithRetry<EvolutionSuggestion[]>(
        'evolution_get_suggestions',
        {},
        { ...STANDARD_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur getSuggestions:', error);
      return [];
    }
  }

  /**
   * Application suggestion évolution
   */
  async applySuggestion(suggestionId: string): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'evolution_apply_suggestion',
        { suggestionId },
        { ...LONG_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur applySuggestion:', error);
      throw new Error(`Application suggestion échouée: ${error}`);
    }
  }

  /**
   * Rejet suggestion évolution
   */
  async rejectSuggestion(suggestionId: string, reason?: string): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'evolution_reject_suggestion',
        { suggestionId, reason },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur rejectSuggestion:', error);
    }
  }

  /**
   * Enregistrement feedback utilisateur
   */
  async recordFeedback(
    context: string,
    rating: number, // 1-5
    details?: string
  ): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'evolution_record_feedback',
        { context, rating, details },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur recordFeedback:', error);
    }
  }

  /**
   * Analyse patterns d'usage
   */
  async analyzePatterns(
    timeWindow: number = 7 // jours
  ): Promise<
    Array<{
      pattern: string;
      frequency: number;
      trend: 'increasing' | 'stable' | 'decreasing';
    }>
  > {
    try {
      return await invokeWithRetry(
        'evolution_analyze_patterns',
        { timeWindow },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur analyzePatterns:', error);
      return [];
    }
  }

  /**
   * Export historique évolution
   */
  async exportHistory(format: 'json' | 'csv'): Promise<string> {
    try {
      return await invokeWithRetry<string>(
        'evolution_export_history',
        { format },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur exportHistory:', error);
      throw new Error(`Export historique échoué: ${error}`);
    }
  }

  /**
   * Reset évolution (retour état initial)
   */
  async reset(): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'evolution_reset',
        {},
        { ...CRITICAL_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur reset:', error);
      throw new Error(`Reset évolution échoué: ${error}`);
    }
  }

  /**
   * Snapshot état actuel (backup)
   */
  async snapshot(): Promise<string> {
    try {
      return await invokeWithRetry<string>(
        'evolution_snapshot',
        {},
        { ...STANDARD_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur snapshot:', error);
      throw new Error(`Snapshot échoué: ${error}`);
    }
  }

  /**
   * Restauration snapshot
   */
  async restore(snapshotId: string): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'evolution_restore',
        { snapshotId },
        { ...LONG_COMMAND_OPTIONS, context: 'Evolution' }
      );
    } catch (error) {
      console.error('[EvolutionService] Erreur restore:', error);
      throw new Error(`Restauration échouée: ${error}`);
    }
  }
}

/**
 * Instance singleton
 */
export const evolutionService = new EvolutionService();
