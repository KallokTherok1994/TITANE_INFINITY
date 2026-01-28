/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ — Alerting System
 * Système d'alertes intelligent basé sur les métriques
 * Sprint 2: Monitoring Avancé (NIVEAU 2)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { chatMetrics, type GlobalMetrics, type ConversationMetrics } from './chatMetrics';
import { logger } from './logger';

/**
 * Type d'alerte
 */
export enum AlertType {
  /** Taux de rejet trop élevé */
  HIGH_REJECTION_RATE = 'HIGH_REJECTION_RATE',
  /** Temps de réponse trop lent */
  SLOW_RESPONSE_TIME = 'SLOW_RESPONSE_TIME',
  /** Taux d'erreur trop élevé */
  HIGH_ERROR_RATE = 'HIGH_ERROR_RATE',
  /** ErrorBoundary déclenché */
  ERROR_BOUNDARY_TRIGGERED = 'ERROR_BOUNDARY_TRIGGERED',
  /** Conversation anormalement longue */
  LONG_CONVERSATION = 'LONG_CONVERSATION',
}

/**
 * Sévérité d'alerte
 */
export enum AlertSeverity {
  /** Informationnel */
  INFO = 'INFO',
  /** Avertissement */
  WARNING = 'WARNING',
  /** Critique (action immédiate requise) */
  CRITICAL = 'CRITICAL',
}

/**
 * Alerte déclenchée
 */
export interface Alert {
  /** ID unique de l'alerte */
  id: string;
  /** Type d'alerte */
  type: AlertType;
  /** Sévérité */
  severity: AlertSeverity;
  /** Timestamp déclenchement */
  timestamp: string;
  /** Message descriptif */
  message: string;
  /** Métadonnées additionnelles */
  metadata: Record<string, unknown>;
  /** Alerte résolue (true si résolu, false si actif) */
  resolved: boolean;
  /** Timestamp résolution (si resolved=true) */
  resolvedAt?: string;
}

/**
 * Règle d'alerte
 */
interface AlertRule {
  type: AlertType;
  severity: AlertSeverity;
  condition: (global: GlobalMetrics, conversation?: ConversationMetrics) => boolean;
  getMessage: (global: GlobalMetrics, conversation?: ConversationMetrics) => string;
  getMetadata: (global: GlobalMetrics, conversation?: ConversationMetrics) => Record<string, unknown>;
}

/**
 * Configuration alerting
 */
export interface AlertingConfig {
  /** Activer le système d'alertes */
  enabled: boolean;
  /** Seuil taux de rejet (0-1, défaut: 0.05 = 5%) */
  rejectionRateThreshold: number;
  /** Seuil temps de réponse (ms, défaut: 10000 = 10s) */
  responseTimeThreshold: number;
  /** Seuil taux d'erreur (0-1, défaut: 0.05 = 5%) */
  errorRateThreshold: number;
  /** Seuil nombre messages conversation (défaut: 200) */
  longConversationThreshold: number;
  /** Intervalle vérification (ms, défaut: 30000 = 30s) */
  checkInterval: number;
}

/**
 * Système d'alertes
 * - Surveille les métriques en continu
 * - Déclenche des alertes si seuils dépassés
 * - Expose les alertes actives
 * - Auto-résolution quand seuils redeviennent normaux
 */
class AlertingSystem {
  private config: AlertingConfig = {
    enabled: true,
    rejectionRateThreshold: 0.05, // 5%
    responseTimeThreshold: 10000, // 10s
    errorRateThreshold: 0.05, // 5%
    longConversationThreshold: 200,
    checkInterval: 30000, // 30s
  };

  /** Alertes actives (Map alertId -> alert) */
  private activeAlerts = new Map<string, Alert>();

  /** Historique alertes (buffer circulaire, max 100) */
  private alertHistory: Alert[] = [];
  private readonly MAX_HISTORY = 100;

  /** Timer pour vérifications périodiques */
  private checkTimer: NodeJS.Timeout | null = null;

