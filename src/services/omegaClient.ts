/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 — OMEGA CLIENT
 * Frontend bridge for OMEGA Pipeline via Conversation Engine IPC
 *
 * Architecture:
 * - One Door: UI → secureInvoke → Tauri IPC → OMEGA Pipeline
 * - Health check and process message via conversation_engine commands
 * - All responses validated with Array.isArray / null guards
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import type { ConversationHealthReport, OmegaHealthReport } from '@/types/omega.types';

// ─────────────────────────────────────────────────────────────────────
// OMEGA IPC Commands (registered in main.rs + ALLOWED_COMMANDS)
// ─────────────────────────────────────────────────────────────────────

const CMD_CONVERSATION_HEALTH = 'conversation_health_check';
const CMD_CONVERSATION_GENERATE = 'conversation_generate';

// ─────────────────────────────────────────────────────────────────────
// OMEGA Client — V30
// ─────────────────────────────────────────────────────────────────────

export class OmegaClient {
  /**
   * Vérifie la santé du pipeline OMEGA via le Conversation Engine.
   * Retourne un rapport de santé normalisé, ou null si indisponible.
   * Note: latencyAvgMs et requestsProcessed ne sont pas encore exposés
   * par l'IPC conversation_health_check — valeurs réservées pour V31.
   */
  static async health(): Promise<OmegaHealthReport | null> {
    try {
      const report = await secureInvoke<ConversationHealthReport>(CMD_CONVERSATION_HEALTH);
      if (!report) return null;

      const healthy = report.status === 'Healthy';
      return {
        enabled: true,
        healthy,
        latencyAvgMs: 0,
        requestsProcessed: 0,
      };
    } catch (err) {
      console.warn('[OmegaClient] health() unavailable:', err);
      return null;
    }
  }

  /**
   * Envoie un message au pipeline OMEGA via le Conversation Engine.
   *
   * @param conversationId - ID de conversation existant
   * @param message - Message utilisateur
   * @returns Réponse générée, ou null si erreur
   */
  static async processMessage(conversationId: string, message: string): Promise<string | null> {
    try {
      const result = await secureInvoke<{ response: string }>(CMD_CONVERSATION_GENERATE, {
        conversation_id: conversationId,
        user_message: message,
      });
      return result?.response ?? null;
    } catch (err) {
      console.warn('[OmegaClient] processMessage() error:', err);
      return null;
    }
  }
}

export default OmegaClient;
