/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ — Chat IA Metrics Service
 * Collecte et expose les métriques de performance du Chat IA
 * Sprint 2: Monitoring Avancé (NIVEAU 2)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Métriques par conversation
 */
export interface ConversationMetrics {
  /** ID unique de la conversation */
  conversationId: string;
  /** Timestamp de début (ISO 8601) */
  startedAt: string;
  /** Timestamp de fin (ISO 8601, null si en cours) */
  endedAt: string | null;
  /** Nombre total de messages (user + assistant) */
  totalMessages: number;
  /** Nombre de messages user */
  userMessages: number;
  /** Nombre de messages assistant */
  assistantMessages: number;
  /** Nombre de messages rejetés (validation échouée) */
  rejectedMessages: number;
  /** Nombre d'erreurs rencontrées */
  errorCount: number;
  /** Temps de réponse moyen (ms) */
  avgResponseTime: number;
  /** Temps de réponse min (ms) */
  minResponseTime: number;
  /** Temps de réponse max (ms) */
  maxResponseTime: number;
  /** Taux de validation (0-1) */
  validationRate: number;
  /** Taux d'erreur (0-1) */
  errorRate: number;
}

/**
 * Métriques globales (toutes conversations)
 */
export interface GlobalMetrics {
  /** Nombre total de conversations */
  totalConversations: number;
  /** Nombre de conversations actives */
  activeConversations: number;
  /** Nombre total de messages (toutes conversations) */
  totalMessages: number;
  /** Nombre total d'erreurs (toutes conversations) */
  totalErrors: number;
  /** Temps de réponse moyen global (ms) */
  avgResponseTime: number;
  /** Taux de validation global (0-1) */
  validationRate: number;
  /** Taux d'erreur global (0-1) */
  errorRate: number;
  /** Timestamp dernière mise à jour */
  lastUpdated: string;
}

/**
 * Événement métrique individuel
 */
export interface MetricEvent {
  /** Type d'événement */
  type:
    | 'message_sent'
    | 'message_received'
    | 'message_rejected'
    | 'error'
    | 'conversation_start'
    | 'conversation_end';
  /** ID conversation */
  conversationId: string;
  /** Timestamp événement (ISO 8601) */
  timestamp: string;
  /** Durée (ms) pour événements temporels */
  duration?: number;
  /** Détails additionnels */
  metadata?: Record<string, unknown>;
}

/**
 * Service de métriques Chat IA
 * - Collecte métriques en temps réel
 * - Calcule statistiques agrégées
 * - Expose données pour alertes/dashboard
 */
class ChatMetricsService {
  /** Métriques par conversation (Map conversationId -> metrics) */
  private conversations = new Map<string, ConversationMetrics>();

  /** Événements récents (buffer circulaire, max 1000) */
  private eventBuffer: MetricEvent[] = [];
  private readonly MAX_EVENTS = 1000;

  /** Temps de réponse par message (pour calculs statistiques) */
  private responseTimesBuffer: number[] = [];
  private readonly MAX_RESPONSE_TIMES = 500;

