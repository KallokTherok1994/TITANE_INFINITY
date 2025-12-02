/**
 * TITANE∞ vΩ∞ — VISION INTENT HANDLER
 * Super Prompt #9: Gestion des intents Vision pour le Chat IA
 *
 * Intents supportés:
 * - VISION_ENABLE: Activer le mode observation
 * - VISION_DISABLE: Désactiver le mode observation
 * - VISION_STATUS: Obtenir le statut actuel
 * - VISION_FEEDBACK: Obtenir un feedback prudent
 * - VISION_CALIBRATE: Lancer une calibration
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES:
 * - Formulations TOUJOURS prudentes
 * - Pas de certitudes absolues
 * - Disclaimer obligatoire
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { useVisionStore } from '@/stores/useVisionStore';
import type {
  VisionIntent,
  VisionFeedbackResponse,
  CalibrationCommand,
  VisualLevel,
} from '@/types/visionAffect';
import {
  VISION_ETHICAL_DISCLAIMER,
  PRUDENT_FORMULATIONS,
} from '@/types/visionAffect';

// ============================================================================
// TYPES
// ============================================================================

export interface VisionIntentResult {
  success: boolean;
  intent: string;
  message: string;
  data?: unknown;
  disclaimer?: string;
}

export interface VisionStatusResult {
  isActive: boolean;
  hasPermission: boolean;
  isCameraOn: boolean;
  confidence: number;
  energyLevel: VisualLevel;
  tensionLevel: VisualLevel;
  engagementLevel: VisualLevel;
  sessionDurationMs: number;
}

// ============================================================================
// PATTERNS DE DÉTECTION
// ============================================================================

/**
 * Patterns pour détecter les intents Vision dans le texte utilisateur
 */
