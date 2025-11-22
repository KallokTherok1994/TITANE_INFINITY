/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — BEHAVIORAL LAYER
 *   Phase 10: Définition des réactions comportementales
 * ═══════════════════════════════════════════════════════════════
 */

import type { BehavioralLayer, BehaviorResponse, SystemState, MotionType } from '../ARCHITECTURE_TYPES_v24-v∞';

/**
 * Créer une couche comportementale par défaut
 */
export function createDefaultBehavioralLayer(): BehavioralLayer {
  return {
    reactions: {
      onError: createBehaviorResponse('pulse', 0.9, 3000),
      onSuccess: createBehaviorResponse('flow', 0.6, 2000),
      onWarning: createBehaviorResponse('pulse', 0.7, 2500),
      onOverload: createBehaviorResponse('pulse', 1.0, 5000),
      onIdle: createBehaviorResponse('breathe', 0.3, 10000),
    },
    posture: 'relaxed',
    adaptationSpeed: 0.5,
  };
}

/**
 * Créer une réponse comportementale
 */
function createBehaviorResponse(
  motionType: MotionType,
  glowIntensity: number,
  durationMs: number,
  soundFeedback?: string,
  narrativePhrase?: string
): BehaviorResponse {
  return {
    glowIntensity,
    motionType,
    soundFeedback,
    narrativePhrase,
    durationMs,
  };
}

/**
 * Déterminer la posture basée sur l'état système
 */
export function determinePosture(
  systemState: SystemState,
  cognitiveLoad: number
): BehavioralLayer['posture'] {
  if (systemState === 'danger' || cognitiveLoad > 0.9) return 'vigilant';
  if (systemState === 'warning' || cognitiveLoad > 0.7) return 'attentive';
  if (systemState === 'offline' || systemState === 'null' || cognitiveLoad < 0.2) return 'minimal';
  return 'relaxed';
}

/**
 * Adapter la réponse comportementale selon le contexte
 */
export function adaptBehaviorResponse(
  baseResponse: BehaviorResponse,
  contextIntensity: number
): BehaviorResponse {
  return {
    ...baseResponse,
    glowIntensity: Math.min(1, baseResponse.glowIntensity * contextIntensity),
    durationMs: Math.round(baseResponse.durationMs * (0.5 + contextIntensity * 0.5)),
  };
}

/**
 * Obtenir la réponse comportementale appropriée
 */
export function getBehaviorForState(
  layer: BehavioralLayer,
  systemState: SystemState
): BehaviorResponse {
  switch (systemState) {
    case 'danger':
      return layer.reactions.onError;
    case 'warning':
      return layer.reactions.onWarning;
    case 'stable':
      return layer.reactions.onSuccess;
    case 'offline':
    case 'null':
      return layer.reactions.onIdle;
    default:
      return layer.reactions.onSuccess;
  }
}

/**
 * Calculer la vitesse d'adaptation basée sur les changements
 */
export function calculateAdaptationSpeed(
  currentPosture: BehavioralLayer['posture'],
  targetPosture: BehavioralLayer['posture'],
  baseSpeed: number
): number {
  const postureDistance = getPostureDistance(currentPosture, targetPosture);
  return baseSpeed * (1 + postureDistance * 0.5);
}

/**
 * Distance entre deux postures (pour transitions)
 */
function getPostureDistance(
  from: BehavioralLayer['posture'],
  to: BehavioralLayer['posture']
): number {
  const postureOrder: BehavioralLayer['posture'][] = ['minimal', 'relaxed', 'attentive', 'vigilant'];
  const fromIndex = postureOrder.indexOf(from);
  const toIndex = postureOrder.indexOf(to);
  return Math.abs(toIndex - fromIndex) / 3;
}