  /**
   * Démarre une nouvelle conversation
   */
  startConversation(conversationId: string): void {
    const metrics: ConversationMetrics = {
      conversationId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      rejectedMessages: 0,
      errorCount: 0,
      avgResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      validationRate: 1.0,
      errorRate: 0.0,
    };

    this.conversations.set(conversationId, metrics);

    this.recordEvent({
      type: 'conversation_start',
      conversationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Termine une conversation
   */
  endConversation(conversationId: string): void {
    const metrics = this.conversations.get(conversationId);
    if (!metrics) {
      console.warn(`[ChatMetrics] Conversation ${conversationId} introuvable`);
      return;
    }

    metrics.endedAt = new Date().toISOString();

    this.recordEvent({
      type: 'conversation_end',
      conversationId,
      timestamp: new Date().toISOString(),
      metadata: {
        totalMessages: metrics.totalMessages,
        duration:
          new Date(metrics.endedAt).getTime() - new Date(metrics.startedAt).getTime(),
      },
    });
  }

  /**
   * Enregistre l'envoi d'un message user
   */
  recordMessageSent(conversationId: string, messageLength: number): void {
    const metrics = this.conversations.get(conversationId);
    if (!metrics) {
      console.warn(
        `[ChatMetrics] Conversation ${conversationId} introuvable, création auto`
      );
      this.startConversation(conversationId);
      return this.recordMessageSent(conversationId, messageLength);
    }

    metrics.totalMessages++;
    metrics.userMessages++;

    this.recordEvent({
      type: 'message_sent',
      conversationId,
      timestamp: new Date().toISOString(),
      metadata: { messageLength },
    });
  }

  /**
   * Enregistre la réception d'un message assistant
   */
  recordMessageReceived(
    conversationId: string,
    responseTime: number,
    messageLength: number
  ): void {
    const metrics = this.conversations.get(conversationId);
    if (!metrics) {
      console.warn(`[ChatMetrics] Conversation ${conversationId} introuvable`);
      return;
    }

    metrics.totalMessages++;
    metrics.assistantMessages++;

    // Mise à jour statistiques temps de réponse
    this.responseTimesBuffer.push(responseTime);
    if (this.responseTimesBuffer.length > this.MAX_RESPONSE_TIMES) {
      this.responseTimesBuffer.shift(); // Supprimer le plus ancien
    }

    // Temps de réponse conversation
    const responseTimes = this.responseTimesBuffer.slice(-metrics.assistantMessages);
    metrics.avgResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime);
    metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime);

    // Mise à jour taux validation/erreur
    const totalAttempts = metrics.totalMessages;
    const validMessages = totalAttempts - metrics.rejectedMessages - metrics.errorCount;
    metrics.validationRate = validMessages / totalAttempts;
    metrics.errorRate = metrics.errorCount / totalAttempts;

    this.recordEvent({
      type: 'message_received',
      conversationId,
      timestamp: new Date().toISOString(),
      duration: responseTime,
      metadata: { messageLength },
    });
  }

  /**
   * Enregistre un message rejeté (validation échouée)
   */
  recordMessageRejected(conversationId: string, reason: string): void {
    const metrics = this.conversations.get(conversationId);
    if (!metrics) {
      console.warn(`[ChatMetrics] Conversation ${conversationId} introuvable`);
      return;
    }

    metrics.rejectedMessages++;
    metrics.totalMessages++;

    // Mise à jour taux validation/erreur
    const totalAttempts = metrics.totalMessages;
    const validMessages = totalAttempts - metrics.rejectedMessages - metrics.errorCount;
    metrics.validationRate = validMessages / totalAttempts;
    metrics.errorRate = metrics.errorCount / totalAttempts;

    this.recordEvent({
      type: 'message_rejected',
      conversationId,
      timestamp: new Date().toISOString(),
      metadata: { reason },
    });
  }

  /**
   * Enregistre une erreur
   */
  recordError(conversationId: string, errorType: string, errorMessage: string): void {
    const metrics = this.conversations.get(conversationId);
    if (!metrics) {
      console.warn(`[ChatMetrics] Conversation ${conversationId} introuvable`);
      return;
    }

    metrics.errorCount++;
    metrics.totalMessages++; // Compte comme tentative

    // Mise à jour taux validation/erreur
    const totalAttempts = metrics.totalMessages;
    const validMessages = totalAttempts - metrics.rejectedMessages - metrics.errorCount;
    metrics.validationRate = validMessages / totalAttempts;
    metrics.errorRate = metrics.errorCount / totalAttempts;

    this.recordEvent({
      type: 'error',
      conversationId,
      timestamp: new Date().toISOString(),
      metadata: { errorType, errorMessage },
    });
  }

  /**
   * Récupère les métriques d'une conversation
   */
  getConversationMetrics(conversationId: string): ConversationMetrics | null {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Récupère les métriques globales
   */
  getGlobalMetrics(): GlobalMetrics {
    const allMetrics = Array.from(this.conversations.values());

    const totalConversations = allMetrics.length;
    const activeConversations = allMetrics.filter(m => m.endedAt === null).length;

    const totalMessages = allMetrics.reduce((sum, m) => sum + m.totalMessages, 0);
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.errorCount, 0);

    // Temps de réponse moyen global (tous messages)
    const avgResponseTime =
      this.responseTimesBuffer.length > 0
        ? this.responseTimesBuffer.reduce((a, b) => a + b, 0) /
          this.responseTimesBuffer.length
        : 0;

    // Taux validation/erreur global
    const totalRejected = allMetrics.reduce((sum, m) => sum + m.rejectedMessages, 0);
    const validMessages = totalMessages - totalRejected - totalErrors;
    const validationRate = totalMessages > 0 ? validMessages / totalMessages : 1.0;
    const errorRate = totalMessages > 0 ? totalErrors / totalMessages : 0.0;

    return {
      totalConversations,
      activeConversations,
      totalMessages,
      totalErrors,
      avgResponseTime,
      validationRate,
      errorRate,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Récupère les événements récents
   */
  getRecentEvents(limit: number = 100): MetricEvent[] {
    return this.eventBuffer.slice(-limit);
  }

  /**
   * Enregistre un événement dans le buffer
   */
  private recordEvent(event: MetricEvent): void {
    this.eventBuffer.push(event);
    if (this.eventBuffer.length > this.MAX_EVENTS) {
      this.eventBuffer.shift(); // Supprimer le plus ancien
    }
  }

  /**
   * Nettoie les conversations terminées (garbage collection)
   * Conserve seulement les N dernières conversations terminées
   */
  cleanupOldConversations(keepLast: number = 50): void {
    const allMetrics = Array.from(this.conversations.entries());
    const ended = allMetrics.filter(([, m]) => m.endedAt !== null);

    if (ended.length <= keepLast) {
      return; // Rien à nettoyer
    }

    // Trier par date de fin (plus récent en dernier)
    ended.sort((a, b) => {
      const endedAtA = a[1].endedAt;
      const endedAtB = b[1].endedAt;
      if (!endedAtA || !endedAtB) {
        return 0;
      }
      const dateA = new Date(endedAtA).getTime();
      const dateB = new Date(endedAtB).getTime();
      return dateA - dateB;
    });

    // Supprimer les plus anciennes
    const toDelete = ended.slice(0, ended.length - keepLast);
    toDelete.forEach(([conversationId]) => {
      this.conversations.delete(conversationId);
    });

    console.log(
      `[ChatMetrics] Nettoyage: ${toDelete.length} conversations supprimées (conservation: ${keepLast} dernières)`
    );
  }

  /**
   * Réinitialise toutes les métriques (pour tests uniquement)
   */
  reset(): void {
    this.conversations.clear();
    this.eventBuffer = [];
    this.responseTimesBuffer = [];
    console.warn('[ChatMetrics] RESET: Toutes les métriques ont été effacées');
  }
}

/**
 * Instance singleton du service
 */
export const chatMetrics = new ChatMetricsService();

/**
 * Hook React pour accéder aux métriques (optionnel, pour dashboard)
 */
export function useChatMetrics() {
  return {
    getConversationMetrics: chatMetrics.getConversationMetrics.bind(chatMetrics),
    getGlobalMetrics: chatMetrics.getGlobalMetrics.bind(chatMetrics),
    getRecentEvents: chatMetrics.getRecentEvents.bind(chatMetrics),
  };
}