  /** Règles d'alertes */
  private rules: AlertRule[] = [
    // Règle 1: Taux de rejet élevé
    {
      type: AlertType.HIGH_REJECTION_RATE,
      severity: AlertSeverity.WARNING,
      condition: (global) => global.validationRate < (1 - this.config.rejectionRateThreshold),
      getMessage: (global) =>
        `Taux de rejet élevé: ${((1 - global.validationRate) * 100).toFixed(1)}% (seuil: ${this.config.rejectionRateThreshold * 100}%)`,
      getMetadata: (global) => ({
        validationRate: global.validationRate,
        rejectionRate: 1 - global.validationRate,
        threshold: this.config.rejectionRateThreshold,
      }),
    },

    // Règle 2: Temps de réponse lent
    {
      type: AlertType.SLOW_RESPONSE_TIME,
      severity: AlertSeverity.WARNING,
      condition: (global) => global.avgResponseTime > this.config.responseTimeThreshold,
      getMessage: (global) =>
        `Temps de réponse lent: ${(global.avgResponseTime / 1000).toFixed(1)}s (seuil: ${this.config.responseTimeThreshold / 1000}s)`,
      getMetadata: (global) => ({
        avgResponseTime: global.avgResponseTime,
        threshold: this.config.responseTimeThreshold,
      }),
    },

    // Règle 3: Taux d'erreur élevé
    {
      type: AlertType.HIGH_ERROR_RATE,
      severity: AlertSeverity.CRITICAL,
      condition: (global) => global.errorRate > this.config.errorRateThreshold,
      getMessage: (global) =>
        `Taux d'erreur élevé: ${(global.errorRate * 100).toFixed(1)}% (seuil: ${this.config.errorRateThreshold * 100}%)`,
      getMetadata: (global) => ({
        errorRate: global.errorRate,
        threshold: this.config.errorRateThreshold,
        totalErrors: global.totalErrors,
      }),
    },

    // Règle 4: Conversation anormalement longue
    {
      type: AlertType.LONG_CONVERSATION,
      severity: AlertSeverity.INFO,
      condition: (global, conversation) =>
        !!conversation && conversation.totalMessages > this.config.longConversationThreshold,
      getMessage: (global, conversation) =>
        `Conversation longue détectée: ${conversation?.totalMessages} messages (seuil: ${this.config.longConversationThreshold})`,
      getMetadata: (global, conversation) => ({
        conversationId: conversation?.conversationId,
        totalMessages: conversation?.totalMessages,
        threshold: this.config.longConversationThreshold,
      }),
    },
  ];

  /**
   * Configure le système d'alertes
   */
  configure(config: Partial<AlertingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Démarre la surveillance automatique
   */
  start(): void {
    if (!this.config.enabled) {
      logger.info('Système d\'alertes désactivé (config.enabled=false)', 'Alerting');
      return;
    }

    if (this.checkTimer) {
      logger.warn('Système d\'alertes déjà démarré', 'Alerting');
      return;
    }

    logger.info(
      `Démarrage système d'alertes (intervalle: ${this.config.checkInterval}ms)`,
      'Alerting',
      {
        rejectionRateThreshold: this.config.rejectionRateThreshold,
        responseTimeThreshold: this.config.responseTimeThreshold,
        errorRateThreshold: this.config.errorRateThreshold,
      }
    );

    // Vérification initiale
    this.checkAlerts();

    // Vérifications périodiques
    this.checkTimer = setInterval(() => {
      this.checkAlerts();
    }, this.config.checkInterval);
  }

  /**
   * Arrête la surveillance automatique
   */
  stop(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
      logger.info('Système d\'alertes arrêté', 'Alerting');
    }
  }

  /**
   * Vérifie les métriques et déclenche des alertes si nécessaire
   */
  checkAlerts(): void {
    const globalMetrics = chatMetrics.getGlobalMetrics();

    // Vérifier les règles globales
    for (const rule of this.rules) {
      // Skip règles spécifiques à une conversation
      if (rule.type === AlertType.LONG_CONVERSATION) {
        continue;
      }

      const alertId = `${rule.type}-global`;
      const isConditionMet = rule.condition(globalMetrics);
      const existingAlert = this.activeAlerts.get(alertId);

      if (isConditionMet && !existingAlert) {
        // Déclencher nouvelle alerte
        this.triggerAlert(alertId, rule, globalMetrics);
      } else if (!isConditionMet && existingAlert && !existingAlert.resolved) {
        // Auto-résoudre alerte
        this.resolveAlert(alertId);
      }
    }
  }