export const VISION_INTENT_PATTERNS = {
  enable: [
    /active(?:r|z)?\s+(?:la\s+)?vision/i,
    /active(?:r|z)?\s+(?:le\s+)?mode\s+observation/i,
    /observe(?:r|z)?\s+(?:moi|mon)/i,
    /(?:regarde|regardez)\s+(?:moi|comment\s+je)/i,
    /perception\s+visuelle\s+(?:on|activ)/i,
    /enable\s+vision/i,
    /start\s+(?:camera|observation)/i,
    /👁️\s*(?:on|activ)/i,
  ],
  disable: [
    /désactive(?:r|z)?\s+(?:la\s+)?vision/i,
    /arrête(?:r|z)?\s+(?:la\s+)?(?:caméra|observation)/i,
    /stoppe(?:r|z)?\s+(?:le\s+)?mode\s+observation/i,
    /perception\s+visuelle\s+(?:off|désactiv)/i,
    /disable\s+vision/i,
    /stop\s+(?:camera|observation)/i,
    /👁️\s*(?:off|désactiv)/i,
    /ne\s+(?:me\s+)?regarde\s+plus/i,
  ],
  status: [
    /(?:quel\s+est\s+)?(?:le\s+)?(?:status|statut|état)\s+(?:de\s+la\s+)?vision/i,
    /(?:la\s+)?vision\s+(?:est\s+)?(?:active|activée)\s*\?/i,
    /(?:tu\s+)?(?:me\s+)?(?:vois|observes)\s*\?/i,
    /(?:mode\s+)?observation\s+(?:actif|activ)/i,
    /vision\s+status/i,
    /is\s+vision\s+(?:on|active)/i,
  ],
  feedback: [
    /(?:comment\s+)?(?:tu\s+)?(?:me\s+)?(?:vois|perçois)/i,
    /(?:qu(?:'est-ce\s+que|e)\s+)?(?:tu\s+)?(?:perçois|observes)/i,
    /(?:quel\s+est\s+)?mon\s+(?:état|niveau)\s+d'énergie/i,
    /(?:comment\s+)?(?:je\s+)?(?:semble|ai\s+l'air)/i,
    /(?:donne(?:-moi)?|dis(?:-moi)?)\s+(?:un\s+)?feedback\s+(?:visuel)?/i,
    /(?:analyse|évalue)\s+(?:mon\s+)?(?:état|énergie|tension)/i,
    /vision\s+feedback/i,
    /what\s+do\s+you\s+see/i,
  ],
  calibrate: [
    /calibre(?:r|z)?\s+(?:la\s+)?vision/i,
    /(?:marque(?:r|z)?|enregistre(?:r|z)?)\s+(?:mon\s+)?état\s+(?:actuel|normal)/i,
    /baseline\s+(?:reset|calibr)/i,
    /(?:je\s+suis\s+)?(?:très\s+)?(?:énergique|fatigué|détendu|concentré)/i,
  ],
} as const;

/**
 * Patterns pour extraire la durée d'observation
 */
const DURATION_PATTERNS = [
  { pattern: /(\d+)\s*minutes?/i, multiplier: 60 * 1000 },
  { pattern: /(\d+)\s*heures?/i, multiplier: 60 * 60 * 1000 },
  { pattern: /(\d+)\s*secondes?/i, multiplier: 1000 },
];

/**
 * Patterns pour extraire la commande de calibration
 */
const CALIBRATION_PATTERNS: { pattern: RegExp; command: CalibrationCommand }[] = [
  { pattern: /(?:très\s+)?(?:énergique|énergie\s+haute)/i, command: 'MARK_HIGH_ENERGY' },
  { pattern: /(?:fatigué|basse\s+énergie|peu\s+d'énergie)/i, command: 'MARK_LOW_ENERGY' },
  { pattern: /(?:détendu|relaxé|calme)/i, command: 'MARK_RELAXED' },
  { pattern: /(?:concentré|focus|focusé)/i, command: 'MARK_FOCUSED' },
  { pattern: /reset|réinitialiser/i, command: 'RESET_BASELINE' },
];

// ============================================================================
// DETECTION
// ============================================================================

/**
 * Détecte un intent Vision dans le texte utilisateur
 */
export function detectVisionIntent(text: string): VisionIntent | null {
  const normalizedText = text.toLowerCase().trim();

  // VISION_ENABLE
  for (const pattern of VISION_INTENT_PATTERNS.enable) {
    if (pattern.test(normalizedText)) {
      // Extraire durée optionnelle
      let durationMs: number | undefined;
      for (const { pattern: durPattern, multiplier } of DURATION_PATTERNS) {
        const match = normalizedText.match(durPattern);
        if (match) {
          durationMs = parseInt(match[1], 10) * multiplier;
          break;
        }
      }
      return { type: 'VISION_ENABLE', durationMs };
    }
  }

  // VISION_DISABLE
  for (const pattern of VISION_INTENT_PATTERNS.disable) {
    if (pattern.test(normalizedText)) {
      return { type: 'VISION_DISABLE' };
    }
  }

  // VISION_FEEDBACK (avant STATUS pour éviter confusion)
  for (const pattern of VISION_INTENT_PATTERNS.feedback) {
    if (pattern.test(normalizedText)) {
      return { type: 'VISION_FEEDBACK' };
    }
  }

  // VISION_STATUS
  for (const pattern of VISION_INTENT_PATTERNS.status) {
    if (pattern.test(normalizedText)) {
      return { type: 'VISION_STATUS' };
    }
  }

  // VISION_CALIBRATE
  for (const pattern of VISION_INTENT_PATTERNS.calibrate) {
    if (pattern.test(normalizedText)) {
      // Détecter la commande de calibration
      let command: CalibrationCommand = 'MARK_FOCUSED'; // défaut
      for (const { pattern: calPattern, command: calCommand } of CALIBRATION_PATTERNS) {
        if (calPattern.test(normalizedText)) {
          command = calCommand;
          break;
        }
      }
      return { type: 'VISION_CALIBRATE', command };
    }
  }

  return null;
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * Handler principal pour exécuter un intent Vision
 */
export async function handleVisionIntent(intent: VisionIntent): Promise<VisionIntentResult> {
  const store = useVisionStore.getState();

  switch (intent.type) {
    case 'VISION_ENABLE':
      return handleVisionEnable(intent.durationMs);

    case 'VISION_DISABLE':
      return handleVisionDisable();

    case 'VISION_STATUS':
      return handleVisionStatus();

    case 'VISION_FEEDBACK':
      return handleVisionFeedback();

    case 'VISION_CALIBRATE':
      return handleVisionCalibrate(intent.command);

    default:
      return {
        success: false,
        intent: 'UNKNOWN',
        message: "Intent Vision non reconnu.",
      };
  }
}

/**
 * Handler: Activer la vision
 */
async function handleVisionEnable(durationMs?: number): Promise<VisionIntentResult> {
  const store = useVisionStore.getState();

  // Déjà actif ?
  if (store.isObservationActive) {
    return {
      success: true,
      intent: 'VISION_ENABLE',
      message: "Le mode observation est déjà actif. Je continue de percevoir les indices visuels.",
      disclaimer: VISION_ETHICAL_DISCLAIMER,
    };
  }

  // Activer
  const success = await store.enableVision(durationMs);

  if (success) {
    const durationText = durationMs
      ? ` pour ${Math.round(durationMs / 60000)} minutes`
      : '';
    return {
      success: true,
      intent: 'VISION_ENABLE',
      message: `Mode observation activé${durationText}. Je vais percevoir des indices visuels approximatifs. Rappelle-toi que ces indices ne sont que des approximations basées sur des signaux visuels.`,
      disclaimer: VISION_ETHICAL_DISCLAIMER,
    };
  } else {
    const error = store.lastError;
    let errorMsg = "Je n'ai pas pu activer le mode observation.";
    if (error?.code === 'PERMISSION_DENIED') {
      errorMsg += " L'accès à la caméra a été refusé. Tu peux l'autoriser dans les paramètres système.";
    } else if (error?.code === 'DEVICE_NOT_FOUND') {
      errorMsg += " Aucune caméra n'a été détectée.";
    }
    return {
      success: false,
      intent: 'VISION_ENABLE',
      message: errorMsg,
    };
  }
}

/**
 * Handler: Désactiver la vision
 */
function handleVisionDisable(): VisionIntentResult {
  const store = useVisionStore.getState();

  if (!store.isObservationActive) {
    return {
      success: true,
      intent: 'VISION_DISABLE',
      message: "Le mode observation n'était pas actif.",
    };
  }

  store.disableVision();

  return {
    success: true,
    intent: 'VISION_DISABLE',
    message: "Mode observation désactivé. La caméra est arrêtée et aucune donnée visuelle n'est plus traitée.",
  };
}

/**
 * Handler: Statut de la vision
 */
function handleVisionStatus(): VisionIntentResult {
  const store = useVisionStore.getState();

  const status: VisionStatusResult = {
    isActive: store.isObservationActive,
    hasPermission: store.visionInput.permissionStatus === 'granted',
    isCameraOn: store.visionInput.streamActive,
    confidence: store.affectEstimation.confidence,
    energyLevel: store.affectEstimation.visualEnergyLevel,
    tensionLevel: store.affectEstimation.visualTensionLevel,
    engagementLevel: store.affectEstimation.visualEngagementLevel,
    sessionDurationMs: store.sessionDurationMs,
  };

  let message: string;

  if (!status.isActive) {
    message = "Le mode observation n'est pas actif. Tu peux l'activer si tu veux que je perçoive des indices visuels.";
  } else if (!status.isCameraOn) {
    message = "Le mode observation est actif mais la caméra est en pause.";
  } else if (status.confidence < 0.3) {
    message = "Le mode observation est actif, mais la confiance dans les indices visuels est faible. Assure-toi d'être bien visible.";
  } else {
    const sessionMin = Math.round(status.sessionDurationMs / 60000);
    message = `Mode observation actif depuis ${sessionMin} minutes. Confiance: ${(status.confidence * 100).toFixed(0)}%.`;
  }

  return {
    success: true,
    intent: 'VISION_STATUS',
    message,
    data: status,
    disclaimer: status.isActive ? VISION_ETHICAL_DISCLAIMER : undefined,
  };
}

/**
 * Handler: Feedback visuel prudent
 */
function handleVisionFeedback(): VisionIntentResult {
  const store = useVisionStore.getState();

  if (!store.isObservationActive) {
    return {
      success: false,
      intent: 'VISION_FEEDBACK',
      message: "Le mode observation n'est pas actif. Active-le d'abord si tu veux un feedback visuel.",
    };
  }

  if (store.affectEstimation.confidence < 0.3) {
    return {
      success: true,
      intent: 'VISION_FEEDBACK',
      message: "La confiance dans les indices visuels est trop faible pour donner un feedback fiable. Assure-toi d'être bien visible par la caméra.",
      disclaimer: VISION_ETHICAL_DISCLAIMER,
    };
  }

  // Générer le feedback
  const feedback = store.generateFeedback();

  // Construire le message prudent
  const parts: string[] = [];

  // Message principal
  parts.push(feedback.prudentMessage);

  // Ajouter détails si confiance suffisante
  if (feedback.confidence > 0.5) {
    const energyMsg = PRUDENT_FORMULATIONS.energy[feedback.energyLevel];
    const tensionMsg = PRUDENT_FORMULATIONS.tension[feedback.tensionLevel];

    // Ne pas répéter le message principal
    if (!feedback.prudentMessage.includes('énergie') && feedback.energyLevel !== 'medium') {
      parts.push(energyMsg);
    }
    if (!feedback.prudentMessage.includes('tension') && feedback.tensionLevel !== 'medium') {
      parts.push(tensionMsg);
    }
  }

  // Ajouter suggestion si pertinent
  if (feedback.suggestions.length > 0) {
    parts.push('\n' + feedback.suggestions[0].message);
  }

  return {
    success: true,
    intent: 'VISION_FEEDBACK',
    message: parts.join(' '),
    data: feedback,
    disclaimer: feedback.disclaimer,
  };
}

/**
 * Handler: Calibration baseline
 */
function handleVisionCalibrate(command: CalibrationCommand): VisionIntentResult {
  const store = useVisionStore.getState();

  if (!store.isObservationActive) {
    return {
      success: false,
      intent: 'VISION_CALIBRATE',
      message: "Le mode observation doit être actif pour calibrer. Active-le d'abord.",
    };
  }

  // Reset baseline
  if (command === 'RESET_BASELINE') {
    store.resetBaseline();
    return {
      success: true,
      intent: 'VISION_CALIBRATE',
      message: "Baseline réinitialisée. Les seuils sont revenus aux valeurs par défaut.",
    };
  }

  // Démarrer calibration
  store.startCalibration(command);

  const commandLabels: Record<CalibrationCommand, string> = {
    MARK_HIGH_ENERGY: "haute énergie",
    MARK_LOW_ENERGY: "basse énergie",
    MARK_RELAXED: "état relaxé",
    MARK_FOCUSED: "concentration",
    RESET_BASELINE: "reset",
  };

  return {
    success: true,
    intent: 'VISION_CALIBRATE',
    message: `Calibration "${commandLabels[command]}" en cours. Je capture quelques secondes de référence. Reste dans cet état...`,
    data: { command },
  };
}

// ============================================================================
// UTILS
// ============================================================================

/**
 * Vérifie si un texte contient un intent Vision
 */
export function containsVisionIntent(text: string): boolean {
  return detectVisionIntent(text) !== null;
}

/**
 * Liste des intents Vision supportés (pour aide contextuelle)
 */
export const VISION_INTENT_HELP = {
  enable: {
    examples: [
      "Active le mode observation",
      "Regarde-moi",
      "Active la vision pour 10 minutes",
    ],
    description: "Active la caméra pour percevoir des indices visuels approximatifs.",
  },
  disable: {
    examples: [
      "Désactive la vision",
      "Arrête la caméra",
      "Ne me regarde plus",
    ],
    description: "Désactive la caméra et arrête le traitement visuel.",
  },
  status: {
    examples: [
      "Quel est le statut de la vision ?",
      "Tu me vois ?",
      "La vision est active ?",
    ],
    description: "Vérifie si le mode observation est actif.",
  },
  feedback: {
    examples: [
      "Comment tu me vois ?",
      "Qu'est-ce que tu perçois ?",
      "Comment ai-je l'air ?",
    ],
    description: "Obtient un feedback prudent basé sur les indices visuels.",
  },
  calibrate: {
    examples: [
      "Je suis très énergique là",
      "Marque mon état actuel comme fatigué",
      "Calibre la vision",
    ],
    description: "Enregistre l'état actuel comme référence pour la baseline.",
  },
} as const;

export default {
  detectVisionIntent,
  handleVisionIntent,
  containsVisionIntent,
  VISION_INTENT_PATTERNS,
  VISION_INTENT_HELP,
};
