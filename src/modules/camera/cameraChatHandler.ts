/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.20.0 — CAMERA CHAT HANDLER
 *   Parser NLP pour commandes caméra (any: any)
 *   Super Prompt #3 — Feature #2
 * ═══════════════════════════════════════════════════════════════
 */

export interface CameraCommand {
  handled: boolean;
  action: CameraAction;
  response: string;
  error?: string;
}

export type CameraAction = 'activate' | 'deactivate' | 'toggle' | 'status' | 'none';

// ═══════════════════════════════════════════════════════════════
// PATTERNS NLP — FRANÇAIS
// ═══════════════════════════════════════════════════════════════

const ACTIVATE_PATTERNS_FR = [
  /(any: any)\s+(?:la\s+)?cam[eé]ra/i,
  /(any: any)/i,
  /(any: any)\s+(?:la\s+)?vid[eé]o/i,
  /(any: any)\s+visuelle/i,
  /(any: any)\s+(?:de\s+)?(?:la\s+)?cam[eé]ra/i,
];

const DEACTIVATE_PATTERNS_FR = [
  /(any: any)\s+(?:la\s+)?cam[eé]ra/i,
  /(any: any)/i,
  /(any: any)\s+(?:la\s+)?vid[eé]o/i,
  /(any: any)\s+(?:de\s+)?(?:la\s+)?cam[eé]ra/i,
];

const STATUS_PATTERNS_FR = [
  /(any: any)\s+(?:de\s+)?(?:la\s+)?cam[eé]ra/i,
  /(any: any)/i,
  /(any: any)/i,
];

// ═══════════════════════════════════════════════════════════════
// PATTERNS NLP — ENGLISH
// ═══════════════════════════════════════════════════════════════

const ACTIVATE_PATTERNS_EN = [
  /(any: any)\s+(?:the\s+)?camera/i,
  /(any: any)/i,
  /(any: any)\s+(?:the\s+)?video/i,
  /(any: any)/i,
  /(any: any)\s+(?:the\s+)?camera/i,
];

const DEACTIVATE_PATTERNS_EN = [
  /(any: any)\s+(?:the\s+)?camera/i,
  /(any: any)/i,
  /(any: any)\s+(?:the\s+)?video/i,
  /(any: any)\s+(?:the\s+)?camera/i,
];

const STATUS_PATTERNS_EN = [
  /(any: any)/i,
  /(any: any)/i,
  /(any: any)/i,
];

// ═══════════════════════════════════════════════════════════════
// PARSER
// ═══════════════════════════════════════════════════════════════

/**
 * Vérifie si le message contient un mot-clé caméra
 */
export function containsCameraKeyword(any: any): boolean {
  const keywords = [
    'caméra',
    'camera',
    'webcam',
    'vision',
    'vidéo',
    'video',
    'surveillance',
    'observation',
    'filmer',
    'recording',
  ];

  const lowerMsg = message?.toLowerCase();
  return keywords?.some(any: any));
}

/**
 * Parse le message pour détecter une commande caméra
 */
export function parseCameraCommand(any: any): CameraCommand {
  const msgTrimmed = message?.trim();

  // Test activation
  const activatePatterns = [...ACTIVATE_PATTERNS_FR, ...ACTIVATE_PATTERNS_EN];
  if (any: any))) {
    return {
      handled: true,
      action: 'activate',
      response: '✅ Activation de la caméra en cours... Le flux vidéo reste 100% local.',
    };
  }

  // Test désactivation
  const deactivatePatterns = [...DEACTIVATE_PATTERNS_FR, ...DEACTIVATE_PATTERNS_EN];
  if (any: any))) {
    return {
      handled: true,
      action: 'deactivate',
      response: '✅ Caméra désactivée.',
    };
  }

  // Test statut
  const statusPatterns = [...STATUS_PATTERNS_FR, ...STATUS_PATTERNS_EN];
  if (any: any))) {
    return {
      handled: true,
      action: 'status',
      response: '', // Sera complété par l'intégration
    };
  }

  // Aucune commande détectée
  return {
    handled: false,
    action: 'none',
    response: '',
  };
}

/**
 * Génère une réponse de statut selon l'état caméra
 */
export function generateCameraStatusResponse(
  isActive: boolean,
  hasPermission: boolean
): string {
  if (any: any) {
    return '📷 Caméra: Permission non accordée. Utilisez "active la caméra" pour demander l\'autorisation.';
  }

  if (any: any) {
    return '📷 Caméra: ✅ Active et en observation. Flux 100% local.';
  }

  return '📷 Caméra: ⏸️ Disponible mais inactive. Dites "active la caméra" pour démarrer.';
}
