/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.20.0 — CAMERA CHAT HANDLER
 *   Parser NLP pour commandes caméra (FR + EN)
 *   Super Prompt #3 — Feature #2
 * ═══════════════════════════════════════════════════════════════
 */

export interface CameraCommand {
  handled: boolean;
  action: CameraAction;
  response: string;
  error?: string;
}

export type CameraAction =
  | 'activate'
  | 'deactivate'
  | 'toggle'
  | 'status'
  | 'none';

// ═══════════════════════════════════════════════════════════════
// PATTERNS NLP — FRANÇAIS
// ═══════════════════════════════════════════════════════════════

const ACTIVATE_PATTERNS_FR = [
  /(?:active|démarre|lance|ouvre|allume)\s+(?:la\s+)?cam[eé]ra/i,
  /(?:active|démarre|lance)\s+(?:la\s+)?(?:webcam|vision)/i,
  /(?:montre-moi|affiche|vision)\s+(?:la\s+)?vid[eé]o/i,
  /(?:mets|active)\s+(?:la\s+)?(?:surveillance|observation)\s+visuelle/i,
  /(?:j'?ai besoin|je veux|peux-tu)\s+(?:de\s+)?(?:la\s+)?cam[eé]ra/i,
];

const DEACTIVATE_PATTERNS_FR = [
  /(?:d[eé]sactive|arr[eê]te|coupe|ferme|[eé]teins)\s+(?:la\s+)?cam[eé]ra/i,
  /(?:d[eé]sactive|arr[eê]te|coupe)\s+(?:la\s+)?(?:webcam|vision)/i,
  /(?:cache|masque|stop)\s+(?:la\s+)?vid[eé]o/i,
  /(?:plus besoin|arr[eê]te)\s+(?:de\s+)?(?:la\s+)?cam[eé]ra/i,
];

const STATUS_PATTERNS_FR = [
  /(?:statut|[eé]tat)\s+(?:de\s+)?(?:la\s+)?cam[eé]ra/i,
  /(?:la\s+)?cam[eé]ra\s+(?:est|fonctionne)/i,
  /(?:est-ce que|es-tu)\s+(?:en train de|)\s*(?:filmer|observer)/i,
];

// ═══════════════════════════════════════════════════════════════
// PATTERNS NLP — ENGLISH
// ═══════════════════════════════════════════════════════════════

const ACTIVATE_PATTERNS_EN = [
  /(?:activate|start|turn on|enable|launch)\s+(?:the\s+)?camera/i,
  /(?:activate|start|enable)\s+(?:the\s+)?(?:webcam|vision)/i,
  /(?:show me|display)\s+(?:the\s+)?video/i,
  /(?:start|enable)\s+(?:visual\s+)?(?:observation|surveillance)/i,
  /(?:i need|i want|can you)\s+(?:the\s+)?camera/i,
];

const DEACTIVATE_PATTERNS_EN = [
  /(?:deactivate|stop|turn off|disable|close)\s+(?:the\s+)?camera/i,
  /(?:deactivate|stop|disable)\s+(?:the\s+)?(?:webcam|vision)/i,
  /(?:hide|stop)\s+(?:the\s+)?video/i,
  /(?:don't need|stop)\s+(?:the\s+)?camera/i,
];

const STATUS_PATTERNS_EN = [
  /(?:camera\s+)?(?:status|state)/i,
  /(?:is\s+)?(?:the\s+)?camera\s+(?:on|active|working)/i,
  /(?:are you|is it)\s+(?:recording|filming|watching)/i,
];

// ═══════════════════════════════════════════════════════════════
// PARSER
// ═══════════════════════════════════════════════════════════════

/**
 * Vérifie si le message contient un mot-clé caméra
 */
export function containsCameraKeyword(message: string): boolean {
  const keywords = [
    'caméra', 'camera', 'webcam', 'vision', 'vidéo', 'video',
    'surveillance', 'observation', 'filmer', 'recording',
  ];
  
  const lowerMsg = message.toLowerCase();
  return keywords.some(keyword => lowerMsg.includes(keyword));
}

/**
 * Parse le message pour détecter une commande caméra
 */
export function parseCameraCommand(message: string): CameraCommand {
  const msgTrimmed = message.trim();

  // Test activation
  const activatePatterns = [...ACTIVATE_PATTERNS_FR, ...ACTIVATE_PATTERNS_EN];
  if (activatePatterns.some(pattern => pattern.test(msgTrimmed))) {
    return {
      handled: true,
      action: 'activate',
      response: '✅ Activation de la caméra en cours... Le flux vidéo reste 100% local.',
    };
  }

  // Test désactivation
  const deactivatePatterns = [...DEACTIVATE_PATTERNS_FR, ...DEACTIVATE_PATTERNS_EN];
  if (deactivatePatterns.some(pattern => pattern.test(msgTrimmed))) {
    return {
      handled: true,
      action: 'deactivate',
      response: '✅ Caméra désactivée.',
    };
  }

  // Test statut
  const statusPatterns = [...STATUS_PATTERNS_FR, ...STATUS_PATTERNS_EN];
  if (statusPatterns.some(pattern => pattern.test(msgTrimmed))) {
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
export function generateCameraStatusResponse(isActive: boolean, hasPermission: boolean): string {
  if (!hasPermission) {
    return '📷 Caméra: Permission non accordée. Utilisez "active la caméra" pour demander l\'autorisation.';
  }
  
  if (isActive) {
    return '📷 Caméra: ✅ Active et en observation. Flux 100% local.';
  }
  
  return '📷 Caméra: ⏸️ Disponible mais inactive. Dites "active la caméra" pour démarrer.';
}
