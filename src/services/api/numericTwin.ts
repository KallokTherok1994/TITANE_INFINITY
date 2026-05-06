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

import { createLogger } from '@/utils/logger';

const logger = createLogger('NumericTwin');

export const OWNER_TWIN_RESONANCE = {
  ownerThemes: [
    'présence',
    'authenticité',
    'retour au vivant',
    'deuxième vitesse',
    'clarté',
    'œuvre vivante',
  ],
  sourceCount: 42,
  reflectionAxis: 'clarté intérieure, structure concrète et transformation humaine douce',
  portraitUrl:
    'https://static.wixstatic.com/media/0c58f2_0e50a8a83cac4080848fe97b54f92b8a~mv2.jpg/v1/fill/w_285,h_287,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/465277026_1246722113243921_9112138683944422327_n.jpg',
  portraitFallbackUrl: '/kevin-owner-portrait.svg',
} as const;

function canPersistTwinSnapshot(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function persistTwinChatContextSnapshot(params: {
  state: TwinState;
  fusion: FusionIndex;
  profile: TwinEvolutionProfile;
}): void {
  if (!canPersistTwinSnapshot()) {
    return;
  }

  const { state, fusion, profile } = params;
  window.localStorage.setItem(
    'titane_twin_fusion_v1',
    JSON.stringify({
      globalScore: fusion.globalScore,
      trend: fusion.trend,
      currentPhase: profile.currentPhase ?? null,
      syncScore: profile.syncScore ?? 0,
      identityCore: state.identityCore,
      valueMap: state.valueMap,
      cognitivePatterns: state.cognitivePatterns,
      therapeuticModel: state.therapeuticModel,
      creativeSignature: state.creativeSignature,
      fusionComponents: {
        valueAlignment: fusion.valueAlignment,
        cognitiveAlignment: fusion.cognitiveAlignment,
        styleAlignment: fusion.styleAlignment,
        therapeuticAlignment: fusion.therapeuticAlignment,
        creativeAlignment: fusion.creativeAlignment,
        evolutionAlignment: fusion.evolutionAlignment,
      },
      ownerThemes: [...OWNER_TWIN_RESONANCE.ownerThemes],
      sourceCount: OWNER_TWIN_RESONANCE.sourceCount,
      reflectionAxis: OWNER_TWIN_RESONANCE.reflectionAxis,
      portraitUrl: OWNER_TWIN_RESONANCE.portraitUrl,
      portraitFallbackUrl: OWNER_TWIN_RESONANCE.portraitFallbackUrl,
      updatedAt: Date.now(),
    })
  );
}

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
    logger.info(`${this.LOG_PREFIX} getState`);
    try {
      const state = await secureInvoke<TwinState>('twin_get_state');
      return state;
    } catch (error) {
      logger.error(`${this.LOG_PREFIX} getState error:`, error);
      throw error;
    }
  }

  /**
   * Obtient uniquement le FusionIndex
   */
  async getFusionIndex(): Promise<FusionIndex> {
    logger.info(`${this.LOG_PREFIX} getFusionIndex`);
    try {
      const index = await secureInvoke<FusionIndex>('twin_get_fusion_index');
      return index;
    } catch (error) {
      logger.error(`${this.LOG_PREFIX} getFusionIndex error:`, error);
      throw error;
    }
  }

  /**
   * Soumet une observation au Twin
   */
  async submitObservation(observation: TwinObservationRequest): Promise<string> {
    logger.info(`${this.LOG_PREFIX} submitObservation:`, observation.observationType);
    try {
      const syncId = await secureInvoke<string>('twin_submit_observation', {
        observation,
      });
      return syncId;
    } catch (error) {
      logger.error(`${this.LOG_PREFIX} submitObservation error:`, error);
      throw error;
    }
  }

  /**
   * Applique une évolution au Twin
   */
  async applyEvolution(evolution: TwinEvolutionRequest): Promise<TwinEvolutionResult> {
    logger.info(`${this.LOG_PREFIX} applyEvolution:`, evolution.evolutionType);
    try {
      const result = await secureInvoke<TwinEvolutionResult>('twin_apply_evolution', {
        evolution,
      });
      return result;
    } catch (error) {
      logger.error(`${this.LOG_PREFIX} applyEvolution error:`, error);
      throw error;
    }
  }

  /**
   * Valide une synchronisation
   */
  async validateSync(validation: TwinSyncValidationRequest): Promise<boolean> {
    logger.info(`${this.LOG_PREFIX} validateSync:`, validation.syncId);
    try {
      const result = await secureInvoke<boolean>('twin_validate_sync', { validation });
      return result;
    } catch (error) {
      logger.error(`${this.LOG_PREFIX} validateSync error:`, error);
      throw error;
    }
  }

  /**
   * Obtient le profil d'évolution
   */
  async getEvolutionProfile(): Promise<TwinEvolutionProfile> {
    logger.info(`${this.LOG_PREFIX} getEvolutionProfile`);
    try {
      const profile = await secureInvoke<TwinEvolutionProfile>(
        'twin_get_evolution_profile'
      );
      return profile;
    } catch (error) {
      logger.error(`${this.LOG_PREFIX} getEvolutionProfile error:`, error);
      throw error;
    }
  }

  /**
   * Obtient l'identité du Twin
   */
  async getIdentity(): Promise<TwinIdentityCore> {
    logger.info(`${this.LOG_PREFIX} getIdentity`);
    try {
      const identity = await secureInvoke<TwinIdentityCore>('twin_get_identity');
      return identity;
    } catch (error) {
      logger.error(`${this.LOG_PREFIX} getIdentity error:`, error);
      throw error;
    }
  }

  /**
   * Force le recalcul du FusionIndex
   */
  async recalculateFusion(): Promise<number> {
    logger.info(`${this.LOG_PREFIX} recalculateFusion`);
    try {
      const score = await secureInvoke<number>('twin_recalculate_fusion');
      return score;
    } catch (error) {
      logger.error(`${this.LOG_PREFIX} recalculateFusion error:`, error);
      throw error;
    }
  }

  async refreshChatContextSnapshot(): Promise<void> {
    const [profile, fusion, state] = await Promise.all([
      this.getEvolutionProfile(),
      this.getFusionIndex(),
      this.getState(),
    ]);

    persistTwinChatContextSnapshot({ state, fusion, profile });
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
    return this.submitObservation({
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
    return this.submitObservation({
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
    return this.submitObservation({
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
    return this.submitObservation({
      observationType: 'emotional',
      content: emotionalState,
      context,
      confidence,
    });
  }

  /**
   * Renforce une valeur (avec validation Kevin)
   */
  async reinforceValue(
    valueName: string,
    validatedByKevin = true
  ): Promise<TwinEvolutionResult> {
    return this.applyEvolution({
      evolutionType: 'value_reinforcement',
      target: valueName,
      isDeepChange: false,
      validatedByKevin,
    });
  }

  /**
   * Ajuste un trait (avec validation si profond)
   */
  async adjustTrait(
    traitName: string,
    delta: number,
    isDeep = false,
    validatedByKevin = true
  ): Promise<TwinEvolutionResult> {
    return this.applyEvolution({
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
    return this.applyEvolution({
      evolutionType: 'pattern_integration',
      target: patternName,
      isDeepChange: false,
      validatedByKevin,
    });
  }

  /**
   * Transition de phase (nécessite validation)
   */
  async transitionPhase(validatedByKevin = true): Promise<TwinEvolutionResult> {
    return this.applyEvolution({
      evolutionType: 'phase_transition',
      target: 'next_phase',
      isDeepChange: true,
      validatedByKevin,
    });
  }
}

/** Instance singleton */
export const numericTwinService = new NumericTwinService();
