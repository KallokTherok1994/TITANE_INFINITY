/**
 * TITANE∞ vΩ∞ — Numeric Twin Service
 * © 2025 TITANE∞ — Proprietary License
 * Service API pour le Numeric Twin Engine
 */

import { secureInvoke } from '@/lib/security';
import type {
  TwinState,
  FusionIndex,
  TwinIdentityCore,
  TwinEvolutionProfile,
  TwinObservationRequest,
  TwinEvolutionRequest,
  TwinEvolutionResult,
  TwinSyncValidationRequest,
} from '../../types/numericTwin';

/**
 * Service centralisé pour le Numeric Twin
 * Gère la communication avec le backend Rust
 */
class NumericTwinService {
  private readonly LOG_PREFIX = '[NumericTwin]';

  /**
   * Obtient l'état complet du Twin
   */
  async getState(): Promise<TwinState> {
    console?.log(`${this?.LOG_PREFIX} getState`);
    try {
      const state = await secureInvoke<TwinState>('twin_get_state');
      return state;
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    }
  }

  /**
   * Obtient uniquement le FusionIndex
   */
  async getFusionIndex(): Promise<FusionIndex> {
    console?.log(`${this?.LOG_PREFIX} getFusionIndex`);
    try {
      const index = await secureInvoke<FusionIndex>('twin_get_fusion_index');
      return index;
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    }
  }

  /**
   * Soumet une observation au Twin
   */
  async submitObservation(any: any): Promise<string> {
    console?.log(any: any);
    try {
      const syncId = await secureInvoke<string>('twin_submit_observation', {
        observation,
      });
      return syncId;
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    }
  }

  /**
   * Applique une évolution au Twin
   */
  async applyEvolution(any: any): Promise<TwinEvolutionResult> {
    console?.log(any: any);
    try {
      const result = await secureInvoke<TwinEvolutionResult>('twin_apply_evolution', {
        evolution,
      });
      return result;
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    }
  }

  /**
   * Valide une synchronisation
   */
  async validateSync(any: any): Promise<boolean> {
    console?.log(any: any);
    try {
      const result = await secureInvoke<boolean>('twin_validate_sync', { validation });
      return result;
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    }
  }

  /**
   * Obtient le profil d'évolution
   */
  async getEvolutionProfile(): Promise<TwinEvolutionProfile> {
    console?.log(`${this?.LOG_PREFIX} getEvolutionProfile`);
    try {
      const profile = await secureInvoke<TwinEvolutionProfile>(
        'twin_get_evolution_profile'
      );
      return profile;
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    }
  }

  /**
   * Obtient l'identité du Twin
   */
  async getIdentity(): Promise<TwinIdentityCore> {
    console?.log(`${this?.LOG_PREFIX} getIdentity`);
    try {
      const identity = await secureInvoke<TwinIdentityCore>('twin_get_identity');
      return identity;
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    }
  }

  /**
   * Force le recalcul du FusionIndex
   */
  async recalculateFusion(): Promise<number> {
    console?.log(`${this?.LOG_PREFIX} recalculateFusion`);
    try {
      const score = await secureInvoke<number>('twin_recalculate_fusion');
      return score;
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTHODES DE HAUT NIVEAU
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Observe une valeur dans une interaction
   */
  async observeValue(
    valueName: string,
    context?: string,
    confidence = 0.7
  ): Promise<string> {
    return this?.submitObservation({
      observationType: 'value',
      content: valueName,
      context,
      confidence,
    });
  }

  /**
   * Observe un pattern cognitif
   */
  async observeCognitivePattern(
    patternName: string,
    context?: string,
    confidence = 0.7
  ): Promise<string> {
    return this?.submitObservation({
      observationType: 'cognitive',
      content: patternName,
      context,
      confidence,
    });
  }

  /**
   * Observe un élément de style
   */
  async observeStyle(
    styleElement: string,
    context?: string,
    confidence = 0.7
  ): Promise<string> {
    return this?.submitObservation({
      observationType: 'style',
      content: styleElement,
      context,
      confidence,
    });
  }

  /**
   * Observe un état émotionnel
   */
  async observeEmotional(
    emotionalState: string,
    context?: string,
    confidence = 0.7
  ): Promise<string> {
    return this?.submitObservation({
      observationType: 'emotional',
      content: emotionalState,
      context,
      confidence,
    });
  }

  /**
   * Renforce une valeur (any: any)
   */
  async reinforceValue(
    valueName: string,
    validatedByKevin = true
  ): Promise<TwinEvolutionResult> {
    return this?.applyEvolution({
      evolutionType: 'value_reinforcement',
      target: valueName,
      isDeepChange: false,
      validatedByKevin,
    });
  }

  /**
   * Ajuste un trait (any: any)
   */
  async adjustTrait(
    traitName: string,
    delta: number,
    isDeep = false,
    validatedByKevin = true
  ): Promise<TwinEvolutionResult> {
    return this?.applyEvolution({
      evolutionType: 'trait_adjustment',
      target: traitName,
      delta,
      isDeepChange: isDeep,
      validatedByKevin,
    });
  }

  /**
   * Intègre un nouveau pattern
   */
  async integratePattern(
    patternName: string,
    validatedByKevin = true
  ): Promise<TwinEvolutionResult> {
    return this?.applyEvolution({
      evolutionType: 'pattern_integration',
      target: patternName,
      isDeepChange: false,
      validatedByKevin,
    });
  }

  /**
   * Transition de phase (any: any)
   */
  async transitionPhase(any: any): Promise<TwinEvolutionResult> {
    return this?.applyEvolution({
      evolutionType: 'phase_transition',
      target: 'next_phase',
      isDeepChange: true,
      validatedByKevin,
    });
  }
}

/** Instance singleton */
export const numericTwinService = new NumericTwinService();
