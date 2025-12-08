/**
 * TITANE∞ vΩ∞ — MULTIMODAL INTENT HANDLER
 * OPUS v∞.3: Gestionnaire d'intents multimodaux
 *
 * Détecte et traite les intentions liées à l'analyse multimodale
 *
 * Intents supportés:
 * - ANALYZE_MULTIMODAL: Demande d'analyse multimodale globale
 * - GET_FUSION_STATE: Obtenir l'état fusionné actuel
 * - SET_MODALITY_WEIGHTS: Ajuster les poids des modalités
 * - CALIBRATE_MULTIMODAL: Calibrer le baseline multimodal
 * - START_MULTIMODAL: Démarrer l'analyse multimodale
 * - STOP_MULTIMODAL: Arrêter l'analyse multimodale
 * - GET_CORRELATIONS: Obtenir la matrice de corrélation
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// REMOVED: engines/multimodal supprimé en PHASE 1 (OPTION B)
import MultimodalFusionEngine from '@/engines/multimodal/_stubs';
import type {
  MultimodalState,
  ModalityWeights,
  BaselineFusionProfile,
  CorrelationMatrix
} from '@/types/multimodalFusion';

// ============================================================================
// TYPES
// ============================================================================

export type MultimodalIntentType =
  | 'ANALYZE_MULTIMODAL'
  | 'GET_FUSION_STATE'
  | 'SET_MODALITY_WEIGHTS'
  | 'CALIBRATE_MULTIMODAL'
  | 'START_MULTIMODAL'
  | 'STOP_MULTIMODAL'
  | 'GET_CORRELATIONS'
  | 'UNKNOWN';

export interface MultimodalIntent {
  type: MultimodalIntentType;
  confidence: number;
  parameters?: {
    weights?: Partial<ModalityWeights>;
    modality?: 'vision' | 'voice' | 'text';
  };
  rawMessage: string;
}

export interface MultimodalIntentResponse {
  success: boolean;
  intent: MultimodalIntentType;
  message: string;
  data?: {
    state?: MultimodalState | null;
    baseline?: BaselineFusionProfile;
    correlations?: CorrelationMatrix;
    weights?: ModalityWeights;
    isActive?: boolean;
  };
}

// ============================================================================
// PATTERNS DE DÉTECTION
// ============================================================================

const INTENT_PATTERNS: Record<MultimodalIntentType, RegExp[]> = {
  ANALYZE_MULTIMODAL: [
    /analys(e|er)\s*(mon\s*)?(état|etat|humeur|émotions?)?\s*(multimodal|global|complet)/i,
    /multimodal\s*analys(is|e)/i,
    /full\s*(emotion|affect|state)\s*analysis/i,
    /analyse\s*compl[èe]te/i,
    /comment\s*(je\s*)?(me\s*)?(sens|vais)\s*vraiment/i,
  ],

  GET_FUSION_STATE: [
    /(quel|mon|l['\s])\s*(état|etat)\s*(fusionn[ée]|actuel|multimodal)/i,
    /fusion\s*state/i,
    /current\s*(fused|multimodal)\s*state/i,
    /état\s*combiné/i,
  ],

  SET_MODALITY_WEIGHTS: [
    /(ajust|modifi|chang|défini)[er]?\s*(les\s*)?poids/i,
    /(set|adjust|change)\s*(modality\s*)?weights/i,
    /poids\s*(de\s*)?(vision|voix|texte)/i,
    /weight\s*(vision|voice|text)/i,
  ],

  CALIBRATE_MULTIMODAL: [
    /calibr[er]?\s*(le\s*)?(baseline\s*)?multimodal/i,
    /calibrate\s*multimodal/i,
    /recalibr[er]?\s*(le\s*)?(profil|baseline)/i,
    /apprendre\s*mon\s*(profil|baseline)\s*multimodal/i,
  ],

  START_MULTIMODAL: [
    /d[ée]marr[er]?\s*(l['\s])?analys(e|is)\s*multimodal/i,
    /start\s*multimodal/i,
    /activ[er]?\s*(le\s*)?(mode\s*)?multimodal/i,
    /lanc[er]?\s*(l['\s])?(analyse\s*)?multimodal/i,
  ],

  STOP_MULTIMODAL: [
    /arr[êe]t[er]?\s*(l['\s])?analys(e|is)\s*multimodal/i,
    /stop\s*multimodal/i,
    /d[ée]sactiv[er]?\s*(le\s*)?(mode\s*)?multimodal/i,
  ],

  GET_CORRELATIONS: [
    /corr[ée]lations?\s*(entre\s*)?(modalit[ée]s|vision|voix|texte)/i,
    /correlation\s*matrix/i,
    /lien\s*entre\s*(vision|voix|texte)/i,
  ],

  UNKNOWN: []
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractWeightsFromMessage(message: string): Partial<ModalityWeights> | undefined {
  const weights: Partial<ModalityWeights> = {};

  const visionMatch = message.match(/vision\s*[:\s=]?\s*(\d+(?:\.\d+)?)/i);
  const voiceMatch = message.match(/voi[xce]\s*[:\s=]?\s*(\d+(?:\.\d+)?)/i);
  const textMatch = message.match(/text[e]?\s*[:\s=]?\s*(\d+(?:\.\d+)?)/i);

  if (visionMatch) weights.vision = parseFloat(visionMatch[1]);
  if (voiceMatch) weights.voice = parseFloat(voiceMatch[1]);
  if (textMatch) weights.text = parseFloat(textMatch[1]);

  // Normaliser si valeurs > 1 (probablement en pourcentage)
  for (const key of Object.keys(weights) as (keyof ModalityWeights)[]) {
    const value = weights[key];
    if (value !== undefined && value > 1) {
      weights[key] = value / 100;
    }
  }

  return Object.keys(weights).length > 0 ? weights : undefined;
}

function formatMultimodalState(state: MultimodalState): string {
  const energyDesc = state.globalEnergyLevel === 'high' ? 'haute' :
                     state.globalEnergyLevel === 'low' ? 'basse' : 'moyenne';
  const tensionDesc = state.globalTensionLevel === 'high' ? 'haute' :
                      state.globalTensionLevel === 'low' ? 'basse' : 'moyenne';

  return `État multimodal fusionné :
• Énergie : ${(state.fusedScores.globalEnergy.value * 100).toFixed(0)}% (${energyDesc})
• Tension : ${(state.fusedScores.globalTension.value * 100).toFixed(0)}% (${tensionDesc})
• Engagement : ${(state.fusedScores.globalEngagement.value * 100).toFixed(0)}%
• Stabilité : ${(state.fusedScores.globalStability.value * 100).toFixed(0)}%
• Confiance globale : ${(state.overallConfidence * 100).toFixed(0)}%
• Modalités actives : ${state.activeModalities.join(', ') || 'aucune'}
${state.baselineDeviation.isSignificant ? `⚠️ ${state.baselineDeviation.description}` : ''}`;
}

// ============================================================================
// DETECTION D'INTENT
// ============================================================================

export function detectMultimodalIntent(message: string): MultimodalIntent {
  const normalizedMessage = message.toLowerCase().trim();

  let bestMatch: { type: MultimodalIntentType; confidence: number } = {
    type: 'UNKNOWN',
    confidence: 0
  };

  for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (intentType === 'UNKNOWN') continue;

    for (const pattern of patterns) {
      if (pattern.test(normalizedMessage)) {
        const match = normalizedMessage.match(pattern);
        const matchLength = match ? match[0].length : 0;
        const confidence = Math.min(0.5 + (matchLength / normalizedMessage.length) * 0.5, 0.95);

        if (confidence > bestMatch.confidence) {
          bestMatch = {
            type: intentType as MultimodalIntentType,
            confidence
          };
        }
      }
    }
  }

  const parameters: MultimodalIntent['parameters'] = {};

  if (bestMatch.type === 'SET_MODALITY_WEIGHTS') {
    parameters.weights = extractWeightsFromMessage(message);
  }

  return {
    type: bestMatch.type,
    confidence: bestMatch.confidence,
    parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
    rawMessage: message
  };
}

export function hasMultimodalIntent(message: string): boolean {
  const intent = detectMultimodalIntent(message);
  return intent.type !== 'UNKNOWN' && intent.confidence > 0.3;
}

// ============================================================================
// TRAITEMENT DES INTENTS
// ============================================================================

export async function handleMultimodalIntent(
  intent: MultimodalIntent
): Promise<MultimodalIntentResponse> {
  const engine = MultimodalFusionEngine.getInstance();

  switch (intent.type) {
    case 'ANALYZE_MULTIMODAL':
    case 'GET_FUSION_STATE': {
      const state = engine.getLastFusedState();

      if (!state) {
        return {
          success: false,
          intent: intent.type,
          message: engine.isActive()
            ? 'Analyse en cours, mais pas encore assez de données.'
            : 'L\'analyse multimodale n\'est pas active. Demandez-moi de la démarrer.',
          data: { isActive: engine.isActive() }
        };
      }

      return {
        success: true,
        intent: intent.type,
        message: formatMultimodalState(state),
        data: { state }
      };
    }

    case 'SET_MODALITY_WEIGHTS': {
      if (intent.parameters?.weights) {
        engine.setWeights(intent.parameters.weights);
        const newWeights = engine.getWeights();

        return {
          success: true,
          intent: intent.type,
          message: `Poids mis à jour :
• Vision : ${(newWeights.vision * 100).toFixed(0)}%
• Voix : ${(newWeights.voice * 100).toFixed(0)}%
• Texte : ${(newWeights.text * 100).toFixed(0)}%`,
          data: { weights: newWeights }
        };
      }

      const currentWeights = engine.getWeights();
      return {
        success: true,
        intent: intent.type,
        message: `Poids actuels :
• Vision : ${(currentWeights.vision * 100).toFixed(0)}%
• Voix : ${(currentWeights.voice * 100).toFixed(0)}%
• Texte : ${(currentWeights.text * 100).toFixed(0)}%

Pour modifier: "vision 50%, voix 30%, texte 20%"`,
        data: { weights: currentWeights }
      };
    }

    case 'CALIBRATE_MULTIMODAL': {
      const baseline = engine.calibrateBaseline();

      return {
        success: true,
        intent: intent.type,
        message: `Baseline multimodal calibré !
• Échantillons : ${baseline.totalSamplesCount}
• Calibré : ${baseline.isCalibrated ? 'Oui' : 'Non (besoin de plus de données)'}`,
        data: { baseline }
      };
    }

    case 'START_MULTIMODAL': {
      if (engine.isActive()) {
        return {
          success: true,
          intent: intent.type,
          message: 'L\'analyse multimodale est déjà active.',
          data: { isActive: true }
        };
      }

      await engine.start();

      return {
        success: true,
        intent: intent.type,
        message: 'Analyse multimodale démarrée ! Je combine vision, voix et texte.',
        data: { isActive: true }
      };
    }

    case 'STOP_MULTIMODAL': {
      if (!engine.isActive()) {
        return {
          success: true,
          intent: intent.type,
          message: 'L\'analyse multimodale n\'est pas active.',
          data: { isActive: false }
        };
      }

      engine.stop();

      return {
        success: true,
        intent: intent.type,
        message: 'Analyse multimodale arrêtée.',
        data: { isActive: false }
      };
    }

    case 'GET_CORRELATIONS': {
      const correlations = engine.getCorrelationMatrix();

      return {
        success: true,
        intent: intent.type,
        message: `Corrélations inter-modales :
• Vision ↔ Voix : ${(correlations.visionVoice * 100).toFixed(0)}%
• Vision ↔ Texte : ${(correlations.visionText * 100).toFixed(0)}%
• Voix ↔ Texte : ${(correlations.voiceText * 100).toFixed(0)}%
• Triple : ${(correlations.allThree * 100).toFixed(0)}%`,
        data: { correlations }
      };
    }

    case 'UNKNOWN':
    default:
      return {
        success: false,
        intent: 'UNKNOWN',
        message: 'Je n\'ai pas compris cette demande concernant l\'analyse multimodale.'
      };
  }
}

export async function processMultimodalMessage(
  message: string
): Promise<MultimodalIntentResponse | null> {
  const intent = detectMultimodalIntent(message);

  if (intent.type === 'UNKNOWN' || intent.confidence < 0.3) {
    return null;
  }

  return handleMultimodalIntent(intent);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  detectMultimodalIntent,
  hasMultimodalIntent,
  handleMultimodalIntent,
  processMultimodalMessage
};
