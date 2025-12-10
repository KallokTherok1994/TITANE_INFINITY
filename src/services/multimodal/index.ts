/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  TITANE INFINITY — Multimodal Services Index v∞.3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Point d'entrée pour les services multimodaux
 *
 *  © 2025 MUSIC MUSIC.AI — Tous droits réservés
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ══════════════════════════════════════════════════════════════════════════
// INTENT HANDLER
// ══════════════════════════════════════════════════════════════════════════

export {
  detectMultimodalIntent,
  hasMultimodalIntent,
  handleMultimodalIntent,
  processMultimodalMessage,
  default as multimodalIntentHandler,
} from './multimodalIntentHandler';

export type {
  MultimodalIntentType,
  MultimodalIntent,
  MultimodalIntentResponse,
} from './multimodalIntentHandler';