  /**
   * Déclenche manuellement une alerte (ex: ErrorBoundary)
   */
  triggerManualAlert(
    type: AlertType,
    severity: AlertSeverity,
    message: string,
    metadata: Record<string, unknown> = {}
  ): string {
    const alertId = `${type}-manual-${Date.now()}`;

    const alert: Alert = {
      id: alertId,
      type,
      severity,
      timestamp: new Date().toISOString(),
      message,
      metadata,
      resolved: false,
    };

    this.activeAlerts.set(alertId, alert);
    this.alertHistory.push(alert);

    if (this.alertHistory.length > this.MAX_HISTORY) {
      this.alertHistory.shift();
    }

    // Log selon sévérité
    switch (severity) {
      case AlertSeverity.INFO:
        logger.info(`[ALERT] ${message}`, 'Alerting', metadata);
        break;
      case AlertSeverity.WARNING:
        logger.warn(`[ALERT] ${message}`, 'Alerting', metadata);
        break;
      case AlertSeverity.CRITICAL:
        logger.error(`[ALERT CRITICAL] ${message}`, 'Alerting', undefined, metadata);
        break;
    }

    return alertId;
  }

  /**
   * Déclenche une alerte basée sur une règle
   */
  private triggerAlert(
    alertId: string,
    rule: AlertRule,
    globalMetrics: GlobalMetrics,
    conversationMetrics?: ConversationMetrics
  ): void {
    const alert: Alert = {
      id: alertId,
      type: rule.type,
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      message: rule.getMessage(globalMetrics, conversationMetrics),
      metadata: rule.getMetadata(globalMetrics, conversationMetrics),
      resolved: false,
    };

    this.activeAlerts.set(alertId, alert);
    this.alertHistory.push(alert);

    if (this.alertHistory.length > this.MAX_HISTORY) {
      this.alertHistory.shift();
    }

    // Log selon sévérité
    switch (rule.severity) {
      case AlertSeverity.INFO:
        logger.info(`[ALERT] ${alert.message}`, 'Alerting', alert.metadata);
        break;
      case AlertSeverity.WARNING:
        logger.warn(`[ALERT] ${alert.message}`, 'Alerting', alert.metadata);
        break;
      case AlertSeverity.CRITICAL:
        logger.error(`[ALERT CRITICAL] ${alert.message}`, 'Alerting', undefined, alert.metadata);
        break;
    }
  }

  /**
   * Résout une alerte active
   */
  resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      return;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();

    this.activeAlerts.delete(alertId);

    logger.info(`[ALERT RESOLVED] ${alert.message}`, 'Alerting', {
      alertId,
      type: alert.type,
      resolvedAfter: new Date(alert.resolvedAt).getTime() - new Date(alert.timestamp).getTime(),
    });
  }

  /**
   * Récupère les alertes actives
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Récupère l'historique des alertes
   */
  getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Récupère les alertes par sévérité
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this.getActiveAlerts().filter(alert => alert.severity === severity);
  }

  /**
   * Nettoie les alertes résolues de l'historique
   */
  cleanupHistory(): void {
    // Garder seulement alertes non résolues + 20 dernières résolues
    const unresolved = this.alertHistory.filter(a => !a.resolved);
    const resolved = this.alertHistory.filter(a => a.resolved).slice(-20);

    this.alertHistory = [...unresolved, ...resolved];
  }

  /**
   * Réinitialise le système (pour tests uniquement)
   */
  reset(): void {
    this.stop();
    this.activeAlerts.clear();
    this.alertHistory = [];
    logger.warn('[Alerting] RESET: Toutes les alertes ont été effacées', 'Alerting');
  }
}

/**
 * Instance singleton du système d'alertes
 */
export const alerting = new AlertingSystem();

/**
 * Hook React pour accéder aux alertes (optionnel, pour dashboard)
 */
export function useAlerting() {
  return {
    getActiveAlerts: alerting.getActiveAlerts.bind(alerting),
    getAlertHistory: alerting.getAlertHistory.bind(alerting),
    getAlertsBySeverity: alerting.getAlertsBySeverity.bind(alerting),
  };
}
